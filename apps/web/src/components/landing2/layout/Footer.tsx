import Link from "next/link";
import { HeartPulse } from "lucide-react";

const columns = [
  {
    title: "Company",
    links: [
      { label: "About", href: "#faq" },
      { label: "Contact", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Partners", href: "/partner-registration" },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "Doctors", href: "#services" },
      { label: "Ambulance", href: "#services" },
      { label: "Blood Bank", href: "#services" },
      { label: "Pharmacy", href: "#services" },
      { label: "Diagnostics", href: "#services" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Centre", href: "#" },
      { label: "FAQ", href: "#faq" },
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign In", href: "/login" },
      { label: "Register", href: "/register" },
      { label: "Partner Registration", href: "/partner-registration" },
      { label: "Request Demo", href: "/request-demo" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-[#f3f1ef] text-primary-text">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8 py-14 sm:py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-6">
          <div className="lg:col-span-2">
            <Link href="/landing2" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand text-white">
                <HeartPulse className="h-3.5 w-3.5" />
              </div>
              <span className="text-[14px] font-semibold tracking-tight">EHC</span>
            </Link>
            <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-secondary-text">
              Connecting patients and healthcare providers through one secure
              digital platform.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-3 text-[11px] font-medium uppercase tracking-[0.1em] text-secondary-text">
                {col.title}
              </h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-secondary-text transition-colors hover:text-primary-text"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-brand/10 pt-6 sm:flex-row">
          <p className="text-[11px] text-secondary-text">
            &copy; {new Date().getFullYear()} EHC - Electronic Healthcare
          </p>
          <div className="flex items-center gap-4">
            {["Twitter", "LinkedIn", "GitHub"].map((s) => (
              <a
                key={s}
                href="#"
                className="text-[11px] text-secondary-text transition-colors hover:text-primary-text"
                aria-label={s}
              >
                {s}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
