"use client";

import { Check } from "lucide-react";
import { Button } from "../common/Button";
import { FadeIn } from "../common/FadeIn";
import { EditorialHighlight, EditorialTitle } from "../common/EditorialTitle";
import { serviceStories } from "@/data/landing2-services";
import { cdn } from "@/data/landing2-assets";

const imageMap: Record<string, string> = {
  doctors: cdn.images.doctorConsult,
  ambulance: cdn.images.ambulanceMap,
  "blood-bank": cdn.images.bloodBank,
  pharmacy: cdn.images.pharmacy,
  diagnostics: cdn.images.diagnostics,
  "health-records": cdn.images.healthRecords,
};

export function ServiceStories() {
  return (
    <section id="services" className="bg-[#f3f1ef] py-20 sm:py-28">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <FadeIn className="text-center mb-20 sm:mb-28">
          <EditorialTitle
            as="h2"
            size="section"
            className="mx-auto max-w-[860px]"
            lines={[
              <>
                Every <EditorialHighlight>service,</EditorialHighlight>
              </>,
              "one experience.",
            ]}
          />
        </FadeIn>

        <div className="space-y-28 sm:space-y-36">
          {serviceStories.map((service, i) => {
            const Icon = service.icon;
            const isReversed = i % 2 === 1;

            return (
              <div
                key={service.id}
                className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center"
              >
                <FadeIn
                  direction={isReversed ? "right" : "left"}
                  className={isReversed ? "lg:order-2" : ""}
                >
                  <div className="flex items-center gap-2.5 mb-4">
                    <Icon className="w-5 h-5 text-brand" strokeWidth={1.5} />
                    <span className="text-[13px] font-medium text-brand uppercase tracking-wider">
                      {service.label}
                    </span>
                  </div>

                  <EditorialTitle
                    as="h3"
                    align="left"
                    size="subsection"
                    className="max-w-[620px]"
                    lines={[service.heading]}
                  />

                  <ul className="mt-5 space-y-2.5">
                    {service.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2.5 text-[15px] text-secondary-text"
                      >
                        <Check className="w-4 h-4 text-success mt-0.5 shrink-0" strokeWidth={2} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-7">
                    <Button
                      href={service.ctaHref}
                      variant="primary"
                      size="sm"
                    >
                      {service.cta}
                    </Button>
                  </div>
                </FadeIn>

                <FadeIn
                  direction={isReversed ? "left" : "right"}
                  delay={0.1}
                  className={isReversed ? "lg:order-1" : ""}
                >
                  <div className="rounded-2xl overflow-hidden" style={{ aspectRatio: "16/10" }}>
                    <img
                      src={imageMap[service.id] || cdn.images.doctorConsult}
                      alt={`${service.label} interface preview`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </FadeIn>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
