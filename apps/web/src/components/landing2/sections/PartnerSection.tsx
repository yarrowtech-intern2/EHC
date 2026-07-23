"use client";

import { Stethoscope, Ambulance, Droplets, Pill, Microscope, Building2 } from "lucide-react";
import { Button } from "../common/Button";
import { FadeIn } from "../common/FadeIn";
import { EditorialHighlight, EditorialTitle } from "../common/EditorialTitle";
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
    <section id="partners" className="bg-[#f3f1ef] py-20 sm:py-28 px-5 sm:px-8">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <FadeIn>
            <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-brand mb-4">
              Partners
            </p>
            <EditorialTitle
              as="h2"
              align="left"
              size="section"
              className="max-w-[760px]"
              lines={[
                <>
                  Bring your <EditorialHighlight>service</EditorialHighlight>
                </>,
                "onto one platform.",
              ]}
            />
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
              <Button
                href="/provider-signup"
                variant="primary"
                size="md"
              >
                Become a Partner
              </Button>
              <Button
                href="/request-demo"
                variant="secondary"
                size="md"
              >
                Request a Demo
              </Button>
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
