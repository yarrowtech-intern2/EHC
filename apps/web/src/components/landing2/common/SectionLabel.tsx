interface SectionLabelProps {
  label?: string;
  dark?: boolean;
}

export function SectionLabel({ label, dark }: SectionLabelProps) {
  if (!label) return null;
  return (
    <span
      className={`inline-block text-[13px] font-semibold uppercase tracking-[0.15em] mb-5 ${
        dark ? "text-brand" : "text-brand"
      }`}
    >
      {label}
    </span>
  );
}
