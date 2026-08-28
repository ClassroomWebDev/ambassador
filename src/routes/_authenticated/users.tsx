import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Loader2, ShieldCheck, UserPlus } from "lucide-react";
import { createMember, listMembers, setMemberStatus } from "@/lib/members.functions";
import { useMyRole } from "@/hooks/useProfile";
import { isStaffRole } from "@/hooks/useBusiness";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/users")({
  head: () => ({
    meta: [
      { title: "User management — Ambassador Hub" },
      {
        name: "description",
        content: "Create mentors, coordinators and campus ambassadors and switch accounts between active and held.",
      },
      { property: "og:title", content: "User management — Ambassador Hub" },
      { property: "og:description", content: "Create members and control account status." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: UsersPage;
});

type NewRole = "mentor" | "coordinator" | "ambassador";

function UsersPage() {
  const { data: role } = useMyRole();
  const staff = isStaffRole(role);
  const list = useServerFn(listMembers);
  const members = useQuery({
    queryKey: ["members"],
    enabled: staff,
    queryFn: () => list(),
  });

  if (!staff) {
    return (
      <div className="mx-auto max-w-3xl rounded-3xl border border-dashed border-border p-8 text-sm text-muted-foreground">
        User management is available to admins and managers only.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Administration</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">User management</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Create mentors (CBM), coordinators (CBC) and campus ambassadors (CBA), then control account status.
        </p>
      </header>

      <CreateMemberForm members={members.data ?? []} />
      <MemberTable members={members.data ?? []} loading={members.isLoading} />
    </div>
  );
}

type MemberRow = {
  id: string;
  auto_id: string | null;
  full_name: string;
  mobile: string | null;
  status: string;
  institution: string | null;
  role: string;
};

function CreateMemberForm({ members }: { members: MemberRow[] }) {
  const queryClient = useQueryClient();
  const create = useServerFn(createMember);
  const [form, setForm] = useState({
    full_name: "",
    mobile: "",
    email: "",
    password: "",
    institution: "",
    designation: "",
    role: "ambassador" as NewRole,
    mentor_id: "",
    support_manager_id: "",
    coordinator_id: "",
  });

  const mentors = useMemo(() => members.filter((m) => m.role === "mentor"), [members]);
  const managers = useMemo(() => members.filter((m) => m.role === "support_manager"), [members]);
  const coordinators = useMemo(() => members.filter((m) => m.role === "coordinator"), [members]);

  const mutation = useMutation({
    mutationFn: () =>
      create({
        data: {
          full_name: form.full_name.trim(),
          mobile: form.mobile.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role,
          institution: form.institution.trim() || null,
          designation: form.designation.trim() || null,
          mentor_id: form.mentor_id || null,
          support_manager_id: form.support_manager_id || null,
          coordinator_id: form.coordinator_id || null,
        },
      }),
    onSuccess: (res) => {
      toast.success(`Member created${res?.auto_id ? ` — ${res.auto_id}` : ""}`);
      setForm((f) => ({ ...f, full_name: "", mobile: "", email: "", password: "", institution: "" }));
      void queryClient.invalidateQueries({ queryKey: ["members"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <h2 className="font-display text-xl font-semibold">Create a member</h2>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Field label="Name *">
          <Input value={form.full_name} onChange={set("full_name")} />
        </Field>
        <Field label="Mobile *">
          <Input value={form.mobile} onChange={set("mobile")} placeholder="01XXXXXXXXX" />
        </Field>
        <Field label="Email *">
          <Input type="email" value={form.email} onChange={set("email")} />
        </Field>
        <Field label="Temporary password *">
          <Input value={form.password} onChange={set("password")} />
        </Field>
        <Field label="Role *">
          <select
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as NewRole }))}
            className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
          >
            <option value="ambassador">Campus Ambassador (CBA)</option>
            <option value="coordinator">Coordinator (CBC)</option>
            <option value="mentor">Mentor (CBM)</option>
          </select>
        </Field>
        <Field label="Institution">
          <Input value={form.institution} onChange={set("institution")} />
        </Field>
        <Field label="Designation">
          <Input value={form.designation} onChange={set("designation")} />
        </Field>
        <Field label="Mentor">
          <Picker value={form.mentor_id} onChange={set("mentor_id")} options={mentors} placeholder="Select mentor" />
        </Field>
        <Field label="Support manager">
          <Picker
            value={form.support_manager_id}
            onChange={set("support_manager_id")}
            options={managers}
            placeholder="Select support manager"
          />
        </Field>
        {form.role === "ambassador" ? (
          <Field label="Coordinator">
            <Picker
              value={form.coordinator_id}
              onChange={set("coordinator_id")}
              options={coordinators}
              placeholder="Select coordinator"
            />
          </Field>
        ) : null}
      </div>
      <Button className="mt-6" disabled={mutation.isPending} onClick={() => mutation.mutate()}>
        {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />} Create
        member
      </Button>
    </section>
  );
}

function MemberTable({ members, loading }: { members: MemberRow[]; loading: boolean }) {
  const queryClient = useQueryClient();
  const toggle = useServerFn(setMemberStatus);
  const [busy, setBusy] = useState<string | null>(null);

  async function flip(m: MemberRow) {
    setBusy(m.id);
    try {
      await toggle({ data: { user_id: m.id, status: m.status === "held" ? "active" : "held" } });
      toast.success(`${m.full_name || "Member"} is now ${m.status === "held" ? "active" : "held"}`);
      await queryClient.invalidateQueries({ queryKey: ["members"] });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="space-y-4">
      <h2 className="font-display text-xl font-semibold">All members</h2>
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading members…</p>
      ) : members.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
          No members yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-border bg-card shadow-sm">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Institution</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-t border-border">
                  <td className="px-4 py-3 text-muted-foreground">{m.auto_id ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className="font-medium">{m.full_name || "Member"}</span>
                    <span className="block text-xs text-muted-foreground">{m.mobile || "—"}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {ROLE_LABELS[m.role as keyof typeof ROLE_LABELS] ?? m.role}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{m.institution || "—"}</td>
                  <td className="px-4 py-3">
                    <Badge variant={m.status === "held" ? "destructive" : "default"}>{m.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant={m.status === "held" ? "default" : "secondary"}
                      disabled={busy === m.id}
                      onClick={() => void flip(m)}
                    >
                      {busy === m.id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <ShieldCheck className="size-3.5" />
                      )}
                      {m.status === "held" ? "Set active" : "Hold account"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function Picker({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (e: { target: { value: string } }) => void;
  options: MemberRow[];
  placeholder: string;
}) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.id} value={o.id}>
          {o.auto_id ? `${o.auto_id} · ` : ""}
          {o.full_name || "Member"}
        </option>
      ))}
    </select>
  );
}
