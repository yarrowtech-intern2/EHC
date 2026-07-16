"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { quickActions } from "@/data/services";

export function QuickActions() {
  return (
    <section className="px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-container">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {quickActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <Link
                  href={action.href}
                  className={`group neu-card flex flex-col items-center gap-2.5 p-4 text-center transition-all duration-200 hover:-translate-y-1 ${
                    action.isEmergency
                      ? "ring-2 ring-emergency/20"
                      : ""
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-2xl transition-colors duration-200 ${
                      action.isEmergency
                        ? "bg-emergency/10 text-emergency group-hover:bg-emergency/15"
                        : "bg-brand/8 text-brand group-hover:bg-brand/12"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span
                    className={`text-[13px] font-semibold leading-5 ${
                      action.isEmergency ? "text-emergency" : "text-heading"
                    }`}
                  >
                    {action.title}
                  </span>
                  {!action.isEmergency && (
                    <span className="text-[10px] leading-4 text-body">
                      Sign in to continue
                    </span>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
