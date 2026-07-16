"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  HeartPulse,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
} from "lucide-react";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);

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

          <h1 className="text-2xl font-bold text-heading">Create your account</h1>
          <p className="mt-1 text-sm text-body">
            Join the connected healthcare ecosystem.
          </p>

          <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-semibold text-heading mb-1.5"
              >
                Full name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-body" />
                <input
                  id="name"
                  type="text"
                  placeholder="Your full name"
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-[14px] bg-surface border border-border text-heading placeholder:text-body/50 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all neu-inset"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-heading mb-1.5"
              >
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-body" />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-[14px] bg-surface border border-border text-heading placeholder:text-body/50 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all neu-inset"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-heading mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-body" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a secure password"
                  className="w-full pl-10 pr-10 py-3 text-sm rounded-[14px] bg-surface border border-border text-heading placeholder:text-body/50 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all neu-inset"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-body hover:text-heading"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-brand text-white text-sm font-semibold rounded-[14px] hover:bg-brand-dark transition-colors shadow-lg shadow-brand/20"
            >
              Create Account
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-body">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-brand hover:text-brand-dark transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
