"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarDays, Clock3, MapPin, NotebookText } from "lucide-react";

import { AuthGuard } from "@/components/guards/auth-guard";
import { useAuth } from "@/components/providers/auth-provider";
import { apiRequest } from "@/lib/api";

type PatientAppointment = {
  id: string;
  facility_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  service_type: string;
  reason: string;
  notes: string | null;
  status: string;
  created_at: string;
  facilities?: {
    name?: string;
    city?: string | null;
    type?: string;
  } | null;
};

export default function AppointmentsPage() {
  return (
    <AuthGuard allowedActors={["patient"]}>
      <AppointmentsScreen />
    </AuthGuard>
  );
}

function AppointmentsScreen() {
  const { session } = useAuth();
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

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-brand">Patient timeline</p>
            <h1 className="mt-2 text-3xl font-bold text-heading">My appointments</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-body">
              Review your confirmed appointments and track their current status.
            </p>
          </div>
          <Link
            href="/discover"
            className="rounded-full bg-ambercare px-4 py-2 text-sm font-semibold text-heading"
          >
            Book new care
          </Link>
        </div>

        {message ? (
          <div className="mt-6 rounded-2xl bg-skywash/30 px-4 py-3 text-sm text-heading">
            {message}
          </div>
        ) : null}

        <div className="mt-6 grid gap-4">
          {appointments.length === 0 ? (
            <div className="rounded-3xl bg-white/70 p-6 text-sm text-body shadow-card">
              No appointments yet. Once you confirm a slot from facility discovery, it will show here.
            </div>
          ) : null}

          {appointments.map((appointment) => (
            <article key={appointment.id} className="rounded-3xl bg-white/70 p-5 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-brand">
                    {appointment.service_type.replaceAll("_", " ")}
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-heading">
                    {appointment.facilities?.name ?? "Facility"}
                  </h2>
                </div>
                <span className="rounded-full bg-skywash/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-heading">
                  {appointment.status}
                </span>
              </div>

              <div className="mt-4 grid gap-2 text-sm text-body sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-brand" />
                  {appointment.appointment_date}
                </div>
                <div className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-brand" />
                  {appointment.start_time} - {appointment.end_time}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-brand" />
                  {appointment.facilities?.city || "City not added"}
                </div>
                <div className="flex items-center gap-2">
                  <NotebookText className="h-4 w-4 text-brand" />
                  {appointment.reason}
                </div>
              </div>

              {appointment.notes ? (
                <div className="mt-4 rounded-2xl bg-skywash/25 px-4 py-3 text-sm text-body">
                  {appointment.notes}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}

