"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  HeartPulse,
  Building2,
  Mail,
  Phone,
  User,
  Stethoscope,
  Ambulance,
  Droplets,
  Pill,
  Microscope,
} from "lucide-react";

const partnerTypes = [
  { id: "doctor", label: "Doctor", icon: Stethoscope },
  { id: "ambulance", label: "Ambulance", icon: Ambulance },
  { id: "blood-bank", label: "Blood Bank", icon: Droplets },
  { id: "pharmacy", label: "Pharmacy", icon: Pill },
  { id: "diagnostics", label: "Diagnostics", icon: Microscope },
];

export default function PartnerRegistrationPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-body hover:text-heading transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="neu-card p-8">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white">
              <HeartPulse className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-bold text-heading">EHC</span>
              <span className="block text-[10px] font-medium text-body leading-none">
                Electronic Healthcare
              </span>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-heading">
            Become an EHC Partner
          </h1>
          <p className="mt-1 text-sm text-body">
            Join the connected healthcare platform as a service provider.
          </p>

          <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
            {/* Partner type selection */}
            <div>
              <label className="block text-xs font-semibold text-heading mb-2">
                Partner type
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {partnerTypes.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelectedType(id)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl text-xs font-medium transition-all duration-200 ${
                      selectedType === id
                        ? "bg-brand text-white shadow-md shadow-brand/20"
                        : "neu-btn text-body hover:text-heading"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="org-name"
                className="block text-xs font-semibold text-heading mb-1.5"
              >
                Organisation name
              </label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-body" />
                <input
                  id="org-name"
                  type="text"
                  placeholder="Your organisation name"
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-[14px] bg-surface border border-border text-heading placeholder:text-body/50 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all neu-inset"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="contact-name"
                className="block text-xs font-semibold text-heading mb-1.5"
              >
                Contact person
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-body" />
                <input
                  id="contact-name"
                  type="text"
                  placeholder="Full name"
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-[14px] bg-surface border border-border text-heading placeholder:text-body/50 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all neu-inset"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="p-email"
                  className="block text-xs font-semibold text-heading mb-1.5"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-body" />
                  <input
                    id="p-email"
                    type="email"
                    placeholder="Email"
                    className="w-full pl-10 pr-4 py-3 text-sm rounded-[14px] bg-surface border border-border text-heading placeholder:text-body/50 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all neu-inset"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="p-phone"
                  className="block text-xs font-semibold text-heading mb-1.5"
                >
                  Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-body" />
                  <input
                    id="p-phone"
                    type="tel"
                    placeholder="Phone"
                    className="w-full pl-10 pr-4 py-3 text-sm rounded-[14px] bg-surface border border-border text-heading placeholder:text-body/50 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all neu-inset"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-brand text-white text-sm font-semibold rounded-[14px] hover:bg-brand-dark transition-colors shadow-lg shadow-brand/20"
            >
              Submit Partner Application
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-body">
              Want to see a demo first?{" "}
              <Link
                href="/request-demo"
                className="font-semibold text-brand hover:text-brand-dark transition-colors"
              >
                Request a demo
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
