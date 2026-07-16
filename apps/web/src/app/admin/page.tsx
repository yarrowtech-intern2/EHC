import Link from "next/link";
import { Activity, Building2, LayoutDashboard, MapPinned, Users } from "lucide-react";

import { DashboardCard } from "@/components/dashboard-card";
import { UIButton } from "@/components/ui-button";

const stats = [
  { label: "Organizations", value: "12", icon: Building2 },
  { label: "Facilities", value: "38", icon: MapPinned },
  { label: "Active users", value: "246", icon: Users },
  { label: "Audit events", value: "1.2k", icon: Activity },
];

export default function AdminPage() {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-[32px] border border-sapphire/10 bg-white p-5 shadow-card sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-skywash/20 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-sapphire">
                <LayoutDashboard className="h-4 w-4" />
                Admin Console
              </div>
              <h1 className="mt-4 text-3xl font-semibold text-ink sm:text-4xl">
                Phase 1 tenant operations dashboard
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                Start with organization creation, facility onboarding, access control,
                and audit visibility. This dashboard is optimized for phones first and
                scales up to admin workstations.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/admin/tenant-setup">
                <UIButton>Create tenant</UIButton>
              </Link>
              <Link href="/">
                <UIButton variant="secondary">Back to overview</UIButton>
              </Link>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="rounded-[24px] border border-sapphire/10 bg-cloud px-4 py-5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">{label}</span>
                  <div className="rounded-2xl bg-white p-2 text-sapphire">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-5 text-3xl font-semibold text-ink">{value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          <DashboardCard
            eyebrow="Onboarding"
            title="Tenant readiness"
            description="Track which organizations have completed profile, subscription, primary facility, and role setup."
          >
            <div className="space-y-3 text-sm text-slate-600">
              <div className="rounded-2xl bg-skywash/20 px-4 py-3">Profile complete: 9/12</div>
              <div className="rounded-2xl bg-skywash/20 px-4 py-3">Facility registered: 7/12</div>
              <div className="rounded-2xl bg-skywash/20 px-4 py-3">Admin verified: 5/12</div>
            </div>
          </DashboardCard>
          <DashboardCard
            eyebrow="Facility mix"
            title="Branch and vendor model"
            description="Supports enterprise groups and small operators without changing the core tenant model."
          >
            <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
              <div className="rounded-2xl bg-cloud px-4 py-3">Hospitals: 8</div>
              <div className="rounded-2xl bg-cloud px-4 py-3">Clinics: 11</div>
              <div className="rounded-2xl bg-cloud px-4 py-3">Pharmacies: 9</div>
              <div className="rounded-2xl bg-cloud px-4 py-3">Ambulance: 10</div>
            </div>
          </DashboardCard>
          <DashboardCard
            eyebrow="Compliance"
            title="Audit log watch"
            description="The first production release should expose all privileged tenant and facility operations here."
          >
            <div className="space-y-3 text-sm text-slate-600">
              <div className="rounded-2xl border border-sapphire/10 px-4 py-3">
                `tenant.created` by `super_admin`
              </div>
              <div className="rounded-2xl border border-sapphire/10 px-4 py-3">
                `facility.created` by `tenant_admin`
              </div>
              <div className="rounded-2xl border border-sapphire/10 px-4 py-3">
                `user.role_assigned` by `tenant_admin`
              </div>
            </div>
          </DashboardCard>
        </section>
      </div>
    </main>
  );
}

