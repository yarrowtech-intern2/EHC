"use client";

import {
  Stethoscope,
  Pill,
  Droplets,
  FileText,
  ShoppingCart,
  CalendarCheck,
} from "lucide-react";
import { Button } from "../common/Button";
import { FadeIn } from "../common/FadeIn";
import { EditorialHighlight, EditorialTitle } from "../common/EditorialTitle";

const timeline = [
  { icon: Stethoscope, label: "Doctor visit" },
  { icon: Pill, label: "Prescription" },
  { icon: Droplets, label: "Blood test" },
  { icon: FileText, label: "Lab report" },
  { icon: ShoppingCart, label: "Medicine order" },
  { icon: CalendarCheck, label: "Follow-up" },
];

export function HealthRecordsShowcase() {
  return (
    <section className="bg-background py-20 text-primary-text sm:py-28">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8 text-center">
        <FadeIn>
          <EditorialTitle
            as="h2"
            size="section"
            className="mx-auto max-w-[860px]"
            lines={[
              <>
                Your healthcare <EditorialHighlight>story,</EditorialHighlight>
              </>,
              "organised over time.",
            ]}
          />
          <p className="mx-auto mt-4 max-w-lg text-base text-secondary-text">
            Medical records, prescriptions, diagnostics, appointments and
            billing — securely accessible from one place.
          </p>
        </FadeIn>

        <FadeIn delay={0.15}>
          <div className="mt-14 flex flex-wrap justify-center gap-6 sm:gap-10">
            {timeline.map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/70">
                  <Icon className="h-5 w-5 text-brand" strokeWidth={1.5} />
                </div>
                <span className="text-[12px] text-secondary-text">{label}</span>
              </div>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={0.25}>
          <div className="mt-10">
            <Button
              href="/login"
              variant="primary"
              size="md"
            >
              Explore Health Records
            </Button>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
