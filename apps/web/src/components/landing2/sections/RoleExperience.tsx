"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { FadeIn } from "../common/FadeIn";
import { EditorialHighlight, EditorialTitle } from "../common/EditorialTitle";
import { roles } from "@/data/landing2-roles";
import { cdn } from "@/data/landing2-assets";

const dashboardImages: Record<string, string> = {
  patient: cdn.images.patientDashboard,
  doctor: cdn.images.doctorDashboard,
  ambulance: cdn.images.ambulanceDashboard,
  "blood-bank": cdn.images.bloodBankDashboard,
  pharmacy: cdn.images.pharmacyDashboard,
};

export function RoleExperience() {
  const [activeId, setActiveId] = useState("patient");
  const active = roles.find((r) => r.id === activeId)!;

  return (
    <section id="platform" className="py-20 sm:py-28 px-5 sm:px-8">
      <div className="mx-auto max-w-[1200px]">
        <FadeIn className="text-center mb-12">
          <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-brand mb-4">
            Platform
          </p>
          <EditorialTitle
            as="h2"
            size="section"
            lines={[
              <>
                A <EditorialHighlight>workspace</EditorialHighlight>
              </>,
              "for every role.",
            ]}
          />
        </FadeIn>

        <div className="flex flex-wrap justify-center gap-1.5 mb-12">
          {roles.map((role) => {
            const Icon = role.icon;
            const isActive = role.id === activeId;
            return (
              <button
                key={role.id}
                onClick={() => setActiveId(role.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-primary-text text-white"
                    : "text-secondary-text hover:text-primary-text hover:bg-gray-50"
                }`}
                aria-pressed={isActive}
              >
                <Icon className="w-3.5 h-3.5" />
                {role.label}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <div>
                <EditorialTitle
                  as="h3"
                  align="left"
                  size="subsection"
                  className="max-w-[620px]"
                  lines={[active.heading]}
                />
                <p className="mt-3 text-[15px] text-secondary-text leading-relaxed">
                  {active.description}
                </p>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  {active.features.map((f) => (
                    <div
                      key={f}
                      className="flex items-center gap-2 text-[14px] text-primary-text"
                    >
                      <Check className="w-3.5 h-3.5 text-success shrink-0" strokeWidth={2} />
                      {f}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl overflow-hidden" style={{ aspectRatio: "16/10" }}>
                <img
                  src={dashboardImages[activeId] || cdn.images.patientDashboard}
                  alt={`${active.label} dashboard preview`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <p className="mt-8 text-center text-[12px] text-secondary-text/60">
          Previews are illustrative. Sign in to access your secure workspace.
        </p>
      </div>
    </section>
  );
}
