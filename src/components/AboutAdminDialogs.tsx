import { useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import {
  LOGO_CATEGORIES,
  parseSocialLinks,
  type CompanyWing,
  type LogoCategory,
} from "@/hooks/useEcosystem";

/** Upload an image to the site assets bucket and return a long-lived signed URL. */
export async function uploadSiteAsset(file: File, folder = "logos"): Promise<string | null> {
  const path = `${folder}/${crypto.randomUUID()}-${file.name.replace(/[^\w.-]/g, "_")}`;
  const { error } = await supabase.storage.from("site-assets").upload(path, file, { upsert: true });
  if (error) {
    toast.error(error.message);
    return null;
  }
  const { data } = await supabase.storage.from("site-assets").createSignedUrl(path, 60 * 60 * 24 * 365 * 5);
  return data?.signedUrl ?? null;
}

function linksToText(value: unknown) {
  return parseSocialLinks(value)
    .map((l) => `${l.label} | ${l.url}`)
    .join("\n");
}

function textToLinks(text: string) {
  return text
    .split("\n")
    .map((line) => line.split("|").map((p) => p.trim()))
    .filter((parts) => parts.length >= 2 && parts[0] && parts[1])
    .map((parts) => ({ label: parts[0]!, url: parts[1]! }));
}

function FieldRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

/* -------------------------- mother company (hero) -------------------------- */

/**
 * The mother company record is stored in `company_wings` with sort_order 0,
 * so the About hero is fully admin-editable without a separate table.
 */
export function AboutHeroDialog({
  mother,
  fallback,
}: {
  mother: CompanyWing | undefined;
  fallback: { name: string; tagline: string; story: string; address: string; helpline: string; email: string };
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState({
    name: mother?.name ?? fallback.name,
    tagline: mother?.tagline ?? fallback.tagline,
    description: mother?.description ?? fallback.story,
    address: mother?.address ?? fallback.address,
    helpline: mother?.helpline ?? fallback.helpline,
    email: mother?.email ?? fallback.email,
    logo_url: mother?.logo_url ?? "",
    links: mother ? linksToText(mother.social_links) : "",
  });

  async function save() {
    if (!draft.name.trim()) {
      toast.error("Headline is required");
      return;
    }
    setBusy(true);
    const payload = {
      name: draft.name.trim(),
      tagline: draft.tagline.trim() || null,
      description: draft.description.trim() || null,
      address: draft.address.trim() || null,
      helpline: draft.helpline.trim() || null,
      email: draft.email.trim() || null,
      logo_url: draft.logo_url.trim() || null,
      social_links: textToLinks(draft.links),
      sort_order: 0,
    };
    const { data: userData } = await supabase.auth.getUser();
    const { error } = mother
      ? await supabase.from("company_wings").update(payload).eq("id", mother.id)
      : await supabase.from("company_wings").insert({ ...payload, created_by: userData.user?.id ?? null });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("About details saved");
    void queryClient.invalidateQueries({ queryKey: ["company-wings"] });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary">
          Edit About Details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit About details</DialogTitle>
          <DialogDescription>Mother company branding, story and corporate contact.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FieldRow label="Headline *">
            <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} maxLength={140} />
          </FieldRow>
          <FieldRow label="Tagline">
            <Input value={draft.tagline} onChange={(e) => setDraft({ ...draft, tagline: e.target.value })} maxLength={180} />
          </FieldRow>
          <div className="sm:col-span-2">
            <FieldRow label="Story description">
              <Textarea
                rows={5}
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                maxLength={2000}
              />
            </FieldRow>
          </div>
          <div className="sm:col-span-2">
            <FieldRow label="Headquarters address">
              <Input value={draft.address} onChange={(e) => setDraft({ ...draft, address: e.target.value })} />
            </FieldRow>
          </div>
          <FieldRow label="Helpline">
            <Input value={draft.helpline} onChange={(e) => setDraft({ ...draft, helpline: e.target.value })} />
          </FieldRow>
          <FieldRow label="Support email">
            <Input value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
          </FieldRow>
          <div className="sm:col-span-2">
            <FieldRow label="Action button URLs — one per line as “Label | https://url”">
              <Textarea
                rows={4}
                value={draft.links}
                onChange={(e) => setDraft({ ...draft, links: e.target.value })}
                placeholder={"Official Website | https://…\nFacebook | https://…\nYouTube | https://…"}
              />
            </FieldRow>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => void save()} disabled={busy}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save details
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------ sister concern ----------------------------- */

export function WingDialog({ nextOrder }: { nextOrder: number }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState({
    name: "",
    tagline: "",
    description: "",
    helpline: "",
    email: "",
    logo_url: "",
    links: "",
  });

  async function pick(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    const url = await uploadSiteAsset(file, "wings");
    setBusy(false);
    if (url) {
      setDraft((d) => ({ ...d, logo_url: url }));
      toast.success("Logo uploaded");
    }
  }

  async function create() {
    if (!draft.name.trim()) {
      toast.error("Name is required");
      return;
    }
    setBusy(true);
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase.from("company_wings").insert({
      name: draft.name.trim(),
      tagline: draft.tagline.trim() || null,
      description: draft.description.trim() || null,
      helpline: draft.helpline.trim() || null,
      email: draft.email.trim() || null,
      logo_url: draft.logo_url.trim() || null,
      social_links: textToLinks(draft.links),
      sort_order: nextOrder,
      created_by: userData.user?.id ?? null,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Sister concern added");
    setDraft({ name: "", tagline: "", description: "", helpline: "", email: "", logo_url: "", links: "" });
    void queryClient.invalidateQueries({ queryKey: ["company-wings"] });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">+ Add New Wing / Sister Concern</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add wing / sister concern</DialogTitle>
          <DialogDescription>Shown in the ecosystem grid instantly after saving.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FieldRow label="Name *">
            <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} maxLength={120} />
          </FieldRow>
          <FieldRow label="Tagline">
            <Input value={draft.tagline} onChange={(e) => setDraft({ ...draft, tagline: e.target.value })} maxLength={160} />
          </FieldRow>
          <div className="sm:col-span-2">
            <FieldRow label="Description">
              <Textarea
                rows={4}
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                maxLength={1200}
              />
            </FieldRow>
          </div>
          <FieldRow label="Helpline">
            <Input value={draft.helpline} onChange={(e) => setDraft({ ...draft, helpline: e.target.value })} />
          </FieldRow>
          <FieldRow label="Email">
            <Input value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
          </FieldRow>
          <FieldRow label="Logo URL">
            <Input value={draft.logo_url} onChange={(e) => setDraft({ ...draft, logo_url: e.target.value })} placeholder="https://…" />
          </FieldRow>
          <FieldRow label="…or upload a logo">
            <Input type="file" accept="image/*" onChange={(e) => void pick(e.target.files?.[0])} />
          </FieldRow>
          <div className="sm:col-span-2">
            <FieldRow label="Social / web links — one per line as “Label | https://url”">
              <Textarea
                rows={3}
                value={draft.links}
                onChange={(e) => setDraft({ ...draft, links: e.target.value })}
                placeholder={"Website | https://…\nFacebook | https://…"}
              />
            </FieldRow>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => void create()} disabled={busy}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Add concern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------------- logos ---------------------------------- */

export function LogoDialog({
  category,
  nextOrder,
  label,
  variant = "secondary",
}: {
  category: LogoCategory;
  nextOrder: number;
  label: string;
  variant?: "secondary" | "default";
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState({ title: "", logo_url: "", link_url: "", category });

  async function pick(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    const url = await uploadSiteAsset(file, "logos");
    setBusy(false);
    if (url) {
      setDraft((d) => ({ ...d, logo_url: url }));
      toast.success("Logo uploaded");
    }
  }

  async function create() {
    if (!draft.title.trim() || !draft.logo_url.trim()) {
      toast.error("Name and logo image are required");
      return;
    }
    setBusy(true);
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase.from("logo_boards").insert({
      title: draft.title.trim(),
      logo_url: draft.logo_url.trim(),
      link_url: draft.link_url.trim() || null,
      category: draft.category,
      sort_order: nextOrder,
      created_by: userData.user?.id ?? null,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Logo added");
    setDraft({ title: "", logo_url: "", link_url: "", category });
    void queryClient.invalidateQueries({ queryKey: ["logo-boards"] });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant={variant}>
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add logo</DialogTitle>
          <DialogDescription>Appears on the selected logo board immediately.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4">
          <FieldRow label="Institution / brand name *">
            <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} maxLength={120} />
          </FieldRow>
          <FieldRow label="Logo image URL *">
            <Input value={draft.logo_url} onChange={(e) => setDraft({ ...draft, logo_url: e.target.value })} placeholder="https://…" />
          </FieldRow>
          <FieldRow label="…or upload an image">
            <Input type="file" accept="image/*" onChange={(e) => void pick(e.target.files?.[0])} />
          </FieldRow>
          <FieldRow label="Website link">
            <Input value={draft.link_url} onChange={(e) => setDraft({ ...draft, link_url: e.target.value })} placeholder="https://…" />
          </FieldRow>
          <FieldRow label="Category">
            <Select
              value={draft.category}
              onValueChange={(v) => setDraft({ ...draft, category: v as LogoCategory })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOGO_CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldRow>
        </div>
        <DialogFooter>
          <Button onClick={() => void create()} disabled={busy}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Add logo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
