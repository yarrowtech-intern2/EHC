"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  CalendarDays,
  ChevronRight,
  CheckCircle2,
  MapPin,
  Phone,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";

import { AuthGuard } from "@/components/guards/auth-guard";
import { useAuth } from "@/components/providers/auth-provider";
import { apiRequest } from "@/lib/api";

type FacilityDetail = {
  id: string;
  tenant_id: string;
  name: string;
  type: string;
  city: string | null;
  contact_number: string | null;
  serves_patients_directly: boolean;
};

type AppointmentSlot = {
  id: string;
  facility_id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  service_type: string;
  capacity: number;
  booked_count: number;
  status: string;
};

export default function BookPage() {
  return (
    <AuthGuard allowedActors={["patient"]}>
      <BookScreen />
    </AuthGuard>
  );
}

function BookScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [facility, setFacility] = useState<FacilityDetail | null>(null);
  const [slots, setSlots] = useState<AppointmentSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    slotId: "",
    reason: "",
    notes: "",
  });

  const facilityId = useMemo(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return new URLSearchParams(window.location.search).get("facilityId") ?? "";
  }, []);

  useEffect(() => {
    if (!facilityId) {
      setLoading(false);
      return;
    }

    Promise.all([
      apiRequest<FacilityDetail>(`/facilities/public/${facilityId}`),
      apiRequest<AppointmentSlot[]>(
        `/appointment-slots/public?facilityId=${encodeURIComponent(facilityId)}`,
      ),
    ])
      .then(([facilityData, slotsData]) => {
        setFacility(facilityData);
        setSlots(slotsData);
        if (slotsData[0]) {
          setForm((current) => ({ ...current, slotId: slotsData[0].id }));
        }
      })
      .catch((error) =>
        setMessage(error instanceof Error ? error.message : "Could not load facility."),
      )
      .finally(() => setLoading(false));
  }, [facilityId]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!session?.access_token || !facilityId) {
      setMessage("Missing session or facility context.");
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const response = await apiRequest<{
        message: string;
        appointment: { id: string };
      }>("/appointments", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: {
          facilityId,
          slotId: form.slotId,
          reason: form.reason,
          notes: form.notes,
        },
      });

      setMessage(`${response.message}. Appointment ID: ${response.appointment.id}`);
      setTimeout(() => {
        router.push("/appointments");
      }, 900);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not submit booking request.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="rounded-full bg-white/70 px-5 py-3 text-sm text-body shadow-card">
          Loading facility...
        </div>
      </main>
    );
  }

  if (!facility) {
    return (
      <main className="min-h-screen px-4 py-8">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white/70 p-6 shadow-card">
          <h1 className="text-2xl font-bold text-heading">Facility not found</h1>
          <p className="mt-3 text-sm leading-6 text-body">
            This booking link is incomplete or the facility does not exist anymore.
          </p>
          <Link
            href="/discover"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-ambercare px-4 py-2 text-sm font-semibold text-heading"
          >
            Back to discovery
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <aside className="rounded-3xl bg-white/70 p-6 shadow-card">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-brand">Facility details</p>
                <h1 className="text-2xl font-bold text-heading">{facility.name}</h1>
              </div>
            </div>

            <div className="mt-5 space-y-3 text-sm text-body">
              <div className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-brand" />
                {facility.type}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-brand" />
                {facility.city || "City not added yet"}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-brand" />
                {facility.contact_number || "Contact number not added yet"}
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-brand" />
                {facility.serves_patients_directly
                  ? "Accepts direct patient requests"
                  : "Internal facility access only"}
              </div>
            </div>

            <div className="mt-6 rounded-3xl bg-skywash/35 p-4">
              <p className="text-sm font-semibold text-heading">Phase 1 booking scope</p>
              <p className="mt-2 text-sm leading-6 text-body">
                Phase 1 now supports direct slot-based confirmation. Admins create facility slots,
                and patients can choose one to confirm an appointment.
              </p>
            </div>
          </aside>

          <section className="rounded-3xl bg-white/70 p-6 shadow-card">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ambercare/30 text-heading">
                <CalendarDays className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-brand">Booking request</p>
                <h2 className="text-2xl font-bold text-heading">Request care from this facility</h2>
              </div>
            </div>

            <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={submit}>
              <div className="sm:col-span-2">
                <p className="text-sm font-medium text-heading">Available slots</p>
                <div className="mt-3 grid gap-3">
                  {slots.length === 0 ? (
                    <div className="rounded-2xl bg-skywash/30 px-4 py-4 text-sm text-body">
                      No confirmed slots are available yet. Ask a tenant admin to create slots for this facility.
                    </div>
                  ) : null}

                  {slots.map((slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setForm((current) => ({ ...current, slotId: slot.id }))}
                      className={`rounded-2xl border px-4 py-4 text-left transition ${
                        form.slotId === slot.id
                          ? "border-brand bg-skywash/35"
                          : "border-border bg-white/75"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-heading">
                            {slot.service_type.replaceAll("_", " ")}
                          </p>
                          <p className="mt-1 text-sm text-body">
                            {slot.slot_date} | {slot.start_time} - {slot.end_time}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-brand">
                          <CheckCircle2 className="h-4 w-4" />
                          {slot.capacity - slot.booked_count} left
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <label className="text-sm font-medium text-heading sm:col-span-2">
                Reason for appointment
                <textarea
                  value={form.reason}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, reason: event.target.value }))
                  }
                  placeholder="Briefly describe symptoms, purpose of visit, or required support"
                  className="mt-2 min-h-28 w-full rounded-[14px] border border-border bg-white/80 px-4 py-3 text-sm text-heading outline-none focus:border-brand"
                />
              </label>

              <label className="text-sm font-medium text-heading sm:col-span-2">
                Additional notes
                <textarea
                  value={form.notes}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, notes: event.target.value }))
                  }
                  placeholder="Optional notes, prescription references, or accessibility needs"
                  className="mt-2 min-h-24 w-full rounded-[14px] border border-border bg-white/80 px-4 py-3 text-sm text-heading outline-none focus:border-brand"
                />
              </label>

              {message ? (
                <div className="rounded-2xl bg-skywash/30 px-4 py-3 text-sm text-heading sm:col-span-2">
                  {message}
                </div>
              ) : null}

              <div className="flex flex-col gap-3 pt-2 sm:col-span-2 sm:flex-row">
                <button
                  type="submit"
                  disabled={submitting || !form.slotId}
                  className="inline-flex items-center justify-center rounded-full bg-ambercare px-6 py-3 text-sm font-semibold text-heading transition hover:bg-[#c99e79] disabled:opacity-60"
                >
                  Confirm appointment
                </button>
                <Link
                  href="/discover"
                  className="inline-flex items-center justify-center rounded-full border border-brand/20 bg-white/75 px-6 py-3 text-sm font-semibold text-heading"
                >
                  Back to discovery
                </Link>
              </div>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
