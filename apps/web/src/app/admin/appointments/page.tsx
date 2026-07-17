"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, Clock3, MapPin, Phone } from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { apiRequest } from "@/lib/api";

type Facility = {
  id: string;
  tenant_id: string;
  name: string;
  type: string;
  city: string | null;
};

type FacilityAppointment = {
  id: string;
  patient_user_id: string;
  facility_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  service_type: string;
  reason: string;
  notes: string | null;
  status: string;
  created_at: string;
  profiles?: {
    full_name?: string | null;
    phone?: string | null;
    email?: string | null;
  } | null;
};

const statusActions = ["confirmed", "checked_in", "completed", "cancelled"] as const;

export default function AdminAppointmentsPage() {
  const { session } = useAuth();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState("");
  const [appointments, setAppointments] = useState<FacilityAppointment[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.access_token) {
      return;
    }

    apiRequest<Facility[]>("/facilities/mine", {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    })
      .then((data) => {
        setFacilities(data);
        if (data[0]) {
          setSelectedFacilityId(data[0].id);
        }
      })
      .catch(() => setFacilities([]));
  }, [session?.access_token]);

  useEffect(() => {
    if (!session?.access_token || !selectedFacilityId) {
      return;
    }

    apiRequest<FacilityAppointment[]>(
      `/appointments/facility?facilityId=${encodeURIComponent(selectedFacilityId)}`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      },
    )
      .then(setAppointments)
      .catch((error) =>
        setMessage(error instanceof Error ? error.message : "Could not load appointments."),
      );
  }, [selectedFacilityId, session?.access_token]);

  const selectedFacility = useMemo(
    () => facilities.find((facility) => facility.id === selectedFacilityId) ?? null,
    [facilities, selectedFacilityId],
  );

  const updateStatus = async (appointmentId: string, status: (typeof statusActions)[number]) => {
    if (!session?.access_token) {
      return;
    }

    try {
      await apiRequest("/appointments/status", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: {
          appointmentId,
          status,
        },
      });

      setAppointments((current) =>
        current.map((appointment) =>
          appointment.id === appointmentId ? { ...appointment, status } : appointment,
        ),
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update appointment.");
    }
  };

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-brand">Operations</p>
            <h1 className="mt-2 text-3xl font-bold text-heading">Facility appointments</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-body">
              Review confirmed bookings and update their operational status.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-3xl bg-white/75 p-5 shadow-card">
          <label className="text-sm font-medium text-heading">
            Facility
            <select
              value={selectedFacilityId}
              onChange={(event) => setSelectedFacilityId(event.target.value)}
              className="mt-2 w-full rounded-[14px] border border-border bg-white/80 px-4 py-3 text-sm text-heading outline-none focus:border-brand"
            >
              {facilities.map((facility) => (
                <option key={facility.id} value={facility.id}>
                  {facility.name} ({facility.type})
                </option>
              ))}
            </select>
          </label>
        </div>

        {selectedFacility ? (
          <div className="mt-4 rounded-3xl bg-white/70 p-4 text-sm text-body shadow-card">
            Managing appointments for {selectedFacility.name}
            {selectedFacility.city ? `, ${selectedFacility.city}` : ""}
          </div>
        ) : null}

        {message ? (
          <div className="mt-4 rounded-2xl bg-skywash/30 px-4 py-3 text-sm text-heading">
            {message}
          </div>
        ) : null}

        <div className="mt-6 grid gap-4">
          {appointments.length === 0 ? (
            <div className="rounded-3xl bg-white/70 p-6 text-sm text-body shadow-card">
              No appointments found for this facility yet.
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
                    {appointment.profiles?.full_name || "Patient"}
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
                  <Phone className="h-4 w-4 text-brand" />
                  {appointment.profiles?.phone || appointment.profiles?.email || "No contact info"}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-brand" />
                  {appointment.reason}
                </div>
              </div>

              {appointment.notes ? (
                <div className="mt-4 rounded-2xl bg-skywash/25 px-4 py-3 text-sm text-body">
                  {appointment.notes}
                </div>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-2">
                {statusActions.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => updateStatus(appointment.id, status)}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
                      appointment.status === status
                        ? "bg-ambercare text-heading"
                        : "border border-brand/20 bg-white/75 text-heading"
                    }`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {status}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
