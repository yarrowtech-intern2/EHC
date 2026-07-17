"use client";

import Link from "next/link";
import { Ambulance } from "lucide-react";
import { Button } from "../common/Button";
import { FadeIn } from "../common/FadeIn";
import { EditorialHighlight, EditorialTitle } from "../common/EditorialTitle";

export function FinalCTA() {
  return (
    <section className="py-24 sm:py-36 px-5 sm:px-8 text-center">
      <div className="mx-auto max-w-2xl">
        <FadeIn>
          <EditorialTitle
            as="h2"
            size="section"
            lines={[
              "Start",
              <EditorialHighlight key="final-cta">here.</EditorialHighlight>,
            ]}
          />
          <p className="mt-4 text-base text-secondary-text leading-relaxed">
            Join as a patient, healthcare professional or service provider.
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button
              href="/register"
              variant="primary"
              size="lg"
            >
              Get Started
            </Button>
            <Button
              href="/login"
              variant="secondary"
              size="lg"
            >
              Sign In
            </Button>
            <Button
              href="/request-demo"
              variant="secondary"
              size="lg"
            >
              Request a Demo
            </Button>
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
