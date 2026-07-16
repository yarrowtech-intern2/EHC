import Link from "next/link";
import { HeartPulse } from "lucide-react";

const footerColumns = [
  {
    title: "Company",
    links: [
      { label: "About EHC", href: "#about" },
      { label: "Contact", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Partner with EHC", href: "/partner-registration" },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "Doctor Appointments", href: "#services" },
      { label: "Ambulance", href: "#services" },
      { label: "Blood Bank", href: "#services" },
      { label: "Pharmacy", href: "#services" },
      { label: "Diagnostics", href: "#services" },
      { label: "Health Records", href: "#services" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Centre", href: "#" },
      { label: "FAQ", href: "#about" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms and Conditions", href: "/terms" },
      { label: "Feedback", href: "#" },
    ],
  },
  {
    title: "Authentication",
    links: [
      { label: "Sign In", href: "/login" },
      { label: "Create Account", href: "/register" },
      { label: "Partner Registration", href: "/partner-registration" },
      { label: "Request Demo", href: "/request-demo" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="px-4 sm:px-6 pb-8">
      <div className="mx-auto max-w-container">
        <div className="neu-card px-5 py-8 sm:px-8 sm:py-9">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-6 lg:gap-5">
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white">
                  <HeartPulse className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-base font-bold tracking-tight text-heading">
                    EHC
                  </span>
                  <span className="block text-[10px] font-medium text-body leading-none tracking-wide">
                    Electronic Healthcare
                  </span>
                </div>
              </Link>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-body">
                Connecting patients and healthcare providers through one secure
                digital platform.
              </p>
            </div>

            {footerColumns.map((column) => (
              <div key={column.title}>
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-heading">
                  {column.title}
                </h4>
                <ul className="space-y-2">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-body hover:text-heading transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-border pt-5 sm:flex-row">
            <p className="text-xs text-body">
              &copy; {new Date().getFullYear()} EHC - Electronic Healthcare. All
              rights reserved.
            </p>
            <div className="flex items-center gap-4">
              {["Twitter", "LinkedIn", "GitHub"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="text-xs text-body hover:text-heading transition-colors"
                  aria-label={social}
                >
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
