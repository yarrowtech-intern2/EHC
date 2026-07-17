import { type ElementType, type ReactNode } from "react";

type EditorialTitleProps = {
  as?: ElementType;
  align?: "left" | "center";
  size?: "hero" | "section" | "subsection";
  lines: ReactNode[];
  className?: string;
};

export function EditorialTitle({
  as,
  align = "center",
  size = "section",
  lines,
  className = "",
}: EditorialTitleProps) {
  const Component = (as ?? "h2") as ElementType;

  const sizeClass =
    size === "hero"
      ? "text-[46px] sm:text-[56px] xl:text-[80px] leading-[0.9]"
      : size === "subsection"
        ? "text-[34px] sm:text-[44px] xl:text-[56px] leading-[0.93]"
        : "text-[40px] sm:text-[50px] xl:text-[68px] leading-[0.91]";

  const alignClass = align === "left" ? "text-left" : "text-center";

  return (
    <Component
      className={`${sizeClass} ${alignClass} font-normal tracking-[-0.055em] text-primary-text ${className}`.trim()}
    >
      {lines.map((line, index) => (
        <span key={index} className="block">
          {line}
        </span>
      ))}
    </Component>
  );
}

export function EditorialHighlight({ children }: { children: ReactNode }) {
  return (
    <span className="relative inline-block px-[0.08em] leading-none">
      <span className="relative z-10">{children}</span>
      <span
        className="absolute -left-2 -right-2 -top-1 bottom-[-1px] origin-left rotate-[-2.5deg] bg-[#aaa6ff]"
        aria-hidden="true"
      />
    </span>
  );
}
