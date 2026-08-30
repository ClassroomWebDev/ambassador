import { createFileRoute } from "@tanstack/react-router";
import { Leaderboard } from "@/components/Leaderboard";
import { CoordinatorLeaderboard } from "@/components/CoordinatorLeaderboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMyRole } from "@/hooks/useProfile";

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
  const { data: role, isLoading } = useMyRole();
  const canSeeCoordinators = role === "admin" || role === "support_manager" || role === "mentor";

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Rankings</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Season leaderboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Ambassadors rank by total points (learning + leadership).
          {canSeeCoordinators ? " Coordinators rank by approved sales revenue." : ""}
        </p>
      </header>

      {isLoading ? (
        <div className="grid gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : canSeeCoordinators ? (
        <Tabs defaultValue="ambassadors" className="space-y-6">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="ambassadors" className="flex-1 sm:flex-none">
              Campus Ambassadors
            </TabsTrigger>
            <TabsTrigger value="coordinators" className="flex-1 sm:flex-none">
              Coordinators
            </TabsTrigger>
          </TabsList>
          <TabsContent value="ambassadors">
            <Leaderboard limit={10} />
          </TabsContent>
          <TabsContent value="coordinators">
            <CoordinatorLeaderboard limit={10} />
          </TabsContent>
        </Tabs>
      ) : (
        <Leaderboard limit={10} />
      )}
    </div>
  );
}
