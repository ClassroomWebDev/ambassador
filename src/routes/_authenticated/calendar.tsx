import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCourses, useSessions } from "@/hooks/useBusiness";
import { useEvents } from "@/hooks/useContent";
import { useActiveSeason } from "@/hooks/useSeasons";

export const Route = createFileRoute("/_authenticated/calendar")({
  component: CalendarPage,
  head: () => ({
    meta: [
      { title: "Master Calendar | Ambassador Hub" },
      {
        name: "description",
        content: "One calendar for every event, class routine, live training session and programme deadline.",
      },
      { property: "og:title", content: "Master Calendar | Ambassador Hub" },
      { property: "og:description", content: "Events, class routines and deadlines in a single calendar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

type Kind = "event" | "class" | "deadline";

type CalendarItem = { date: string; title: string; kind: Kind; note?: string };

const KIND_STYLES: Record<Kind, string> = {
  event: "bg-primary/10 text-primary border-primary/25",
  class: "bg-surface-dark/10 text-foreground border-border",
  deadline: "bg-amber-100 text-amber-900 border-amber-200",
};

const KIND_LABELS: Record<Kind, string> = { event: "Event", class: "Class", deadline: "Deadline" };

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function CalendarPage() {
  const { data: events } = useEvents();
  const { data: sessions } = useSessions();
  const { data: courses } = useCourses();
  const { data: season } = useActiveSeason();
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const items = useMemo<CalendarItem[]>(() => {
    const list: CalendarItem[] = [];
    for (const e of events ?? []) {
      list.push({
        date: iso(new Date(e.starts_at)),
        title: e.title,
        kind: "event",
        note: e.is_cancelled ? "Cancelled" : e.location,
      });
    }
    for (const s of sessions ?? []) {
      const course = (courses ?? []).find((c) => c.id === s.course_id);
      list.push({ date: s.session_date, title: s.title, kind: "class", note: course?.name });
    }
    for (const c of courses ?? []) {
      if (c.end_date) list.push({ date: c.end_date, title: `${c.name} ends`, kind: "deadline" });
    }
    if (season) list.push({ date: season.end_date, title: `${season.title} closes`, kind: "deadline" });
    return list;
  }, [events, sessions, courses, season]);

  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const leading = first.getDay();
  const cells: (Date | null)[] = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(cursor.getFullYear(), cursor.getMonth(), i + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const today = iso(new Date());
  const monthItems = items
    .filter((i) => i.date.startsWith(iso(first).slice(0, 7)))
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <AppShell>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Master calendar</h1>
          <p className="mt-1 text-sm text-muted-foreground">Events, class routines, trainings and deadlines.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            aria-label="Previous month"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-40 text-center font-display text-base font-semibold">
            {cursor.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
          </span>
          <Button
            size="sm"
            variant="secondary"
            aria-label="Next month"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        {(Object.keys(KIND_LABELS) as Kind[]).map((k) => (
          <span key={k} className={`rounded-full border px-3 py-1 text-xs font-semibold ${KIND_STYLES[k]}`}>
            {KIND_LABELS[k]}
          </span>
        ))}
      </div>

      <div className="mt-5 overflow-x-auto rounded-3xl border border-border bg-card p-3 shadow-sm">
        <div className="min-w-[720px]">
          <div className="grid grid-cols-7 gap-2 pb-2 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {cells.map((date, index) => {
              if (!date) return <div key={`empty-${index}`} className="min-h-24 rounded-xl bg-muted/40" />;
              const key = iso(date);
              const dayItems = items.filter((i) => i.date === key);
              return (
                <div
                  key={key}
                  className={`min-h-24 rounded-xl border p-2 ${
                    key === today ? "border-primary bg-primary/5" : "border-border bg-background"
                  }`}
                >
                  <p className="text-xs font-bold text-muted-foreground">{date.getDate()}</p>
                  <div className="mt-1 space-y-1">
                    {dayItems.slice(0, 3).map((i, idx) => (
                      <p
                        key={`${key}-${idx}`}
                        title={i.note ? `${i.title} — ${i.note}` : i.title}
                        className={`truncate rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${KIND_STYLES[i.kind]}`}
                      >
                        {i.title}
                      </p>
                    ))}
                    {dayItems.length > 3 ? (
                      <p className="text-[10px] font-semibold text-muted-foreground">+{dayItems.length - 3} more</p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <section className="mt-8 space-y-3">
        <h2 className="font-display text-xl font-semibold">This month at a glance</h2>
        {monthItems.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
            Nothing scheduled this month.
          </p>
        ) : (
          monthItems.map((i, idx) => (
            <article
              key={`${i.date}-${idx}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm"
            >
              <div>
                <p className="font-semibold">{i.title}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(`${i.date}T00:00:00`).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                  {i.note ? ` · ${i.note}` : ""}
                </p>
              </div>
              <Badge variant="secondary">{KIND_LABELS[i.kind]}</Badge>
            </article>
          ))
        )}
      </section>
    </AppShell>
  );
}
