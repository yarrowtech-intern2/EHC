"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Activity,
  Bell,
  Calendar,
  Ambulance,
  Stethoscope,
  Droplets,
  Pill,
  Microscope,
  FileText,
  Clock,
  CheckCircle2,
} from "lucide-react";

const trustItems = [
  { icon: ShieldCheck, label: "Secure platform" },
  { icon: Activity, label: "Multiple healthcare services" },
  { icon: Bell, label: "Real-time updates" },
];

const floatingChips = [
  { icon: Ambulance, label: "Ambulance", x: -20, y: 30, delay: 0 },
  { icon: Stethoscope, label: "Doctor", x: 85, y: 10, delay: 0.1 },
  { icon: Droplets, label: "Blood Bank", x: 90, y: 60, delay: 0.2 },
  { icon: Pill, label: "Pharmacy", x: -15, y: 75, delay: 0.3 },
  { icon: Microscope, label: "Diagnostics", x: 40, y: 95, delay: 0.4 },
];

export function HeroSection() {
  return (
    <section className="px-4 pb-10 pt-24 sm:px-6 sm:pb-14 sm:pt-28">
      <div className="mx-auto max-w-container">
        <div className="grid items-center gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-brand/8 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">
                <Activity className="h-3.5 w-3.5" />
                Connected Digital Healthcare
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.08, ease: "easeOut" }}
              className="mt-4 max-w-2xl text-[2.45rem] font-bold leading-[1.04] tracking-tight text-heading sm:text-[3.15rem] lg:text-[3.9rem]"
            >
              Healthcare support, connected in one place.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.16, ease: "easeOut" }}
              className="mt-4 max-w-xl text-[15px] leading-7 text-body sm:text-base"
            >
              EHC connects patients with doctors, ambulances, blood banks,
              pharmacies, diagnostics and secure digital health records through
              one integrated healthcare platform.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.24, ease: "easeOut" }}
              className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
            >
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-full bg-ambercare px-6 py-3 text-sm font-semibold text-heading transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#c99e79]"
              >
                Access Healthcare
              </Link>
              <Link
                href="/partner-registration"
                className="inline-flex items-center justify-center rounded-full border border-brand/20 bg-white/65 px-6 py-3 text-sm font-semibold text-heading transition-all duration-200 hover:-translate-y-0.5 hover:bg-white"
              >
                Join as a Healthcare Partner
              </Link>
            </motion.div>

            <motion.a
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.45, delay: 0.3 }}
              href="#how-it-works"
              className="mt-1 inline-block text-sm font-medium text-brand transition-colors hover:text-brand-dark"
            >
              Explore how EHC works &darr;
            </motion.a>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.36, ease: "easeOut" }}
              className="mt-6 flex flex-wrap gap-3 sm:gap-5"
            >
              {trustItems.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 rounded-full bg-white/55 px-3 py-2 text-xs text-body"
                >
                  <Icon className="h-4 w-4 text-success" />
                  {label}
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, delay: 0.18, ease: "easeOut" }}
            className="relative"
          >
            <div className="neu-card relative overflow-hidden p-4 sm:p-5">
              <motion.div
                className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/30 to-transparent"
                initial={{ opacity: 0, scaleX: 0.7 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              />
              <div className="mb-4 flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-success" />
                <span className="text-xs font-medium text-body">
                  Dashboard Preview
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <motion.div
                  whileHover={{ y: -4, transition: { duration: 0.18 } }}
                  className="rounded-2xl border border-border bg-white/70 p-3.5"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-brand" />
                    <span className="text-xs font-semibold text-heading">
                      Upcoming Appointment
                    </span>
                  </div>
                  <p className="text-xs text-body">Dr. Sarah Mitchell</p>
                  <p className="mt-1 text-[11px] text-body/70">
                    Today, 2:30 PM
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ y: -4, transition: { duration: 0.18 } }}
                  className="rounded-2xl border border-border bg-white/70 p-3.5"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Ambulance className="h-4 w-4 text-emergency" />
                    <span className="text-xs font-semibold text-heading">
                      Ambulance Tracking
                    </span>
                  </div>
                  <p className="text-xs text-success font-medium">En route</p>
                  <p className="mt-1 text-[11px] text-body/70">
                    ETA: 8 min
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ y: -4, transition: { duration: 0.18 } }}
                  className="rounded-2xl border border-border bg-white/70 p-3.5"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-purple" />
                    <span className="text-xs font-semibold text-heading">
                      Prescription
                    </span>
                  </div>
                  <p className="text-xs text-body">3 active medications</p>
                  <div className="flex items-center gap-1 mt-1">
                    <CheckCircle2 className="h-3 w-3 text-success" />
                    <span className="text-[11px] text-success">
                      Verified
                    </span>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ y: -4, transition: { duration: 0.18 } }}
                  className="rounded-2xl border border-border bg-white/70 p-3.5"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Droplets className="h-4 w-4 text-emergency" />
                    <span className="text-xs font-semibold text-heading">
                      Blood Availability
                    </span>
                  </div>
                  <p className="text-xs text-body">A+, B+, O+</p>
                  <p className="mt-1 text-[11px] text-body/70">
                    3 banks nearby
                  </p>
                </motion.div>
              </div>

              <motion.div
                whileHover={{ y: -4, transition: { duration: 0.18 } }}
                className="mt-3 rounded-2xl border border-border bg-white/70 p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-brand" />
                    <span className="text-xs font-semibold text-heading">
                      Health Record Summary
                    </span>
                  </div>
                  <span className="text-[10px] text-body/70">
                    Last updated: 2h ago
                  </span>
                </div>
                <div className="mt-2 flex gap-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-heading">
                      12
                    </p>
                    <p className="text-[10px] text-body">Reports</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-heading">
                      5
                    </p>
                    <p className="text-[10px] text-body">Visits</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-heading">
                      3
                    </p>
                    <p className="text-[10px] text-body">Rx Active</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {floatingChips.map(({ icon: Icon, label, x, y, delay }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, delay: 0.52 + delay }}
                whileHover={{ y: -3 }}
                className="absolute hidden items-center gap-1.5 rounded-full border border-border/50 bg-white/82 px-3 py-1.5 text-xs font-medium text-heading shadow-neu-sm sm:flex"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <Icon className="h-3 w-3 text-brand" />
                {label}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
