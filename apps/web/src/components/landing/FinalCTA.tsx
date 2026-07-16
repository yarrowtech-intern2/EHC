"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Ambulance } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-container">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="neu-card overflow-hidden p-6 text-center sm:p-8 lg:p-10"
        >
          <motion.div
            className="mx-auto mb-5 h-px max-w-xs bg-gradient-to-r from-transparent via-brand/35 to-transparent"
            initial={{ opacity: 0, scaleX: 0.7 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          />
          <h2 className="mx-auto max-w-2xl text-2xl font-bold tracking-tight text-heading sm:text-3xl">
            Access healthcare services when and where you need them.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[15px] leading-7 text-body">
            Create an EHC account or join as a healthcare provider to become
            part of one connected digital healthcare ecosystem.
          </p>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-full bg-ambercare px-6 py-3 text-sm font-semibold text-heading transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#c99e79]"
            >
              Get Started with EHC
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full border border-brand/20 bg-white/70 px-6 py-3 text-sm font-semibold text-heading transition-all duration-200 hover:-translate-y-0.5 hover:bg-white"
            >
              Sign In
            </Link>
            <Link
              href="/request-demo"
              className="inline-flex items-center justify-center rounded-full border border-brand/20 px-6 py-3 text-sm font-semibold text-brand transition-colors hover:bg-brand/5"
            >
              Request a Demo
            </Link>
          </div>

          <div className="mt-5">
            <Link
              href="/emergency-ambulance"
              className="inline-flex items-center gap-2 text-sm font-medium text-emergency hover:text-red-600 transition-colors"
            >
              <Ambulance className="h-4 w-4" />
              Need urgent help? Request an ambulance.
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
