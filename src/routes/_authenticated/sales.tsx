import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BadgeCheck, Loader2, Printer, RotateCcw, Send, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMyRole, useProfile } from "@/hooks/useProfile";
import { isStaffRole, useCourses, useProgramSettings, useSales, useTeam, type Sale } from "@/hooks/useBusiness";
import { MoneyReceipt } from "@/components/MoneyReceipt";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/sales")({
  head: () => ({
    meta: [
      { title: "Opportunities — Ambassador Hub" },
      {
        name: "description",
        content:
          "Submit new opportunities at the student special price and approve pending opportunities to award leadership points.",
      },
      { property: "og:title", content: "Opportunities — Ambassador Hub" },
      { property: "og:description", content: "Opportunity entry, approvals, invoices and leadership points." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OpportunityPage,
});

const PAYMENT_METHODS = ["bKash", "Nagad", "Rocket", "Bank Transfer", "Cash"] as const;
const money = (v: number) => `৳${Number(v || 0).toLocaleString("en-US")}`;

function OpportunityPage() {
  const { data: role } = useMyRole();
  const staff = isStaffRole(role);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Opportunity</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">
          {staff ? "Opportunities & approvals" : "New opportunity"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {staff
            ? "Review pending opportunities, approve to generate the invoice and award leadership points."
            : "Enrol a student at the student special price — leadership points arrive once the opportunity is approved."}
        </p>
      </header>

      <OpportunityEntry />
      {staff ? <Approvals /> : null}
      <OpportunityHistory />
    </div>
  );
}

function OpportunityEntry() {
  const { data: role } = useMyRole();
  const { data: profile } = useProfile();
  const { data: courses } = useCourses();
  const { data: team } = useTeam();
  const queryClient = useQueryClient();
  const selfOnly = role === "ambassador" || !role;

  const [courseId, setCourseId] = useState("");
  const [ambassadorId, setAmbassadorId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentMobile, setStudentMobile] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentInstitution, setStudentInstitution] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>(PAYMENT_METHODS[0]);
  const [orderNo, setOrderNo] = useState("");
  const [paymentRef, setPaymentRef] = useState("");
  const [saving, setSaving] = useState(false);

  const course = useMemo(() => (courses ?? []).find((c) => c.id === courseId) ?? null, [courses, courseId]);
  const amount = Number(course?.student_price ?? 0);
  const effectiveAmbassadorId = selfOnly || !ambassadorId ? (profile?.id ?? "") : ambassadorId;

  async function submit() {
    if (!courseId) {
      toast.error("Select a course");
      return;
    }
    if (!effectiveAmbassadorId) {
      toast.error("Select the member this opportunity belongs to");
      return;
    }
    if (!studentName.trim() || !studentMobile.trim()) {
      toast.error("Student name and mobile are required");
      return;
    }

    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase.from("sales").insert({
      course_id: courseId,
      ambassador_id: effectiveAmbassadorId,
      submitted_by: userData.user?.id ?? null,
      student_name: studentName.trim(),
      student_mobile: studentMobile.trim(),
      student_email: studentEmail.trim() || null,
      student_institution: studentInstitution.trim() || null,
      payment_method: paymentMethod,
      order_no: orderNo.trim() || null,
      payment_ref: paymentRef.trim() || null,
      amount,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Opportunity submitted for approval");
    setStudentName("");
    setStudentMobile("");
    setStudentEmail("");
    setStudentInstitution("");
    setOrderNo("");
    setPaymentRef("");
    void queryClient.invalidateQueries({ queryKey: ["sales"] });
  }

  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <h2 className="font-display text-xl font-semibold">Opportunity entry</h2>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div className="grid gap-1.5 sm:col-span-2">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Course *</Label>
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
          >
            <option value="">Select course</option>
            {(courses ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Student special price
          </Label>
          <div className="flex h-10 items-center rounded-xl bg-primary px-4 font-display text-sm font-bold text-primary-foreground">
            {money(amount)}
          </div>
        </div>

        <div className="grid gap-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Credited to *</Label>
          {selfOnly ? (
            <Input value={profile?.full_name ?? "You"} readOnly className="bg-muted" />
          ) : (
            <select
              value={ambassadorId}
              onChange={(e) => setAmbassadorId(e.target.value)}
              className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
            >
              <option value="">Myself ({profile?.full_name ?? "me"})</option>
              {(team ?? []).map((m) => (
                <option key={m.id} value={m.id}>
                  {m.full_name || "Member"}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="grid gap-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Student name *</Label>
          <Input value={studentName} onChange={(e) => setStudentName(e.target.value)} />
        </div>
        <div className="grid gap-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Student mobile *</Label>
          <Input value={studentMobile} onChange={(e) => setStudentMobile(e.target.value)} placeholder="01XXXXXXXXX" />
        </div>
        <div className="grid gap-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Student email</Label>
          <Input type="email" value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} />
        </div>
        <div className="grid gap-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Institution</Label>
          <Input value={studentInstitution} onChange={(e) => setStudentInstitution(e.target.value)} />
        </div>
        <div className="grid gap-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Payment method *</Label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
          >
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Order number</Label>
          <Input value={orderNo} onChange={(e) => setOrderNo(e.target.value)} />
        </div>
        <div className="grid gap-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Payment reference
          </Label>
          <Input value={paymentRef} onChange={(e) => setPaymentRef(e.target.value)} />
        </div>
      </div>
      <Button className="mt-6" onClick={() => void submit()} disabled={saving}>
        {saving ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} Submit opportunity
      </Button>
    </section>
  );
}

function Approvals() {
  const { data: sales } = useSales();
  const { data: courses } = useCourses();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState<string | null>(null);
  const pending = (sales ?? []).filter((s) => s.status === "pending" && !s.deleted_at);

  async function decide(id: string, status: "approved" | "rejected") {
    setBusy(id);
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("sales")
      .update({ status, approved_by: userData.user?.id ?? null })
      .eq("id", id);
    setBusy(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(status === "approved" ? "Opportunity approved — invoice created" : "Opportunity rejected");
    void queryClient.invalidateQueries({ queryKey: ["sales"] });
  }

  return (
    <section className="space-y-4">
      <h2 className="font-display text-xl font-semibold">Pending approvals</h2>
      {pending.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
          Nothing waiting for approval.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-border bg-card shadow-sm">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {pending.map((s) => (
                <tr key={s.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <span className="font-medium">{s.student_name}</span>
                    <span className="block text-xs text-muted-foreground">{s.student_mobile}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {(courses ?? []).find((c) => c.id === s.course_id)?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3">{money(Number(s.amount))}</td>
                  <td className="px-4 py-3">{s.payment_method}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" disabled={busy === s.id} onClick={() => void decide(s.id, "approved")}>
                        {busy === s.id ? <Loader2 className="size-3.5 animate-spin" /> : <BadgeCheck className="size-3.5" />}
                        Approve
                      </Button>
                      <Button size="sm" variant="ghost" disabled={busy === s.id} onClick={() => void decide(s.id, "rejected")}>
                        Reject
                      </Button>
                    </div>
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

function OpportunityHistory() {
  const { data: sales, isLoading } = useSales();
  const { data: courses } = useCourses();
  const { data: settings } = useProgramSettings();
  const { data: role } = useMyRole();
  const staff = isStaffRole(role);
  const queryClient = useQueryClient();
  const [receipt, setReceipt] = useState<Sale | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const rows = sales ?? [];
  const live = rows.filter((s) => !s.deleted_at);
  const groups = {
    pending: live.filter((s) => s.status === "pending"),
    approved: live.filter((s) => s.status === "approved"),
    rejected: live.filter((s) => s.status === "rejected"),
    trash: rows.filter((s) => !!s.deleted_at),
  };

  async function softDelete(id: string) {
    setBusy(id);
    const { error } = await supabase.from("sales").update({ deleted_at: new Date().toISOString() }).eq("id", id);
    setBusy(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Opportunity moved to trash");
    void queryClient.invalidateQueries({ queryKey: ["sales"] });
  }

  async function restore(id: string) {
    setBusy(id);
    const { error } = await supabase.from("sales").update({ deleted_at: null }).eq("id", id);
    setBusy(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Opportunity restored");
    void queryClient.invalidateQueries({ queryKey: ["sales"] });
  }

  function Card({ s, trashed }: { s: Sale; trashed: boolean }) {
    return (
      <article className="rounded-3xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-semibold">{s.student_name}</p>
            <p className="text-xs text-muted-foreground">
              {(courses ?? []).find((c) => c.id === s.course_id)?.name ?? "—"} · {s.payment_method} ·{" "}
              {money(Number(s.amount))}
            </p>
          </div>
          <Badge variant={s.status === "approved" ? "default" : s.status === "rejected" ? "destructive" : "secondary"}>
            {s.status}
          </Badge>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          {s.status === "approved" ? (
            <p className="text-xs font-medium text-muted-foreground">
              Invoice {s.invoice_no} · TX {s.tx_id}
            </p>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            {s.status === "approved" && !trashed ? (
              <Button size="sm" variant="secondary" onClick={() => setReceipt(s)}>
                <Printer className="size-3.5" /> Money receipt
              </Button>
            ) : null}
            {staff && trashed ? (
              <Button size="sm" variant="secondary" disabled={busy === s.id} onClick={() => void restore(s.id)}>
                {busy === s.id ? <Loader2 className="size-3.5 animate-spin" /> : <RotateCcw className="size-3.5" />}{" "}
                Restore
              </Button>
            ) : null}
            {staff && !trashed ? (
              <Button size="sm" variant="ghost" disabled={busy === s.id} onClick={() => void softDelete(s.id)}>
                <Trash2 className="size-3.5" /> Delete
              </Button>
            ) : null}
          </div>
        </div>
      </article>
    );
  }

  function List({ items, empty, trashed = false }: { items: Sale[]; empty: string; trashed?: boolean }) {
    if (items.length === 0) {
      return (
        <p className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">{empty}</p>
      );
    }
    return (
      <div className="grid gap-3">
        {items.map((s) => (
          <Card key={s.id} s={s} trashed={trashed} />
        ))}
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="font-display text-xl font-semibold">Opportunity history</h2>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <Tabs defaultValue="pending">
          <TabsList className="flex-wrap">
            <TabsTrigger value="pending">Pending ({groups.pending.length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({groups.approved.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({groups.rejected.length})</TabsTrigger>
            {staff ? <TabsTrigger value="trash">Trash ({groups.trash.length})</TabsTrigger> : null}
          </TabsList>
          <TabsContent value="pending" className="mt-4">
            <List items={groups.pending} empty="No pending opportunities." />
          </TabsContent>
          <TabsContent value="approved" className="mt-4">
            <List items={groups.approved} empty="No approved opportunities yet." />
          </TabsContent>
          <TabsContent value="rejected" className="mt-4">
            <List items={groups.rejected} empty="No rejected opportunities." />
          </TabsContent>
          {staff ? (
            <TabsContent value="trash" className="mt-4">
              <List items={groups.trash} empty="Trash is empty." trashed />
            </TabsContent>
          ) : null}
        </Tabs>
      )}
      {receipt ? (
        <MoneyReceipt
          sale={receipt}
          course={(courses ?? []).find((c) => c.id === receipt.course_id) ?? null}
          settings={settings ?? null}
          onClose={() => setReceipt(null)}
        />
      ) : null}
    </section>
  );
}
