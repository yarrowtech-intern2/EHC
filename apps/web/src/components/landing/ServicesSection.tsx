"use client";

import { motion } from "framer-motion";
import { services } from "@/data/services";

export function ServicesSection() {
  return (
    <section id="services" className="px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-container">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center sm:mb-10"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
            One Connected Ecosystem
          </span>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-heading sm:text-3xl">
            Everything you need for coordinated healthcare
          </h2>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.32, delay: i * 0.06 }}
                whileHover={{ y: -5 }}
                className="neu-card p-5 transition-all duration-200"
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: `${service.color}12` }}
                >
                  <Icon
                    className="h-5 w-5"
                    style={{ color: service.color }}
                  />
                </div>
                <h3 className="mt-3 text-base font-bold text-heading">
                  {service.title}
                </h3>
                <ul className="mt-3 space-y-1.5">
                  {service.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm text-body"
                    >
                      <div
                        className="h-1.5 w-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: service.color }}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
