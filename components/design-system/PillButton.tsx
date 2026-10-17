import React from "react";
import Link from "next/link";

interface PillButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "white" | "dark" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  href?: string;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  children: React.ReactNode;
}

export function PillButton({
  variant = "white",
  size = "md",
  href,
  icon,
  iconRight,
  children,
  className = "",
  disabled,
  ...props
}: PillButtonProps) {
  const sizeClasses =
    size === "sm"
      ? "px-3.5 py-1.5 text-xs gap-1.5"
      : size === "lg"
      ? "px-7 py-3.5 text-base gap-2.5 font-semibold"
      : "px-5 py-2.5 text-sm gap-2 font-medium";

  const variantClasses = {
    white: "bg-white text-black hover:bg-[#EBEBEB] active:bg-[#D6D6D6]",
    primary: "bg-[#2BD64F] text-black hover:bg-[#25C245] active:bg-[#1EAB3B]",
    dark: "bg-[#1C1C1C] text-white hover:bg-[#2A2A2A] border border-[#2A2A2A]",
    outline: "bg-transparent text-white border border-[#333333] hover:border-white hover:bg-white/5",
    danger: "bg-[#FF5C5C] text-white hover:bg-[#E04848]",
  }[variant];

  const combinedClasses = `inline-flex items-center justify-center rounded-full transition-smooth font-medium cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none ${sizeClasses} ${variantClasses} ${className}`;

  if (href && !disabled) {
    return (
      <Link href={href} className={combinedClasses}>
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span>{children}</span>
        {iconRight && <span className="flex-shrink-0">{iconRight}</span>}
      </Link>
    );
  }

  return (
    <button className={combinedClasses} disabled={disabled} {...props}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
      {iconRight && <span className="flex-shrink-0">{iconRight}</span>}
    </button>
  );
}
