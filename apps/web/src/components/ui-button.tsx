import { ButtonHTMLAttributes, forwardRef } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantMap: Record<ButtonVariant, string> = {
  primary:
    "bg-ambercare text-ink shadow-card hover:bg-[#c99e79] focus-visible:ring-ambercare",
  secondary:
    "bg-white/75 text-sapphire ring-1 ring-sapphire/20 hover:bg-skywash/60 focus-visible:ring-sapphire",
  ghost:
    "bg-transparent text-sapphire hover:bg-skywash/25 focus-visible:ring-sapphire",
};

export const UIButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
        variantMap[variant],
        className,
      )}
      {...props}
    />
  ),
);

UIButton.displayName = "UIButton";
