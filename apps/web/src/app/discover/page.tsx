"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Ambulance,
  Building2,
  CalendarCheck,
  Droplets,
  MapPin,
  Pill,
  Search,
  SlidersHorizontal,
  Stethoscope,
} from "lucide-react";

import { AuthGuard } from "@/components/guards/auth-guard";
import { PatientShell } from "@/components/patient-shell";
import { apiRequest } from "@/lib/api";

type Facility = {
  id: string;
  name: string;
  type: string;
  city: string | null;
};

type ServiceTab = "all" | "clinics" | "blood_banks" | "pharmacies";

const serviceTabs: Array<{ id: ServiceTab; label: string }> = [
  { id: "all", label: "All" },
  { id: "clinics", label: "Clinics" },
  { id: "blood_banks", label: "Blood banks" },
  { id: "pharmacies", label: "Pharmacies" },
];

export default function DiscoverPage() {
  return (
    <AuthGuard allowedActors={["patient"]}>
      <PatientShell>
        <DiscoverScreen />
      </PatientShell>
    </AuthGuard>
  );
}

function DiscoverScreen() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [activeTab, setActiveTab] = useState<ServiceTab>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    apiRequest<Facility[]>("/facilities/public")
      .then(setFacilities)
      .catch(() => setFacilities([]));
  }, []);

  const filteredFacilities = useMemo(() => {
    const query = search.trim().toLowerCase();

    return facilities.filter((facility) => {
      const matchesTab = activeTab === "all" || getFacilityCategory(facility) === activeTab;
      const searchable = `${facility.name} ${facility.type} ${facility.city ?? ""}`.toLowerCase();
      const matchesSearch = !query || searchable.includes(query);

      return matchesTab && matchesSearch;
    });
  }, [activeTab, facilities, search]);

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] bg-white p-4 shadow-[0_18px_44px_rgba(15,23,42,0.07)] sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0057FF]">
              Patient home
            </p>
            <h1 className="mt-2 text-3xl font-semibold leading-tight text-[#0f172a] sm:text-4xl">
              Find care near you
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Browse clinics, pharmacies, blood services, and urgent care options from one simple home screen.
            </p>
          </div>

          <label className="flex h-12 w-full items-center gap-3 rounded-full border border-slate-200 bg-[#f8f7f4] px-4 text-sm text-slate-500 shadow-inner lg:max-w-[380px]">
            <Search className="h-4 w-4 text-[#0057FF]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search services, city, provider..."
              className="min-w-0 flex-1 bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
            />
            <SlidersHorizontal className="h-4 w-4 text-slate-400" />
          </label>
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {serviceTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`h-10 shrink-0 rounded-full px-4 text-sm font-semibold transition ${
                activeTab === tab.id
                  ? "bg-[#0057FF] text-white shadow-[0_12px_28px_rgba(0,87,255,0.22)]"
                  : "bg-[#f8f7f4] text-slate-600 hover:bg-[#eef1f5] hover:text-slate-950"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <Link
          href="/emergency-ambulance"
          className="flex items-center gap-3 rounded-[22px] bg-white p-4 text-left shadow-[0_14px_34px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0057FF] text-white">
            <Ambulance className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-sm font-semibold text-slate-950">Book ambulance</span>
            <span className="mt-1 block text-xs text-slate-500">Emergency support</span>
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setActiveTab("pharmacies")}
          className="flex items-center gap-3 rounded-[22px] bg-white p-4 text-left shadow-[0_14px_34px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0057FF] text-white">
            <Pill className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-sm font-semibold text-slate-950">Order medicines</span>
            <span className="mt-1 block text-xs text-slate-500">Find pharmacies</span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("blood_banks")}
          className="flex items-center gap-3 rounded-[22px] bg-white p-4 text-left shadow-[0_14px_34px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0057FF] text-white">
            <Droplets className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-sm font-semibold text-slate-950">Look for blood</span>
            <span className="mt-1 block text-xs text-slate-500">Blood bank listings</span>
          </span>
        </button>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {facilities.length === 0 ? (
          <div className="rounded-[24px] bg-white p-6 text-sm text-slate-600 shadow-[0_14px_34px_rgba(15,23,42,0.06)] sm:col-span-2 xl:col-span-3">
            No services are available yet.
          </div>
        ) : null}

        {facilities.length > 0 && filteredFacilities.length === 0 ? (
          <div className="rounded-[24px] bg-white p-6 text-sm text-slate-600 shadow-[0_14px_34px_rgba(15,23,42,0.06)] sm:col-span-2 xl:col-span-3">
            No matching services found.
          </div>
        ) : null}

        {filteredFacilities.map((facility) => {
          const Icon = getFacilityIcon(facility);

          return (
            <article key={facility.id} className="rounded-[24px] bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f2f5ff] text-[#0057FF]">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-base font-semibold text-slate-950">{facility.name}</h2>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                    {formatFacilityType(facility.type)}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#0057FF]" />
                  {facility.city || "City not added yet"}
                </div>
                <div className="flex items-center gap-2">
                  <CalendarCheck className="h-4 w-4 text-[#0057FF]" />
                  {getFacilityActionText(facility)}
                </div>
              </div>

              <Link
                href={`/book?facilityId=${facility.id}`}
                className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-[#0057FF] px-4 text-sm font-semibold text-white transition hover:bg-[#0046CC]"
              >
                View service
              </Link>
            </article>
          );
        })}
      </section>
    </div>
  );
}

function getFacilityCategory(facility: Facility): ServiceTab {
  if (facility.type === "pharmacy") {
    return "pharmacies";
  }

  if (facility.name.toLowerCase().includes("blood")) {
    return "blood_banks";
  }

  if (facility.type === "hospital" || facility.type === "clinic" || facility.type === "lab") {
    return "clinics";
  }

  return "all";
}

function getFacilityIcon(facility: Facility) {
  if (facility.type === "pharmacy") {
    return Pill;
  }

  if (facility.name.toLowerCase().includes("blood")) {
    return Droplets;
  }

  if (facility.type === "ambulance_unit") {
    return Ambulance;
  }

  if (facility.type === "clinic" || facility.type === "hospital") {
    return Stethoscope;
  }

  return Building2;
}

function getFacilityActionText(facility: Facility) {
  if (facility.type === "pharmacy") {
    return "Medicine orders can connect here";
  }

  if (facility.name.toLowerCase().includes("blood")) {
    return "Blood availability can connect here";
  }

  if (facility.type === "ambulance_unit") {
    return "Ambulance booking can connect here";
  }

  return "Book appointment slots";
}

function formatFacilityType(type: string) {
  return type.replaceAll("_", " ");
}
