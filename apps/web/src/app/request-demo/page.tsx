"use client";

import Link from "next/link";
import {
  ArrowLeft,
  HeartPulse,
  Building2,
  Mail,
  Phone,
  User,
  MessageSquare,
} from "lucide-react";

export default function DemoRequestPage() {
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

          <h1 className="text-2xl font-bold text-heading">Request a Demo</h1>
          <p className="mt-1 text-sm text-body">
            See how EHC can transform your healthcare operations.
          </p>

          <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label
                htmlFor="d-name"
                className="block text-xs font-semibold text-heading mb-1.5"
              >
                Full name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-body" />
                <input
                  id="d-name"
                  type="text"
                  placeholder="Your name"
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-[14px] bg-surface border border-border text-heading placeholder:text-body/50 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all neu-inset"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="d-org"
                className="block text-xs font-semibold text-heading mb-1.5"
              >
                Organisation
              </label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-body" />
                <input
                  id="d-org"
                  type="text"
                  placeholder="Organisation name"
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-[14px] bg-surface border border-border text-heading placeholder:text-body/50 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all neu-inset"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="d-email"
                  className="block text-xs font-semibold text-heading mb-1.5"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-body" />
                  <input
                    id="d-email"
                    type="email"
                    placeholder="Email"
                    className="w-full pl-10 pr-4 py-3 text-sm rounded-[14px] bg-surface border border-border text-heading placeholder:text-body/50 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all neu-inset"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="d-phone"
                  className="block text-xs font-semibold text-heading mb-1.5"
                >
                  Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-body" />
                  <input
                    id="d-phone"
                    type="tel"
                    placeholder="Phone"
                    className="w-full pl-10 pr-4 py-3 text-sm rounded-[14px] bg-surface border border-border text-heading placeholder:text-body/50 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all neu-inset"
                  />
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="d-message"
                className="block text-xs font-semibold text-heading mb-1.5"
              >
                Message (optional)
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3.5 top-3.5 h-4 w-4 text-body" />
                <textarea
                  id="d-message"
                  rows={3}
                  placeholder="Tell us about your requirements"
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-[14px] bg-surface border border-border text-heading placeholder:text-body/50 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all neu-inset resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-brand text-white text-sm font-semibold rounded-[14px] hover:bg-brand-dark transition-colors shadow-lg shadow-brand/20"
            >
              Request Demo
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-body">
              Ready to join?{" "}
              <Link
                href="/partner-registration"
                className="font-semibold text-brand hover:text-brand-dark transition-colors"
              >
                Become a partner
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
