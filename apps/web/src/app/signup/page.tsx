import Link from "next/link";
import { ArrowLeft, Smartphone, Sparkles } from "lucide-react";

import { AuthSignupForm } from "@/components/auth-signup-form";

export default function SignupPage() {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-white/75 px-4 py-2 text-sm font-medium text-sapphire shadow-card"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <section className="mt-4 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="rounded-[32px] border border-sapphire/10 bg-cloud p-6 text-ink shadow-card sm:p-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-skywash px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-sapphire">
              <Sparkles className="h-4 w-4" />
              Main customer path
            </div>
            <h1 className="mt-5 text-3xl font-semibold sm:text-4xl">
              Patients can start directly without an organization invite.
            </h1>
            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
              This Phase 1 flow keeps patients first, while still supporting
              tenant admins and facility operators with the same onboarding engine.
            </p>

            <div className="mt-8 space-y-4">
              <div className="rounded-[24px] bg-skywash/40 p-4">
                <p className="text-sm font-semibold">Why phone OTP is prominent</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Mobile-first onboarding works better for patients in urgent or
                  low-friction scenarios.
                </p>
              </div>
              <div className="rounded-[24px] bg-skywash/40 p-4">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5" />
                  <p className="text-sm font-semibold">Skip-friendly flow</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Optional details can be skipped now and completed later without
                  blocking the patient from entering the system.
                </p>
              </div>
            </div>
          </aside>

          <AuthSignupForm />
        </section>
      </div>
    </main>
  );
}
