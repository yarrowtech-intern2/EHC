"use client";

import { FadeIn } from "../common/FadeIn";

const steps = [
  { num: "01", title: "Choose a service", desc: "Doctors, ambulance, blood bank, pharmacy, diagnostics or health records." },
  { num: "02", title: "Share your requirement", desc: "Provide symptoms, location, prescription or test details." },
  { num: "03", title: "Connect with a provider", desc: "Matched with verified providers by availability and proximity." },
  { num: "04", title: "Track and manage", desc: "Monitor progress, receive updates, manage your healthcare." },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 sm:py-28 px-5 sm:px-8">
      <div className="mx-auto max-w-[1200px]">
        <FadeIn className="text-center mb-16">
          <h2 className="text-section text-primary-text">
            How it works.
          </h2>
        </FadeIn>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {steps.map((step, i) => (
            <FadeIn key={step.num} delay={i * 0.08}>
              <div>
                <span className="text-[56px] font-bold text-gray-100 leading-none select-none block">
                  {step.num}
                </span>
                <h3 className="mt-1 text-lg font-semibold text-primary-text">
                  {step.title}
                </h3>
                <p className="mt-2 text-[14px] text-secondary-text leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
