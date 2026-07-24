"use client";

import { useEffect, useState } from "react";
import { AlertCircle, BadgeCheck, Eye, ShieldCheck, XCircle } from "lucide-react";

import { DashboardHero, DashboardPanel, DashboardStatCard } from "@/components/dashboard-shell";
import { useAuth } from "@/components/providers/auth-provider";
import { apiRequest } from "@/lib/api";

type DriverApplication = {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  serviceName: string;
  city: string;
  vehicleNumber: string;
  licenseNumber: string;
  ambulancePermitNumber: string;
  documents: Record<string, string>;
  status: "pending_verification" | "approved" | "rejected";
  adminNotes: string | null;
  reviewedAt: string | null;
  createdAt: string;
};

const documentLabels: Record<string, string> = {
  driverLicenseImage: "Driver license",
  vehicleRegistrationImage: "Vehicle RC / registration",
  ambulancePermitImage: "Ambulance permit",
  driverPhotoImage: "Driver photo",
};

export default function AmbulanceVerificationPage() {
  const { session } = useAuth();
  const [applications, setApplications] = useState<DriverApplication[]>([]);
  const [status, setStatus] = useState("pending_verification");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const headers = session?.access_token
    ? {
        Authorization: `Bearer ${session.access_token}`,
      }
    : undefined;

  useEffect(() => {
    if (!headers) {
      return;
    }

    loadApplications();
  }, [session?.access_token, status]);

  async function loadApplications() {
    setLoading(true);
    try {
      const data = await apiRequest<DriverApplication[]>(
        `/emergency-ambulance/admin/driver-applications?status=${encodeURIComponent(status)}`,
        { headers },
      );
      setApplications(data);
      setMessage(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load driver applications.");
    } finally {
      setLoading(false);
    }
  }

  async function reviewApplication(id: string, nextStatus: "approved" | "rejected") {
    setSavingId(id);
    try {
      await apiRequest(`/emergency-ambulance/admin/driver-applications/${id}/review`, {
        method: "PATCH",
        headers,
        body: {
          status: nextStatus,
          notes: notes[id] || undefined,
        },
      });
      await loadApplications();
      setMessage(`Application ${nextStatus}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not review application.");
    } finally {
      setSavingId(null);
    }
  }

  const pendingCount = applications.filter((application) => application.status === "pending_verification").length;

  return (
    <div className="space-y-5">
      <DashboardHero
        eyebrow="Super admin"
        title="Ambulance driver verification"
        description="Review independent driver identity, vehicle registration, ambulance permit, and driver photo before allowing dispatch."
      >
        {message ? (
          <div className="mb-4 flex items-center gap-2 rounded-2xl bg-[#fff7ed] px-4 py-3 text-sm text-[#9a3412]">
            <AlertCircle className="h-4 w-4" />
            {message}
          </div>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-3">
          <DashboardStatCard icon={ShieldCheck} label="Loaded applications" value={loading ? "..." : String(applications.length)} tone="blue" />
          <DashboardStatCard icon={Eye} label="Pending review" value={loading ? "..." : String(pendingCount)} tone="green" />
          <DashboardStatCard icon={BadgeCheck} label="Filter" value={formatStatus(status)} tone="slate" />
        </div>
      </DashboardHero>

      <DashboardPanel eyebrow="Queue" title="Applications">
        <div className="mb-5 flex flex-wrap gap-2">
          {["pending_verification", "approved", "rejected"].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setStatus(item)}
              className={`h-10 rounded-full px-4 text-sm font-semibold ${
                status === item ? "bg-[#0057FF] text-white" : "bg-[#dedede] text-ink"
              }`}
            >
              {formatStatus(item)}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="rounded-2xl bg-[#dedede] px-4 py-4 text-sm text-slate-600">
              Loading applications...
            </div>
          ) : null}

          {!loading && applications.length === 0 ? (
            <div className="rounded-2xl bg-[#dedede] px-4 py-4 text-sm text-slate-600">
              No applications found for this filter.
            </div>
          ) : null}

          {applications.map((application) => (
            <article key={application.id} className="rounded-2xl bg-[#dedede] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-ink">{application.fullName}</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {application.serviceName} - {application.city}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {application.vehicleNumber} - License {application.licenseNumber} - Permit {application.ambulancePermitNumber}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {application.phone} {application.email ? `- ${application.email}` : ""}
                  </p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink">
                  {formatStatus(application.status)}
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {Object.entries(documentLabels).map(([key, label]) => (
                  <a
                    key={key}
                    href={application.documents[key]}
                    target="_blank"
                    rel="noreferrer"
                    className="overflow-hidden rounded-2xl bg-white text-xs font-semibold text-ink"
                  >
                    {application.documents[key] ? (
                      <img
                        src={application.documents[key]}
                        alt={label}
                        className="h-32 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-32 items-center justify-center text-slate-400">
                        Missing image
                      </div>
                    )}
                    <span className="block px-3 py-2">{label}</span>
                  </a>
                ))}
              </div>

              {application.status === "pending_verification" ? (
                <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto_auto]">
                  <input
                    value={notes[application.id] ?? ""}
                    onChange={(event) =>
                      setNotes((current) => ({ ...current, [application.id]: event.target.value }))
                    }
                    placeholder="Admin notes"
                    className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-ink outline-none"
                  />
                  <button
                    type="button"
                    disabled={savingId === application.id}
                    onClick={() => reviewApplication(application.id, "approved")}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#16a34a] px-4 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    <BadgeCheck className="h-4 w-4" />
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={savingId === application.id}
                    onClick={() => reviewApplication(application.id, "rejected")}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#ef4444] px-4 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </DashboardPanel>
    </div>
  );
}

function formatStatus(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}
