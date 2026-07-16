"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { VideoPlayer } from "../common/VideoPlayer";
import { cdn } from "@/data/landing2-assets";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col pt-20 pb-8">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8 text-center mt-auto">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-[13px] font-medium uppercase tracking-[0.14em] text-brand mb-5"
        >
          Connected Healthcare Platform
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-hero text-primary-text mx-auto max-w-4xl"
        >
          Healthcare, connected around you.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mt-5 text-lg text-secondary-text max-w-xl mx-auto leading-relaxed"
        >
          Patients, doctors, ambulances, pharmacies, diagnostics and health
          records — one integrated platform.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="mt-8 flex flex-wrap justify-center gap-3"
        >
          <Link
            href="/register"
            className="px-7 py-3 text-[14px] font-semibold text-white bg-brand rounded-full hover:bg-brand-dark transition-colors"
          >
            Get Started
          </Link>
          <a
            href="#services"
            className="px-7 py-3 text-[14px] font-semibold text-primary-text border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
          >
            Explore Platform
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-3 text-[13px] text-secondary-text"
        >
          Already have an account?{" "}
          <Link href="/login" className="text-brand hover:text-brand-dark font-medium">
            Sign in
          </Link>
        </motion.p>
      </div>

      {/* Hero video */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.5 }}
        className="mx-auto max-w-[1200px] w-full px-5 sm:px-8 mt-12 mb-auto"
      >
        <VideoPlayer
          src={cdn.videos.heroReel}
          poster={cdn.posters.heroReel}
          className="rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.08)]"
        />
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="mt-6 flex flex-col items-center gap-1.5"
      >
        <span className="text-[11px] text-secondary-text/50 tracking-wider uppercase">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-4 h-4 text-secondary-text/30" />
        </motion.div>
      </motion.div>
    </section>
  );
}
