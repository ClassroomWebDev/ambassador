import { Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, Megaphone } from "lucide-react";
import { countdownLabel, formatDateTime, useEvents, useNotices } from "@/hooks/useContent";

export function NoticeWidget() {
  const { data: notices, isLoading } = useNotices();
  const { data: events } = useEvents();

  const latest = (notices ?? []).slice(0, 3);
  const upcoming = (events ?? [])
    .filter((e) => !e.is_cancelled && new Date(e.starts_at).getTime() > Date.now())
    .slice(0, 2);

  return (
    <section className="grid gap-4 md:grid-cols-2">
      <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
            <Megaphone className="size-4 text-primary" /> Notice board
          </h2>
          <Link to="/notices" className="text-xs font-semibold text-primary">
            View all <ArrowRight className="inline size-3" />
          </Link>
        </div>
        {isLoading ? (
          <div className="mt-4 h-20 animate-pulse rounded-xl bg-muted" />
        ) : latest.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No notices right now.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border">
            {latest.map((n) => (
              <li key={n.id} className="py-2.5">
                <p className="text-sm font-semibold">{n.title}</p>
                <p className="line-clamp-1 text-xs text-muted-foreground">{n.content}</p>
                <p className="mt-0.5 text-[0.65rem] text-muted-foreground">
                  {formatDateTime(n.created_at)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
            <CalendarDays className="size-4 text-primary" /> Upcoming events
          </h2>
          <Link to="/events" className="text-xs font-semibold text-primary">
            View all <ArrowRight className="inline size-3" />
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No upcoming events.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border">
            {upcoming.map((e) => (
              <li key={e.id} className="flex items-start justify-between gap-3 py-2.5">
                <div>
                  <p className="text-sm font-semibold">{e.title}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(e.starts_at)}</p>
                </div>
                <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[0.65rem] font-semibold text-primary">
                  {countdownLabel(e.starts_at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
