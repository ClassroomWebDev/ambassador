import type { ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import type { LogoBoardRow } from "@/hooks/useEcosystem";


/**
 * Public logo showcase board: a clean, evenly aligned logo grid.
 * Names are rendered as text below each logo — never inline with headings.
 */
export function LogoBoard({
  title,
  subtitle,
  logos,
  tone = "light",
  action,
  emptyAction,
}: {
  title: string;
  subtitle?: string;
  logos: LogoBoardRow[];
  tone?: "light" | "dark";
  /** Admin action rendered in the board header. */
  action?: ReactNode;
  /** Admin action rendered inside the empty state. */
  emptyAction?: ReactNode;
}) {
  const dark = tone === "dark";

  return (
    <section
      className={
        dark
          ? "rounded-3xl bg-surface-dark p-6 text-surface-dark-foreground shadow-card sm:p-8"
          : "rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8"
      }
    >
      <header className="mb-6 text-center">
        <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
        {subtitle ? (
          <p className={dark ? "mt-1 text-sm text-surface-dark-foreground/70" : "mt-1 text-sm text-muted-foreground"}>
            {subtitle}
          </p>
        ) : null}
        {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
      </header>

      {logos.length === 0 ? (
        <div
          className={
            dark
              ? "rounded-2xl border border-dashed border-white/20 p-10 text-center text-sm text-surface-dark-foreground/70"
              : "rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground"
          }
        >
          <p>No logos on this board yet.</p>
          {emptyAction ? <div className="mt-4 flex justify-center">{emptyAction}</div> : null}
        </div>
      ) : (
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {logos.map((logo) => {
          const inner = (
            <>
              <div className="flex h-16 w-full items-center justify-center">
                {logo.logo_url ? (
                  <img
                    src={logo.logo_url}
                    alt={`${logo.title} logo`}
                    loading="lazy"
                    className="max-h-16 max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <span className="font-display text-lg font-bold">{logo.title.slice(0, 2).toUpperCase()}</span>
                )}
              </div>
              <p
                className={
                  dark
                    ? "mt-3 line-clamp-2 text-center text-xs font-semibold text-surface-dark-foreground/80"
                    : "mt-3 line-clamp-2 text-center text-xs font-semibold text-muted-foreground"
                }
              >
                {logo.title}
                {logo.link_url ? <ExternalLink className="ml-1 inline size-3 align-[-2px]" /> : null}
              </p>
            </>
          );

          return (
            <li key={logo.id}>
              {logo.link_url ? (
                <a
                  href={logo.link_url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={
                    dark
                      ? "group flex h-full flex-col items-center rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-white/30"
                      : "group flex h-full flex-col items-center rounded-2xl border border-border bg-background p-4 transition hover:border-primary/40 hover:shadow-sm"
                  }
                >
                  {inner}
                </a>
              ) : (
                <div
                  className={
                    dark
                      ? "group flex h-full flex-col items-center rounded-2xl border border-white/10 bg-white/5 p-4"
                      : "group flex h-full flex-col items-center rounded-2xl border border-border bg-background p-4"
                  }
                >
                  {inner}
                </div>
              )}
            </li>
          );
        })}
      </ul>
      )}
    </section>
  );
}
