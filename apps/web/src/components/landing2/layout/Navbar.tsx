"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Cross } from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { getDashboardPath } from "@/lib/supabase-browser";

const links = [
  { label: "Services", href: "#services" },
  { label: "Platform", href: "#platform" },
  { label: "Partners", href: "#partners" },
  { label: "Security", href: "#security" },
];

const logoImage =
  "https://res.cloudinary.com/dc3qprub3/image/upload/v1784888990/3_kxglwk.png";

export function Navbar() {
  const { actorType, loading, user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dashboardPath = getDashboardPath(actorType);
  const signedIn = Boolean(user);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#f3f1ef]/92 backdrop-blur-md"
          : "bg-transparent"
      }`}
      role="banner"
    >
      <nav
        className="flex h-16 w-full items-center justify-between px-3 md:px-[8.4vw] xl:h-[76px]"
        role="navigation"
        aria-label="Main navigation"
      >
        <Link href="/" className="flex shrink-0 items-center">
          <img
            src={logoImage}
            alt="EHC"
            className="h-6 w-auto select-none xl:h-8"
            loading="eager"
            decoding="async"
            draggable={false}
          />
        </Link>

        <div className="ml-auto hidden items-center gap-4 md:flex xl:gap-8">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-[11px] font-medium text-[#090b13] transition-colors hover:text-brand xl:text-[14px]"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="ml-5 hidden items-center gap-2 md:flex xl:ml-10 xl:gap-3">
          {!loading ? (
            <Link
              href={signedIn ? dashboardPath : "/login"}
              className="flex h-[22px] items-center bg-[#aaa6ff] px-3 text-[11px] font-semibold text-white transition-colors hover:bg-brand xl:h-9 xl:px-5 xl:text-[14px]"
            >
              {signedIn ? "Dashboard" : "Sign in"}
            </Link>
          ) : null}
          <Link
            href="/emergency-ambulance"
            className="flex h-[22px] w-[22px] items-center justify-center bg-[#ffd5d8] text-emergency transition-colors hover:bg-[#ffc2c6] xl:h-9 xl:w-9"
            aria-label="Emergency Ambulance"
          >
            <Cross className="h-3.5 w-3.5 fill-emergency stroke-emergency xl:h-5 xl:w-5" />
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-[#aaa6ff]"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 top-16 z-40 bg-[#f3f1ef] md:hidden"
          >
            <div className="flex flex-col p-6 gap-0.5">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="py-3 text-base font-medium text-primary-text"
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col gap-3">
                <Link
                  href={signedIn ? dashboardPath : "/login"}
                  onClick={() => setMobileOpen(false)}
                  className="bg-[#aaa6ff] py-3 text-center text-[14px] font-medium text-white"
                >
                  {signedIn ? "Dashboard" : "Sign In"}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="bg-amber-400 py-3 text-center text-[14px] font-medium text-primary-text"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
