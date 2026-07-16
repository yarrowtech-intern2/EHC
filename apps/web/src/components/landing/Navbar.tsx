"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Ambulance,
  HeartPulse,
} from "lucide-react";

const navLinks = [
  { label: "Services", href: "#services" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Partners", href: "#partners" },
  { label: "Security", href: "#security" },
  { label: "About", href: "#about" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav
      className="fixed left-0 right-0 top-0 z-50 px-4 pt-3 sm:px-6"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="mx-auto max-w-container">
        <div className="flex items-center justify-between rounded-full border border-white/35 px-1 py-1.5 backdrop-blur-md">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white shadow-sm">
              <HeartPulse className="h-4 w-4" />
            </div>
            <div>
              <span className="text-base font-semibold tracking-tight text-heading">EHC</span>
              <span className="hidden sm:block text-[10px] leading-none tracking-[0.14em] text-body">
                Electronic Healthcare
              </span>
            </div>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="rounded-full px-3 py-2 text-[13px] font-medium text-body transition-colors duration-200 hover:text-heading"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            <Link
              href="/login"
              className="rounded-full px-4 py-2 text-sm font-medium text-heading transition-colors hover:text-brand"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-ambercare px-4 py-2 text-sm font-semibold text-heading transition-transform duration-200 hover:-translate-y-0.5"
            >
              Get Started
            </Link>
            <Link
              href="/emergency-ambulance"
              className="flex items-center gap-2 rounded-full border border-red-200 bg-white/70 px-4 py-2 text-sm font-semibold text-emergency transition-colors hover:bg-white"
            >
              <Ambulance className="h-4 w-4" />
              Emergency
            </Link>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <Link
              href="/emergency-ambulance"
              className="flex items-center gap-1.5 rounded-full border border-red-200 bg-white/75 px-3 py-2 text-xs font-semibold text-emergency"
              aria-label="Emergency Ambulance"
            >
              <Ambulance className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Emergency</span>
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-full p-2.5 text-heading transition-colors hover:bg-white/50"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="mt-2 rounded-[24px] border border-white/40 bg-white/88 p-3 shadow-card backdrop-blur-md lg:hidden"
            >
              <div className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-2xl px-4 py-3 text-sm font-medium text-body transition-colors hover:bg-skywash/40 hover:text-heading"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
              <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
                <Link
                  href="/login"
                  className="rounded-2xl px-4 py-3 text-center text-sm font-semibold text-heading transition-colors hover:bg-skywash/40"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="rounded-2xl bg-ambercare px-4 py-3 text-center text-sm font-semibold text-heading"
                  onClick={() => setMobileOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
