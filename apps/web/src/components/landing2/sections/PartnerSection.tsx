"use client";

import Link from "next/link";
import { Stethoscope, Ambulance, Droplets, Pill, Microscope, Building2 } from "lucide-react";
import { FadeIn } from "../common/FadeIn";
import { cdn } from "@/data/landing2-assets";

const partners = [
  { icon: Stethoscope, label: "Doctors" },
  { icon: Ambulance, label: "Ambulance Providers" },
  { icon: Droplets, label: "Blood Banks" },
  { icon: Pill, label: "Pharmacies" },
  { icon: Microscope, label: "Diagnostic Centres" },
  { icon: Building2, label: "Institutions" },
];

export function PartnerSection() {
  return (
    <section id="partners" className="py-20 sm:py-28 bg-soft-bg px-5 sm:px-8">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <FadeIn>
            <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-brand mb-4">
              Partners
            </p>
            <h2 className="text-section text-primary-text leading-tight">
              Bring your service onto one platform.
            </h2>
            <p className="mt-4 text-[15px] text-secondary-text leading-relaxed max-w-md">
              Join as a doctor, ambulance provider, blood bank, pharmacy or
              diagnostic centre.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {partners.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white border border-gray-100 text-[13px] font-medium text-primary-text"
                >
                  <Icon className="w-3.5 h-3.5 text-brand" strokeWidth={1.5} />
                  {label}
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/partner-registration"
                className="px-6 py-3 text-[14px] font-semibold text-white bg-brand rounded-full hover:bg-brand-dark transition-colors"
              >
                Become a Partner
              </Link>
              <Link
                href="/request-demo"
                className="px-6 py-3 text-[14px] font-medium text-primary-text border border-gray-200 rounded-full hover:bg-white transition-colors"
              >
                Request a Demo
              </Link>
            </div>
          </FadeIn>

          <FadeIn direction="right" delay={0.1}>
            <div className="rounded-2xl overflow-hidden" style={{ aspectRatio: "4/3" }}>
              <img
                src={cdn.images.partners}
                alt="Healthcare partners collaboration"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
