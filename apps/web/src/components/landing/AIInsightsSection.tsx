"use client";

import { motion } from "framer-motion";
import {
  Brain,
  FileSearch,
  ImageIcon,
  TrendingUp,
  BarChart3,
} from "lucide-react";

const insights = [
  {
    icon: Brain,
    title: "Pattern Recognition",
    description: "Identify health trends and patterns across patient data",
  },
  {
    icon: FileSearch,
    title: "Report Classification",
    description: "Automatically categorise and organise medical documents",
  },
  {
    icon: ImageIcon,
    title: "Medical Image Support",
    description: "Assist in analysing diagnostic imaging data",
  },
  {
    icon: TrendingUp,
    title: "Treatment Progress",
    description: "Track and visualise treatment outcomes over time",
  },
  {
    icon: BarChart3,
    title: "Provider Analytics",
    description: "Operational insights for healthcare service providers",
  },
];

export function AIInsightsSection() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6">
      <div className="mx-auto max-w-container">
        <div className="rounded-3xl bg-heading p-6 sm:p-10 lg:p-14">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
              AI-Assisted Healthcare
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Smarter healthcare insights with responsible AI
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {insights.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ duration: 0.35, delay: i * 0.07 }}
                  className="rounded-2xl bg-white/[0.06] backdrop-blur-sm border border-white/10 p-5 text-center"
                >
                  <Icon className="h-6 w-6 text-brand mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-white">
                    {item.title}
                  </h3>
                  <p className="text-xs text-white/60 mt-2 leading-relaxed">
                    {item.description}
                  </p>
                </motion.div>
              );
            })}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 text-xs text-white/50 text-center max-w-2xl mx-auto leading-relaxed italic"
          >
            AI-generated insights are designed to support qualified healthcare
            professionals and do not replace medical diagnosis, treatment or
            emergency care.
          </motion.p>
        </div>
      </div>
    </section>
  );
}
