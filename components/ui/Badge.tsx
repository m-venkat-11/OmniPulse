import React from "react";

type BadgeVariant =
  | "default"
  | "forest"
  | "brass"
  | "sage"
  | "success"
  | "warning"
  | "danger"
  | "critical"
  | "neutral"
  | "demo";

interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
  children: React.ReactNode;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  default:  "bg-[#222222] text-[#CCCCCC] border border-[#333333]",
  forest:   "bg-[#2BD64F]/10 text-[#2BD64F] border border-[#2BD64F]/20",
  brass:    "bg-[#FFE234]/10 text-[#FFE234] border border-[#FFE234]/20",
  sage:     "bg-[#333333] text-[#CCCCCC] border border-[#444444]",
  success:  "bg-[#2BD64F]/15 text-[#2BD64F] border border-[#2BD64F]/30",
  warning:  "bg-[#FFE234]/15 text-[#FFE234] border border-[#FFE234]/30",
  danger:   "bg-[#FF5C5C]/15 text-[#FF5C5C] border border-[#FF5C5C]/30",
  critical: "bg-[#FF5C5C]/20 text-[#FF5C5C] border border-[#FF5C5C]/40 font-semibold",
  neutral:  "bg-[#1C1C1E] text-[#A3A3A3] border border-[#333333]",
  demo:     "bg-[#FFE234]/10 text-[#FFE234] border border-[#FFE234]/30 font-medium",
};

const dotStyles: Record<BadgeVariant, string> = {
  default:  "bg-[#A3A3A3]",
  forest:   "bg-[#2BD64F]",
  brass:    "bg-[#FFE234]",
  sage:     "bg-[#777777]",
  success:  "bg-[#2BD64F]",
  warning:  "bg-[#FFE234]",
  danger:   "bg-[#FF5C5C]",
  critical: "bg-[#FF5C5C]",
  neutral:  "bg-[#666666]",
  demo:     "bg-[#FFE234]",
};

export function Badge({ variant = "default", className = "", children, dot }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5",
        "text-xs font-medium tracking-wide",
        variantStyles[variant],
        className,
      ].join(" ")}
    >
      {dot && (
        <span className={["w-1.5 h-1.5 rounded-full shrink-0", dotStyles[variant]].join(" ")} />
      )}
      {children}
    </span>
  );
}
