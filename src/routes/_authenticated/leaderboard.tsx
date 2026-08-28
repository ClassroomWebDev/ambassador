import { createFileRoute } from "@tanstack/react-router";
import { Leaderboard } from "@/components/Leaderboard";

export const Route = createFileRoute("/_authenticated/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboard — Ambassador Hub" },
      {
        name: "description",
        content: "See the top 10 ambassadors ranked by combined learning and leadership points this season.",
      },
      { property: "og:title", content: "Leaderboard — Ambassador Hub" },
      { property: "og:description", content: "Top 10 ranking by total learning and leadership points." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LeaderboardPage,
});

function LeaderboardPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Rankings</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Season leaderboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Total points = learning points + leadership points. Your own row is highlighted.
        </p>
      </header>
      <Leaderboard limit={10} />
    </div>
  );
}
