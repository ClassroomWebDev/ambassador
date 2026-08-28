import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard, LifeBuoy, LogOut, UserRoundCog, Menu, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMyRole, useProfile } from "@/hooks/useProfile";
import { ROLE_LABELS } from "@/lib/types";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/profile", label: "Profile", icon: UserRoundCog },
  { to: "/support", label: "Support", icon: LifeBuoy },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  const { data: role } = useMyRole();
  const [menuOpen, setMenuOpen] = useState(false);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop side navigation */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-sidebar px-5 py-7 text-sidebar-foreground md:flex">
        <Brand />
        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                path === item.to
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              }`}
            >
              <item.icon className="size-4.5" />
              {item.label}
            </Link>
          ))}
        </nav>
        <UserBlock name={profile?.full_name} role={role ? ROLE_LABELS[role] : undefined} onSignOut={signOut} />
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between bg-sidebar px-4 py-3 text-sidebar-foreground md:hidden">
        <Brand />
        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((o) => !o)}
          className="rounded-lg p-2 hover:bg-sidebar-accent"
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </header>

      {menuOpen ? (
        <div className="sticky top-14 z-30 border-b border-sidebar-border bg-sidebar px-4 pb-4 text-sidebar-foreground md:hidden">
          <UserBlock name={profile?.full_name} role={role ? ROLE_LABELS[role] : undefined} onSignOut={signOut} />
        </div>
      ) : null}

      <main className="px-4 pb-28 pt-6 md:ml-64 md:px-10 md:pb-14">{children}</main>

      {/* Mobile bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t border-sidebar-border bg-sidebar px-2 pb-[env(safe-area-inset-bottom)] text-sidebar-foreground md:hidden">
        {NAV.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex flex-col items-center gap-1 py-3 text-[0.7rem] font-medium transition-colors ${
              path === item.to ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/60"
            }`}
          >
            <span
              className={`grid size-9 place-items-center rounded-xl ${
                path === item.to ? "bg-sidebar-primary" : ""
              }`}
            >
              <item.icon className="size-4.5" />
            </span>
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-xl bg-sidebar-primary font-display text-sm font-bold text-sidebar-primary-foreground">
        AH
      </span>
      <span className="font-display text-base font-semibold tracking-tight">Ambassador Hub</span>
    </div>
  );
}

function UserBlock({
  name,
  role,
  onSignOut,
}: {
  name: string | null | undefined;
  role: string | undefined;
  onSignOut: () => void | Promise<void>;
}) {
  return (
    <div className="mt-4 rounded-2xl bg-sidebar-accent p-4">
      <p className="truncate text-sm font-semibold">{name || "Member"}</p>
      <p className="text-xs text-sidebar-foreground/60">{role || "—"}</p>
      <button
        type="button"
        onClick={onSignOut}
        className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-sidebar-foreground/80 hover:text-sidebar-foreground"
      >
        <LogOut className="size-3.5" /> Sign out
      </button>
    </div>
  );
}
