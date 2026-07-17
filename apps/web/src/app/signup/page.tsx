import Link from "next/link";
import { ArrowLeft, Cross } from "lucide-react";

import { PatientSignupForm } from "@/components/patient-signup-form";

const logoImage =
  "https://res.cloudinary.com/dc3qprub3/image/upload/f_auto,q_auto,w_160/v1784277032/1_i9ichu.png";

const navLinks = [
  { label: "Services", href: "/landing2#services" },
  { label: "Platform", href: "/landing2#platform" },
  { label: "Partners", href: "/landing2#partners" },
  { label: "Security", href: "/landing2#security" },
];

export default function SignupPage() {
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

        <nav className="hidden items-center gap-8 md:flex" aria-label="Signup page navigation">
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

      <section className="flex min-h-[calc(100vh-76px)] items-start justify-center px-5 pt-[54px] sm:pt-[60px]">
        <div className="w-full max-w-[520px]">
          <Link
            href="/"
            className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#d9d9d9] text-[#5d5d5d] transition-colors hover:bg-[#cecece]"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <PatientSignupForm />

          <p className="mt-5 text-center text-[13px] text-[#575757]">
            Already have an account?{" "}
            <Link href="/login" className="font-bold uppercase text-[#7779fc]">
              Sign in
            </Link>
          </p>
          <p className="mt-2 text-center text-[13px] text-[#575757]">
            Healthcare provider?{" "}
            <Link href="/provider-signup" className="font-bold uppercase text-[#7779fc]">
              Provider signup
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
