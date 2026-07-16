"use client";

import { motion } from "framer-motion";
import {
  MousePointerClick,
  ClipboardList,
  Link2,
  BarChart3,
} from "lucide-react";

const steps = [
  {
    icon: MousePointerClick,
    step: "01",
    title: "Select a Service",
    description:
      "Choose from doctor consultations, ambulance requests, blood bank search, pharmacy orders, or diagnostics.",
  },
  {
    icon: ClipboardList,
    step: "02",
    title: "Share Your Requirement",
    description:
      "Provide relevant details like symptoms, location, prescription, or test requirements.",
  },
  {
    icon: Link2,
    step: "03",
    title: "Connect with a Provider",
    description:
      "Get matched with verified healthcare providers based on your needs and location.",
  },
  {
    icon: BarChart3,
    step: "04",
    title: "Track and Manage",
    description:
      "Monitor progress, receive updates, access records, and manage your healthcare journey.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-container">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center sm:mb-10"
        >
          <h2 className="text-2xl font-bold tracking-tight text-heading sm:text-3xl">
            Healthcare access in four simple steps
          </h2>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="relative"
              >
                {/* Connector line (desktop) */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] border-t-2 border-dashed border-brand/20" />
                )}

                <div className="neu-card h-full p-5 transition-transform duration-200 hover:-translate-y-1">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand/8">
                      <Icon className="h-5 w-5 text-brand" />
                    </div>
                    <span className="text-xl font-bold text-brand/20">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-[15px] font-bold text-heading">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-body leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
