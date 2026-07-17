"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Cross } from "lucide-react";

const links = [
  { label: "Services", href: "#services" },
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
          ? "bg-[#efefeb]/92 backdrop-blur-md"
          : "bg-transparent"
      }`}
      role="banner"
    >
      <nav
        className="flex h-16 w-full items-center justify-between px-3 md:px-[8.4vw] xl:h-[76px]"
        role="navigation"
        aria-label="Main navigation"
      >
        <Link href="/" className="flex shrink-0 items-center gap-1.5 xl:gap-2">
          <span
            className="relative h-5 w-5 overflow-hidden rounded-full bg-[#7779fc] md:bg-brand xl:h-7 xl:w-7"
            aria-hidden="true"
          >
            <span className="absolute left-[5px] top-[-3px] h-7 w-2.5 rotate-[-42deg] rounded-full bg-[#efefeb] xl:left-[7px] xl:top-[-4px] xl:h-10 xl:w-3.5" />
            <span className="absolute bottom-1 right-1 h-1.5 w-1.5 rounded-full bg-[#efefeb] xl:bottom-1.5 xl:right-1.5 xl:h-2 xl:w-2" />
          </span>
          <span className="text-[14px] font-bold text-[#090b13] xl:text-[18px]">
            EHC
          </span>
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
          <Link
            href="/login"
            className="flex h-[22px] items-center bg-[#aaa6ff] px-3 text-[11px] font-semibold text-white transition-colors hover:bg-brand xl:h-9 xl:px-5 xl:text-[14px]"
          >
            Sign in
          </Link>
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
            className="fixed inset-0 top-16 z-40 bg-[#efefeb] md:hidden"
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
                  className="bg-[#aaa6ff] py-3 text-center text-[14px] font-medium text-white"
                >
                  Sign In
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
