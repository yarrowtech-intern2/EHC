"use client";

import { ShieldCheck, Lock, FileCheck, ScrollText } from "lucide-react";
import { FadeIn } from "../common/FadeIn";
import { EditorialHighlight, EditorialTitle } from "../common/EditorialTitle";

const principles = [
  { icon: ShieldCheck, title: "Role-Based Access", desc: "Each user type sees only what they are authorised to access." },
  { icon: Lock, title: "Encryption", desc: "Health data is encrypted in transit and at rest." },
  { icon: FileCheck, title: "Secure Storage", desc: "Records stored with controlled access and versioning." },
  { icon: ScrollText, title: "Audit Logs", desc: "Platform actions logged for transparency." },
];

const access = [
  { role: "Patient", scope: "Personal data", color: "bg-brand" },
  { role: "Doctor", scope: "Authorised patient records", color: "bg-ai-purple" },
  { role: "Provider", scope: "Operational data", color: "bg-success" },
  { role: "Admin", scope: "Platform controls", color: "bg-warning" },
];

export function SecuritySection() {
  return (
    <section id="security" className="py-20 sm:py-28 px-5 sm:px-8">
      <div className="mx-auto max-w-[1200px]">
        <FadeIn className="text-center mb-14 max-w-2xl mx-auto">
          <EditorialTitle
            as="h2"
            size="section"
            className="mx-auto max-w-[860px]"
            lines={[
              "Information",
              <>
                <EditorialHighlight>protected</EditorialHighlight> by design.
              </>,
            ]}
          />
        </FadeIn>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-14">
          {principles.map(({ icon: Icon, title, desc }, i) => (
            <FadeIn key={title} delay={i * 0.06}>
              <div className="text-center">
                <Icon className="w-6 h-6 text-primary-text mx-auto mb-3" strokeWidth={1.5} />
                <h3 className="text-[14px] font-semibold text-primary-text">{title}</h3>
                <p className="mt-1.5 text-[13px] text-secondary-text leading-relaxed">{desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.15}>
          <div className="max-w-lg mx-auto space-y-2">
            {access.map(({ role, scope, color }) => (
              <div key={role} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-soft-bg">
                <div className={`w-1.5 h-1.5 rounded-full ${color} shrink-0`} />
                <span className="text-[13px] font-medium text-primary-text w-20 shrink-0">{role}</span>
                <div className="h-px flex-1 border-t border-dashed border-gray-200" />
                <span className="text-[13px] text-secondary-text">{scope}</span>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
