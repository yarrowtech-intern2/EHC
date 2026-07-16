"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, HeartPulse, Lock, Mail } from "lucide-react";

import { getAuthRedirectPath, getSupabaseBrowserClient, savePendingSignup } from "@/lib/supabase-browser";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const nextPath = useMemo(() => {
    if (typeof window === "undefined") {
      return "/profile-completion";
    }

    return new URLSearchParams(window.location.search).get("next") ?? "/profile-completion";
  }, []);

  const signInWithPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      const actorType = data.user?.user_metadata?.actorType ?? "patient";
      router.push(nextPath === "/profile-completion" ? getAuthRedirectPath(actorType) : nextPath);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not sign in.");
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const supabase = getSupabaseBrowserClient();
      savePendingSignup({
        actorType: "patient",
        signupMethod: "google",
        nextPath,
      });

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      setLoading(false);
      setMessage(error instanceof Error ? error.message : "Google sign in failed.");
    }
  };

  const sendMagicLink = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const supabase = getSupabaseBrowserClient();
      savePendingSignup({
        actorType: "patient",
        signupMethod: "magic_link",
        nextPath,
      });

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }

      setMessage("Magic link sent. Check your email to continue.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not send magic link.");
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

          <h1 className="text-2xl font-bold text-heading">Welcome back</h1>
          <p className="mt-1 text-sm text-body">Sign in to continue your healthcare journey.</p>

          <form className="mt-6 space-y-4" onSubmit={signInWithPassword}>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-heading">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-body" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
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
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
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
              Sign In
            </button>
          </form>

          <div className="mt-4 grid gap-3">
            <button
              type="button"
              onClick={signInWithGoogle}
              disabled={loading}
              className="w-full rounded-[14px] border border-border bg-white/80 px-4 py-3 text-sm font-semibold text-heading"
            >
              Continue with Google
            </button>
            <button
              type="button"
              onClick={sendMagicLink}
              disabled={loading || !email}
              className="w-full rounded-[14px] border border-brand/20 bg-white/70 px-4 py-3 text-sm font-semibold text-brand disabled:opacity-60"
            >
              Send magic link
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-body">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="font-semibold text-brand transition-colors hover:text-brand-dark">
                Start guided signup
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
