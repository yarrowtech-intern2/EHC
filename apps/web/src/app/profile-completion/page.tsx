"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, HeartPulse, MapPin, Phone, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";

import { AuthGuard } from "@/components/guards/auth-guard";
import { useAuth } from "@/components/providers/auth-provider";
import { apiRequest } from "@/lib/api";

export default function ProfileCompletionPage() {
  return (
    <AuthGuard allowedActors={["patient"]}>
      <ProfileCompletionScreen />
    </AuthGuard>
  );
}

function ProfileCompletionScreen() {
  const router = useRouter();
  const { user, session } = useAuth();
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    preferredCity: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
  });
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setForm((current) => ({
      ...current,
      fullName:
        user?.user_metadata?.fullName ??
        user?.user_metadata?.full_name ??
        current.fullName,
      phone: user?.phone ?? current.phone,
    }));
  }, [user]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!session?.access_token) {
      setMessage("Session expired. Please sign in again.");
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      await apiRequest("/auth/profile-completion", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: form,
      });

      router.push("/discover");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save profile.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="neu-card p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white">
              <HeartPulse className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-brand">Patient onboarding</p>
              <h1 className="text-2xl font-bold text-heading">Complete your profile</h1>
            </div>
          </div>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-body">
            Patients are independent accounts in EHC. Add your basic details first,
            then continue to facility discovery and booking.
          </p>

          <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={submit}>
            <label className="text-sm font-medium text-heading sm:col-span-2">
              Full name
              <div className="relative mt-2">
                <UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-body" />
                <input
                  value={form.fullName}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, fullName: event.target.value }))
                  }
                  className="w-full rounded-[14px] border border-border bg-white/80 py-3 pl-10 pr-4 text-sm text-heading outline-none focus:border-brand"
                  placeholder="Your full name"
                />
              </div>
            </label>

            <label className="text-sm font-medium text-heading">
              Phone
              <div className="relative mt-2">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-body" />
                <input
                  value={form.phone}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, phone: event.target.value }))
                  }
                  className="w-full rounded-[14px] border border-border bg-white/80 py-3 pl-10 pr-4 text-sm text-heading outline-none focus:border-brand"
                  placeholder="+91 90000 00000"
                />
              </div>
            </label>

            <label className="text-sm font-medium text-heading">
              Preferred city
              <div className="relative mt-2">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-body" />
                <input
                  value={form.preferredCity}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, preferredCity: event.target.value }))
                  }
                  className="w-full rounded-[14px] border border-border bg-white/80 py-3 pl-10 pr-4 text-sm text-heading outline-none focus:border-brand"
                  placeholder="Kolkata"
                />
              </div>
            </label>

            <label className="text-sm font-medium text-heading">
              Emergency contact name
              <input
                value={form.emergencyContactName}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    emergencyContactName: event.target.value,
                  }))
                }
                className="mt-2 w-full rounded-[14px] border border-border bg-white/80 px-4 py-3 text-sm text-heading outline-none focus:border-brand"
                placeholder="Emergency contact name"
              />
            </label>

            <label className="text-sm font-medium text-heading">
              Emergency contact phone
              <input
                value={form.emergencyContactPhone}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    emergencyContactPhone: event.target.value,
                  }))
                }
                className="mt-2 w-full rounded-[14px] border border-border bg-white/80 px-4 py-3 text-sm text-heading outline-none focus:border-brand"
                placeholder="+91 90000 00000"
              />
            </label>

            {message ? (
              <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 sm:col-span-2">
                {message}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 pt-2 sm:col-span-2 sm:flex-row">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-ambercare px-6 py-3 text-sm font-semibold text-heading transition hover:bg-[#c99e79] disabled:opacity-60"
              >
                Save and continue
                <ArrowRight className="h-4 w-4" />
              </button>
              <Link
                href="/discover"
                className="inline-flex items-center justify-center rounded-full border border-brand/20 bg-white/70 px-6 py-3 text-sm font-semibold text-heading"
              >
                Skip for now
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
