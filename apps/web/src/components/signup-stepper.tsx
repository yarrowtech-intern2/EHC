"use client";

import { useState } from "react";
import {
  ArrowRight,
  ChevronLeft,
  Hospital,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { UIButton } from "@/components/ui-button";

const steps = [
  {
    icon: UserRound,
    title: "Choose your access",
    text: "Pick patient, tenant admin, or facility operator. Each path can continue later without losing progress.",
  },
  {
    icon: Hospital,
    title: "Add organization basics",
    text: "Create the healthcare organization first, then add branches like hospital, clinic, pharmacy, lab, or ambulance unit.",
  },
  {
    icon: ShieldCheck,
    title: "Verify and continue",
    text: "Support email-password, Google, magic link, and phone verification with optional skipped fields for faster onboarding.",
  },
];

export function SignupStepper() {
  const [currentStep, setCurrentStep] = useState(0);
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;
  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <div className="rounded-[32px] bg-sapphire px-5 py-6 text-white shadow-card sm:px-6">
      <div className="flex items-center gap-2 text-sm text-white/80">
        {steps.map((item, index) => (
          <div
            key={item.title}
            className={`h-2 flex-1 rounded-full ${
              index <= currentStep ? "bg-ambercare" : "bg-white/20"
            }`}
          />
        ))}
      </div>

      <div className="mt-6 flex items-center gap-4">
        <div className="rounded-2xl bg-white/12 p-3">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-white/70">
            Step {currentStep + 1}
          </p>
          <h3 className="text-xl font-semibold">{step.title}</h3>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-white/85">{step.text}</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <UIButton
          type="button"
          variant="secondary"
          className="bg-white/10 text-white ring-white/20 hover:bg-white/20"
          disabled={isFirst}
          onClick={() => setCurrentStep((value) => Math.max(0, value - 1))}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </UIButton>
        <UIButton
          type="button"
          variant="secondary"
          className="bg-white text-sapphire hover:bg-cloud"
          onClick={() =>
            setCurrentStep((value) =>
              isLast ? value : Math.min(steps.length - 1, value + 1),
            )
          }
        >
          {isLast ? "Review flow" : "Next"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </UIButton>
        <UIButton
          type="button"
          variant="ghost"
          className="text-white hover:bg-white/10"
        >
          Skip for now
        </UIButton>
      </div>
    </div>
  );
}

