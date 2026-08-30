import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CalendarCheck, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMyRole } from "@/hooks/useProfile";
import {
  canTakeAttendance,
  useCourses,
  useMyAttendance,
  useSessionAttendance,
  useSessions,
  useTeam,
} from "@/hooks/useBusiness";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/attendance")({
  head: () => ({
    meta: [
      { title: "Attendance — Ambassador Hub" },
      {
        name: "description",
        content: "Take class attendance for your team or review your own date-wise attended classes and learning points.",
      },
      { property: "og:title", content: "Attendance — Ambassador Hub" },
      { property: "og:description", content: "Attendance turns straight into learning points." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AttendancePage,
});

function AttendancePage() {
  const { data: role } = useMyRole();
  const supervisor = canTakeAttendance(role);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Attendance</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">
          {supervisor ? "Take attendance" : "My attendance log"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {supervisor
            ? "Pick a class session, mark who was present and submit — learning points are awarded automatically."
            : "Every class you attended, with the learning points it earned."}
        </p>
      </header>

      {supervisor ? <TakeAttendance /> : null}
      <MyAttendanceLog />
    </div>
  );
}

function TakeAttendance() {
  const { data: sessions } = useSessions();
  const { data: courses } = useCourses();
  const { data: team } = useTeam();
  const [sessionId, setSessionId] = useState<string>("");
  const { data: existing } = useSessionAttendance(sessionId || null);
  const [present, setPresent] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const map: Record<string, boolean> = {};
    for (const row of existing ?? []) map[row.ambassador_id] = row.present;
    setPresent(map);
  }, [existing, sessionId]);

  const courseName = useMemo(() => {
    const s = (sessions ?? []).find((x) => x.id === sessionId);
    if (!s) return null;
    return (courses ?? []).find((c) => c.id === s.course_id)?.name ?? null;
  }, [sessionId, sessions, courses]);

  async function submit() {
    if (!sessionId) {
      toast.error("Select a class session first");
      return;
    }
    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    const rows = (team ?? []).map((m) => ({
      session_id: sessionId,
      ambassador_id: m.id,
      present: !!present[m.id],
      marked_by: userData.user?.id ?? null,
    }));
    const { error } = await supabase.from("attendances").upsert(rows, { onConflict: "session_id,ambassador_id" });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Attendance submitted");
    void queryClient.invalidateQueries({ queryKey: ["session-attendance", sessionId] });
    void queryClient.invalidateQueries({ queryKey: ["my-team"] });
  }

  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <label className="grid max-w-md gap-1.5 text-sm font-medium">
        Class session
        <select
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
        >
          <option value="">Select a session</option>
          {(sessions ?? []).map((s) => (
            <option key={s.id} value={s.id}>
              {s.session_date} · {s.title}
            </option>
          ))}
        </select>
      </label>
      {courseName ? <p className="mt-2 text-xs text-muted-foreground">Course: {courseName}</p> : null}

      <div className="mt-6 space-y-2">
        {(team ?? []).length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-5 text-sm text-muted-foreground">
            No team members are assigned to you yet.
          </p>
        ) : (
          (team ?? []).map((m) => (
            <label
              key={m.id}
              className="flex cursor-pointer items-center justify-between rounded-2xl border border-border px-4 py-3"
            >
              <span>
                <span className="text-sm font-semibold">{m.full_name || "Member"}</span>
                <span className="ml-2 text-xs text-muted-foreground">{m.designation ?? "Ambassador"}</span>
              </span>
              <span className="flex items-center gap-3">
                <Badge variant="secondary">{m.learning_points} LP</Badge>
                <Checkbox
                  checked={!!present[m.id]}
                  onCheckedChange={(v) => setPresent((p) => ({ ...p, [m.id]: v === true }))}
                />
              </span>
            </label>
          ))
        )}
      </div>

      <Button className="mt-6" onClick={() => void submit()} disabled={saving || !sessionId}>
        {saving ? <Loader2 className="size-4 animate-spin" /> : <CalendarCheck className="size-4" />}
        Submit attendance
      </Button>
    </section>
  );
}

function MyAttendanceLog() {
  const { data, isLoading } = useMyAttendance();
  const rows = (data ?? []) as Array<{
    id: string;
    present: boolean;
    session_id: string;
    class_sessions: {
      title: string;
      session_date: string;
      courses: { name: string; learning_points_per_class: number } | null;
    } | null;
  }>;
  const sorted = [...rows].sort((a, b) =>
    (b.class_sessions?.session_date ?? "").localeCompare(a.class_sessions?.session_date ?? ""),
  );

  return (
    <section className="space-y-4">
      <h2 className="font-display text-xl font-semibold">Date-wise attended classes</h2>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : sorted.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
          No attendance recorded yet.
        </p>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Class</th>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Points</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="px-4 py-3">{r.class_sessions?.session_date ?? "—"}</td>
                  <td className="px-4 py-3 font-medium">{r.class_sessions?.title ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.class_sessions?.courses?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Badge variant={r.present ? "default" : "secondary"}>{r.present ? "Present" : "Absent"}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {r.present ? (r.class_sessions?.courses?.learning_points_per_class ?? 0) : 0}
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
