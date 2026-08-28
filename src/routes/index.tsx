import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, LifeBuoy, GaugeCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ambassador Hub — Member Profiles & Support" },
      {
        name: "description",
        content:
          "Ambassador Hub keeps member profiles complete and connects ambassadors, coordinators and mentors to their support team.",
      },
      { property: "og:title", content: "Ambassador Hub — Member Profiles & Support" },
      {
        property: "og:description",
        content: "Complete your profile to 100% and reach your assigned support team instantly.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: GaugeCircle,
    title: "100% profile engine",
    body: "A live completion bar guides members through every mandatory and optional field.",
  },
  {
    icon: LifeBuoy,
    title: "Role-aware support hub",
    body: "Ambassadors, coordinators and mentors each see exactly the contacts they need.",
  },
  {
    icon: ShieldCheck,
    title: "Compliance hold gate",
    body: "Accounts on hold are signed out instantly and shown their support manager.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-primary font-display text-sm font-bold text-primary-foreground">
            AH
          </span>
          <span className="font-display text-base font-semibold">Ambassador Hub</span>
        </div>
        <Button asChild variant="outline">
          <Link to="/auth">Sign in</Link>
        </Button>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-20">
        <section className="rounded-4xl bg-surface-dark px-6 py-16 text-surface-dark-foreground sm:px-12 sm:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-surface-dark-foreground/60">
            Member platform
          </p>
          <h1 className="mt-4 max-w-2xl font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
            Every member profile, complete and compliant.
          </h1>
          <p className="mt-5 max-w-xl text-base text-surface-dark-foreground/75">
            Sign in to update your profile, track completion in real time, and reach your coordinator,
            mentor or support manager in one tap.
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link to="/auth">
              Get started <ArrowRight className="size-4" />
            </Link>
          </Button>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {FEATURES.map((f) => (
            <article key={f.title} className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <span className="grid size-11 place-items-center rounded-xl bg-accent text-primary">
                <f.icon className="size-5" />
              </span>
              <h2 className="mt-4 font-display text-lg font-semibold">{f.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
