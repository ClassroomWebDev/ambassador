import { createFileRoute } from "@tanstack/react-router";
import { SupportHub } from "@/components/SupportHub";

export const Route = createFileRoute("/_authenticated/support")({
  head: () => ({
    meta: [
      { title: "Support Hub — Ambassador Hub" },
      {
        name: "description",
        content: "Find your assigned coordinator, faculty and manager with direct phone contact.",
      },
      { property: "og:title", content: "Support Hub — Ambassador Hub" },
      { property: "og:description", content: "Your assigned support hierarchy, always one tap away." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SupportPage,
});

function SupportPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight">Support Hub</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your assigned support line, based on your role in the hierarchy.
        </p>
      </header>
      <SupportHub />
    </div>
  );
}
