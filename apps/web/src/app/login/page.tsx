"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Cross } from "lucide-react";

import {
  getAuthRedirectPath,
  getSupabaseBrowserClient,
  savePendingSignup,
} from "@/lib/supabase-browser";

const logoImage =
  "https://res.cloudinary.com/dc3qprub3/image/upload/f_auto,q_auto,w_160/v1784277032/1_i9ichu.png";

const navLinks = [
  { label: "Services", href: "/landing2#services" },
  { label: "Platform", href: "/landing2#platform" },
  { label: "Partners", href: "/landing2#partners" },
  { label: "Security", href: "/landing2#security" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  return (
    <main className="min-h-screen bg-[#efefeb] text-[#050608]">
      <header className="mx-auto flex h-[76px] w-full max-w-[1740px] items-center justify-between px-5 sm:px-[8.4vw]">
        <Link href="/" className="flex shrink-0 items-center">
          <img
            src={logoImage}
            alt="EHC"
            className="h-7 w-auto select-none sm:h-8"
            loading="eager"
            decoding="async"
            draggable={false}
          />
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Login page navigation">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-[14px] font-medium text-[#090b13] transition-colors hover:text-[#7779fc]"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/emergency-ambulance"
            className="flex h-9 w-9 items-center justify-center bg-[#ffd5d8] text-emergency transition-colors hover:bg-[#ffc2c6]"
            aria-label="Emergency Ambulance"
          >
            <Cross className="h-5 w-5 fill-emergency stroke-emergency" />
          </Link>
        </nav>
      </header>

      <section className="flex min-h-[calc(100vh-76px)] items-start justify-center px-5 pt-[92px] sm:pt-[86px]">
        <div className="w-full max-w-[439px]">
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#d9d9d9] text-[#5d5d5d] transition-colors hover:bg-[#cecece]"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="rounded-[36px] bg-[#d2d2d2] px-[68px] pb-[55px] pt-[48px] shadow-[inset_-30px_-23px_87px_rgba(0,0,0,0.21),inset_40px_39px_109.3px_rgba(255,255,255,0.71)] max-[520px]:px-8">
            <h1 className="text-[34px] font-semibold leading-none tracking-[-0.03em] text-[#7779fc]">
              Welcome Back
            </h1>
            <p className="mt-1 text-[13px] font-normal text-[#6f6f6f]">
              Sign in to continue
            </p>

            <form className="mt-8" onSubmit={signInWithPassword}>
              <label className="block text-[12px] font-medium text-[#707070]" htmlFor="email">
                Email/Phone
              </label>
              <input
                id="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 h-[39px] w-full rounded-[10px] border-2 border-[#aaa6ff] bg-[#efefeb] px-3 text-[14px] outline-none transition-shadow focus:shadow-[0_0_0_3px_rgba(170,166,255,0.22)]"
              />

              <label className="mt-5 block text-[12px] font-medium text-[#707070]" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 h-[39px] w-full rounded-[10px] border-2 border-[#aaa6ff] bg-[#efefeb] px-3 text-[14px] outline-none transition-shadow focus:shadow-[0_0_0_3px_rgba(170,166,255,0.22)]"
              />

              {message ? (
                <div className="mt-4 rounded-[12px] bg-white/50 px-3 py-2 text-[12px] leading-5 text-[#444]">
                  {message}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="mx-auto mt-6 flex h-[30px] w-[160px] items-center justify-center rounded-full bg-[#aaa6ff] text-[11px] font-medium text-[#050608] shadow-[inset_10px_9px_20.6px_0_rgba(255,255,255,0.32),5px_5px_7px_0_rgba(0,0,0,0.18)] transition hover:brightness-105 disabled:opacity-60"
              >
                Sign in
              </button>
            </form>

            <button
              type="button"
              onClick={signInWithGoogle}
              disabled={loading}
              className="mx-auto mt-6 flex h-[34px] items-center gap-2 rounded-full bg-white px-5 text-[11px] font-semibold text-[#050608] shadow-[inset_5px_5px_12px_rgba(255,255,255,0.75),5px_8px_18px_rgba(0,0,0,0.22)] transition hover:brightness-105 disabled:opacity-60"
            >
              <span className="flex h-4 w-4 items-center justify-center rounded-full text-[13px] font-bold text-[#4285f4]">
                G
              </span>
              Login with Google
            </button>
          </div>

          <p className="mt-5 text-center text-[13px] text-[#575757]">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-bold uppercase text-[#7779fc]">
              Register
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
