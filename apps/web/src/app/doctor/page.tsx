"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ClipboardPenLine,
  Clock3,
  MapPin,
  NotebookText,
  Phone,
  Stethoscope,
} from "lucide-react";

import { AuthGuard } from "@/components/guards/auth-guard";
import { DashboardShell } from "@/components/dashboard-shell";
import { useAuth } from "@/components/providers/auth-provider";
import { apiRequest } from "@/lib/api";

type DoctorAppointment = {
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
  consultation_notes: string | null;
  diagnosis_summary: string | null;
  prescription_notes: string | null;
  created_at: string;
  profiles?: {
    full_name?: string | null;
    phone?: string | null;
    email?: string | null;
  } | null;
  facilities?: {
    name?: string | null;
    city?: string | null;
    type?: string | null;
  } | null;
};

type ConsultationForm = {
  consultationNotes: string;
  diagnosisSummary: string;
  prescriptionNotes: string;
  status: string;
};

const defaultForm: ConsultationForm = {
  consultationNotes: "",
  diagnosisSummary: "",
  prescriptionNotes: "",
  status: "completed",
};

export default function DoctorPage() {
  return (
    <AuthGuard allowedActors={["doctor", "facility_operator", "tenant_admin"]}>
      <DashboardShell>
        <DoctorWorkspace />
      </DashboardShell>
    </AuthGuard>
  );
}

function DoctorWorkspace() {
  const { session } = useAuth();
  const [appointments, setAppointments] = useState<DoctorAppointment[]>([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState("");
  const [form, setForm] = useState<ConsultationForm>(defaultForm);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!session?.access_token) {
      return;
    }

    apiRequest<DoctorAppointment[]>("/appointments/doctor", {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    })
      .then((data) => {
        setAppointments(data);
        if (data[0]) {
          hydrateFormFromAppointment(data[0], setSelectedAppointmentId, setForm);
        }
      })
      .catch((error) =>
        setMessage(error instanceof Error ? error.message : "Could not load doctor schedule."),
      );
  }, [session?.access_token]);

  const selectedAppointment = useMemo(
    () => appointments.find((appointment) => appointment.id === selectedAppointmentId) ?? null,
    [appointments, selectedAppointmentId],
  );

  const selectAppointment = (appointment: DoctorAppointment) => {
    hydrateFormFromAppointment(appointment, setSelectedAppointmentId, setForm);
    setMessage(null);
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!session?.access_token || !selectedAppointmentId) {
      setMessage("Select an appointment first.");
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      await apiRequest("/appointments/consultation", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: {
          appointmentId: selectedAppointmentId,
          consultationNotes: form.consultationNotes,
          diagnosisSummary: form.diagnosisSummary,
          prescriptionNotes: form.prescriptionNotes,
          status: form.status,
        },
      });

      setAppointments((current) =>
        current.map((appointment) =>
          appointment.id === selectedAppointmentId
            ? {
                ...appointment,
                consultation_notes: form.consultationNotes,
                diagnosis_summary: form.diagnosisSummary,
                prescription_notes: form.prescriptionNotes,
                status: form.status,
              }
            : appointment,
        ),
      );
      setMessage("Consultation notes saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save consultation.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-brand">Doctor workspace</p>
            <h1 className="mt-2 text-3xl font-bold text-heading">Today&apos;s care schedule</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-body">
              Review assigned consultations, capture lightweight notes, and mark care as completed.
            </p>
          </div>
        </div>

        {message ? (
          <div className="mt-6 rounded-2xl bg-skywash/30 px-4 py-3 text-sm text-heading">
            {message}
          </div>
        ) : null}

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-3xl bg-white/70 p-5 shadow-card">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                <Stethoscope className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-brand">Assigned queue</p>
                <h2 className="text-xl font-semibold text-heading">Upcoming consultations</h2>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              {appointments.length === 0 ? (
                <div className="rounded-2xl bg-skywash/25 px-4 py-4 text-sm text-body">
                  No appointments are assigned to this doctor yet. Assign a doctor while creating facility slots.
                </div>
              ) : null}

              {appointments.map((appointment) => (
                <button
                  key={appointment.id}
                  type="button"
                  onClick={() => selectAppointment(appointment)}
                  className={`rounded-2xl border px-4 py-4 text-left transition ${
                    selectedAppointmentId === appointment.id
                      ? "border-brand bg-skywash/35"
                      : "border-border bg-white/80"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-heading">
                        {appointment.profiles?.full_name || "Patient"}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.14em] text-brand">
                        {appointment.service_type.replaceAll("_", " ")}
                      </p>
                    </div>
                    <span className="rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-heading">
                      {appointment.status}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-body">
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
                      {appointment.facilities?.name || "Facility"}
                      {appointment.facilities?.city ? `, ${appointment.facilities.city}` : ""}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-3xl bg-white/70 p-6 shadow-card">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ambercare/30 text-heading">
                <ClipboardPenLine className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-brand">Consultation shell</p>
                <h2 className="text-xl font-semibold text-heading">Clinical summary</h2>
              </div>
            </div>

            {!selectedAppointment ? (
              <div className="mt-6 rounded-2xl bg-skywash/25 px-4 py-4 text-sm text-body">
                Choose an appointment from the left to start consultation notes.
              </div>
            ) : (
              <form className="mt-6 grid gap-4" onSubmit={submit}>
                <div className="rounded-2xl bg-skywash/25 p-4 text-sm text-body">
                  <div className="flex items-center gap-2 text-heading">
                    <NotebookText className="h-4 w-4 text-brand" />
                    {selectedAppointment.reason}
                  </div>
                  {selectedAppointment.notes ? (
                    <p className="mt-2 leading-6">{selectedAppointment.notes}</p>
                  ) : null}
                  <div className="mt-3 flex flex-wrap gap-4 text-xs">
                    <span>
                      Patient: {selectedAppointment.profiles?.full_name || "Not added"}
                    </span>
                    <span>
                      Contact:{" "}
                      {selectedAppointment.profiles?.phone ||
                        selectedAppointment.profiles?.email ||
                        "Not added"}
                    </span>
                  </div>
                </div>

                <label className="text-sm font-medium text-heading">
                  Consultation notes
                  <textarea
                    value={form.consultationNotes}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        consultationNotes: event.target.value,
                      }))
                    }
                    placeholder="Visit details, examination observations, and treatment context"
                    className="mt-2 min-h-28 w-full rounded-[14px] border border-border bg-white/80 px-4 py-3 text-sm text-heading outline-none focus:border-brand"
                  />
                </label>

                <label className="text-sm font-medium text-heading">
                  Diagnosis summary
                  <textarea
                    value={form.diagnosisSummary}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        diagnosisSummary: event.target.value,
                      }))
                    }
                    placeholder="Primary findings or working diagnosis"
                    className="mt-2 min-h-24 w-full rounded-[14px] border border-border bg-white/80 px-4 py-3 text-sm text-heading outline-none focus:border-brand"
                  />
                </label>

                <label className="text-sm font-medium text-heading">
                  Prescription notes
                  <textarea
                    value={form.prescriptionNotes}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        prescriptionNotes: event.target.value,
                      }))
                    }
                    placeholder="Medicines, instructions, or follow-up guidance"
                    className="mt-2 min-h-24 w-full rounded-[14px] border border-border bg-white/80 px-4 py-3 text-sm text-heading outline-none focus:border-brand"
                  />
                </label>

                <label className="text-sm font-medium text-heading">
                  Visit status
                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, status: event.target.value }))
                    }
                    className="mt-2 w-full rounded-[14px] border border-border bg-white/80 px-4 py-3 text-sm text-heading outline-none focus:border-brand"
                  >
                    <option value="checked_in">Checked in</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </label>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center justify-center rounded-full bg-ambercare px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0046CC] disabled:opacity-60"
                  >
                    Save consultation
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
    </div>
  );
}

function hydrateFormFromAppointment(
  appointment: DoctorAppointment,
  setSelectedAppointmentId: (value: string) => void,
  setForm: (value: ConsultationForm | ((current: ConsultationForm) => ConsultationForm)) => void,
) {
  setSelectedAppointmentId(appointment.id);
  setForm({
    consultationNotes: appointment.consultation_notes ?? "",
    diagnosisSummary: appointment.diagnosis_summary ?? "",
    prescriptionNotes: appointment.prescription_notes ?? "",
    status: appointment.status === "completed" ? "completed" : "checked_in",
  });
}
