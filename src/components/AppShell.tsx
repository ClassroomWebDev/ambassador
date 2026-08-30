import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  Award,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  CalendarRange,
  LayoutDashboard,
  LayoutTemplate,
  LifeBuoy,
  LogOut,
  Megaphone,
  Menu,
  ReceiptText,
  Timer,
  Trophy,
  Users,
  UserRoundCog,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMyRole, useProfile } from "@/hooks/useProfile";
import { ROLE_LABELS, type AppRole } from "@/lib/types";
import { NotificationBell } from "@/components/NotificationBell";

type NavItem = {
  to:
    | "/dashboard"
    | "/courses"
    | "/attendance"
    | "/sales"
    | "/leaderboard"
    | "/users"
    | "/notices"
    | "/events"
    | "/calendar"
    | "/certificates"
    | "/seasons"
    | "/cms"
    | "/profile"
    | "/support";
  label: string;
  icon: typeof LayoutDashboard;
};

function navForRole(role: AppRole | undefined): NavItem[] {
  const dashboard: NavItem = { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard };
  const profile: NavItem = { to: "/profile", label: "Profile", icon: UserRoundCog };
  const support: NavItem = { to: "/support", label: "Support", icon: LifeBuoy };
  const leaderboard: NavItem = { to: "/leaderboard", label: "Leaderboard", icon: Trophy };
  const notices: NavItem = { to: "/notices", label: "Notice Board", icon: Megaphone };
  const events: NavItem = { to: "/events", label: "Events", icon: CalendarDays };
  const calendar: NavItem = { to: "/calendar", label: "Calendar", icon: CalendarRange };
  const certificates: NavItem = { to: "/certificates", label: "Certificates", icon: Award };

  if (role === "admin" || role === "support_manager") {
    return [
      dashboard,
      { to: "/courses", label: "Courses", icon: BookOpen },
      { to: "/attendance", label: "Attendance", icon: CalendarCheck },
      { to: "/sales", label: "Opportunities", icon: ReceiptText },
      leaderboard,
      notices,
      events,
      calendar,
      certificates,
      { to: "/seasons", label: "Seasons", icon: Timer },
      { to: "/cms", label: "Website CMS", icon: LayoutTemplate },
      { to: "/users", label: "Users", icon: Users },
      support,
      profile,
    ];
  }
  if (role === "coordinator" || role === "mentor") {
    return [
      dashboard,
      { to: "/attendance", label: "Take Attendance", icon: CalendarCheck },
      { to: "/sales", label: "New Opportunity", icon: ReceiptText },
      { to: "/courses", label: "Courses", icon: BookOpen },
      leaderboard,
      notices,
      events,
      calendar,
      certificates,
      support,
      profile,
    ];
  }
  return [
    dashboard,
    { to: "/courses", label: "My Opportunities", icon: BookOpen },
    { to: "/attendance", label: "Attendance Log", icon: CalendarCheck },
    { to: "/sales", label: "New Opportunity", icon: ReceiptText },
    leaderboard,
    notices,
    events,
    calendar,
    certificates,
    support,
    profile,
  ];
}


export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  const { data: role } = useMyRole();
  const [menuOpen, setMenuOpen] = useState(false);
  const NAV = navForRole(role);

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
        <div className="flex items-center justify-between">
          <Brand />
          <NotificationBell />
        </div>
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
        <div className="flex items-center gap-1">
          <NotificationBell />
        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((o) => !o)}
          className="rounded-lg p-2 hover:bg-sidebar-accent"
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
        </div>
      </header>

      {menuOpen ? (
        <div className="sticky top-14 z-30 border-b border-sidebar-border bg-sidebar px-4 pb-4 text-sidebar-foreground md:hidden">
          <nav className="flex flex-col gap-1 pt-2">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
                  path === item.to ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground/75"
                }`}
              >
                <item.icon className="size-4.5" />
                {item.label}
              </Link>
            ))}
          </nav>
          <UserBlock name={profile?.full_name} role={role ? ROLE_LABELS[role] : undefined} onSignOut={signOut} />
        </div>
      ) : null}

      <main className="px-4 pb-28 pt-6 md:ml-64 md:px-10 md:pb-14">{children}</main>

      {/* Mobile bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-sidebar-border bg-sidebar px-2 pb-[env(safe-area-inset-bottom)] text-sidebar-foreground md:hidden">
        {NAV.slice(0, 4).map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex flex-col items-center gap-1 py-3 text-[0.7rem] font-medium transition-colors ${
              path === item.to ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/60"
            }`}
          >
            <span
              className={`grid size-9 place-items-center rounded-xl ${path === item.to ? "bg-sidebar-primary" : ""}`}
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
