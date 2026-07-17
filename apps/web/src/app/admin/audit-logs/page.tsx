"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, Building2, CalendarDays, Filter, ShieldCheck } from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { apiRequest } from "@/lib/api";

type Tenant = {
  id: string;
  display_name: string;
  category: string;
};

type Facility = {
  id: string;
  tenant_id: string;
  name: string;
  type: string;
  city: string | null;
};

type AuditLogEntry = {
  id: string;
  tenant_id: string | null;
  facility_id: string | null;
  actor_user_id: string | null;
  event_type: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  tenant_name: string | null;
  facility_name: string | null;
  actor_name: string | null;
  actor_email: string | null;
};

const eventTypeOptions = [
  "tenant.created",
  "facility.created",
  "user.role_assigned",
  "appointment_slot.created",
  "appointment.created",
  "appointment.status_updated",
  "consultation.updated",
] as const;

export default function AdminAuditLogsPage() {
  const { session } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    tenantId: "",
    facilityId: "",
    eventType: "",
    from: "",
    to: "",
  });

  useEffect(() => {
    if (!session?.access_token) {
      return;
    }

    const headers = {
      Authorization: `Bearer ${session.access_token}`,
    };

    Promise.all([
      apiRequest<Tenant[]>("/tenants/mine", { headers }),
      apiRequest<Facility[]>("/facilities/mine", { headers }),
    ])
      .then(([tenantData, facilityData]) => {
        setTenants(tenantData);
        setFacilities(facilityData);

        if (tenantData[0]) {
          setFilters((current) => ({ ...current, tenantId: tenantData[0].id }));
        }
      })
      .catch((error) =>
        setMessage(error instanceof Error ? error.message : "Could not load audit filter data."),
      );
  }, [session?.access_token]);

  const visibleFacilities = useMemo(
    () => facilities.filter((facility) => facility.tenant_id === filters.tenantId),
    [facilities, filters.tenantId],
  );

  useEffect(() => {
    if (!filters.tenantId || !session?.access_token) {
      return;
    }

    if (
      filters.facilityId &&
      !visibleFacilities.some((facility) => facility.id === filters.facilityId)
    ) {
      setFilters((current) => ({ ...current, facilityId: "" }));
      return;
    }

    const params = new URLSearchParams();
    params.set("tenantId", filters.tenantId);
    params.set("limit", "80");

    if (filters.facilityId) {
      params.set("facilityId", filters.facilityId);
    }

    if (filters.eventType) {
      params.set("eventType", filters.eventType);
    }

    if (filters.from) {
      params.set("from", `${filters.from}T00:00:00.000Z`);
    }

    if (filters.to) {
      params.set("to", `${filters.to}T23:59:59.999Z`);
    }

    setLoading(true);
    setMessage(null);

    apiRequest<AuditLogEntry[]>(`/audit-logs?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    })
      .then(setLogs)
      .catch((error) =>
        setMessage(error instanceof Error ? error.message : "Could not load audit logs."),
      )
      .finally(() => setLoading(false));
  }, [
    filters.eventType,
    filters.facilityId,
    filters.from,
    filters.tenantId,
    filters.to,
    session?.access_token,
    visibleFacilities,
  ]);

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-[32px] border border-sapphire/10 bg-white p-5 shadow-card sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-skywash/20 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-sapphire">
                <ShieldCheck className="h-4 w-4" />
                Compliance
              </div>
              <h1 className="mt-4 text-3xl font-semibold text-ink sm:text-4xl">
                Audit log visibility
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
                Review privileged tenant and facility actions across setup, access control,
                scheduling, and care operations. This is the Phase 1 operational visibility layer.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <StatTile label="Loaded events" value={loading ? "..." : String(logs.length)} icon={Activity} />
              <StatTile label="Actors seen" value={String(new Set(logs.map((log) => log.actor_user_id).filter(Boolean)).size)} icon={Building2} />
              <StatTile label="Facilities in scope" value={String(visibleFacilities.length)} icon={CalendarDays} />
            </div>
          </div>

          <div className="mt-6 grid gap-4 rounded-[28px] bg-cloud p-4 sm:grid-cols-2 xl:grid-cols-5">
            <label className="text-sm font-medium text-heading">
              Tenant
              <select
                value={filters.tenantId}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    tenantId: event.target.value,
                    facilityId: "",
                  }))
                }
                className="mt-2 w-full rounded-[14px] border border-border bg-white/80 px-4 py-3 text-sm text-heading outline-none focus:border-brand"
              >
                {tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.display_name} ({tenant.category})
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium text-heading">
              Facility
              <select
                value={filters.facilityId}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, facilityId: event.target.value }))
                }
                className="mt-2 w-full rounded-[14px] border border-border bg-white/80 px-4 py-3 text-sm text-heading outline-none focus:border-brand"
              >
                <option value="">All facilities</option>
                {visibleFacilities.map((facility) => (
                  <option key={facility.id} value={facility.id}>
                    {facility.name} ({facility.type})
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium text-heading">
              Event type
              <select
                value={filters.eventType}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, eventType: event.target.value }))
                }
                className="mt-2 w-full rounded-[14px] border border-border bg-white/80 px-4 py-3 text-sm text-heading outline-none focus:border-brand"
              >
                <option value="">All event types</option>
                {eventTypeOptions.map((eventType) => (
                  <option key={eventType} value={eventType}>
                    {eventType}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium text-heading">
              From
              <input
                type="date"
                value={filters.from}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, from: event.target.value }))
                }
                className="mt-2 w-full rounded-[14px] border border-border bg-white/80 px-4 py-3 text-sm text-heading outline-none focus:border-brand"
              />
            </label>

            <label className="text-sm font-medium text-heading">
              To
              <input
                type="date"
                value={filters.to}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, to: event.target.value }))
                }
                className="mt-2 w-full rounded-[14px] border border-border bg-white/80 px-4 py-3 text-sm text-heading outline-none focus:border-brand"
              />
            </label>
          </div>
        </section>

        {message ? (
          <div className="mt-4 rounded-2xl bg-skywash/30 px-4 py-3 text-sm text-heading">
            {message}
          </div>
        ) : null}

        <section className="mt-6 rounded-[32px] border border-sapphire/10 bg-white p-5 shadow-card sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand/10 text-brand">
              <Filter className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-brand">Event stream</p>
              <h2 className="text-xl font-semibold text-heading">Recent tenant activity</h2>
            </div>
          </div>

          <div className="mt-5 grid gap-4">
            {loading ? (
              <div className="rounded-2xl bg-skywash/25 px-4 py-4 text-sm text-body">
                Loading audit events...
              </div>
            ) : null}

            {!loading && logs.length === 0 ? (
              <div className="rounded-2xl bg-skywash/25 px-4 py-4 text-sm text-body">
                No audit events match the current filters.
              </div>
            ) : null}

            {logs.map((log) => (
              <article key={log.id} className="rounded-[24px] border border-border bg-cloud/50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
                      {log.event_type}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-heading">
                      {formatActor(log)} ran {log.entity_type.replaceAll("_", " ")}
                    </h3>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-heading ring-1 ring-sapphire/10">
                    {formatDateTime(log.created_at)}
                  </span>
                </div>

                <div className="mt-4 grid gap-2 text-sm text-body sm:grid-cols-2 xl:grid-cols-4">
                  <div>Tenant: {log.tenant_name || shortenId(log.tenant_id)}</div>
                  <div>Facility: {log.facility_name || shortenId(log.facility_id) || "Tenant-wide"}</div>
                  <div>Actor email: {log.actor_email || readString(log.metadata.actorEmail) || "Not captured"}</div>
                  <div>Entity ID: {shortenId(log.entity_id) || "Not set"}</div>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  {buildMetadataRows(log.metadata).map(([label, value]) => (
                    <div key={`${log.id}-${label}`} className="rounded-2xl bg-white/80 px-4 py-3 text-sm text-body">
                      <span className="font-semibold text-heading">{label}:</span> {value}
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function StatTile({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-[24px] border border-sapphire/10 bg-cloud px-4 py-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-600">{label}</span>
        <div className="rounded-2xl bg-white p-2 text-sapphire">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-4 text-2xl font-semibold text-ink">{value}</p>
    </div>
  );
}

function formatActor(log: AuditLogEntry) {
  return (
    log.actor_name ||
    log.actor_email ||
    readString(log.metadata.actorName) ||
    readString(log.metadata.actorEmail) ||
    shortenId(log.actor_user_id) ||
    "Unknown actor"
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function shortenId(value: string | null) {
  if (!value) {
    return null;
  }

  if (value.length <= 10) {
    return value;
  }

  return `${value.slice(0, 8)}...`;
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function buildMetadataRows(metadata: Record<string, unknown>) {
  const hiddenKeys = new Set(["actorEmail", "actorName"]);

  return Object.entries(metadata)
    .filter(([key]) => !hiddenKeys.has(key))
    .slice(0, 6)
    .map(([key, value]) => [formatMetadataKey(key), formatMetadataValue(value)] as const);
}

function formatMetadataKey(key: string) {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatMetadataValue(value: unknown) {
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (typeof value === "string") {
    return value;
  }

  if (value === null || value === undefined) {
    return "Not set";
  }

  return JSON.stringify(value);
}
