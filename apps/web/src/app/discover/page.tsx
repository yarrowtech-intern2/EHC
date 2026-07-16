"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, CalendarCheck, ChevronRight, MapPin, Pill } from "lucide-react";

import { AuthGuard } from "@/components/guards/auth-guard";
import { apiRequest } from "@/lib/api";

type Facility = {
  id: string;
  name: string;
  type: string;
  city: string | null;
};

export default function DiscoverPage() {
  return (
    <AuthGuard allowedActors={["patient"]}>
      <DiscoverScreen />
    </AuthGuard>
  );
}

function DiscoverScreen() {
  const [facilities, setFacilities] = useState<Facility[]>([]);

  useEffect(() => {
    apiRequest<Facility[]>("/facilities/public")
      .then(setFacilities)
      .catch(() => setFacilities([]));
  }, []);

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-brand">Patient next step</p>
            <h1 className="mt-2 text-3xl font-bold text-heading">Discover facilities and book care</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-body">
              Start with a provider, clinic, pharmacy, or ambulance-enabled facility.
              Booking and consultation flows will connect here in the next Phase 1 slices.
            </p>
          </div>
          <Link
            href="/"
            className="rounded-full border border-brand/20 bg-white/70 px-4 py-2 text-sm font-semibold text-heading"
          >
            Back to home
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {facilities.length === 0 ? (
            <div className="rounded-3xl bg-white/70 p-6 text-sm text-body shadow-card sm:col-span-2 xl:col-span-3">
              No facilities are available yet. Once tenant admins create facilities,
              they will appear here for patients.
            </div>
          ) : null}

          {facilities.map((facility) => (
            <article key={facility.id} className="rounded-3xl bg-white/70 p-5 shadow-card">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-heading">{facility.name}</h2>
                  <p className="text-xs uppercase tracking-[0.14em] text-body">{facility.type}</p>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm text-body">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-brand" />
                  {facility.city || "City not added yet"}
                </div>
                <div className="flex items-center gap-2">
                  <CalendarCheck className="h-4 w-4 text-brand" />
                  Booking integration comes next
                </div>
                <div className="flex items-center gap-2">
                  <Pill className="h-4 w-4 text-brand" />
                  Pharmacy and care modules connect from here
                </div>
              </div>

              <Link
                href={`/book?facilityId=${facility.id}`}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-ambercare px-4 py-2 text-sm font-semibold text-heading"
              >
                View facility
                <ChevronRight className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
