"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Ambulance, HeartPulse } from "lucide-react";

const links = [
  { label: "Services", href: "#services" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Platform", href: "#platform" },
  { label: "Partners", href: "#partners" },
  { label: "Security", href: "#security" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-xl border-b border-gray-100"
          : "bg-transparent"
      }`}
      role="banner"
    >
      <nav
        className="mx-auto max-w-[1200px] flex items-center justify-between px-5 sm:px-8 h-16"
        role="navigation"
        aria-label="Main navigation"
      >
        <Link href="/landing2" className="flex items-center gap-2 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white">
            <HeartPulse className="h-4 w-4" />
          </div>
          <span className="text-[15px] font-semibold text-primary-text tracking-tight">
            EHC
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-0.5">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="px-3.5 py-1.5 text-[13px] font-medium text-secondary-text hover:text-primary-text rounded-lg transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-2">
          <Link
            href="/login"
            className="px-4 py-1.5 text-[13px] font-medium text-secondary-text hover:text-primary-text transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-4 py-1.5 text-[13px] font-medium text-white bg-primary-text rounded-full hover:bg-gray-800 transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/emergency-ambulance"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-[13px] font-medium text-white bg-emergency rounded-full hover:bg-red-600 transition-colors"
          >
            <Ambulance className="h-3.5 w-3.5" />
            Emergency
          </Link>
        </div>

        <div className="flex lg:hidden items-center gap-2">
          <Link
            href="/emergency-ambulance"
            className="flex items-center px-2.5 py-1.5 text-[11px] font-semibold text-white bg-emergency rounded-full"
            aria-label="Emergency Ambulance"
          >
            <Ambulance className="h-3.5 w-3.5" />
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg text-primary-text"
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
            className="lg:hidden fixed inset-0 top-16 bg-white z-40"
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
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="py-3 text-center text-[14px] font-medium text-primary-text border border-gray-200 rounded-full"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="py-3 text-center text-[14px] font-medium text-white bg-primary-text rounded-full"
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
