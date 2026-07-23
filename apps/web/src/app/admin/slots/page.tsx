"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Clock3, PlusCircle } from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { apiRequest } from "@/lib/api";

type Facility = {
  id: string;
  tenant_id: string;
  name: string;
  type: string;
  city: string | null;
};

type Doctor = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
};

export default function AdminSlotsPage() {
  const { session } = useAuth();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingFacilities, setLoadingFacilities] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    facilityId: "",
    doctorUserId: "",
    slotDate: "",
    startTime: "",
    endTime: "",
    serviceType: "doctor_consultation",
    capacity: "1",
  });

  useEffect(() => {
    if (!session?.access_token) {
      return;
    }

    setLoadingFacilities(true);

    apiRequest<Facility[]>("/facilities/mine", {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    })
      .then((data) => {
        setFacilities(data);
        if (data[0]) {
          setForm((current) => ({ ...current, facilityId: data[0].id }));
        }
      })
      .catch(() => {
        setFacilities([]);
        setMessage("Could not load assigned facilities.");
      })
      .finally(() => setLoadingFacilities(false));
  }, [session?.access_token]);

  useEffect(() => {
    if (!session?.access_token || !form.facilityId) {
      return;
    }

    const facility = facilities.find((item) => item.id === form.facilityId);
    const params = new URLSearchParams();

    params.set("facilityId", form.facilityId);

    if (facility?.tenant_id) {
      params.set("tenantId", facility.tenant_id);
    }

    apiRequest<Doctor[]>(`/users/doctors?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    })
      .then(setDoctors)
      .catch(() => setDoctors([]));
  }, [facilities, form.facilityId, session?.access_token]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!session?.access_token) {
      setMessage("Session missing. Please sign in again.");
      return;
    }

    if (!form.facilityId) {
      setMessage("No facility is assigned to this account yet.");
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      await apiRequest("/appointment-slots", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: {
          facilityId: form.facilityId,
          doctorUserId: form.doctorUserId || undefined,
          slotDate: form.slotDate,
          startTime: form.startTime,
          endTime: form.endTime,
          serviceType: form.serviceType,
          capacity: Number(form.capacity),
        },
      });

      setMessage("Appointment slot created.");
      setForm((current) => ({
        ...current,
        slotDate: "",
        startTime: "",
        endTime: "",
        capacity: "1",
      }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create slot.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-3xl bg-white/75 p-6 shadow-card">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand/10 text-brand">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-brand">Scheduling</p>
              <h1 className="text-2xl font-bold text-heading">Create appointment slots</h1>
            </div>
          </div>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-body">
            This is the minimum scheduling control for Phase 1. Create facility slots here so
            patients can book confirmed appointments instead of only submitting requests.
          </p>

          <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={submit}>
            <label className="text-sm font-medium text-heading sm:col-span-2">
              Facility
              <select
                value={form.facilityId}
                onChange={(event) =>
                  setForm((current) => ({ ...current, facilityId: event.target.value }))
                }
                disabled={loadingFacilities || facilities.length === 0}
                className="mt-2 w-full rounded-[14px] border border-border bg-white/80 px-4 py-3 text-sm text-heading outline-none focus:border-brand"
              >
                {loadingFacilities ? <option value="">Loading assigned facilities...</option> : null}
                {!loadingFacilities && facilities.length === 0 ? (
                  <option value="">No assigned facilities found</option>
                ) : null}
                {facilities.map((facility) => (
                  <option key={facility.id} value={facility.id}>
                    {facility.name} ({facility.type})
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium text-heading sm:col-span-2">
              Assigned doctor
              <select
                value={form.doctorUserId}
                onChange={(event) =>
                  setForm((current) => ({ ...current, doctorUserId: event.target.value }))
                }
                className="mt-2 w-full rounded-[14px] border border-border bg-white/80 px-4 py-3 text-sm text-heading outline-none focus:border-brand"
              >
                <option value="">General facility pool</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.full_name || doctor.email || doctor.phone || doctor.id}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium text-heading">
              Slot date
              <input
                type="date"
                min="2026-07-16"
                value={form.slotDate}
                onChange={(event) =>
                  setForm((current) => ({ ...current, slotDate: event.target.value }))
                }
                className="mt-2 w-full rounded-[14px] border border-border bg-white/80 px-4 py-3 text-sm text-heading outline-none focus:border-brand"
              />
            </label>

            <label className="text-sm font-medium text-heading">
              Service type
              <select
                value={form.serviceType}
                onChange={(event) =>
                  setForm((current) => ({ ...current, serviceType: event.target.value }))
                }
                className="mt-2 w-full rounded-[14px] border border-border bg-white/80 px-4 py-3 text-sm text-heading outline-none focus:border-brand"
              >
                <option value="doctor_consultation">Doctor consultation</option>
                <option value="follow_up">Follow-up</option>
                <option value="diagnostic_booking">Diagnostic booking</option>
                <option value="pharmacy_support">Pharmacy support</option>
              </select>
            </label>

            <label className="text-sm font-medium text-heading">
              Start time
              <div className="relative mt-2">
                <Clock3 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-body" />
                <input
                  value={form.startTime}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, startTime: event.target.value }))
                  }
                  placeholder="10:00 AM"
                  className="w-full rounded-[14px] border border-border bg-white/80 py-3 pl-10 pr-4 text-sm text-heading outline-none focus:border-brand"
                />
              </div>
            </label>

            <label className="text-sm font-medium text-heading">
              End time
              <div className="relative mt-2">
                <Clock3 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-body" />
                <input
                  value={form.endTime}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, endTime: event.target.value }))
                  }
                  placeholder="10:30 AM"
                  className="w-full rounded-[14px] border border-border bg-white/80 py-3 pl-10 pr-4 text-sm text-heading outline-none focus:border-brand"
                />
              </div>
            </label>

            <label className="text-sm font-medium text-heading">
              Capacity
              <input
                type="number"
                min="1"
                max="50"
                value={form.capacity}
                onChange={(event) =>
                  setForm((current) => ({ ...current, capacity: event.target.value }))
                }
                className="mt-2 w-full rounded-[14px] border border-border bg-white/80 px-4 py-3 text-sm text-heading outline-none focus:border-brand"
              />
            </label>

            {message ? (
              <div className="rounded-2xl bg-skywash/30 px-4 py-3 text-sm text-heading sm:col-span-2">
                {message}
              </div>
            ) : null}

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={submitting || loadingFacilities || !form.facilityId}
                className="inline-flex items-center gap-2 rounded-full bg-ambercare px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                <PlusCircle className="h-4 w-4" />
                Create slot
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
