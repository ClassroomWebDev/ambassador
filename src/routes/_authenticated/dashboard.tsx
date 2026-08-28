import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useMyRole, useProfile } from "@/hooks/useProfile";
import { profileCompletion, FIELD_LABELS } from "@/lib/profile-meta";
import { ROLE_LABELS } from "@/lib/types";
import { SupportHub } from "@/components/SupportHub";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Ambassador Hub" },
      {
        name: "description",
        content: "Track your profile completion and reach your assigned support team at a glance.",
      },
      { property: "og:title", content: "Dashboard — Ambassador Hub" },
      { property: "og:description", content: "Profile completion and support contacts in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { data: profile } = useProfile();
  const { data: role } = useMyRole();
  const stats = profileCompletion((profile ?? {}) as Record<string, unknown>);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          {role ? ROLE_LABELS[role] : "Member"}
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">
          Hello, {profile?.full_name?.split(" ")[0] || "there"}
        </h1>
      </header>

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
            Mandatory {stats.mandatoryDone}/{stats.mandatoryTotal} · Optional {stats.optionalDone}/
            {stats.optionalTotal}
          </p>
          {stats.missingMandatory.length > 0 ? (
            <p>Still required: {stats.missingMandatory.map((f) => FIELD_LABELS[f]).join(", ")}</p>
          ) : (
            <p>All mandatory fields complete.</p>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold">Your support hub</h2>
        <SupportHub />
      </section>
    </div>
  );
}
