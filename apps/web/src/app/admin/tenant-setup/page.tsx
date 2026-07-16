import { ChevronRight, ShieldCheck } from "lucide-react";

import { TenantSetupForm } from "@/components/tenant-setup-form";

export default function TenantSetupPage() {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <section className="rounded-[32px] border border-sapphire/10 bg-white p-5 shadow-card sm:p-8">
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <span>Admin</span>
            <ChevronRight className="h-4 w-4" />
            <span>Tenant setup</span>
          </div>

          <h1 className="mt-4 text-3xl font-semibold text-ink sm:text-4xl">
            Create a healthcare organization
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Phase 1 treats the organization as the tenant and each service location
            as a facility. Small vendors can operate with a single direct-to-patient
            facility without changing the structure later.
          </p>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <TenantSetupForm />

            <aside className="rounded-[28px] bg-sapphire p-5 text-white shadow-card">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white/15 p-3">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-white/70">
                    Phase 1 notes
                  </p>
                  <h2 className="text-xl font-semibold">Guardrails</h2>
                </div>
              </div>

              <ul className="mt-5 space-y-3 text-sm leading-6 text-white/85">
                <li>Tenant is always the top-level organization record.</li>
                <li>Every patient-serving branch is modeled as a facility.</li>
                <li>Small vendors can onboard as a single-facility tenant.</li>
                <li>Role assignment should happen before operational modules open.</li>
              </ul>

              <div className="mt-6 rounded-[24px] bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-white/65">
                  Supported auth
                </p>
                <p className="mt-2 text-sm leading-6 text-white/90">
                  Email-password, Google, magic link, and phone OTP are all
                  expected in the Phase 1 onboarding flow.
                </p>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
