"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CalendarDays, Home, LogOut, UserRound } from "lucide-react";
import type { ReactNode } from "react";

import { useAuth } from "@/components/providers/auth-provider";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

const navItems = [
  { label: "Home", href: "/discover", icon: Home },
  { label: "My care", href: "/appointments", icon: CalendarDays },
];

export function PatientShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  const displayName =
    user?.user_metadata?.fullName ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Patient";
  const initials = getInitials(displayName);

  const signOut = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <main className="ehc-patient-shell min-h-screen bg-[#f8f7f4] text-[#0f172a]">
      <header className="sticky top-0 z-40 border-b border-white/70 bg-[#f8f7f4]/92 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1180px] items-center gap-3 px-4 py-3 sm:px-6">
          <Link href="/discover" className="flex items-center gap-2" aria-label="Patient home">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0057FF] text-sm font-bold text-white shadow-[0_12px_28px_rgba(0,87,255,0.22)]">
              E
            </span>
            <span className="hidden text-base font-semibold sm:block">EHC</span>
          </Link>

          <nav className="ml-auto flex items-center gap-1 rounded-full bg-white p-1 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
            {navItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex h-10 items-center gap-2 rounded-full px-3 text-sm font-semibold transition sm:px-4 ${
                    active ? "bg-[#0057FF] text-white" : "text-slate-600 hover:bg-[#f4f6f8] hover:text-slate-950"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <Link
            href="/profile"
            className="flex items-center gap-2 rounded-full bg-white py-1.5 pl-2 pr-2 shadow-[0_12px_30px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 sm:pr-3"
            aria-label="Open profile"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0057FF] text-xs font-bold text-white">
              {initials}
            </span>
            <span className="hidden max-w-[132px] truncate text-sm font-semibold sm:block">
              {displayName}
            </span>
          </Link>

          <button
            type="button"
            onClick={signOut}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-600 shadow-[0_12px_30px_rgba(15,23,42,0.06)] transition hover:text-slate-950"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-[1180px] px-4 py-5 sm:px-6 sm:py-7">{children}</div>
    </main>
  );
}

function getInitials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || <UserRound className="h-4 w-4" />
  );
}
