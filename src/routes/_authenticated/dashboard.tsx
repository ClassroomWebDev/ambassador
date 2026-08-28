import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowRight, Loader2, Plus, Target } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useMyRole, useProfile } from "@/hooks/useProfile";
import {
  isStaffRole,
  useCourses,
  useProgramSettings,
  useProspects,
  useSales,
  useTeam,
  type Sale,
} from "@/hooks/useBusiness";
import { profileCompletion, FIELD_LABELS } from "@/lib/profile-meta";
import { ROLE_LABELS } from "@/lib/types";
import { Leaderboard } from "@/components/Leaderboard";
import { SupportHub } from "@/components/SupportHub";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Ambassador Hub" },
      {
        name: "description",
        content: "Role-based sales KPIs, season target progress, points breakdown and the top 10 leaderboard.",
      },
      { property: "og:title", content: "Dashboard — Ambassador Hub" },
      { property: "og:description", content: "Sales KPIs, points and leaderboard in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const money = (v: number) => `৳${Number(v || 0).toLocaleString("en-US")}`;
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

function kpis(sales: Sale[], seasonStart: string | undefined) {
  const approved = sales.filter((s) => s.status === "approved");
  const today = startOfDay(new Date());
  const day = 86_400_000;
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
  const season = seasonStart ? new Date(seasonStart).getTime() : new Date(new Date().getFullYear(), 0, 1).getTime();

  const sum = (from: number, to = Infinity) =>
    approved
      .filter((s) => {
        const t = new Date(s.created_at).getTime();
        return t >= from && t < to;
      })
      .reduce((acc, s) => acc + Number(s.amount || 0), 0);

  return [
    { label: "Today", value: sum(today) },
    { label: "Yesterday", value: sum(today - day, today) },
    { label: "Last 7 days", value: sum(today - 6 * day) },
    { label: "This month", value: sum(monthStart) },
    { label: "This season", value: sum(season) },
    { label: "All time", value: sum(0) },
  ];
}

function dailySeries(sales: Sale[]) {
  const day = 86_400_000;
  const today = startOfDay(new Date());
  return Array.from({ length: 14 }, (_, i) => {
    const from = today - (13 - i) * day;
    const total = sales
      .filter((s) => s.status === "approved")
      .filter((s) => {
        const t = new Date(s.created_at).getTime();
        return t >= from && t < from + day;
      })
      .reduce((acc, s) => acc + Number(s.amount || 0), 0);
    return { day: new Date(from).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }), total };
  });
}

function Dashboard() {
  const { data: profile } = useProfile();
  const role: any = "admin";
  const { data: sales } = useSales();
  const { data: settings } = useProgramSettings();
  const stats = profileCompletion((profile ?? {}) as Record<string, unknown>);
  const staff = true;

  const rows = sales ?? [];
  const cards = useMemo(() => kpis(rows, settings?.season_start), [rows, settings?.season_start]);
  const series = useMemo(() => dailySeries(rows), [rows]);
  const pending = rows.filter((s) => s.status === "pending").length;

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          {role ? ROLE_LABELS[role] : "Member"} {profile?.auto_id ? `· ${profile.auto_id}` : ""}
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">
          Hello, {profile?.full_name?.split(" ")[0] || "there"}
        </h1>
      </header>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold">Sales performance</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {cards.map((c) => (
            <article key={c.label} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {c.label}
              </p>
              <p className="mt-1 font-display text-xl font-bold sm:text-2xl">{money(c.value)}</p>
            </article>
          ))}
        </div>
        <div className="rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-6">
          <p className="text-sm font-semibold">Approved sales · last 14 days</p>
          <div className="mt-4 h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.25} />
                <XAxis dataKey="day" fontSize={11} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis fontSize={11} tickLine={false} axisLine={false} width={44} />
                <Tooltip formatter={(v: number) => money(Number(v))} />
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {staff ? <StaffPanel pending={pending} /> : null}
      {role === "mentor" ? <TeamPanel title="Mentor network analytics" /> : null}
      {role === "coordinator" ? <TeamPanel title="My team points breakdown" showSalesLink /> : null}
      {!role || role === "ambassador" ? <AmbassadorPanel /> : null}

      <section className="rounded-3xl bg-surface-dark p-6 text-surface-dark-foreground sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-surface-dark-foreground/70">Profile completion</p>
            <p className="font-display text-5xl font-bold">{stats.percent}%</p>
          </div>
          <Button asChild>
            <Link to="/profile">
              Update profile <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        <Progress value={stats.percent} className="mt-6 bg-surface-dark-foreground/15" />
        <div className="mt-4 grid gap-1 text-sm text-surface-dark-foreground/70">
          <p>
            Mandatory {stats.mandatoryDone}/{stats.mandatoryTotal} · Optional {stats.optionalDone}/{stats.optionalTotal}
          </p>
          {stats.missingMandatory.length > 0 ? (
            <p>Still required: {stats.missingMandatory.map((f) => FIELD_LABELS[f]).join(", ")}</p>
          ) : (
            <p>All mandatory fields complete.</p>
          )}
        </div>
      </section>

      <Leaderboard limit={10} />

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold">Your support hub</h2>
        <SupportHub />
      </section>
    </div>
  );
}

function StaffPanel({ pending }: { pending: number }) {
  const { data: settings } = useProgramSettings();
  const { data: sales } = useSales();
  const approvedPoints = (sales ?? []).filter((s) => s.status === "approved").length;
  const target = settings?.season_target_points ?? 1000;
  const percent = Math.min(100, Math.round((approvedPoints / Math.max(target, 1)) * 100));

  return (
    <section className="grid gap-4 sm:grid-cols-2">
      <article className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Target className="size-4 text-primary" />
          <p className="text-sm font-semibold">Season target progress</p>
        </div>
        <p className="mt-3 font-display text-3xl font-bold">{percent}%</p>
        <Progress value={percent} className="mt-3" />
        <p className="mt-2 text-xs text-muted-foreground">
          {approvedPoints} approved sales against a {target} point season target.
        </p>
      </article>
      <article className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <p className="text-sm font-semibold">Pending approvals</p>
        <p className="mt-3 font-display text-3xl font-bold text-primary">{pending}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link to="/sales">Review sales</Link>
          </Button>
          <Button asChild size="sm" variant="secondary">
            <Link to="/users">Manage users</Link>
          </Button>
        </div>
      </article>
    </section>
  );
}

function TeamPanel({ title, showSalesLink = false }: { title: string; showSalesLink?: boolean }) {
  const { data: team } = useTeam();
  const rows = team ?? [];
  const chart = rows
    .map((m) => ({
      name: (m.full_name || "Member").split(" ")[0],
      total: m.learning_points + m.leadership_points,
    }))
    .slice(0, 10);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-semibold">{title}</h2>
        {showSalesLink ? (
          <Button asChild size="sm">
            <Link to="/sales">Enter a sale</Link>
          </Button>
        ) : null}
      </div>
      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
          Nobody is assigned to you yet.
        </p>
      ) : (
        <>
          <div className="rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-6">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chart}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.25} />
                  <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis fontSize={11} tickLine={false} axisLine={false} width={36} />
                  <Tooltip />
                  <Bar dataKey="total" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {rows.map((m) => (
              <article key={m.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <p className="text-sm font-semibold">{m.full_name || "Member"}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Learning {m.learning_points} · Leadership {m.leadership_points}
                </p>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function AmbassadorPanel() {
  const { data: profile } = useProfile();
  const { data: settings } = useProgramSettings();
  const learning = profile?.learning_points ?? 0;
  const leadership = profile?.leadership_points ?? 0;
  const total = learning + leadership;
  const target = settings?.season_target_points ?? 1000;
  const gap = Math.max(0, target - total);

  return (
    <section className="space-y-4">
      <h2 className="font-display text-xl font-semibold">Your points</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        <article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Learning points
          </p>
          <p className="mt-1 font-display text-2xl font-bold">{learning}</p>
        </article>
        <article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Leadership points
          </p>
          <p className="mt-1 font-display text-2xl font-bold">{leadership}</p>
        </article>
        <article className="rounded-2xl border-2 border-primary bg-primary/5 p-5">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-primary">Gap to season target</p>
          <p className="mt-1 font-display text-2xl font-bold text-primary">{gap}</p>
          <p className="text-xs text-muted-foreground">
            {total} / {target} points
          </p>
        </article>
      </div>
      <Progress value={Math.min(100, Math.round((total / Math.max(target, 1)) * 100))} />
      <SeatReservation />
    </section>
  );
}

function SeatReservation() {
  const { data: prospects } = useProspects();
  const { data: profile } = useProfile();
  const { data: courses } = useCourses();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [fb, setFb] = useState("");
  const [note, setNote] = useState(courses?.[0]?.name ?? "");
  const [saving, setSaving] = useState(false);

  async function reserve() {
    if (!name.trim() || !mobile.trim()) {
      toast.error("Name and mobile are required");
      return;
    }
    if (!profile?.id) return;
    setSaving(true);
    const { error } = await supabase.from("prospects").insert({
      ambassador_id: profile.id,
      name: name.trim(),
      mobile: mobile.trim(),
      facebook_link: fb.trim() || null,
      note: note.trim() || null,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Seat reserved");
    setName("");
    setMobile("");
    setFb("");
    void queryClient.invalidateQueries({ queryKey: ["prospects"] });
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <h3 className="font-display text-lg font-semibold">Seat reservation</h3>
      <p className="mt-1 text-sm text-muted-foreground">Reserve a seat for a prospective student.</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Name *</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="grid gap-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Mobile *</Label>
          <Input value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="01XXXXXXXXX" />
        </div>
        <div className="grid gap-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Facebook profile link
          </Label>
          <Input value={fb} onChange={(e) => setFb(e.target.value)} placeholder="https://facebook.com/…" />
        </div>
        <div className="grid gap-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Interested course / note
          </Label>
          <Input value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
      </div>
      <Button className="mt-5" disabled={saving} onClick={() => void reserve()}>
        {saving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} Reserve seat
      </Button>

      {(prospects ?? []).length > 0 ? (
        <ul className="mt-6 grid gap-2">
          {(prospects ?? []).map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border px-4 py-3 text-sm"
            >
              <span>
                <span className="font-medium">{p.name}</span>
                <span className="block text-xs text-muted-foreground">
                  {p.mobile}
                  {p.note ? ` · ${p.note}` : ""}
                </span>
              </span>
              <Badge variant="secondary">{p.status}</Badge>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
