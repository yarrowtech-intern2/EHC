import { ReactNode } from "react";

interface DashboardCardProps {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}

export function DashboardCard({
  eyebrow,
  title,
  description,
  children,
}: DashboardCardProps) {
  return (
    <section className="rounded-[28px] border border-sapphire/10 bg-cloud p-5 shadow-card">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-azure">
        {eyebrow}
      </p>
      <h3 className="mt-3 text-xl font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      {children ? <div className="mt-5">{children}</div> : null}
    </section>
  );
}
