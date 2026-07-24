"use client";

import { useEffect, useState, type ChangeEvent, type ComponentType } from "react";
import {
  AlertCircle,
  Ambulance,
  BadgeCheck,
  Camera,
  FileImage,
  IdCard,
  LoaderCircle,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";

import { AuthGuard } from "@/components/guards/auth-guard";
import { useAuth } from "@/components/providers/auth-provider";
import { apiRequest } from "@/lib/api";

type DriverApplication = {
  id: string;
  serviceName: string;
  city: string;
  vehicleNumber: string;
  status: "pending_verification" | "approved" | "rejected";
  adminNotes: string | null;
  reviewedAt: string | null;
  createdAt: string;
};

type DocumentKey =
  | "driverLicenseImage"
  | "vehicleRegistrationImage"
  | "ambulancePermitImage"
  | "driverPhotoImage";

const documentFields: Array<{ key: DocumentKey; label: string }> = [
  { key: "driverLicenseImage", label: "Driver license image" },
  { key: "vehicleRegistrationImage", label: "Vehicle RC / registration image" },
  { key: "ambulancePermitImage", label: "Ambulance permit image" },
  { key: "driverPhotoImage", label: "Driver photo" },
];

export default function AmbulanceDriverOnboardingPage() {
  return (
    <AuthGuard allowedActors={["ambulance_driver"]}>
      <AmbulanceDriverOnboardingContent />
    </AuthGuard>
  );
}

function AmbulanceDriverOnboardingContent() {
  const { session, sessionContext, user } = useAuth();
  const [application, setApplication] = useState<DriverApplication | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    serviceName: "",
    city: "",
    vehicleNumber: "",
    licenseNumber: "",
    ambulancePermitNumber: "",
  });
  const [documents, setDocuments] = useState<Record<DocumentKey, string>>({
    driverLicenseImage: "",
    vehicleRegistrationImage: "",
    ambulancePermitImage: "",
    driverPhotoImage: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const headers = session?.access_token
    ? {
        Authorization: `Bearer ${session.access_token}`,
      }
    : undefined;

  useEffect(() => {
    setForm((current) => ({
      ...current,
      fullName:
        sessionContext?.profile?.full_name ||
        user?.user_metadata?.fullName ||
        user?.email?.split("@")[0] ||
        current.fullName,
      email: sessionContext?.profile?.email || user?.email || current.email,
      phone: sessionContext?.profile?.phone || current.phone,
      serviceName:
        sessionContext?.profile?.full_name || user?.user_metadata?.fullName
          ? `${sessionContext?.profile?.full_name || user?.user_metadata?.fullName} Ambulance`
          : current.serviceName,
    }));
  }, [sessionContext?.profile, user]);

  useEffect(() => {
    if (!headers) {
      return;
    }

    apiRequest<DriverApplication | null>("/emergency-ambulance/driver/application", { headers })
      .then(setApplication)
      .catch((error) =>
        setMessage(error instanceof Error ? error.message : "Could not load driver application."),
      )
      .finally(() => setLoading(false));
  }, [session?.access_token]);

  async function handleFile(key: DocumentKey, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setMessage("Upload image files only.");
      return;
    }

    if (file.size > 900 * 1024) {
      setMessage("Each image must be under 900 KB for this MVP upload path.");
      return;
    }

    const dataUrl = await readFileAsDataUrl(file);
    setDocuments((current) => ({ ...current, [key]: dataUrl }));
    setMessage(null);
  }

  async function submitApplication() {
    const missingDoc = documentFields.find((field) => !documents[field.key]);

    if (missingDoc) {
      setMessage(`${missingDoc.label} is required.`);
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const response = await apiRequest<{ application: DriverApplication }>(
        "/emergency-ambulance/driver/applications",
        {
          method: "POST",
          headers,
          body: {
            ...form,
            documents,
          },
        },
      );
      setApplication(response.application);
      setMessage("Verification submitted. Admin approval is required before you can accept rides.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not submit verification.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f7f4] px-4 py-6 text-ink">
      <div className="mx-auto max-w-5xl space-y-5">
        <section className="rounded-[28px] bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.12)] sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-13 w-13 items-center justify-center rounded-full bg-[#ef4444] text-white">
                <Ambulance className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#ef4444]">
                  Independent driver
                </p>
                <h1 className="mt-2 text-3xl font-semibold text-ink">Ambulance verification</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Submit your driver, vehicle, and permit documents. Your ambulance stays offline until an admin approves it.
                </p>
              </div>
            </div>
            <StatusPill status={application?.status ?? "pending_verification"} />
          </div>

          {message ? (
            <div className="mt-5 flex items-center gap-2 rounded-2xl bg-[#fff7ed] px-4 py-3 text-sm text-[#9a3412]">
              <AlertCircle className="h-4 w-4" />
              {message}
            </div>
          ) : null}
        </section>

        {loading ? (
          <div className="rounded-[24px] bg-white p-5 text-sm text-slate-500">
            Loading verification status...
          </div>
        ) : application ? (
          <section className="rounded-[28px] bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.06)] sm:p-6">
            <div className="flex items-start gap-4">
              <BadgeCheck className="mt-1 h-6 w-6 text-[#0057FF]" />
              <div>
                <h2 className="text-xl font-semibold text-ink">{application.serviceName}</h2>
                <p className="mt-2 text-sm text-slate-500">
                  {application.vehicleNumber} - {application.city}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Status: {formatStatus(application.status)}
                </p>
                {application.adminNotes ? (
                  <p className="mt-3 rounded-2xl bg-[#f8f7f4] px-4 py-3 text-sm text-slate-600">
                    {application.adminNotes}
                  </p>
                ) : null}
              </div>
            </div>
          </section>
        ) : (
          <section className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
            <div className="rounded-[28px] bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.06)] sm:p-6">
              <h2 className="text-xl font-semibold text-ink">Driver and vehicle details</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Input icon={IdCard} label="Full name" value={form.fullName} onChange={(value) => setForm((current) => ({ ...current, fullName: value }))} />
                <Input icon={Phone} label="Phone" value={form.phone} onChange={(value) => setForm((current) => ({ ...current, phone: value }))} />
                <Input icon={ShieldCheck} label="Service name" value={form.serviceName} onChange={(value) => setForm((current) => ({ ...current, serviceName: value }))} />
                <Input icon={MapPin} label="City" value={form.city} onChange={(value) => setForm((current) => ({ ...current, city: value }))} />
                <Input icon={Ambulance} label="Vehicle number" value={form.vehicleNumber} onChange={(value) => setForm((current) => ({ ...current, vehicleNumber: value }))} />
                <Input icon={IdCard} label="License number" value={form.licenseNumber} onChange={(value) => setForm((current) => ({ ...current, licenseNumber: value }))} />
                <Input icon={FileImage} label="Ambulance permit number" value={form.ambulancePermitNumber} onChange={(value) => setForm((current) => ({ ...current, ambulancePermitNumber: value }))} />
              </div>
            </div>

            <div className="rounded-[28px] bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.06)] sm:p-6">
              <h2 className="text-xl font-semibold text-ink">Document images</h2>
              <div className="mt-5 grid gap-3">
                {documentFields.map((field) => (
                  <label key={field.key} className="rounded-2xl bg-[#dedede] p-4 text-sm font-semibold text-ink">
                    <span className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2">
                        <Camera className="h-4 w-4 text-[#0057FF]" />
                        {field.label}
                      </span>
                      {documents[field.key] ? (
                        <span className="text-xs text-[#166534]">Added</span>
                      ) : null}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => handleFile(field.key, event)}
                      className="mt-3 block w-full text-xs text-slate-500"
                    />
                  </label>
                ))}
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={submitApplication}
                className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#0057FF] text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                Submit for verification
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function Input({
  icon: Icon,
  label,
  value,
  onChange,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm font-semibold text-ink">
      {label}
      <span className="relative mt-2 block">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-ink outline-none focus:border-[#0057FF]"
        />
      </span>
    </label>
  );
}

function StatusPill({ status }: { status: DriverApplication["status"] }) {
  const className =
    status === "approved"
      ? "bg-[#dcfce7] text-[#166534]"
      : status === "rejected"
        ? "bg-[#fee2e2] text-[#991b1b]"
        : "bg-[#fff7ed] text-[#9a3412]";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${className}`}>
      {formatStatus(status)}
    </span>
  );
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function formatStatus(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}
