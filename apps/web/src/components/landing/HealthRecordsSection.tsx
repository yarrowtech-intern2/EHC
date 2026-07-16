"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileText,
  Pill,
  Activity,
  Calendar,
  CreditCard,
  User,
} from "lucide-react";

const records = [
  { icon: FileText, title: "Medical Reports", description: "Access lab results, imaging, and clinical documents" },
  { icon: Pill, title: "Prescription History", description: "View active and past medication records" },
  { icon: Activity, title: "Diagnostic Timeline", description: "Track diagnostic tests and results over time" },
  { icon: Calendar, title: "Appointment History", description: "Review past and scheduled consultations" },
  { icon: CreditCard, title: "Billing History", description: "Manage payment records and invoices" },
  { icon: User, title: "Patient Profile", description: "Personal health summary and demographics" },
];

export function HealthRecordsSection() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6">
      <div className="mx-auto max-w-container">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
              Digital Health Records
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-heading tracking-tight">
              Your health information, securely organised
            </h2>
            <p className="mt-4 text-base text-body leading-relaxed max-w-lg">
              All your medical records, prescriptions, diagnostic reports, and
              health data in one secure, accessible location.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center mt-6 px-6 py-3 bg-brand text-white text-sm font-semibold rounded-[14px] hover:bg-brand-dark transition-colors shadow-lg shadow-brand/20"
            >
              Explore Health Record Features
            </Link>
          </motion.div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {records.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ duration: 0.35, delay: i * 0.06 }}
                  className="neu-card p-4 sm:p-5"
                >
                  <Icon className="h-5 w-5 text-brand mb-2" />
                  <h3 className="text-sm font-bold text-heading">
                    {item.title}
                  </h3>
                  <p className="text-xs text-body mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
