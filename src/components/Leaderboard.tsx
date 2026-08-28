import { Trophy } from "lucide-react";
import { useLeaderboard, useMyRank } from "@/hooks/useBusiness";
import { useProfile } from "@/hooks/useProfile";

export function Leaderboard({ limit = 10 }: { limit?: number }) {
  const { data: rows, isLoading } = useLeaderboard(limit);
  const { data: mine } = useMyRank();
  const { data: profile } = useProfile();
  const inTop = (rows ?? []).some((r) => r.user_id === profile?.id);

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Trophy className="size-5 text-primary" />
        <h2 className="font-display text-xl font-semibold">Top {limit} leaderboard</h2>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading rankings…</p>
      ) : (rows ?? []).length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
          No ranked members yet.
        </p>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="grid gap-3 sm:hidden">
            {(rows ?? []).map((r) => (
              <article
                key={r.user_id}
                className={`rounded-2xl bg-card p-4 shadow-sm ${
                  r.user_id === profile?.id ? "border-2 border-primary" : "border border-border"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid size-8 place-items-center rounded-xl bg-muted font-display text-sm font-bold">
                      {r.rank}
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{r.full_name || "Member"}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.auto_id ?? "—"} · {r.institution || "—"}
                      </p>
                    </div>
                  </div>
                  <span className="font-display text-lg font-bold text-primary">{r.total_points}</span>
                </div>
              </article>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-3xl border border-border bg-card shadow-sm sm:block">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Institution</th>
                  <th className="px-4 py-3 text-right">Total points</th>
                </tr>
              </thead>
              <tbody>
                {(rows ?? []).map((r) => (
                  <tr
                    key={r.user_id}
                    className={
                      r.user_id === profile?.id
                        ? "border-2 border-primary bg-primary/5"
                        : "border-t border-border"
                    }
                  >
                    <td className="px-4 py-3 font-display font-bold">#{r.rank}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.auto_id ?? "—"}</td>
                    <td className="px-4 py-3 font-medium">{r.full_name || "Member"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.institution || "—"}</td>
                    <td className="px-4 py-3 text-right font-display font-bold text-primary">{r.total_points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!inTop && mine ? (
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Your standing</p>
          <p className="mt-1 text-sm">
            Rank <span className="font-display text-lg font-bold">#{mine.rank}</span> with{" "}
            <span className="font-semibold">{mine.total_points}</span> points —{" "}
            {Math.max(0, (mine.leader_points ?? 0) - mine.total_points)} points behind the leader.
          </p>
        </div>
      ) : null}
    </section>
  );
}
