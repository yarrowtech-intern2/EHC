"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ComponentType } from "react";
import {
  Activity,
  AlertCircle,
  Ambulance,
  ArrowRight,
  Building2,
  CalendarCheck,
  ClipboardList,
  Droplets,
  MapPinned,
  Pill,
  ShieldCheck,
  Stethoscope,
  UserPlus,
  Users,
} from "lucide-react";

import {
  DashboardHero,
  DashboardPanel,
  DashboardStatCard,
} from "@/components/dashboard-shell";
import { useAuth } from "@/components/providers/auth-provider";
import { UIButton } from "@/components/ui-button";
import { apiRequest } from "@/lib/api";
import type { AppActorType, FacilityType, SessionRole } from "@/lib/supabase-browser";

type Tenant = {
  id: string;
  display_name: string | null;
  category: string | null;
};

type Facility = {
  id: string;
  tenant_id: string;
  name: string;
  type: FacilityType;
  city: string | null;
};

type Member = {
  id: string;
  user_id: string;
  tenant_id: string | null;
  facility_id: string | null;
  role: AppActorType;
  full_name: string | null;
  email: string | null;
  phone: string | null;
};

type AuditLogEntry = {
  id: string;
  tenant_id: string | null;
  facility_id: string | null;
  actor_user_id: string | null;
  event_type: string;
  entity_type: string;
  created_at: string;
  actor_name: string | null;
  actor_email: string | null;
  tenant_name: string | null;
  facility_name: string | null;
  metadata: Record<string, unknown>;
};

type DashboardData = {
  tenants: Tenant[];
  facilities: Facility[];
  members: Member[];
  auditLogs: AuditLogEntry[];
};

type DashboardProfile = {
  eyebrow: string;
  title: string;
  description: string;
  readinessTitle: string;
  readinessDescription: string;
  facilityPanelTitle: string;
  facilityPanelDescription: string;
  deliveryTitle: string;
  deliveryDescription: string;
  facilityTypes?: FacilityType[];
  serviceRole?: AppActorType;
  serviceNoun: string;
  icon: ComponentType<{ className?: string }>;
  actions: Array<{ label: string; href: string; icon: ComponentType<{ className?: string }> }>;
};

const emptyDashboardData: DashboardData = {
  tenants: [],
  facilities: [],
  members: [],
  auditLogs: [],
};

const roleProfiles: Record<string, DashboardProfile> = {
  default: {
    eyebrow: "Facility operations",
    title: "Facility dashboard",
    description: "Review live setup, staffing, and audit activity for your assigned facility scope.",
    readinessTitle: "Facility readiness",
    readinessDescription: "Calculated from facilities, staff roles, and audit activity in your scope.",
    facilityPanelTitle: "Facility mix",
    facilityPanelDescription: "Grouped from facilities available to your signed-in role.",
    deliveryTitle: "Care delivery readiness",
    deliveryDescription: "Derived from real role assignments and scoped facilities.",
    serviceNoun: "facilities",
    icon: Building2,
    actions: [
      { label: "Team", href: "/admin/team", icon: UserPlus },
      { label: "Audit logs", href: "/admin/audit-logs", icon: Activity },
    ],
  },
  super_admin: {
    eyebrow: "Super admin",
    title: "Platform operations",
    description: "Monitor tenant setup, facilities, roles, and audit visibility from live platform data.",
    readinessTitle: "Platform readiness",
    readinessDescription: "Calculated from tenants, registered facilities, and mapped tenant admin roles.",
    facilityPanelTitle: "Facility mix",
    facilityPanelDescription: "Grouped from all facilities visible to your platform role.",
    deliveryTitle: "Care delivery readiness",
    deliveryDescription: "Derived from doctor assignments and facilities visible to the platform role.",
    serviceNoun: "facilities",
    icon: ShieldCheck,
    actions: [
      { label: "Create tenant", href: "/admin/tenant-setup", icon: Building2 },
      { label: "Assign staff", href: "/admin/team", icon: UserPlus },
      { label: "Audit logs", href: "/admin/audit-logs", icon: Activity },
    ],
  },
  tenant_admin: {
    eyebrow: "Tenant admin",
    title: "Tenant operations",
    description: "Monitor tenant readiness, facility onboarding, access control, scheduling, and audit visibility from live data.",
    readinessTitle: "Tenant readiness",
    readinessDescription: "Calculated from tenants, registered facilities, and mapped tenant admin roles.",
    facilityPanelTitle: "Branch and vendor model",
    facilityPanelDescription: "Grouped from facilities attached to the tenant.",
    deliveryTitle: "Care delivery readiness",
    deliveryDescription: "Derived from doctor role assignments and facilities currently visible to the admin.",
    serviceNoun: "facilities",
    icon: Building2,
    actions: [
      { label: "Create tenant", href: "/admin/tenant-setup", icon: Building2 },
      { label: "Assign staff", href: "/admin/team", icon: UserPlus },
      { label: "Create slots", href: "/admin/slots", icon: CalendarCheck },
      { label: "Appointments", href: "/admin/appointments", icon: ClipboardList },
    ],
  },
  facility_operator: {
    eyebrow: "Facility operator",
    title: "Facility operations",
    description: "Review assigned facilities, staff coverage, appointments, and audit activity.",
    readinessTitle: "Facility readiness",
    readinessDescription: "Calculated from assigned facilities, staff roles, and recent audit events.",
    facilityPanelTitle: "Assigned facility mix",
    facilityPanelDescription: "Grouped from facilities assigned to your tenant scope.",
    deliveryTitle: "Care delivery readiness",
    deliveryDescription: "Derived from doctor assignments and appointment-ready facilities.",
    serviceNoun: "facilities",
    icon: MapPinned,
    actions: [
      { label: "Create slots", href: "/admin/slots", icon: CalendarCheck },
      { label: "Appointments", href: "/admin/appointments", icon: ClipboardList },
      { label: "Audit logs", href: "/admin/audit-logs", icon: Activity },
    ],
  },
  pharmacy_admin: {
    eyebrow: "Pharmacy",
    title: "Pharmacy operations",
    description: "Review pharmacy facilities, pharmacy staff access, and pharmacy-scoped audit activity.",
    readinessTitle: "Pharmacy readiness",
    readinessDescription: "Calculated from pharmacy facilities and pharmacy admin role assignments.",
    facilityPanelTitle: "Pharmacy locations",
    facilityPanelDescription: "Only pharmacy facilities are included here.",
    deliveryTitle: "Pharmacy setup status",
    deliveryDescription: "Uses Phase 1 facility, role, and audit data. Order and catalog tables are not present yet.",
    facilityTypes: ["pharmacy"],
    serviceRole: "pharmacy_admin",
    serviceNoun: "pharmacy facilities",
    icon: Pill,
    actions: [
      { label: "Assign pharmacy staff", href: "/admin/team", icon: UserPlus },
      { label: "Audit logs", href: "/admin/audit-logs", icon: Activity },
    ],
  },
  ambulance_admin: {
    eyebrow: "Ambulance service",
    title: "Ambulance operations",
    description: "Review ambulance units, ambulance service admins, and emergency-service audit activity.",
    readinessTitle: "Ambulance readiness",
    readinessDescription: "Calculated from ambulance unit facilities and ambulance admin role assignments.",
    facilityPanelTitle: "Ambulance units",
    facilityPanelDescription: "Only ambulance unit facilities are included here.",
    deliveryTitle: "Emergency service setup",
    deliveryDescription: "Uses Phase 1 facility, role, and audit data. Trip dispatch tables are not present yet.",
    facilityTypes: ["ambulance_unit"],
    serviceRole: "ambulance_admin",
    serviceNoun: "ambulance units",
    icon: Ambulance,
    actions: [
      { label: "Assign ambulance staff", href: "/admin/team", icon: UserPlus },
      { label: "Audit logs", href: "/admin/audit-logs", icon: Activity },
    ],
  },
  blood_bank_admin: {
    eyebrow: "Blood bank service",
    title: "Blood bank operations",
    description: "Review blood-bank admin access, linked tenant/facility setup, and audit activity.",
    readinessTitle: "Blood bank readiness",
    readinessDescription: "Calculated from blood-bank admin roles and linked facilities. Blood inventory tables are not present yet.",
    facilityPanelTitle: "Linked facilities",
    facilityPanelDescription: "The current Phase 1 schema has no blood-bank facility type, so only explicitly linked facilities can appear here.",
    deliveryTitle: "Blood bank setup status",
    deliveryDescription: "Uses Phase 1 role, facility, and audit data. Donor and inventory modules are planned later.",
    serviceRole: "blood_bank_admin",
    serviceNoun: "linked facilities",
    icon: Droplets,
    actions: [
      { label: "Assign blood bank staff", href: "/admin/team", icon: UserPlus },
      { label: "Audit logs", href: "/admin/audit-logs", icon: Activity },
    ],
  },
};

export default function AdminPage() {
  const { actorType, session, sessionContext } = useAuth();
  const [data, setData] = useState<DashboardData>(emptyDashboardData);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.access_token) {
      return;
    }

    let cancelled = false;
    const headers = {
      Authorization: `Bearer ${session.access_token}`,
    };

    async function loadDashboard() {
      setLoading(true);
      setMessage(null);

      try {
        const [tenants, facilities] = await Promise.all([
          apiRequest<Tenant[]>("/tenants/mine", { headers }),
          apiRequest<Facility[]>("/facilities/mine", { headers }),
        ]);

        const memberGroups = await Promise.all(
          tenants.map((tenant) =>
            apiRequest<Member[]>(`/users/members?tenantId=${encodeURIComponent(tenant.id)}`, {
              headers,
            }).catch(() => [] as Member[]),
          ),
        );

        const auditGroups = await Promise.all(
          tenants.map((tenant) =>
            apiRequest<AuditLogEntry[]>(
              `/audit-logs?tenantId=${encodeURIComponent(tenant.id)}&limit=30`,
              { headers },
            ).catch(() => [] as AuditLogEntry[]),
          ),
        );

        if (cancelled) {
          return;
        }

        setData({
          tenants,
          facilities,
          members: dedupeMembers(memberGroups.flat()),
          auditLogs: dedupeAuditLogs(auditGroups.flat()),
        });
      } catch (error) {
        if (!cancelled) {
          setData(emptyDashboardData);
          setMessage(error instanceof Error ? error.message : "Could not load dashboard data.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [session?.access_token]);

  const role = actorType ?? "facility_operator";
  const profile = getDashboardProfile(role);
  const currentRoleRecords = useMemo(
    () => getCurrentRoleRecords(sessionContext?.roles ?? [], role),
    [role, sessionContext?.roles],
  );
  const visibleFacilities = useMemo(
    () => filterFacilitiesForRole(data.facilities, currentRoleRecords, profile),
    [currentRoleRecords, data.facilities, profile],
  );
  const visibleFacilityIds = useMemo(
    () => new Set(visibleFacilities.map((facility) => facility.id)),
    [visibleFacilities],
  );
  const scopedMembers = useMemo(
    () => filterMembersForRole(data.members, currentRoleRecords, visibleFacilityIds, role, profile),
    [currentRoleRecords, data.members, profile, role, visibleFacilityIds],
  );
  const scopedAuditLogs = useMemo(
    () => filterAuditLogsForRole(data.auditLogs, currentRoleRecords, visibleFacilityIds, profile),
    [currentRoleRecords, data.auditLogs, profile, visibleFacilityIds],
  );
  const serviceRoleCount = profile.serviceRole
    ? scopedMembers.filter((member) => member.role === profile.serviceRole).length
    : scopedMembers.length;
  const doctorCount = scopedMembers.filter((member) => member.role === "doctor").length;
  const readiness = useMemo(
    () => buildReadiness(profile, data.tenants, visibleFacilities, scopedMembers, scopedAuditLogs),
    [data.tenants, profile, scopedAuditLogs, scopedMembers, visibleFacilities],
  );
  const facilityMix = useMemo(() => buildFacilityMix(visibleFacilities), [visibleFacilities]);
  const recentAuditLogs = scopedAuditLogs.slice(0, 4);
  const ProfileIcon = profile.icon;

  return (
    <div className="space-y-5">
      <DashboardHero
        eyebrow={loading ? "Loading live data" : profile.eyebrow}
        title={profile.title}
        description={profile.description}
        actions={
          <>
            {profile.actions.slice(0, 2).map((action) => (
              <Link key={action.href} href={action.href}>
                <UIButton variant={action.href === "/admin/audit-logs" ? "secondary" : "primary"}>
                  {action.label}
                </UIButton>
              </Link>
            ))}
          </>
        }
      >
        {message ? (
          <div className="mb-4 flex items-center gap-2 rounded-2xl bg-[#f8f7f4] px-4 py-3 text-sm text-slate-700">
            <AlertCircle className="h-4 w-4 text-[#0057FF]" />
            {message}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardStatCard
            icon={profile.icon}
            label={titleCase(profile.serviceNoun)}
            value={loading ? "..." : formatNumber(visibleFacilities.length)}
            tone="blue"
          />
          <DashboardStatCard
            icon={Users}
            label={profile.serviceRole ? roleLabel(profile.serviceRole) : "Scoped staff"}
            value={loading ? "..." : formatNumber(serviceRoleCount)}
            tone="green"
          />
          <DashboardStatCard
            icon={Building2}
            label="Tenant scope"
            value={loading ? "..." : formatNumber(data.tenants.length)}
            tone="green"
          />
          <DashboardStatCard
            icon={Activity}
            label="Audit events"
            value={loading ? "..." : formatNumber(scopedAuditLogs.length)}
            tone="slate"
          />
        </div>
      </DashboardHero>

      <section className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr_0.92fr]">
        <DashboardPanel
          eyebrow="Readiness"
          title={profile.readinessTitle}
          description={profile.readinessDescription}
        >
          <div className="space-y-4">
            {readiness.map((item) => (
              <div key={item.label} className="rounded-2xl bg-[#dedede] px-4 py-3">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-slate-700">{item.label}</span>
                  <span className="font-semibold text-ink">
                    {item.count}/{item.total}
                  </span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-white">
                  <div
                    className="h-2 rounded-full bg-[#0057FF]"
                    style={{ width: percentageWidth(item.count, item.total) }}
                  />
                </div>
              </div>
            ))}
          </div>
        </DashboardPanel>

        <DashboardPanel
          eyebrow="Operations"
          title="Role-specific actions"
          description="Only actions relevant to this authenticated role are shown here."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {profile.actions.map(({ href, icon: Icon, label }) => (
              <Link
                key={`${href}-${label}`}
                href={href}
                className="group flex items-center justify-between rounded-2xl bg-[#dedede] px-4 py-4 text-sm font-semibold text-ink transition hover:bg-white"
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#0057FF]">
                    <Icon className="h-4 w-4" />
                  </span>
                  {label}
                </span>
                <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-ink" />
              </Link>
            ))}
          </div>
        </DashboardPanel>

        <DashboardPanel
          eyebrow="Compliance"
          title="Audit log watch"
          description="Latest events scoped to this role's tenants and facilities."
        >
          <div className="space-y-3 text-sm text-slate-600">
            {recentAuditLogs.length === 0 ? (
              <div className="rounded-2xl bg-[#dedede] px-4 py-4">
                No audit events found for this role scope.
              </div>
            ) : null}

            {recentAuditLogs.map((log) => (
              <div key={log.id} className="rounded-2xl border border-slate-200/70 bg-[#dedede] px-4 py-3">
                <p className="font-semibold text-ink">{log.event_type}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {formatActor(log)} - {formatDate(log.created_at)}
                </p>
              </div>
            ))}

            <Link href="/admin/audit-logs" className="inline-flex items-center gap-2 text-sm font-semibold text-sapphire">
              Open audit stream
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </DashboardPanel>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <DashboardPanel
          eyebrow="Facilities"
          title={profile.facilityPanelTitle}
          description={profile.facilityPanelDescription}
        >
          {facilityMix.length === 0 ? (
            <div className="rounded-2xl bg-[#dedede] px-4 py-4 text-sm text-slate-600">
              No matching facilities are available for this role yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
              {facilityMix.map((item) => (
                <div key={item.type} className="rounded-2xl bg-[#dedede] px-4 py-4">
                  <p className="font-semibold text-ink">{item.type}</p>
                  <p className="mt-1">{item.count}</p>
                </div>
              ))}
            </div>
          )}
        </DashboardPanel>

        <DashboardPanel
          eyebrow="Module status"
          title={profile.deliveryTitle}
          description={profile.deliveryDescription}
        >
          <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
            <div className="rounded-2xl bg-[#dedede] px-4 py-4">
              <ProfileIcon className="mb-3 h-5 w-5 text-[#0057FF]" />
              <p className="font-semibold text-ink">{formatNumber(visibleFacilities.length)}</p>
              <p className="mt-1">{titleCase(profile.serviceNoun)}</p>
            </div>
            <div className="rounded-2xl bg-[#dedede] px-4 py-4">
              <Users className="mb-3 h-5 w-5 text-[#0057FF]" />
              <p className="font-semibold text-ink">{formatNumber(scopedMembers.length)}</p>
              <p className="mt-1">Scoped role assignments</p>
            </div>
            <div className="rounded-2xl bg-[#dedede] px-4 py-4">
              <Stethoscope className="mb-3 h-5 w-5 text-[#0057FF]" />
              <p className="font-semibold text-ink">{formatNumber(doctorCount)}</p>
              <p className="mt-1">Doctors mapped</p>
            </div>
          </div>
        </DashboardPanel>
      </section>
    </div>
  );
}

function getDashboardProfile(role: AppActorType): DashboardProfile {
  return roleProfiles[role] ?? roleProfiles.default;
}

function getCurrentRoleRecords(roles: SessionRole[], role: AppActorType) {
  const matching = roles.filter((item) => item.role === role);
  return matching.length > 0 ? matching : roles;
}

function filterFacilitiesForRole(
  facilities: Facility[],
  roleRecords: SessionRole[],
  profile: DashboardProfile,
) {
  const assignedFacilityIds = new Set(roleRecords.map((item) => item.facility_id).filter(Boolean));
  const assignedTenantIds = new Set(roleRecords.map((item) => item.tenant_id).filter(Boolean));
  const facilityTypes = profile.facilityTypes ? new Set(profile.facilityTypes) : null;

  return facilities.filter((facility) => {
    if (assignedFacilityIds.size > 0 && !assignedFacilityIds.has(facility.id)) {
      return false;
    }

    if (assignedTenantIds.size > 0 && !assignedTenantIds.has(facility.tenant_id)) {
      return false;
    }

    if (facilityTypes && !facilityTypes.has(facility.type)) {
      return false;
    }

    if (!facilityTypes && profile.serviceRole === "blood_bank_admin" && assignedFacilityIds.size === 0) {
      return false;
    }

    return true;
  });
}

function filterMembersForRole(
  members: Member[],
  roleRecords: SessionRole[],
  visibleFacilityIds: Set<string>,
  role: AppActorType,
  profile: DashboardProfile,
) {
  const tenantIds = new Set(roleRecords.map((item) => item.tenant_id).filter(Boolean));

  return members.filter((member) => {
    if (tenantIds.size > 0 && member.tenant_id && !tenantIds.has(member.tenant_id)) {
      return false;
    }

    if (profile.serviceRole) {
      return (
        member.role === profile.serviceRole ||
        Boolean(member.facility_id && visibleFacilityIds.has(member.facility_id))
      );
    }

    if (role === "facility_operator" && visibleFacilityIds.size > 0) {
      return Boolean(member.facility_id && visibleFacilityIds.has(member.facility_id));
    }

    return true;
  });
}

function filterAuditLogsForRole(
  logs: AuditLogEntry[],
  roleRecords: SessionRole[],
  visibleFacilityIds: Set<string>,
  profile: DashboardProfile,
) {
  const tenantIds = new Set(roleRecords.map((item) => item.tenant_id).filter(Boolean));

  return logs.filter((log) => {
    if (tenantIds.size > 0 && log.tenant_id && !tenantIds.has(log.tenant_id)) {
      return false;
    }

    if (profile.facilityTypes || visibleFacilityIds.size > 0) {
      return Boolean(log.facility_id && visibleFacilityIds.has(log.facility_id));
    }

    return true;
  });
}

function buildReadiness(
  profile: DashboardProfile,
  tenants: Tenant[],
  facilities: Facility[],
  members: Member[],
  auditLogs: AuditLogEntry[],
) {
  const total = Math.max(tenants.length, 1);
  const tenantIdsWithFacilities = new Set(facilities.map((facility) => facility.tenant_id));
  const tenantIdsWithServiceAdmins = new Set(
    members
      .filter((member) => (profile.serviceRole ? member.role === profile.serviceRole : member.role === "tenant_admin"))
      .map((member) => member.tenant_id)
      .filter(Boolean),
  );
  const tenantIdsWithAudit = new Set(auditLogs.map((log) => log.tenant_id).filter(Boolean));

  return [
    {
      label: `${titleCase(profile.serviceNoun)} registered`,
      count: tenants.filter((tenant) => tenantIdsWithFacilities.has(tenant.id)).length,
      total,
    },
    {
      label: `${profile.serviceRole ? roleLabel(profile.serviceRole) : "Tenant admin"} mapped`,
      count: tenants.filter((tenant) => tenantIdsWithServiceAdmins.has(tenant.id)).length,
      total,
    },
    {
      label: "Audit activity available",
      count: tenants.filter((tenant) => tenantIdsWithAudit.has(tenant.id)).length,
      total,
    },
  ];
}

function dedupeMembers(members: Member[]) {
  const seen = new Set<string>();

  return members.filter((member) => {
    const key = `${member.user_id}-${member.role}-${member.tenant_id ?? ""}-${member.facility_id ?? ""}`;
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function dedupeAuditLogs(logs: AuditLogEntry[]) {
  const seen = new Set<string>();

  return logs
    .filter((log) => {
      if (seen.has(log.id)) {
        return false;
      }

      seen.add(log.id);
      return true;
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

function buildFacilityMix(facilities: Facility[]) {
  const counts = new Map<string, number>();

  facilities.forEach((facility) => {
    const label = titleCase(facility.type.replaceAll("_", " "));
    counts.set(label, (counts.get(label) ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count || a.type.localeCompare(b.type));
}

function percentageWidth(count: number, total: number) {
  if (total <= 0) {
    return "0%";
  }

  return `${Math.round((count / total) * 100)}%`;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value);
}

function titleCase(value: string) {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

function roleLabel(role: AppActorType) {
  return titleCase(role.replaceAll("_", " "));
}

function formatActor(log: AuditLogEntry) {
  return (
    log.actor_name ||
    log.actor_email ||
    readString(log.metadata.actorName) ||
    readString(log.metadata.actorEmail) ||
    "Unknown actor"
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}
