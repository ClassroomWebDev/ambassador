import { Award, Flame, Target, Trophy } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useMyRank, useProgramSettings, useSales } from "@/hooks/useBusiness";

/** High-impact points banner shown at the very top of the ambassador dashboard. */
export function AmbassadorHero() {
  const { data: profile } = useProfile();
  const { data: rank } = useMyRank();
  const { data: sales } = useSales();
  const { data: settings } = useProgramSettings();

  const total = (profile?.learning_points ?? 0) + (profile?.leadership_points ?? 0);
  const converted = (sales ?? []).filter(
    (s) => s.status === "approved" && !s.deleted_at && s.ambassador_id === profile?.id,
  ).length;

  const target = settings?.season_target_points ?? 1000;
  const milestone = Math.max(100, Math.ceil((total + 1) / 250) * 250);
  const milestoneProgress = Math.min(100, Math.round((total / milestone) * 100));

  return (
    <section className="overflow-hidden rounded-3xl bg-surface-dark p-6 text-surface-dark-foreground shadow-sm sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-white/60">
            <Flame className="size-3.5" /> Total points earned
          </p>
          <p className="mt-2 font-display text-5xl font-extrabold tabular-nums text-white sm:text-6xl">{total}</p>
          <p className="mt-1 text-xs text-white/60">
            Learning {profile?.learning_points ?? 0} · Leadership {profile?.leadership_points ?? 0} · Season target{" "}
            {target}
          </p>
        </div>

        <div className="grid flex-1 gap-3 sm:grid-cols-2 sm:justify-items-end">
          <div className="w-full rounded-2xl border border-white/15 bg-white/10 p-4">
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-white/60">
              <Trophy className="size-3.5" /> Leaderboard rank
            </p>
            <p className="mt-1 font-display text-3xl font-extrabold text-white">
              {rank?.rank ? `#${rank.rank}` : "—"}
            </p>
          </div>
          <div className="w-full rounded-2xl border border-white/15 bg-white/10 p-4">
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-white/60">
              <Award className="size-3.5" /> Converted opportunities
            </p>
            <p className="mt-1 font-display text-3xl font-extrabold text-white">{converted}</p>
          </div>
        </div>
      </div>

      <div className="mt-7">
        <div className="flex items-center justify-between text-xs font-semibold text-white/70">
          <span className="flex items-center gap-2">
            <Target className="size-3.5" /> Next milestone reward
          </span>
          <span>
            {total} / {milestone} pts
          </span>
        </div>
        <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full rounded-full bg-primary transition-all duration-700"
            style={{ width: `${milestoneProgress}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-white/60">
          {milestone - total} points to unlock the {milestone}-point reward tier.
        </p>
      </div>
    </section>
  );
}
