import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface CardProps {
  title?: string;
  icon?: React.ReactNode;
  actionHref?: string;
  actionLabel?: string;
  onActionClick?: () => void;
  className?: string;
  surface?: "default" | "subtle" | "hero";
  children: React.ReactNode;
}

export function Card({
  title,
  icon,
  actionHref,
  actionLabel,
  onActionClick,
  className = "",
  surface = "default",
  children,
}: CardProps) {
  const bgClass =
    surface === "hero"
      ? "bg-gradient-to-b from-[#2BD64F] to-[#20A83D] text-black"
      : surface === "subtle"
      ? "bg-[#1E1E1E] text-white"
      : "bg-[#161616] text-white";

  return (
    <div
      className={`relative rounded-[26px] p-6 transition-smooth shadow-lg overflow-hidden ${bgClass} ${className}`}
    >
      {(title || icon || actionHref || onActionClick) && (
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            {icon && (
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                  surface === "hero"
                    ? "bg-black/15 text-black"
                    : "bg-[#2A2A2A] text-white"
                }`}
              >
                {icon}
              </div>
            )}
            {title && (
              <h3
                className={`font-semibold text-sm tracking-tight ${
                  surface === "hero" ? "text-black" : "text-[#E0E0E0]"
                }`}
              >
                {title}
              </h3>
            )}
          </div>

          {(actionHref || onActionClick) && (
            actionHref ? (
              <Link
                href={actionHref}
                title={actionLabel || "Open details"}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-105 ${
                  surface === "hero"
                    ? "bg-black/15 text-black hover:bg-black/25"
                    : "bg-[#2A2A2A] text-[#A3A3A3] hover:text-white hover:bg-[#333333]"
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={onActionClick}
                title={actionLabel || "Action"}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-105 ${
                  surface === "hero"
                    ? "bg-black/15 text-black hover:bg-black/25"
                    : "bg-[#2A2A2A] text-[#A3A3A3] hover:text-white hover:bg-[#333333]"
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )
          )}
        </div>
      )}

      {children}
    </div>
  );
}
