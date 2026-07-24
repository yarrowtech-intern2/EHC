"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  Ambulance,
  Bell,
  CalendarDays,
  ClipboardPenLine,
  HelpCircle,
  Home,
  LogOut,
  Mail,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  Stethoscope,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

import { useAuth } from "@/components/providers/auth-provider";
import { getDashboardPath, getSupabaseBrowserClient, type AppActorType } from "@/lib/supabase-browser";

type ShellLink = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  actors: AppActorType[];
};

const navItems: ShellLink[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: Home,
    actors: [
      "super_admin",
      "tenant_admin",
      "facility_operator",
      "pharmacy_admin",
      "ambulance_admin",
      "ambulance_driver",
      "blood_bank_admin",
    ],
  },
  {
    label: "Tenant setup",
    href: "/admin/tenant-setup",
    icon: ShieldCheck,
    actors: ["super_admin", "tenant_admin"],
  },
  {
    label: "Slots",
    href: "/admin/slots",
    icon: CalendarDays,
    actors: ["super_admin", "tenant_admin", "facility_operator"],
  },
  {
    label: "Appointments",
    href: "/admin/appointments",
    icon: ClipboardPenLine,
    actors: ["super_admin", "tenant_admin", "facility_operator"],
  },
  {
    label: "Ambulance ops",
    href: "/admin/ambulance",
    icon: Ambulance,
    actors: ["super_admin", "tenant_admin", "facility_operator", "ambulance_admin", "ambulance_driver"],
  },
  {
    label: "Driver verification",
    href: "/admin/ambulance-verification",
    icon: ShieldCheck,
    actors: ["super_admin"],
  },
  {
    label: "Team",
    href: "/admin/team",
    icon: Users,
    actors: [
      "super_admin",
      "tenant_admin",
      "facility_operator",
      "pharmacy_admin",
      "ambulance_admin",
      "ambulance_driver",
      "blood_bank_admin",
    ],
  },
  {
    label: "Audit logs",
    href: "/admin/audit-logs",
    icon: Activity,
    actors: [
      "super_admin",
      "tenant_admin",
      "facility_operator",
      "pharmacy_admin",
      "ambulance_admin",
      "ambulance_driver",
      "blood_bank_admin",
    ],
  },
  {
    label: "Doctor workspace",
    href: "/doctor",
    icon: Stethoscope,
    actors: ["doctor", "super_admin", "tenant_admin", "facility_operator"],
  },
  {
    label: "My care",
    href: "/appointments",
    icon: CalendarDays,
    actors: ["patient"],
  },
  {
    label: "Discover",
    href: "/discover",
    icon: Search,
    actors: ["patient"],
  },
];

const roleLabels: Record<AppActorType, string> = {
  ambulance_admin: "Ambulance service",
  ambulance_driver: "Ambulance driver",
  blood_bank_admin: "Blood bank service",
  doctor: "Doctor",
  facility_operator: "Facility operator",
  patient: "Patient",
  pharmacy_admin: "Pharmacy",
  super_admin: "Super admin",
  tenant_admin: "Tenant admin",
};

const logoImage =
  "https://res.cloudinary.com/dc3qprub3/image/upload/v1784888990/3_kxglwk.png";

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { actorType, user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = useMemo(
    () => navItems.filter((item) => actorType && item.actors.includes(actorType)),
    [actorType],
  );

  const displayName =
    user?.user_metadata?.fullName ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "EHC user";
  const roleLabel = actorType ? roleLabels[actorType] : "Signed in";
  const initials = getInitials(displayName);
  const dashboardPath = getDashboardPath(actorType);

  const signOut = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <div className="ehc-dashboard-shell h-screen overflow-hidden bg-[#f8f7f4] p-3 text-ink sm:p-4">
      <div className="mx-auto flex h-full max-w-[1540px] overflow-hidden rounded-[28px] border border-white bg-white/52 shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
        <aside className="hidden w-[250px] shrink-0 bg-white px-5 py-6 lg:flex lg:flex-col">
          <Link
            href={dashboardPath}
            className="flex h-11 items-center"
            aria-label="Dashboard home"
          >
            <img
              src={logoImage}
              alt="EHC"
              className="h-8 w-auto select-none"
              loading="eager"
              decoding="async"
              draggable={false}
            />
          </Link>

          <p className="mt-10 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Menu
          </p>
          <nav className="mt-3 flex flex-1 flex-col gap-1.5" aria-label="Dashboard navigation">
            {links.map((item) => {
              const active =
                pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  aria-label={item.label}
                  className={`relative flex h-12 items-center gap-3 rounded-2xl px-3 text-sm font-semibold transition ${
                    active
                      ? "bg-[#0057FF] text-white shadow-[0_14px_30px_rgba(0,87,255,0.24)]"
                      : "text-slate-500 hover:bg-[#f8f7f4] hover:text-ink"
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-5 border-t border-slate-100 pt-5">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              General
            </p>
            <div className="mt-3 grid gap-1.5">
              <Link
                href={dashboardPath}
                className="flex h-12 items-center gap-3 rounded-2xl px-3 text-sm font-semibold text-slate-500 transition hover:bg-[#f8f7f4] hover:text-ink"
              >
                <Settings className="h-4.5 w-4.5" />
                Settings
              </Link>
              <Link
                href="/"
                className="flex h-12 items-center gap-3 rounded-2xl px-3 text-sm font-semibold text-slate-500 transition hover:bg-[#f8f7f4] hover:text-ink"
              >
                <HelpCircle className="h-4.5 w-4.5" />
                Home
              </Link>
              <button
                type="button"
                onClick={signOut}
                className="flex h-12 items-center gap-3 rounded-2xl px-3 text-left text-sm font-semibold text-slate-500 transition hover:bg-[#f8f7f4] hover:text-ink"
              >
                <LogOut className="h-4.5 w-4.5" />
                Logout
              </button>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#f8f7f4]">
          <header className="z-40 shrink-0 px-4 py-4 backdrop-blur-xl sm:px-5 lg:px-6">
            <div className="flex items-center gap-3 rounded-[24px] bg-white px-3 py-3 shadow-[0_14px_34px_rgba(15,23,42,0.06)] sm:px-4">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f8f7f4] text-ink lg:hidden"
                aria-label="Open dashboard navigation"
              >
                <Menu className="h-5 w-5" />
              </button>

              <Link
                href={dashboardPath}
                className="hidden h-11 items-center justify-center sm:flex lg:hidden"
                aria-label="Dashboard home"
              >
                <img
                  src={logoImage}
                  alt="EHC"
                  className="h-7 w-auto select-none"
                  loading="eager"
                  decoding="async"
                  draggable={false}
                />
              </Link>

              <div className="min-w-0">
                <p className="text-xs text-slate-500">{roleLabel}</p>
                <h1 className="truncate text-lg font-semibold text-ink sm:text-xl">Dashboard</h1>
              </div>

              <div className="ml-auto hidden h-11 min-w-[280px] items-center gap-3 rounded-full bg-[#f8f7f4] px-4 text-sm text-slate-400 md:flex">
                <Search className="h-4 w-4 text-ink" />
                <span>Search care, people, slots...</span>
              </div>

              <button
                type="button"
                className="hidden h-11 w-11 items-center justify-center rounded-full bg-[#f8f7f4] text-ink sm:flex"
                aria-label="Messages"
              >
                <Mail className="h-5 w-5" />
              </button>

              <button
                type="button"
                className="hidden h-11 w-11 items-center justify-center rounded-full bg-[#f8f7f4] text-ink sm:flex"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
              </button>

              <Link
                href={dashboardPath}
                className="hidden h-11 w-11 items-center justify-center rounded-full bg-[#f8f7f4] text-ink shadow-[0_10px_24px_rgba(15,23,42,0.05)] sm:flex"
                aria-label="Dashboard settings"
              >
                <Settings className="h-5 w-5" />
              </Link>

              <div className="flex items-center gap-3 rounded-full bg-[#f8f7f4] py-1.5 pl-2 pr-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0057FF] text-sm font-semibold text-white">
                  {initials}
                </div>
                <div className="hidden min-w-0 sm:block">
                  <p className="max-w-[150px] truncate text-sm font-semibold text-ink">{displayName}</p>
                  <p className="text-xs text-slate-500">{roleLabel}</p>
                </div>
              </div>
            </div>
          </header>

          <main className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-2 sm:px-5 lg:px-6">
            <div className="mx-auto max-w-[1240px]">{children}</div>
          </main>
        </div>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm lg:hidden">
          <div className="flex h-full w-[min(360px,88vw)] flex-col bg-white p-4 shadow-card">
            <div className="flex items-center justify-between">
              <Link
                href={dashboardPath}
                onClick={() => setMobileOpen(false)}
                className="flex items-center"
              >
                <img
                  src={logoImage}
                  alt="EHC"
                  className="h-7 w-auto select-none"
                  loading="eager"
                  decoding="async"
                  draggable={false}
                />
              </Link>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f8f7f4] text-ink"
                aria-label="Close dashboard navigation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="mt-7 grid gap-2" aria-label="Mobile dashboard navigation">
              {links.map((item) => {
                const active =
                  pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold ${
                      active ? "bg-[#0057FF] text-white" : "bg-[#f8f7f4] text-slate-700"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <button
              type="button"
              onClick={signOut}
              className="mt-auto flex items-center gap-3 rounded-2xl bg-[#f8f7f4] px-4 py-3 text-sm font-semibold text-slate-700"
            >
              <LogOut className="h-5 w-5" />
              Sign out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function DashboardHero({
  eyebrow,
  title,
  description,
  actions,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="rounded-[24px] bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.06)] sm:p-5">
      <div className="grid gap-5 xl:grid-cols-[1fr_0.86fr] xl:items-start">
        <div>
          <p className="text-xs font-medium text-slate-500">{eyebrow}</p>
          <h2 className="mt-2 max-w-3xl text-3xl font-semibold leading-tight text-ink sm:text-4xl">
            {title}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>
        {actions ? <div className="flex flex-wrap gap-3 xl:justify-end">{actions}</div> : null}
      </div>
      {children ? <div className="mt-7">{children}</div> : null}
    </section>
  );
}

export function DashboardStatCard({
  label,
  value,
  icon: Icon,
  tone = "blue",
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "blue" | "green" | "sand" | "slate";
}) {
  const toneClass = {
    blue: "bg-[#0057FF] text-white",
    green: "bg-white text-[#0057FF]",
    sand: "bg-white text-[#0057FF]",
    slate: "bg-white text-slate-600",
  }[tone];

  return (
    <div className="group min-h-[120px] rounded-[20px] bg-[#dedede] p-4 transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm font-semibold text-ink">{label}</span>
        <span className={`flex h-9 w-9 items-center justify-center rounded-full ${toneClass}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-5 text-4xl font-semibold text-ink">{value}</p>
    </div>
  );
}

export function DashboardPanel({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <section className="rounded-[24px] bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.06)] sm:p-5">
      <p className="text-xs font-medium text-slate-500">{eyebrow}</p>
      <h3 className="mt-2 text-xl font-semibold text-ink">{title}</h3>
      {description ? <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p> : null}
      {children ? <div className="mt-5">{children}</div> : null}
    </section>
  );
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || <UserRound className="h-4 w-4" />;
}
