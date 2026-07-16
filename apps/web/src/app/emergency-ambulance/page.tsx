"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  Ambulance,
  MapPin,
  Phone,
  User,
  AlertTriangle,
  Navigation,
} from "lucide-react";

export default function EmergencyAmbulancePage() {
  const [locationShared, setLocationShared] = useState(false);

  const handleShareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => setLocationShared(true),
        () => setLocationShared(false)
      );
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-body hover:text-heading transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="rounded-3xl bg-emergency/[0.04] border-2 border-emergency/20 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emergency text-white emergency-pulse">
              <Ambulance className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-heading">
                Emergency Ambulance
              </h1>
              <p className="text-xs text-emergency font-semibold">
                Request immediate assistance
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-emergency/8 border border-emergency/15 p-4 mb-6">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-emergency mt-0.5 shrink-0" />
              <p className="text-xs text-heading leading-relaxed">
                For life-threatening emergencies, also contact your local
                emergency services directly.
              </p>
            </div>
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label
                htmlFor="e-name"
                className="block text-xs font-semibold text-heading mb-1.5"
              >
                Patient name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-body" />
                <input
                  id="e-name"
                  type="text"
                  placeholder="Patient name"
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-[14px] bg-white border border-border text-heading placeholder:text-body/50 focus:outline-none focus:ring-2 focus:ring-emergency/30 focus:border-emergency transition-all"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="e-phone"
                className="block text-xs font-semibold text-heading mb-1.5"
              >
                Contact number
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-body" />
                <input
                  id="e-phone"
                  type="tel"
                  placeholder="Phone number"
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-[14px] bg-white border border-border text-heading placeholder:text-body/50 focus:outline-none focus:ring-2 focus:ring-emergency/30 focus:border-emergency transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-heading mb-1.5">
                Location
              </label>
              <button
                type="button"
                onClick={handleShareLocation}
                className={`w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-[14px] transition-all ${
                  locationShared
                    ? "bg-success/10 text-success border border-success/20"
                    : "bg-white border border-border text-heading hover:border-emergency/30"
                }`}
              >
                {locationShared ? (
                  <>
                    <MapPin className="h-4 w-4" />
                    Location shared
                  </>
                ) : (
                  <>
                    <Navigation className="h-4 w-4" />
                    Share my location
                  </>
                )}
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-emergency text-white text-base font-bold rounded-[14px] hover:bg-red-600 transition-colors shadow-lg shadow-emergency/25 flex items-center justify-center gap-2"
            >
              <Ambulance className="h-5 w-5" />
              Request Ambulance Now
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm font-medium text-body hover:text-heading transition-colors"
            >
              Sign in to track an existing request
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
