"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Lock, FileCheck, ScrollText } from "lucide-react";

const securityCards = [
  {
    icon: ShieldCheck,
    title: "Role-Based Access",
    description:
      "Each user type has specific permissions ensuring access only to relevant features and data.",
  },
  {
    icon: Lock,
    title: "Encrypted Information",
    description:
      "Health data is encrypted in transit and at rest, protecting sensitive patient information.",
  },
  {
    icon: FileCheck,
    title: "Secure Health Records",
    description:
      "Medical records are stored securely with controlled access and versioning.",
  },
  {
    icon: ScrollText,
    title: "Activity and Audit Logs",
    description:
      "All platform actions are logged for transparency, accountability and security monitoring.",
  },
];

export function SecuritySection() {
  return (
    <section id="security" className="py-16 sm:py-24 px-4 sm:px-6">
      <div className="mx-auto max-w-container">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-heading tracking-tight">
            Healthcare information protected by design
          </h2>
          <p className="mt-4 text-base text-body max-w-2xl mx-auto">
            Access to healthcare information depends on the user&apos;s role and
            permissions within the platform.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {securityCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="neu-card neu-card-hover p-6 text-center transition-all duration-200"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/8 mx-auto">
                  <Icon className="h-5 w-5 text-brand" />
                </div>
                <h3 className="mt-4 text-base font-bold text-heading">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm text-body leading-relaxed">
                  {card.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
