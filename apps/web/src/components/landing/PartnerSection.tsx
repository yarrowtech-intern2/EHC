"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Stethoscope,
  Ambulance,
  Droplets,
  Pill,
  Microscope,
} from "lucide-react";

const partners = [
  { icon: Stethoscope, label: "Doctors" },
  { icon: Ambulance, label: "Ambulance Providers" },
  { icon: Droplets, label: "Blood Banks" },
  { icon: Pill, label: "Pharmacies" },
  { icon: Microscope, label: "Diagnostic Centres" },
];

export function PartnerSection() {
  return (
    <section id="partners" className="py-16 sm:py-24 px-4 sm:px-6">
      <div className="mx-auto max-w-container">
        <div className="neu-card p-6 sm:p-10 lg:p-14">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
              Healthcare Partners
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-heading tracking-tight">
              Bring your healthcare service onto one connected platform
            </h2>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-10">
            {partners.map((p, i) => {
              const Icon = p.icon;
              return (
                <motion.div
                  key={p.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.06 }}
                  className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-white border border-border text-sm font-medium text-heading"
                >
                  <Icon className="h-4 w-4 text-brand" />
                  {p.label}
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-3"
          >
            <Link
              href="/partner-registration"
              className="inline-flex items-center px-7 py-3.5 bg-brand text-white text-sm font-semibold rounded-[14px] hover:bg-brand-dark transition-colors shadow-lg shadow-brand/20"
            >
              Become an EHC Partner
            </Link>
            <Link
              href="/request-demo"
              className="neu-btn inline-flex items-center px-7 py-3.5 text-sm font-semibold text-heading hover:shadow-neu transition-shadow duration-200"
            >
              Request a Demo
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
