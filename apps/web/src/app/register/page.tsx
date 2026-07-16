"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Eye, EyeOff, HeartPulse, Lock, Mail, User } from "lucide-react";
import { useRouter } from "next/navigation";

import { apiRequest } from "@/lib/api";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await apiRequest<{
        session: { id: string };
      }>("/auth/signup/begin", {
        method: "POST",
        body: {
          actorType: "patient",
          signupMethod: "email_password",
          email,
          fullName,
        },
      });

      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            actorType: "patient",
            fullName,
            onboardingSessionId: response.session.id,
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data.session?.access_token) {
        await apiRequest("/auth/sync-profile", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${data.session.access_token}`,
          },
          body: {
            actorType: "patient",
            onboardingSessionId: response.session.id,
          },
        });

        router.push("/profile-completion");
        return;
      }

      setMessage("Account created. Check your email to verify and continue.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-body transition-colors hover:text-heading"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="neu-card p-8">
          <div className="mb-6 flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white">
              <HeartPulse className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-bold text-heading">EHC</span>
              <span className="block text-[10px] font-medium leading-none text-body">
                Electronic Healthcare
              </span>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-heading">Create your patient account</h1>
          <p className="mt-1 text-sm text-body">
            Quick registration for independent patients. Use guided signup for admin or facility roles.
          </p>

          <form className="mt-6 space-y-4" onSubmit={submit}>
            <div>
              <label htmlFor="name" className="mb-1.5 block text-xs font-semibold text-heading">
                Full name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-body" />
                <input
                  id="name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  type="text"
                  placeholder="Your full name"
                  className="neu-inset w-full rounded-[14px] border border-border bg-surface py-3 pl-10 pr-4 text-sm text-heading placeholder:text-body/50 transition-all focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-heading">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-body" />
                <input
                  id="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  placeholder="you@example.com"
                  className="neu-inset w-full rounded-[14px] border border-border bg-surface py-3 pl-10 pr-4 text-sm text-heading placeholder:text-body/50 transition-all focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-semibold text-heading">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-body" />
                <input
                  id="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a secure password"
                  className="neu-inset w-full rounded-[14px] border border-border bg-surface py-3 pl-10 pr-10 text-sm text-heading placeholder:text-body/50 transition-all focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-body hover:text-heading"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {message ? <div className="rounded-2xl bg-skywash/30 px-4 py-3 text-sm text-heading">{message}</div> : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-[14px] bg-brand py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
            >
              Create Account
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-body">
              Need admin or partner access?{" "}
              <Link href="/signup" className="font-semibold text-brand transition-colors hover:text-brand-dark">
                Use guided signup
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
