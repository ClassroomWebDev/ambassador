import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { DistrictSelect } from "@/components/DistrictSelect";
import {
  BLOOD_GROUPS,
  FIELD_LABELS,
  RELIGIONS,
  profileCompletion,
} from "@/lib/profile-meta";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Update Profile — Ambassador Hub" },
      {
        name: "description",
        content: "Complete your member profile to 100% with a live progress bar and guided fields.",
      },
      { property: "og:title", content: "Update Profile — Ambassador Hub" },
      { property: "og:description", content: "Fill in mandatory and optional profile details." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});



const EDITABLE_KEYS = [
  "date_of_birth",
  "religion",
  "address",
  "home_district",
  "facebook_link",
  "father_name",
  "mother_name",
  "alt_mobile",
  "whatsapp",
  "blood_group",
  "institution",
  "hobby",
  "favourite_book",
  "favourite_place",
  "ultimate_goal",
  "favourite_movies",
  "favourite_person",
  "idol",
  "favourite_teacher",
] as const;

type EditableKey = (typeof EDITABLE_KEYS)[number];
type FormState = Record<EditableKey, string>;

const EMPTY_FORM = Object.fromEntries(EDITABLE_KEYS.map((k) => [k, ""])) as FormState;

const textField = z.string().trim().max(300);
const facebookSchema = z
  .string()
  .trim()
  .url("Facebook profile link must be a valid URL")
  .max(300)
  .refine((v) => /facebook\.com|fb\.com|fb\.me/i.test(v), "Enter a valid Facebook profile link");

function ProfilePage() {
  const { data: profile, isLoading } = useProfile();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoPath, setPhotoPath] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setForm(
      Object.fromEntries(
        EDITABLE_KEYS.map((key) => [key, (profile[key] as string | null) ?? ""]),
      ) as FormState,
    );
    setPhotoPath(profile.photo_url ?? null);
  }, [profile]);

  useEffect(() => {
    if (!photoPath) {
      setPhotoUrl(null);
      return;
    }
    let active = true;
    supabase.storage
      .from("profile-photos")
      .createSignedUrl(photoPath, 3600)
      .then(({ data }) => {
        if (active) setPhotoUrl(data?.signedUrl ?? null);
      });
    return () => {
      active = false;
    };
  }, [photoPath]);

  const stats = useMemo(
    () =>
      profileCompletion({
        ...form,
        full_name: profile?.full_name ?? "",
        mobile: profile?.mobile ?? "",
        photo_url: photoPath ?? "",
      }),
    [form, profile, photoPath],
  );

  const set = (key: EditableKey) => (value: string) => setForm((f) => ({ ...f, [key]: value }));

  async function handlePhoto(file: File) {
    if (!profile) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const path = `${profile.id}/photo-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("profile-photos")
      .upload(path, file, { upsert: true });
    if (uploadError) {
      setUploading(false);
      toast.error(uploadError.message);
      return;
    }
    const { error } = await supabase.from("profiles").update({ photo_url: path }).eq("id", profile.id);
    setUploading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setPhotoPath(path);
    queryClient.invalidateQueries({ queryKey: ["profile"] });
    toast.success("Photo updated");
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    try {
      const payload = Object.fromEntries(
        EDITABLE_KEYS.map((key) => {
          const raw = form[key].trim();
          if (key === "facebook_link" && raw) facebookSchema.parse(raw);
          else if (raw) textField.parse(raw);
          return [key, raw || null];
        }),
      ) as { [K in EditableKey]: string | null };
      const { error } = await supabase.from("profiles").update(payload).eq("id", profile.id);
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile saved");
    } catch (err) {
      const message =
        err instanceof z.ZodError
          ? (err.issues[0]?.message ?? "Invalid input")
          : err instanceof Error
            ? err.message
            : "Could not save profile";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  if (isLoading || !profile) {
    return <div className="mx-auto h-64 max-w-3xl animate-pulse rounded-3xl bg-muted" />;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight">Update profile</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Fields marked <span className="font-bold text-primary">*</span> are mandatory.
        </p>
      </header>

      <div className="sticky top-16 z-20 rounded-2xl border border-border bg-card p-5 shadow-card md:top-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Profile completion</p>
          <p className="font-display text-2xl font-bold text-primary">{stats.percent}%</p>
        </div>
        <Progress value={stats.percent} className="mt-3" />
        <p className="mt-2 text-xs text-muted-foreground">
          Mandatory {stats.mandatoryDone}/{stats.mandatoryTotal} · Optional {stats.optionalDone}/
          {stats.optionalTotal}
        </p>
      </div>

      <form onSubmit={onSave} className="space-y-6">
        <Section title="Mandatory information">
          <Field label={FIELD_LABELS.full_name} required>
            <Input value={profile.full_name} readOnly className="bg-muted" />
          </Field>
          <Field label={FIELD_LABELS.mobile} required>
            <Input value={profile.mobile} readOnly className="bg-muted" />
          </Field>
          <Field label={FIELD_LABELS.date_of_birth} required>
            <Input
              type="date"
              value={form.date_of_birth}
              onChange={(e) => set("date_of_birth")(e.target.value)}
            />
          </Field>
          <Field label={FIELD_LABELS.religion} required>
            <Select value={form.religion} onValueChange={set("religion")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select religion" />
              </SelectTrigger>
              <SelectContent>
                {RELIGIONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label={FIELD_LABELS.home_district} required>
            <DistrictSelect value={form.home_district} onChange={set("home_district")} />
          </Field>
          <Field label={FIELD_LABELS.facebook_link} required>
            <Input
              value={form.facebook_link}
              onChange={(e) => set("facebook_link")(e.target.value)}
              placeholder="https://facebook.com/username"
            />
          </Field>
          <Field label={FIELD_LABELS.address} required full>
            <Textarea
              value={form.address}
              onChange={(e) => set("address")(e.target.value)}
              rows={3}
            />
          </Field>
        </Section>

        <Section title="Photo">
          <div className="col-span-full flex flex-wrap items-center gap-4">
            <div className="size-20 overflow-hidden rounded-2xl bg-muted">
              {photoUrl ? (
                <img src={photoUrl} alt="Your profile photo" className="size-full object-cover" />
              ) : null}
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-input px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
              {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
              {photoPath ? "Replace photo" : "Upload photo"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handlePhoto(file);
                }}
              />
            </label>
          </div>
        </Section>

        <Section title="Optional information">
          <Field label={FIELD_LABELS.father_name}>
            <Input value={form.father_name} onChange={(e) => set("father_name")(e.target.value)} />
          </Field>
          <Field label={FIELD_LABELS.mother_name}>
            <Input value={form.mother_name} onChange={(e) => set("mother_name")(e.target.value)} />
          </Field>
          <Field label={FIELD_LABELS.alt_mobile}>
            <Input value={form.alt_mobile} onChange={(e) => set("alt_mobile")(e.target.value)} />
          </Field>
          <Field label={FIELD_LABELS.whatsapp}>
            <Input value={form.whatsapp} onChange={(e) => set("whatsapp")(e.target.value)} />
          </Field>
          <Field label={FIELD_LABELS.blood_group}>
            <Select value={form.blood_group} onValueChange={set("blood_group")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select blood group" />
              </SelectTrigger>
              <SelectContent>
                {BLOOD_GROUPS.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label={FIELD_LABELS.institution}>
            <Input value={form.institution} onChange={(e) => set("institution")(e.target.value)} />
          </Field>
          <Field label={FIELD_LABELS.hobby}>
            <Input value={form.hobby} onChange={(e) => set("hobby")(e.target.value)} />
          </Field>
          <Field label={FIELD_LABELS.favourite_book}>
            <Input
              value={form.favourite_book}
              onChange={(e) => set("favourite_book")(e.target.value)}
            />
          </Field>
          <Field label={FIELD_LABELS.favourite_place}>
            <Input
              value={form.favourite_place}
              onChange={(e) => set("favourite_place")(e.target.value)}
            />
          </Field>
          <Field label={FIELD_LABELS.favourite_movies}>
            <Input
              value={form.favourite_movies}
              onChange={(e) => set("favourite_movies")(e.target.value)}
            />
          </Field>
          <Field label={FIELD_LABELS.favourite_person}>
            <Input
              value={form.favourite_person}
              onChange={(e) => set("favourite_person")(e.target.value)}
            />
          </Field>
          <Field label={FIELD_LABELS.idol}>
            <Input value={form.idol} onChange={(e) => set("idol")(e.target.value)} />
          </Field>
          <Field label={FIELD_LABELS.favourite_teacher}>
            <Input
              value={form.favourite_teacher}
              onChange={(e) => set("favourite_teacher")(e.target.value)}
            />
          </Field>
          <Field label={FIELD_LABELS.ultimate_goal} full>
            <Textarea
              value={form.ultimate_goal}
              onChange={(e) => set("ultimate_goal")(e.target.value)}
              rows={3}
            />
          </Field>
        </Section>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving} size="lg">
            {saving ? <Loader2 className="size-4 animate-spin" /> : null}
            Save profile
          </Button>
        </div>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-card sm:p-7">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({
  label,
  required,
  full,
  children,
}: {
  label: string;
  required?: boolean;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`space-y-1.5 ${full ? "sm:col-span-2" : ""}`}>
      <Label className="text-sm">
        {label}
        {required ? <span className="ml-0.5 font-bold text-primary">*</span> : null}
      </Label>
      {children}
    </div>
  );
}
