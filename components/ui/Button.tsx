import React from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger" | "brass";
type Size    = "xs" | "sm" | "md" | "lg" | "xl";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-[#2BD64F] text-black hover:bg-[#22A63C] active:bg-[#1A7D2E] border border-transparent shadow-sm font-semibold",
  secondary:
    "bg-[#1C1C1E] text-white hover:bg-[#2A2A2A] border border-[#333333] font-medium",
  ghost:
    "bg-transparent text-[#A3A3A3] hover:bg-[#1C1C1E] hover:text-white border border-transparent font-medium",
  outline:
    "bg-transparent text-white hover:bg-[#1C1C1E] border border-[#333333] hover:border-[#555555] font-medium",
  danger:
    "bg-[#FF5C5C]/20 text-[#FF5C5C] hover:bg-[#FF5C5C]/30 border border-[#FF5C5C]/30 font-semibold",
  brass:
    "bg-[#FFE234] text-black hover:bg-[#F9CA00] border border-transparent shadow-sm font-semibold",
};

const sizeStyles: Record<Size, string> = {
  xs: "h-7 px-3 text-xs gap-1.5 rounded-full",
  sm: "h-8 px-4 text-xs gap-1.5 rounded-full",
  md: "h-10 px-5 text-sm gap-2 rounded-full",
  lg: "h-12 px-6 text-sm gap-2 rounded-full",
  xl: "h-14 px-8 text-base gap-2.5 rounded-full",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconRight,
  fullWidth = false,
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={[
        "inline-flex items-center justify-center font-sans",
        "transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2BD64F]/50",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "select-none whitespace-nowrap tracking-tight",
        variantStyles[variant],
        sizeStyles[size],
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
      {...props}
    >
      {loading ? (
        <Spinner />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      {children && <span>{children}</span>}
      {!loading && iconRight && <span className="shrink-0">{iconRight}</span>}
    </button>
  );
}

function Spinner() {
  return (
    <svg
      className="w-4 h-4 animate-spin opacity-70"
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
