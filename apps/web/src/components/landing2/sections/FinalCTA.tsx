"use client";

import Link from "next/link";
import { Ambulance } from "lucide-react";
import { FadeIn } from "../common/FadeIn";

export function FinalCTA() {
  return (
    <section className="py-24 sm:py-36 px-5 sm:px-8 text-center">
      <div className="mx-auto max-w-2xl">
        <FadeIn>
          <h2 className="text-section text-primary-text">
            Start here.
          </h2>
          <p className="mt-4 text-base text-secondary-text leading-relaxed">
            Join as a patient, healthcare professional or service provider.
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/register"
              className="px-7 py-3 text-[14px] font-semibold text-white bg-brand rounded-full hover:bg-brand-dark transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="px-7 py-3 text-[14px] font-medium text-primary-text border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/request-demo"
              className="px-7 py-3 text-[14px] font-medium text-secondary-text hover:text-primary-text transition-colors"
            >
              Request a Demo
            </Link>
          </div>

          <div className="mt-6">
            <Link
              href="/emergency-ambulance"
              className="inline-flex items-center gap-1.5 text-[13px] text-emergency hover:text-red-600 transition-colors"
            >
              <Ambulance className="w-3.5 h-3.5" />
              Need urgent help? Request an ambulance.
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
