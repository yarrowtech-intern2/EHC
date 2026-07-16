"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Ambulance,
  MapPin,
  Navigation,
  Clock,
  User,
  Radio,
  Hospital,
} from "lucide-react";

const features = [
  { icon: MapPin, label: "Location detection" },
  { icon: Navigation, label: "Nearest ambulance matching" },
  { icon: Radio, label: "Live vehicle tracking" },
  { icon: User, label: "Driver and vehicle details" },
  { icon: Clock, label: "Estimated arrival time" },
  { icon: Ambulance, label: "Trip updates" },
];

export function EmergencySection() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6">
      <div className="mx-auto max-w-container">
        <div className="rounded-3xl bg-emergency/[0.04] border border-emergency/10 p-6 sm:p-10 lg:p-14">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* Left content */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emergency/10 rounded-full">
                  <div className="h-2 w-2 rounded-full bg-emergency emergency-pulse" />
                  <span className="text-xs font-semibold text-emergency uppercase tracking-wider">
                    Emergency Services
                  </span>
                </div>

                <h2 className="mt-5 text-3xl sm:text-4xl font-bold text-heading tracking-tight">
                  Medical emergency?
                </h2>

                <p className="mt-4 text-base text-body leading-relaxed max-w-lg">
                  Request an ambulance and receive real-time booking, location
                  and arrival updates.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3"
              >
                {features.map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2 text-sm text-heading"
                  >
                    <Icon className="h-4 w-4 text-emergency shrink-0" />
                    {label}
                  </div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-8 flex flex-wrap gap-3"
              >
                <Link
                  href="/emergency-ambulance"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-emergency text-white text-sm font-semibold rounded-[14px] hover:bg-red-600 transition-colors shadow-lg shadow-emergency/20"
                >
                  <Ambulance className="h-4 w-4" />
                  Request Ambulance Now
                </Link>
                <Link
                  href="/login"
                  className="neu-btn inline-flex items-center px-6 py-3.5 text-sm font-semibold text-heading hover:shadow-neu transition-shadow duration-200"
                >
                  Track Existing Request
                </Link>
              </motion.div>
            </div>

            {/* Right: Map illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="relative"
            >
              <div className="neu-card p-5 bg-white/80">
                {/* Simplified map illustration */}
                <div className="relative rounded-2xl bg-gradient-to-br from-blue-50 to-sky-50 border border-border h-64 sm:h-72 overflow-hidden">
                  {/* Grid lines */}
                  <div className="absolute inset-0 opacity-20">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={`h-${i}`}
                        className="absolute w-full border-t border-brand/20"
                        style={{ top: `${(i + 1) * 14.28}%` }}
                      />
                    ))}
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={`v-${i}`}
                        className="absolute h-full border-l border-brand/20"
                        style={{ left: `${(i + 1) * 11.11}%` }}
                      />
                    ))}
                  </div>

                  {/* Route line */}
                  <svg
                    className="absolute inset-0 w-full h-full"
                    viewBox="0 0 400 280"
                    fill="none"
                  >
                    <path
                      d="M 100 200 Q 150 160 200 140 Q 250 120 300 80"
                      stroke="#E84545"
                      strokeWidth="3"
                      strokeDasharray="8 4"
                      opacity="0.6"
                    />
                  </svg>

                  {/* Patient marker */}
                  <div className="absolute bottom-12 left-[20%] flex flex-col items-center">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-lg shadow-sm text-[10px] font-semibold text-heading mb-1">
                      <MapPin className="h-3 w-3 text-brand" />
                      Your location
                    </div>
                    <div className="h-4 w-4 rounded-full bg-brand border-2 border-white shadow-md" />
                  </div>

                  {/* Ambulance marker */}
                  <div className="absolute top-[35%] left-[45%] flex flex-col items-center">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emergency rounded-lg text-[10px] font-semibold text-white mb-1 shadow-sm">
                      <Ambulance className="h-3 w-3" />
                      Ambulance
                    </div>
                    <div className="h-4 w-4 rounded-full bg-emergency border-2 border-white shadow-md emergency-pulse" />
                  </div>

                  {/* Hospital marker */}
                  <div className="absolute top-[20%] right-[15%] flex flex-col items-center">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-lg shadow-sm text-[10px] font-semibold text-heading mb-1">
                      <Hospital className="h-3 w-3 text-success" />
                      Hospital
                    </div>
                    <div className="h-4 w-4 rounded-full bg-success border-2 border-white shadow-md" />
                  </div>

                  {/* ETA card */}
                  <div className="absolute bottom-4 right-4 bg-white rounded-xl p-3 shadow-md border border-border">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-emergency" />
                      <div>
                        <p className="text-[10px] text-body">Estimated Arrival</p>
                        <p className="text-sm font-bold font-mono text-heading">
                          8 min
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
