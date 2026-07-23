"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ComponentType } from "react";
import {
  Ambulance,
  CalendarDays,
  ChevronRight,
  HeartPulse,
  MapPin,
  NotebookText,
  Pill,
  Settings,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { AuthGuard } from "@/components/guards/auth-guard";
import { PatientShell } from "@/components/patient-shell";
import { useAuth } from "@/components/providers/auth-provider";
import { apiRequest } from "@/lib/api";

type PatientTab =
  | "personal"
  | "health"
  | "settings"
  | "appointments"
  | "medicines"
  | "ambulance";

type PatientAppointment = {
  id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  service_type: string;
  reason: string;
  status: string;
  facilities?: {
    name?: string;
    city?: string | null;
    type?: string;
  } | null;
};

const tabs: Array<{
  id: PatientTab;
  label: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  { id: "personal", label: "Personal", icon: UserRound },
  { id: "health", label: "Health", icon: HeartPulse },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "appointments", label: "Appointments", icon: CalendarDays },
  { id: "medicines", label: "Medicines", icon: Pill },
  { id: "ambulance", label: "Ambulance", icon: Ambulance },
];

export default function ProfilePage() {
  return (
    <AuthGuard allowedActors={["patient"]}>
      <PatientShell>
        <ProfileScreen />
      </PatientShell>
    </AuthGuard>
  );
}

function ProfileScreen() {
  const { session, sessionContext, user } = useAuth();
  const [activeTab, setActiveTab] = useState<PatientTab>("personal");
  const [appointments, setAppointments] = useState<PatientAppointment[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.access_token) {
      return;
    }

    apiRequest<PatientAppointment[]>("/appointments/my", {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    })
      .then(setAppointments)
      .catch((error) =>
        setMessage(error instanceof Error ? error.message : "Could not load appointments."),
      );
  }, [session?.access_token]);

  const profile = sessionContext?.profile;
  const displayName =
    profile?.full_name ||
    user?.user_metadata?.fullName ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Patient";
  const initials = getInitials(displayName);

  const profileRows = useMemo(
    () => [
      { label: "Full name", value: displayName },
      { label: "Email", value: profile?.email || user?.email },
      { label: "Phone", value: profile?.phone || user?.phone },
      { label: "Preferred city", value: profile?.preferred_city },
      { label: "Location", value: profile?.location },
    ],
    [displayName, profile, user],
  );

  const healthRows = [
    { label: "Age", value: profile?.age ? String(profile.age) : null },
    { label: "Blood group", value: profile?.blood_group },
    { label: "Emergency contact", value: profile?.emergency_contact_name },
    { label: "Emergency phone", value: profile?.emergency_contact_phone },
  ];

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] bg-white p-5 shadow-[0_18px_44px_rgba(15,23,42,0.07)] sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#0057FF] text-lg font-bold text-white shadow-[0_16px_34px_rgba(0,87,255,0.24)]">
              {initials}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0057FF]">
                Patient profile
              </p>
              <h1 className="mt-1 text-2xl font-semibold text-slate-950 sm:text-3xl">
                {displayName}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Manage your care details, history, orders, and service usage.
              </p>
            </div>
          </div>

          <Link
            href="/profile-completion"
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#0057FF] px-5 text-sm font-semibold text-white transition hover:bg-[#0046CC]"
          >
            Edit profile
          </Link>
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? "bg-[#0057FF] text-white"
                    : "bg-[#f8f7f4] text-slate-600 hover:bg-[#eef1f5] hover:text-slate-950"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </section>

      {activeTab === "personal" ? (
        <ProfileGrid title="Personal details" rows={profileRows} />
      ) : null}

      {activeTab === "health" ? (
        <ProfileGrid title="Health details" rows={healthRows} />
      ) : null}

      {activeTab === "settings" ? <SettingsPanel /> : null}

      {activeTab === "appointments" ? (
        <AppointmentsPanel appointments={appointments} message={message} />
      ) : null}

      {activeTab === "medicines" ? (
        <EmptyHistoryPanel
          icon={Pill}
          title="Medicines ordered"
          description="Medicine ordering is not active yet. Once pharmacy orders are added, your order history and delivery status will appear here."
          actionLabel="Find pharmacies"
          actionHref="/discover"
        />
      ) : null}

      {activeTab === "ambulance" ? (
        <EmptyHistoryPanel
          icon={Ambulance}
          title="Ambulance service used"
          description="Ambulance trip history is not active yet. Future emergency requests and trip updates will be listed here."
          actionLabel="Book ambulance"
          actionHref="/emergency-ambulance"
        />
      ) : null}
    </div>
  );
}

function ProfileGrid({
  title,
  rows,
}: {
  title: string;
  rows: Array<{ label: string; value?: string | number | null }>;
}) {
  return (
    <section className="rounded-[28px] bg-white p-5 shadow-[0_18px_44px_rgba(15,23,42,0.07)] sm:p-6">
      <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label} className="rounded-[20px] bg-[#dedede] px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              {row.label}
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-950">
              {row.value || "Not added"}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SettingsPanel() {
  return (
    <section className="rounded-[28px] bg-white p-5 shadow-[0_18px_44px_rgba(15,23,42,0.07)] sm:p-6">
      <h2 className="text-xl font-semibold text-slate-950">Settings</h2>
      <div className="mt-5 grid gap-3">
        <Link
          href="/profile-completion"
          className="flex items-center justify-between rounded-[20px] bg-[#dedede] px-4 py-4 text-sm font-semibold text-slate-950"
        >
          Update personal and emergency details
          <ChevronRight className="h-4 w-4 text-[#0057FF]" />
        </Link>
        <div className="rounded-[20px] bg-[#dedede] px-4 py-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
            <ShieldCheck className="h-4 w-4 text-[#0057FF]" />
            Account security
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Password, device, and notification controls can be added here when account settings expand.
          </p>
        </div>
      </div>
    </section>
  );
}

function AppointmentsPanel({
  appointments,
  message,
}: {
  appointments: PatientAppointment[];
  message: string | null;
}) {
  return (
    <section className="rounded-[28px] bg-white p-5 shadow-[0_18px_44px_rgba(15,23,42,0.07)] sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-slate-950">My appointments</h2>
        <Link
          href="/appointments"
          className="inline-flex h-10 items-center rounded-full bg-[#0057FF] px-4 text-sm font-semibold text-white"
        >
          Open timeline
        </Link>
      </div>

      {message ? (
        <div className="mt-4 rounded-[18px] bg-red-50 px-4 py-3 text-sm text-red-700">
          {message}
        </div>
      ) : null}

      <div className="mt-5 grid gap-3">
        {appointments.length === 0 ? (
          <div className="rounded-[20px] bg-[#dedede] px-4 py-4 text-sm text-slate-600">
            No appointments yet.
          </div>
        ) : null}

        {appointments.slice(0, 5).map((appointment) => (
          <article key={appointment.id} className="rounded-[20px] bg-[#dedede] px-4 py-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">
                  {appointment.facilities?.name ?? "Facility"}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-500">
                  {appointment.service_type.replaceAll("_", " ")}
                </p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700">
                {appointment.status}
              </span>
            </div>
            <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
              <span className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-[#0057FF]" />
                {appointment.appointment_date}
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#0057FF]" />
                {appointment.facilities?.city || "City not added"}
              </span>
              <span className="flex items-center gap-2 sm:col-span-2">
                <NotebookText className="h-4 w-4 text-[#0057FF]" />
                {appointment.reason}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function EmptyHistoryPanel({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
}) {
  return (
    <section className="rounded-[28px] bg-white p-5 shadow-[0_18px_44px_rgba(15,23,42,0.07)] sm:p-6">
      <div className="rounded-[24px] bg-[#dedede] p-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0057FF] text-white">
          <Icon className="h-5 w-5" />
        </div>
        <h2 className="mt-4 text-xl font-semibold text-slate-950">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
        <Link
          href={actionHref}
          className="mt-5 inline-flex h-10 items-center rounded-full bg-[#0057FF] px-4 text-sm font-semibold text-white transition hover:bg-[#0046CC]"
        >
          {actionLabel}
        </Link>
      </div>
    </section>
  );
}

function getInitials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "P"
  );
}
