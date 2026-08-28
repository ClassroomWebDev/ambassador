import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BadgeCheck, Loader2, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMyRole, useProfile } from "@/hooks/useProfile";
import { isStaffRole, useCourses, useSales, useTeam } from "@/hooks/useBusiness";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/sales")({
  head: () => ({
    meta: [
      { title: "Sales & Approvals — Ambassador Hub" },
      {
        name: "description",
        content: "Submit course sales at the student special price and approve pending sales to award leadership points.",
      },
      { property: "og:title", content: "Sales & Approvals — Ambassador Hub" },
      { property: "og:description", content: "Sales entry, approvals, invoices and leadership points." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SalesPage,
});

const PAYMENT_METHODS = ["bKash", "Nagad", "Rocket", "Bank Transfer", "Cash"] as const;
const money = (v: number) => `৳${Number(v || 0).toLocaleString("en-US")}`;

function SalesPage() {
  const { data: role } = useMyRole();
  const staff = isStaffRole(role);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Sales</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">
          {staff ? "Sales & approvals" : "Submit a sale"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {staff
            ? "Review pending submissions, approve to generate the invoice and award leadership points."
            : "Enrol a student at the student special price — leadership points arrive once approved."}
        </p>
      </header>

      <SalesEntry />
      {staff ? <Approvals /> : null}
      <MySales />
    </div>
  );
}

function SalesEntry() {
  const { data: role } = useMyRole();
  const { data: profile } = useProfile();
  const { data: courses } = useCourses();
  const { data: team } = useTeam();
  const queryClient = useQueryClient();
  const isAmbassador = role === "ambassador" || !role;

  const [courseId, setCourseId] = useState("");
  const [ambassadorId, setAmbassadorId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentMobile, setStudentMobile] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentInstitution, setStudentInstitution] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>(PAYMENT_METHODS[0]);
  const [saving, setSaving] = useState(false);

  const course = useMemo(() => (courses ?? []).find((c) => c.id === courseId) ?? null, [courses, courseId]);
  const amount = Number(course?.student_price ?? 0);
  const effectiveAmbassadorId = isAmbassador ? (profile?.id ?? "") : ambassadorId;

  async function submit() {
    if (!courseId) return toast.error("Select a course");
    if (!effectiveAmbassadorId) return toast.error("Select the ambassador this sale belongs to");
    if (!studentName.trim() || !studentMobile.trim()) return toast.error("Student name and mobile are required");

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
      amount,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Sale submitted for approval");
    setStudentName("");
    setStudentMobile("");
    setStudentEmail("");
    setStudentInstitution("");
    void queryClient.invalidateQueries({ queryKey: ["sales"] });
  }

  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <h2 className="font-display text-xl font-semibold">Sales entry</h2>
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
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ambassador *</Label>
          {isAmbassador ? (
            <Input value={profile?.full_name ?? "You"} readOnly className="bg-muted" />
          ) : (
            <select
              value={ambassadorId}
              onChange={(e) => setAmbassadorId(e.target.value)}
              className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
            >
              <option value="">Select assigned ambassador</option>
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
      </div>
      <Button className="mt-6" onClick={() => void submit()} disabled={saving}>
        {saving ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} Submit sale
      </Button>
    </section>
  );
}

function Approvals() {
  const { data: sales } = useSales();
  const { data: courses } = useCourses();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState<string | null>(null);
  const pending = (sales ?? []).filter((s) => s.status === "pending");

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
    toast.success(status === "approved" ? "Sale approved — invoice created" : "Sale rejected");
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

function MySales() {
  const { data: sales, isLoading } = useSales();
  const { data: courses } = useCourses();

  return (
    <section className="space-y-4">
      <h2 className="font-display text-xl font-semibold">Sales history</h2>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (sales ?? []).length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
          No sales submitted yet.
        </p>
      ) : (
        <div className="grid gap-3">
          {(sales ?? []).map((s) => (
            <article key={s.id} className="rounded-3xl border border-border bg-card p-5 shadow-sm">
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
              {s.status === "approved" ? (
                <p className="mt-3 text-xs font-medium text-muted-foreground">
                  Invoice {s.invoice_no} · TX {s.tx_id}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
