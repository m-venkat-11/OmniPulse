import React from "react";
import { PillButton } from "./PillButton";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onActionClick?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onActionClick,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center rounded-[24px] bg-[#141414] border border-dashed border-[#262626] ${className}`}
    >
      {icon && (
        <div className="w-12 h-12 rounded-full bg-[#1F1F1F] text-[#A3A3A3] flex items-center justify-center mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-white mb-1.5">{title}</h3>
      <p className="text-xs text-[#A3A3A3] max-w-sm mb-5 leading-relaxed">
        {description}
      </p>

      {actionLabel && (actionHref || onActionClick) && (
        <PillButton
          variant="white"
          size="sm"
          href={actionHref}
          onClick={onActionClick}
        >
          {actionLabel}
        </PillButton>
      )}
    </div>
  );
}
