"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ComponentType, type ReactNode } from "react";
import {
  Activity,
  AlertCircle,
  Ambulance,
  ArrowRight,
  Bell,
  Building2,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { DashboardPanel } from "@/components/dashboard-shell";
import { useAuth } from "@/components/providers/auth-provider";
import { apiRequest } from "@/lib/api";

type MetricKey =
  | "tenants"
  | "facilities"
  | "staff"
  | "auditEvents"
  | "appointments"
  | "pendingApprovals"
  | "activeAmbulanceRequests"
  | "availableAmbulances";

type ChartDatum = {
  label: string;
  value: number;
};

type DashboardNotification = {
  id: string;
  tone: "warning" | "critical" | "info";
  title: string;
  description: string;
  href: string;
};

type ApprovalItem = {
  id: string;
  title: string;
  subtitle: string;
  vehicleNumber: string;
  createdAt: string;
  href: string;
};

type RecentAuditLog = {
  id: string;
  eventType: string;
  entityType: string;
  createdAt: string;
};

type AnalyticsOverview = {
  scope: {
    global: boolean;
    tenantIds: string[];
    facilityIds: string[];
  };
  metrics: Record<MetricKey, number>;
  charts: {
    facilityMix: ChartDatum[];
    roleDistribution: ChartDatum[];
    appointmentStatuses: ChartDatum[];
    emergencyRequestStatuses: ChartDatum[];
    auditEventsByDay: ChartDatum[];
    ambulanceUnitStatuses: ChartDatum[];
  };
  notifications: DashboardNotification[];
  approvals: ApprovalItem[];
  recentAuditLogs: RecentAuditLog[];
};

const emptyOverview: AnalyticsOverview = {
  scope: {
    global: false,
    tenantIds: [],
    facilityIds: [],
  },
  metrics: {
    tenants: 0,
    facilities: 0,
    staff: 0,
    auditEvents: 0,
    appointments: 0,
    pendingApprovals: 0,
    activeAmbulanceRequests: 0,
    availableAmbulances: 0,
  },
  charts: {
    facilityMix: [],
    roleDistribution: [],
    appointmentStatuses: [],
    emergencyRequestStatuses: [],
    auditEventsByDay: [],
    ambulanceUnitStatuses: [],
  },
  notifications: [],
  approvals: [],
  recentAuditLogs: [],
};

const palette = ["#0057FF", "#16A34A", "#EF4444", "#D9B100", "#7C3AED", "#0891B2", "#F97316"];

const metricCards: Array<{
  key: MetricKey;
  label: string;
  icon: ComponentType<{ className?: string }>;
  tone: "blue" | "green" | "sand" | "slate";
}> = [
  { key: "tenants", label: "Tenants", icon: Building2, tone: "blue" },
  { key: "facilities", label: "Facilities", icon: ShieldCheck, tone: "green" },
  { key: "staff", label: "Staff roles", icon: Users, tone: "green" },
  { key: "pendingApprovals", label: "Pending approvals", icon: Bell, tone: "sand" },
  { key: "activeAmbulanceRequests", label: "Active emergencies", icon: Ambulance, tone: "blue" },
  { key: "availableAmbulances", label: "Available ambulances", icon: CheckCircle2, tone: "green" },
  { key: "appointments", label: "Appointments", icon: CalendarCheck, tone: "slate" },
  { key: "auditEvents", label: "Audit events", icon: Activity, tone: "slate" },
];

export default function AdminPage() {
  const { session } = useAuth();
  const [overview, setOverview] = useState<AnalyticsOverview>(emptyOverview);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.access_token) {
      return;
    }

    let cancelled = false;

    async function loadOverview() {
      setLoading(true);
      setMessage(null);

      try {
        const data = await apiRequest<AnalyticsOverview>("/admin/analytics/overview", {
          headers: {
            Authorization: `Bearer ${session!.access_token}`,
          },
        });

        if (!cancelled) {
          setOverview(data);
        }
      } catch (error) {
        if (!cancelled) {
          setOverview(emptyOverview);
          setMessage(error instanceof Error ? error.message : "Could not load analytics dashboard.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadOverview();

    return () => {
      cancelled = true;
    };
  }, [session?.access_token]);

  const scopeLabel = overview.scope.global
    ? "System-wide"
    : overview.scope.facilityIds.length > 0
      ? "Facility scoped"
      : "Tenant scoped";
  const visibleMetricCards = useMemo(
    () =>
      metricCards.filter((card) => {
        if (card.key === "pendingApprovals") {
          return overview.scope.global;
        }

        return true;
      }),
    [overview.scope.global],
  );

  return (
    <div className="space-y-3">
      <section className="rounded-[20px] bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500">{loading ? "Loading analytics" : scopeLabel}</p>
            <h1 className="mt-1 text-2xl font-semibold leading-tight text-ink sm:text-3xl">Dashboard</h1>
            <p className="mt-1 max-w-2xl text-sm leading-5 text-slate-500">
              System analytics, operational health, approvals, and service activity.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <ActionLink href="/admin/ambulance" label="Dispatch" icon={Ambulance} />
            {overview.scope.global ? (
              <ActionLink href="/admin/ambulance-verification" label="Approvals" icon={ShieldCheck} />
            ) : null}
            <ActionLink href="/admin/audit-logs" label="Audit" icon={Activity} />
          </div>
        </div>

        {message ? (
          <div className="mt-3 flex items-center gap-2 rounded-2xl bg-[#fff7ed] px-4 py-3 text-sm text-[#9a3412]">
            <AlertCircle className="h-4 w-4" />
            {message}
          </div>
        ) : null}

        <div className="mt-4 grid gap-2 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-8">
          {visibleMetricCards.map((card) => (
            <CompactStatCard
              key={card.key}
              icon={card.icon}
              label={card.label}
              value={loading ? "..." : formatNumber(overview.metrics[card.key])}
              tone={card.tone}
            />
          ))}
        </div>
      </section>

      {overview.notifications.length > 0 ? (
        <section className="grid gap-3 lg:grid-cols-3">
          {overview.notifications.map((notification) => (
            <Link
              key={notification.id}
              href={notification.href}
              className={`group flex min-h-[84px] items-start justify-between gap-4 rounded-[18px] px-4 py-3 shadow-[0_14px_34px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 ${notificationTone(notification.tone)}`}
            >
              <span>
                <span className="block text-sm font-semibold">{notification.title}</span>
                <span className="mt-1 block text-xs leading-5 opacity-80">{notification.description}</span>
              </span>
              <ArrowRight className="mt-1 h-4 w-4 shrink-0 transition group-hover:translate-x-1" />
            </Link>
          ))}
        </section>
      ) : null}

      <section className="grid gap-3 xl:grid-cols-[1.05fr_0.95fr]">
        <DashboardPanel eyebrow="Activity" title="Audit events, last 7 days">
          <ChartFrame empty={overview.charts.auditEventsByDay.every((item) => item.value === 0)}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={overview.charts.auditEventsByDay} margin={{ left: -24, right: 12, top: 12, bottom: 0 }}>
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="4 4" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Line type="monotone" dataKey="value" stroke="#0057FF" strokeWidth={3} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartFrame>
        </DashboardPanel>

        <DashboardPanel eyebrow="Facilities" title="Facility mix">
          <ChartFrame empty={overview.charts.facilityMix.length === 0}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overview.charts.facilityMix} margin={{ left: -24, right: 12, top: 12, bottom: 0 }}>
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="4 4" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {overview.charts.facilityMix.map((_, index) => (
                    <Cell key={index} fill={palette[index % palette.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartFrame>
        </DashboardPanel>
      </section>

      <section className="grid gap-3 xl:grid-cols-3">
        <DashboardPanel eyebrow="People" title="Role distribution">
          <ChartFrame empty={overview.charts.roleDistribution.length === 0} compact>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={overview.charts.roleDistribution} dataKey="value" nameKey="label" innerRadius={42} outerRadius={72} paddingAngle={3}>
                  {overview.charts.roleDistribution.map((_, index) => (
                    <Cell key={index} fill={palette[index % palette.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartFrame>
          <Legend data={overview.charts.roleDistribution} />
        </DashboardPanel>

        <DashboardPanel eyebrow="Emergency" title="Request statuses">
          <ChartFrame empty={overview.charts.emergencyRequestStatuses.length === 0} compact>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overview.charts.emergencyRequestStatuses} layout="vertical" margin={{ left: 6, right: 12, top: 4, bottom: 4 }}>
                <XAxis type="number" allowDecimals={false} hide />
                <YAxis type="category" dataKey="label" tickLine={false} axisLine={false} fontSize={11} width={84} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Bar dataKey="value" fill="#EF4444" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartFrame>
        </DashboardPanel>

        <DashboardPanel eyebrow="Fleet" title="Ambulance unit statuses">
          <ChartFrame empty={overview.charts.ambulanceUnitStatuses.length === 0} compact>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={overview.charts.ambulanceUnitStatuses} dataKey="value" nameKey="label" outerRadius={74}>
                  {overview.charts.ambulanceUnitStatuses.map((_, index) => (
                    <Cell key={index} fill={palette[(index + 2) % palette.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartFrame>
          <Legend data={overview.charts.ambulanceUnitStatuses} />
        </DashboardPanel>
      </section>

      <section className="grid gap-3 xl:grid-cols-[0.95fr_1.05fr]">
        <DashboardPanel eyebrow="Approvals" title="Pending driver verification">
          <div className="space-y-3">
            {overview.approvals.length === 0 ? (
              <EmptyLine text="No pending ambulance driver approvals." />
            ) : null}
            {overview.approvals.map((approval) => (
              <Link
                key={approval.id}
                href={approval.href}
                className="group flex items-center justify-between gap-3 rounded-2xl bg-[#dedede] px-4 py-3 text-sm"
              >
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-ink">{approval.title}</span>
                  <span className="mt-1 block truncate text-xs text-slate-500">
                    {approval.subtitle} - {approval.vehicleNumber}
                  </span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-ink" />
              </Link>
            ))}
          </div>
        </DashboardPanel>

        <DashboardPanel eyebrow="Compliance" title="Recent audit events">
          <div className="grid gap-3 sm:grid-cols-2">
            {overview.recentAuditLogs.length === 0 ? (
              <EmptyLine text="No recent audit events available." />
            ) : null}
            {overview.recentAuditLogs.map((log) => (
              <div key={log.id} className="rounded-2xl bg-[#dedede] px-4 py-3 text-sm">
                <p className="font-semibold text-ink">{log.eventType}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {log.entityType} - {formatDate(log.createdAt)}
                </p>
              </div>
            ))}
          </div>
        </DashboardPanel>
      </section>
    </div>
  );
}

function ActionLink({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      href={href}
      className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-ink shadow-[0_12px_28px_rgba(15,23,42,0.08)]"
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

function CompactStatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  tone: "blue" | "green" | "sand" | "slate";
}) {
  const toneClass = {
    blue: "bg-[#0057FF] text-white",
    green: "bg-white text-[#0057FF]",
    sand: "bg-white text-[#0057FF]",
    slate: "bg-white text-slate-600",
  }[tone];

  return (
    <div className="min-h-[86px] rounded-[16px] bg-[#dedede] p-3 transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between gap-2">
        <span className="min-h-[32px] text-xs font-semibold leading-4 text-ink">{label}</span>
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${toneClass}`}>
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
      <p className="mt-2 text-2xl font-semibold leading-none text-ink">{value}</p>
    </div>
  );
}

function ChartFrame({
  children,
  empty,
  compact = false,
}: {
  children: ReactNode;
  empty: boolean;
  compact?: boolean;
}) {
  return (
    <div className={`${compact ? "h-[190px]" : "h-[230px]"} rounded-2xl bg-[#f8f7f4] p-3`}>
      {empty ? (
        <div className="flex h-full items-center justify-center text-sm text-slate-500">
          No chart data yet.
        </div>
      ) : (
        children
      )}
    </div>
  );
}

function Legend({ data }: { data: ChartDatum[] }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {data.slice(0, 6).map((item, index) => (
        <span key={item.label} className="inline-flex items-center gap-2 rounded-full bg-[#f8f7f4] px-3 py-1 text-xs text-slate-600">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: palette[index % palette.length] }} />
          {item.label}: {item.value}
        </span>
      ))}
    </div>
  );
}

function EmptyLine({ text }: { text: string }) {
  return <div className="rounded-2xl bg-[#dedede] px-4 py-4 text-sm text-slate-600">{text}</div>;
}

function notificationTone(tone: DashboardNotification["tone"]) {
  if (tone === "critical") {
    return "bg-[#fee2e2] text-[#7f1d1d]";
  }

  if (tone === "warning") {
    return "bg-[#fff7ed] text-[#9a3412]";
  }

  return "bg-white text-ink";
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
