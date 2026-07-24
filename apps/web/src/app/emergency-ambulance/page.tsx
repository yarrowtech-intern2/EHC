"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ComponentType, type ReactNode } from "react";
import {
  AlertTriangle,
  Ambulance,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  LocateFixed,
  MapPin,
  Navigation,
  Phone,
  ShieldAlert,
  User,
} from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { apiRequest } from "@/lib/api";

type AmbulanceUnit = {
  id: string;
  vehicleNumber: string;
  driverName: string | null;
  driverPhone: string | null;
  status: string;
  currentLatitude: number | null;
  currentLongitude: number | null;
  lastLocationAt: string | null;
};

type EmergencyRequest = {
  id: string;
  trackingToken?: string;
  patientName: string;
  patientPhone: string;
  pickupAddress: string | null;
  pickupLatitude: number;
  pickupLongitude: number;
  status: "requested" | "accepted" | "en_route" | "arrived" | "transporting" | "completed" | "cancelled";
  acceptedAt: string | null;
  statusUpdatedAt: string;
  createdAt: string;
  ambulanceUnit: AmbulanceUnit | null;
};

type CreateEmergencyResponse = {
  message: string;
  request: EmergencyRequest & { trackingToken: string };
};

const TRACKING_STORAGE_KEY = "ehc.emergencyAmbulance.tracking";

export default function EmergencyAmbulancePage() {
  const { session } = useAuth();
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [request, setRequest] = useState<EmergencyRequest | null>(null);
  const [trackingToken, setTrackingToken] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const authHeaders = useMemo(
    () =>
      session?.access_token
        ? {
            Authorization: `Bearer ${session.access_token}`,
          }
        : undefined,
    [session?.access_token],
  );

  useEffect(() => {
    const saved = window.localStorage.getItem(TRACKING_STORAGE_KEY);

    if (!saved) {
      return;
    }

    try {
      const parsed = JSON.parse(saved) as { requestId?: string; token?: string };
      if (parsed.requestId && parsed.token) {
        setTrackingToken(parsed.token);
        loadTracking(parsed.requestId, parsed.token);
      }
    } catch {
      window.localStorage.removeItem(TRACKING_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (!request?.id || !trackingToken || ["completed", "cancelled"].includes(request.status)) {
      return;
    }

    const interval = window.setInterval(() => {
      loadTracking(request.id, trackingToken);
    }, 6000);

    return () => window.clearInterval(interval);
  }, [request?.id, request?.status, trackingToken]);

  function shareLocation() {
    if (!navigator.geolocation) {
      setMessage("Location sharing is not available in this browser.");
      return;
    }

    setLoadingLocation(true);
    setMessage(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setLoadingLocation(false);
      },
      () => {
        setLoadingLocation(false);
        setMessage("Location permission was denied.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  async function createRequest() {
    if (!patientName.trim() || !patientPhone.trim()) {
      setMessage("Patient name and phone number are required.");
      return;
    }

    if (latitude === null || longitude === null) {
      setMessage("Share current location before requesting an ambulance.");
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const response = await apiRequest<CreateEmergencyResponse>("/emergency-ambulance/requests", {
        method: "POST",
        headers: authHeaders,
        body: {
          patientName,
          patientPhone,
          pickupAddress: pickupAddress || undefined,
          pickupLatitude: latitude,
          pickupLongitude: longitude,
        },
      });

      setRequest(response.request);
      setTrackingToken(response.request.trackingToken);
      window.localStorage.setItem(
        TRACKING_STORAGE_KEY,
        JSON.stringify({
          requestId: response.request.id,
          token: response.request.trackingToken,
        }),
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not request ambulance.");
    } finally {
      setSubmitting(false);
    }
  }

  async function loadTracking(requestId: string, token: string) {
    try {
      const nextRequest = await apiRequest<EmergencyRequest>(
        `/emergency-ambulance/requests/${requestId}/track?token=${encodeURIComponent(token)}`,
      );
      setRequest(nextRequest);
      setMessage(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load tracking status.");
    }
  }

  function clearTracking() {
    window.localStorage.removeItem(TRACKING_STORAGE_KEY);
    setRequest(null);
    setTrackingToken("");
  }

  return (
    <main className="min-h-screen bg-[#f8f7f4] px-4 py-5 text-ink sm:py-8">
      <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[0.92fr_1.08fr]">
        <section className="min-h-[calc(100vh-40px)] rounded-[28px] bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.12)] sm:p-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>

          <div className="mt-7 flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#ef4444] text-white emergency-pulse">
              <Ambulance className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#ef4444]">
                Emergency ambulance
              </p>
              <h1 className="mt-2 text-3xl font-semibold leading-tight text-ink sm:text-4xl">
                Request an ambulance now
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Share location, add contact details, and nearby ambulance units can accept the request immediately.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-[#fff7ed] p-4 text-sm text-[#9a3412]">
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
              <p>
                For life-threatening emergencies, also call the official local emergency number.
              </p>
            </div>
          </div>

          {message ? (
            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-[#fee2e2] px-4 py-3 text-sm text-[#991b1b]">
              <AlertTriangle className="h-4 w-4" />
              {message}
            </div>
          ) : null}

          {request ? (
            <TrackingPanel request={request} onClear={clearTracking} />
          ) : (
            <form className="mt-7 space-y-4" onSubmit={(event) => event.preventDefault()}>
              <Field label="Patient name" icon={User}>
                <input
                  value={patientName}
                  onChange={(event) => setPatientName(event.target.value)}
                  autoComplete="name"
                  placeholder="Name"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-ink outline-none transition focus:border-[#ef4444]"
                />
              </Field>

              <Field label="Contact number" icon={Phone}>
                <input
                  value={patientPhone}
                  onChange={(event) => setPatientPhone(event.target.value)}
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="Phone"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-ink outline-none transition focus:border-[#ef4444]"
                />
              </Field>

              <Field label="Pickup landmark" icon={MapPin}>
                <input
                  value={pickupAddress}
                  onChange={(event) => setPickupAddress(event.target.value)}
                  placeholder="Apartment, street, landmark"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-ink outline-none transition focus:border-[#ef4444]"
                />
              </Field>

              <button
                type="button"
                onClick={shareLocation}
                disabled={loadingLocation}
                className={`flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-semibold transition ${
                  latitude !== null && longitude !== null
                    ? "bg-[#dcfce7] text-[#166534]"
                    : "bg-[#f8f7f4] text-ink hover:bg-[#fee2e2]"
                }`}
              >
                <LocateFixed className="h-4 w-4" />
                {loadingLocation
                  ? "Getting GPS..."
                  : latitude !== null && longitude !== null
                    ? "Location ready"
                    : "Share current location"}
              </button>

              <button
                type="button"
                onClick={createRequest}
                disabled={submitting}
                className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#ef4444] text-base font-bold text-white shadow-[0_16px_34px_rgba(239,68,68,0.28)] transition hover:bg-[#dc2626] disabled:opacity-60"
              >
                <Ambulance className="h-5 w-5" />
                {submitting ? "Requesting..." : "Request Ambulance Now"}
              </button>
            </form>
          )}
        </section>

        <section className="min-h-[520px] overflow-hidden rounded-[28px] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
          {request || (latitude !== null && longitude !== null) ? (
            <iframe
              title="Emergency ambulance map"
              src={buildOsmEmbedUrl(
                request?.ambulanceUnit?.currentLatitude ?? request?.pickupLatitude ?? latitude ?? 0,
                request?.ambulanceUnit?.currentLongitude ?? request?.pickupLongitude ?? longitude ?? 0,
              )}
              className="h-full min-h-[520px] w-full border-0"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full min-h-[520px] items-center justify-center bg-[#dedede] px-8 text-center">
              <div>
                <MapPin className="mx-auto h-10 w-10 text-slate-500" />
                <p className="mt-4 text-sm font-semibold text-ink">Pickup map appears after GPS is shared.</p>
                <p className="mt-2 text-xs text-slate-500">Map data © OpenStreetMap contributors.</p>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function TrackingPanel({ request, onClear }: { request: EmergencyRequest; onClear: () => void }) {
  const statusIndex = statusSteps.findIndex((step) => step.status === request.status);

  return (
    <div className="mt-7 space-y-5">
      <div className="rounded-2xl bg-[#f8f7f4] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Request status
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-ink">{formatStatus(request.status)}</h2>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
            {formatTime(request.statusUpdatedAt)}
          </span>
        </div>

        <div className="mt-5 space-y-3">
          {statusSteps.map((step, index) => {
            const active = index <= statusIndex && request.status !== "cancelled";

            return (
              <div key={step.status} className="flex items-center gap-3">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    active ? "bg-[#16a34a] text-white" : "bg-white text-slate-400"
                  }`}
                >
                  {active ? <CheckCircle2 className="h-4 w-4" /> : <Clock3 className="h-4 w-4" />}
                </span>
                <span className={`text-sm font-semibold ${active ? "text-ink" : "text-slate-400"}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {request.ambulanceUnit ? (
        <div className="rounded-2xl bg-[#fee2e2] p-4 text-sm text-[#7f1d1d]">
          <div className="flex items-start gap-3">
            <Ambulance className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold text-[#7f1d1d]">
                {request.ambulanceUnit.vehicleNumber}
              </p>
              <p className="mt-1">
                {request.ambulanceUnit.driverName || "Ambulance driver"} is assigned.
              </p>
              {request.ambulanceUnit.driverPhone ? (
                <a
                  href={`tel:${request.ambulanceUnit.driverPhone}`}
                  className="mt-3 inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-xs font-semibold text-[#7f1d1d]"
                >
                  <Phone className="h-4 w-4" />
                  Call driver
                </a>
              ) : null}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-[#fff7ed] p-4 text-sm text-[#9a3412]">
          <div className="flex items-start gap-3">
            <Navigation className="mt-0.5 h-5 w-5 shrink-0" />
            <p>Nearby ambulance units are being checked for first acceptance.</p>
          </div>
        </div>
      )}

      {["completed", "cancelled"].includes(request.status) ? (
        <button
          type="button"
          onClick={onClear}
          className="h-11 rounded-full bg-white px-5 text-sm font-semibold text-ink shadow-[0_12px_28px_rgba(15,23,42,0.08)]"
        >
          Start new request
        </button>
      ) : null}
    </div>
  );
}

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: ComponentType<{ className?: string }>;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-ink">{label}</span>
      <span className="relative block">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        {children}
      </span>
    </label>
  );
}

const statusSteps = [
  { status: "requested", label: "Request sent" },
  { status: "accepted", label: "Ambulance accepted" },
  { status: "en_route", label: "Driver en route" },
  { status: "arrived", label: "Ambulance arrived" },
  { status: "transporting", label: "Transporting patient" },
  { status: "completed", label: "Completed" },
] as const;

function formatStatus(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function buildOsmEmbedUrl(latitude: number, longitude: number) {
  const delta = 0.012;
  const left = longitude - delta;
  const right = longitude + delta;
  const top = latitude + delta;
  const bottom = latitude - delta;

  return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${latitude}%2C${longitude}`;
}
