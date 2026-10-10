import React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "forest" | "brass" | "sage" | "success" | "warning" | "danger" | "critical" | "neutral" | "demo";

interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
  children: React.ReactNode;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  default:  "bg-neutral-100 text-graphite border border-neutral-200",
  forest:   "bg-forest/10 text-forest border border-forest/15",
  brass:    "bg-brass/10 text-brass-600 border border-brass/20",
  sage:     "bg-sage text-forest border border-sage-200",
  success:  "bg-emerald-50 text-emerald-800 border border-emerald-200",
  warning:  "bg-amber-50 text-amber-800 border border-amber-200",
  danger:   "bg-red-50 text-red-800 border border-red-200",
  critical: "bg-red-50 text-red-800 border border-red-200 font-semibold",
  neutral:  "bg-neutral-100 text-neutral-600 border border-neutral-200",
  demo:     "bg-brass/10 text-brass-600 border border-brass/30 font-medium",
};

const dotStyles: Record<BadgeVariant, string> = {
  default: "bg-neutral-400",
  forest:  "bg-forest",
  brass:   "bg-brass",
  sage:    "bg-forest/50",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger:  "bg-red-500",
  critical:"bg-red-500",
  neutral: "bg-neutral-400",
  demo:    "bg-brass",
};

export function Badge({ variant = "default", className, children, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5",
        "text-2xs font-medium tracking-wide",
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotStyles[variant])} />
      )}
      {children}
    </span>
  );
}
