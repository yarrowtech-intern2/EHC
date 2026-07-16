"use client";

import { FadeIn } from "../common/FadeIn";
import { serviceLabels } from "@/data/landing2-services";

export function ServicesOverview() {
  return (
    <section className="py-28 sm:py-36 px-5 sm:px-8">
      <div className="mx-auto max-w-[1200px] text-center">
        <FadeIn>
          <h2 className="text-section text-primary-text max-w-2xl mx-auto">
            One platform. Every essential connection.
          </h2>
        </FadeIn>

        <FadeIn delay={0.15}>
          <p className="mt-5 text-lg text-secondary-text max-w-lg mx-auto leading-relaxed">
            From emergency response to continued care — coordinated through one
            secure ecosystem.
          </p>
        </FadeIn>

        <FadeIn delay={0.25}>
          <div className="mt-14 flex flex-wrap justify-center gap-8 sm:gap-12">
            {serviceLabels.map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-2.5">
                <Icon className="w-6 h-6 text-secondary-text" strokeWidth={1.5} />
                <span className="text-[13px] font-medium text-secondary-text">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
