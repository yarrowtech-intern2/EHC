"use client";

import Link from "next/link";
import { Ambulance, MapPin, Navigation, Clock, User, Radio, Hospital } from "lucide-react";
import { FadeIn } from "../common/FadeIn";
import { VideoPlayer } from "../common/VideoPlayer";
import { cdn } from "@/data/landing2-assets";

const stats = [
  { icon: MapPin, label: "Location", value: "Detected" },
  { icon: Navigation, label: "Distance", value: "2.4 km" },
  { icon: Clock, label: "ETA", value: "8 min" },
  { icon: User, label: "Driver", value: "Assigned" },
  { icon: Radio, label: "Status", value: "En route" },
  { icon: Hospital, label: "Hospital", value: "City General" },
];

export function EmergencyExperience() {
  return (
    <section className="bg-background py-20 text-primary-text sm:py-28">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <FadeIn>
            <p className="mb-4 text-[13px] font-medium uppercase tracking-[0.14em] text-brand">
              Emergency Response
            </p>

            <h2 className="text-section leading-tight text-primary-text">
              Request help. Track the response.
            </h2>

            <p className="mt-4 max-w-md text-base leading-relaxed text-secondary-text">
              Request an ambulance, share your location and receive real-time
              arrival updates.
            </p>

            <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
              {stats.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 text-brand" strokeWidth={1.5} />
                  <div>
                    <p className="text-[11px] text-secondary-text">{label}</p>
                    <p className="font-onest text-[13px] font-medium text-primary-text">
                      {value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/emergency-ambulance"
                className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-brand-dark"
              >
                <Ambulance className="w-4 h-4" />
                Request Ambulance
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center rounded-full border border-brand/20 px-6 py-3 text-[14px] font-medium text-primary-text transition-colors hover:bg-white/60"
              >
                Track Existing Request
              </Link>
            </div>
          </FadeIn>

          <FadeIn direction="right" delay={0.1}>
            <VideoPlayer
              src={cdn.videos.ambulanceTracking}
              poster={cdn.posters.ambulanceTracking}
              className="rounded-2xl"
              aspectRatio="4/3"
            />
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
