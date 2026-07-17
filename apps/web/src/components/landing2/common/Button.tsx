import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "emergency";

interface ButtonProps {
  href?: string;
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
}

const variants: Record<Variant, string> = {
  primary:
    "bg-[#F2C990] text-[#050608] shadow-[inset_10px_9px_20.6px_0_#E3B97F,-4px_-4px_5px_0_rgba(255,255,255,0.38),5px_5px_7px_0_rgba(0,0,0,0.42)] transition-all duration-200 hover:translate-y-[-1px] hover:brightness-105 active:translate-y-0",
  secondary:
    "bg-[#F2C990] text-[#050608] shadow-[inset_10px_9px_20.6px_0_#E3B97F,-4px_-4px_5px_0_rgba(255,255,255,0.38),5px_5px_7px_0_rgba(0,0,0,0.42)] transition-all duration-200 hover:translate-y-[-1px] hover:brightness-105 active:translate-y-0",
  ghost: "text-secondary-text hover:text-primary-text",
  emergency:
    "bg-emergency text-white hover:bg-red-600 shadow-[0_1px_2px_rgba(0,0,0,0.05)]",
};

const sizes = {
  sm: "px-4 py-2 text-[13px]",
  md: "px-6 py-3 text-[15px]",
  lg: "px-8 py-4 text-base",
};

export function Button({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  onClick,
  type = "button",
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
    variants[variant],
    sizes[size],
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
