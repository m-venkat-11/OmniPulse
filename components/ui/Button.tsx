import React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "brass" | "outline" | "danger";
type Size    = "xs" | "sm" | "md" | "lg" | "xl";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
  asChild?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-forest text-ivory hover:bg-forest-700 active:bg-forest-900 " +
    "shadow-editorial border border-transparent",
  secondary:
    "bg-sage text-forest hover:bg-sage-200 active:bg-sage-300 " +
    "border border-transparent",
  ghost:
    "bg-transparent text-graphite hover:bg-sage-50 active:bg-sage-100 " +
    "border border-transparent",
  brass:
    "bg-brass text-ivory hover:bg-brass-500 active:bg-brass-600 " +
    "shadow-brass border border-transparent",
  outline:
    "bg-transparent text-forest hover:bg-sage-50 " +
    "border border-forest/20 hover:border-forest/40",
  danger:
    "bg-red-700 text-white hover:bg-red-800 " +
    "border border-transparent",
};

const sizeStyles: Record<Size, string> = {
  xs: "h-7 px-3 text-xs gap-1.5",
  sm: "h-8 px-4 text-sm gap-1.5",
  md: "h-10 px-5 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
  xl: "h-14 px-8 text-base gap-2.5",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconRight,
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center font-sans font-medium",
        "rounded-md transition-all duration-150 ease-editorial",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/60 focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
        "select-none whitespace-nowrap tracking-tight",
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {loading ? (
        <Spinner size={size} />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      {children && <span>{children}</span>}
      {!loading && iconRight && <span className="shrink-0">{iconRight}</span>}
    </button>
  );
}

function Spinner({ size }: { size: Size }) {
  const s = size === "xs" || size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  return (
    <svg
      className={cn(s, "animate-spin opacity-70")}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
