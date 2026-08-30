import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Building2,
  Facebook,
  Globe,
  Linkedin,
  Mail,
  MapPin,
  PhoneCall,
  Sparkles,
  Youtube,
} from "lucide-react";
import { LogoBoard } from "@/components/LogoBoard";
import { ReviewShowcase } from "@/components/ReviewShowcase";
import {
  logosByCategory,
  parseSocialLinks,
  useApprovedReviews,
  useCompanyWings,
  useLogoBoards,
  type SocialLink,
} from "@/hooks/useEcosystem";
import { byKind, usePublishedCms } from "@/hooks/useCms";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About Classroom Bangladesh | Our Ecosystem & Wings" },
      {
        name: "description",
        content:
          "Meet Classroom Bangladesh: our story, enterprise wings and sister concerns, corporate partners, campus network and reviews from campus ambassadors.",
      },
      { property: "og:title", content: "About Classroom Bangladesh | Our Ecosystem & Wings" },
      {
        property: "og:description",
        content: "Our narrative, sister concerns, partner network, campus institutions and ambassador reviews.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const CONTAINER = "w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6";

const MOTHER = {
  name: "Classroom Bangladesh",
  tagline: "Empowering youth leadership & excellence across campuses",
  story:
    "Classroom Bangladesh began with one conviction: talent is everywhere, but opportunity is not. From a handful of campus workshops we grew into a national learning ecosystem — masterclasses, mentorship, career labs and the Classroom Ambassador Program that now represents hundreds of colleges and universities. Every wing of our group exists to hand students a real, measurable path from classroom to career.",
  address: "Corporate Headquarters: Dhaka, Bangladesh",
  helpline: "+880 1XXX-XXXXXX",
  email: "info@classroombangladesh.com",
};

const MOTHER_LINKS: { label: string; url: string; icon: typeof Globe }[] = [
  { label: "Official Website", url: "https://classroombangladesh.com", icon: Globe },
  { label: "Facebook", url: "https://facebook.com/classroombangladesh", icon: Facebook },
  { label: "YouTube", url: "https://youtube.com/@classroombangladesh", icon: Youtube },
  { label: "LinkedIn", url: "https://linkedin.com/company/classroombangladesh", icon: Linkedin },
];

function iconFor(label: string) {
  const l = label.toLowerCase();
  if (l.includes("face")) return Facebook;
  if (l.includes("you") || l.includes("tube")) return Youtube;
  if (l.includes("linked")) return Linkedin;
  if (l.includes("mail") || l.includes("@")) return Mail;
  return Globe;
}

function AboutPage() {
  const { data: logos } = useLogoBoards();
  const { data: wings } = useCompanyWings();
  const { data: reviews } = useApprovedReviews();
  const { data: cms } = usePublishedCms();
  const highlights = byKind(cms, "highlight");

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary text-lg font-bold text-primary-foreground">
              CA
            </span>
            <span className="font-display text-base font-bold leading-tight sm:text-lg">Classroom Ambassador</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link to="/" className="rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
              Home
            </Link>
            <Link
              to="/auth"
              className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
            >
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Mother company showcase */}
        <section className={CONTAINER}>
          <div className="overflow-hidden rounded-3xl bg-surface-dark text-surface-dark-foreground shadow-raised">
            <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.4fr_1fr]">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                  <Sparkles className="size-3.5" /> Mother Company
                </span>
                <h1 className="mt-5 font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                  {MOTHER.name}
                </h1>
                <p className="mt-3 text-sm font-semibold text-surface-dark-foreground/70">{MOTHER.tagline}</p>
                <p className="mt-6 max-w-2xl text-sm leading-relaxed text-surface-dark-foreground/80">{MOTHER.story}</p>

                <div className="mt-8 flex flex-wrap gap-3">
                  {MOTHER_LINKS.map((l) => (
                    <a
                      key={l.label}
                      href={l.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="group inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
                    >
                      <l.icon className="size-4" />
                      {l.label}
                      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                    </a>
                  ))}
                </div>
              </div>

              <aside className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-6">
                <h2 className="font-display text-base font-bold">Corporate contact</h2>
                <p className="flex gap-2 text-sm text-surface-dark-foreground/80">
                  <MapPin className="mt-0.5 size-4 shrink-0" /> {MOTHER.address}
                </p>
                <a
                  href={`tel:${MOTHER.helpline.replace(/\s/g, "")}`}
                  className="flex gap-2 text-sm text-surface-dark-foreground/80 hover:text-surface-dark-foreground"
                >
                  <PhoneCall className="mt-0.5 size-4 shrink-0" /> {MOTHER.helpline}
                </a>
                <a
                  href={`mailto:${MOTHER.email}`}
                  className="flex gap-2 text-sm text-surface-dark-foreground/80 hover:text-surface-dark-foreground"
                >
                  <Mail className="mt-0.5 size-4 shrink-0" /> {MOTHER.email}
                </a>
                {highlights.length > 0 ? (
                  <ul className="mt-6 grid gap-3 border-t border-white/10 pt-5">
                    {highlights.slice(0, 3).map((h) => (
                      <li key={h.id}>
                        <p className="font-display text-xl font-extrabold">{h.title}</p>
                        {h.subtitle ? (
                          <p className="text-xs text-surface-dark-foreground/70">{h.subtitle}</p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </aside>
            </div>
          </div>
        </section>

        {/* Wings logo board */}
        <div className={CONTAINER}>
          <LogoBoard
            title="Our Wings & Sister Concerns"
            subtitle="One group, many specialised enterprises."
            logos={logosByCategory(logos, "wing")}
          />
        </div>

        {/* Sister concerns cards */}
        {(wings ?? []).length > 0 ? (
          <section className={CONTAINER}>
            <h2 className="mb-6 font-display text-2xl font-bold tracking-tight">Enterprise Wings</h2>
            <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {(wings ?? []).map((w) => {
                const links: SocialLink[] = parseSocialLinks(w.social_links);
                return (
                  <li key={w.id} className="flex h-full flex-col rounded-3xl border border-border bg-card p-6 shadow-card">
                    <div className="flex items-center gap-3">
                      {w.logo_url ? (
                        <img src={w.logo_url} alt={w.name} className="size-12 rounded-xl object-contain" />
                      ) : (
                        <span className="flex size-12 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                          <Building2 className="size-5" />
                        </span>
                      )}
                      <div className="min-w-0">
                        <h3 className="truncate font-display text-base font-bold">{w.name}</h3>
                        {w.tagline ? <p className="truncate text-xs text-muted-foreground">{w.tagline}</p> : null}
                      </div>
                    </div>
                    {w.description ? (
                      <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">{w.description}</p>
                    ) : null}
                    <div className="mt-4 space-y-1 text-sm">
                      {w.helpline ? (
                        <a href={`tel:${w.helpline.replace(/\s/g, "")}`} className="flex items-center gap-2 font-semibold text-primary">
                          <PhoneCall className="size-4" /> {w.helpline}
                        </a>
                      ) : null}
                      {w.email ? (
                        <a href={`mailto:${w.email}`} className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="size-4" /> {w.email}
                        </a>
                      ) : null}
                    </div>
                    {links.length > 0 ? (
                      <div className="mt-5 flex flex-wrap gap-2">
                        {links.map((l) => {
                          const Icon = iconFor(l.label);
                          return (
                            <a
                              key={`${w.id}-${l.label}`}
                              href={l.url}
                              target="_blank"
                              rel="noreferrer noopener"
                              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold transition hover:border-primary/40 hover:text-primary"
                            >
                              <Icon className="size-3.5" /> {l.label}
                            </a>
                          );
                        })}
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        {/* Client & campus logo boards */}
        <div className={CONTAINER}>
          <LogoBoard
            title="Clients & Partners"
            subtitle="Corporate houses who build talent with us."
            logos={logosByCategory(logos, "client")}
            tone="dark"
          />
        </div>
        <div className={CONTAINER}>
          <LogoBoard
            title="Campus & Institutional Partners"
            subtitle="Colleges and universities our ambassadors proudly represent."
            logos={logosByCategory(logos, "campus")}
          />
        </div>

        {/* Approved reviews */}
        <div className={CONTAINER}>
          <ReviewShowcase reviews={reviews ?? []} title="Reviews from ambassadors & coordinators" />
        </div>

        <div className={`${CONTAINER} text-center`}>
          <Link
            to="/auth"
            className="group inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3.5 font-semibold text-primary-foreground shadow-md transition hover:opacity-90"
          >
            Join the programme
            <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </main>

      <footer className="mt-10 border-t border-border bg-card py-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 px-4 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>© 2026 {MOTHER.name}. All rights reserved.</p>
          <span>{MOTHER.email}</span>
        </div>
      </footer>
    </div>
  );
}
