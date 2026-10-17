import React from "react";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  HelpCircle,
  ShieldCheck,
  FileEdit,
  Radio,
} from "lucide-react";

export type StatusType =
  | "Draft"
  | "Generated"
  | "Verification"
  | "ReadyForReview"
  | "InReview"
  | "NeedsChanges"
  | "Rejected"
  | "Approved"
  | "Supported"
  | "Unsupported"
  | "Contradicted"
  | "Evidence missing"
  | "Rule violation"
  | "Connected"
  | "Not connected"
  | "active"
  | "completed";

interface StatusChipProps {
  status: StatusType | string;
  size?: "sm" | "md";
  className?: string;
}

export function StatusChip({ status, size = "md", className = "" }: StatusChipProps) {
  const normalized = (status || "").toLowerCase().trim();

  let config = {
    label: status,
    bg: "bg-[#222222]",
    text: "text-white",
    icon: <Clock className="w-3 h-3" />,
  };

  if (normalized === "approved" || normalized === "supported" || normalized === "connected" || normalized === "active") {
    config = {
      label: status,
      bg: "bg-[#14331C] border border-[#2BD64F]/30",
      text: "text-[#2BD64F]",
      icon: <CheckCircle2 className="w-3 h-3 text-[#2BD64F]" />,
    };
  } else if (normalized === "needschanges" || normalized === "needs_changes" || normalized === "unsupported" || normalized === "rule violation") {
    config = {
      label: status === "needschanges" ? "Needs Changes" : status,
      bg: "bg-[#332211] border border-[#FFE234]/30",
      text: "text-[#FFE234]",
      icon: <AlertTriangle className="w-3 h-3 text-[#FFE234]" />,
    };
  } else if (normalized === "rejected" || normalized === "contradicted" || normalized === "not connected") {
    config = {
      label: status,
      bg: "bg-[#331414] border border-[#FF5C5C]/30",
      text: "text-[#FF5C5C]",
      icon: <XCircle className="w-3 h-3 text-[#FF5C5C]" />,
    };
  } else if (normalized === "evidence missing" || normalized === "evidence_missing") {
    config = {
      label: "Evidence Missing",
      bg: "bg-[#252525] border border-[#A3A3A3]/40",
      text: "text-[#D4D4D4]",
      icon: <HelpCircle className="w-3 h-3 text-[#A3A3A3]" />,
    };
  } else if (normalized === "readyforreview" || normalized === "ready_for_review" || normalized === "inreview" || normalized === "in_review") {
    config = {
      label: normalized.includes("ready") ? "Ready for Review" : "In Review",
      bg: "bg-[#182333] border border-[#60A5FA]/30",
      text: "text-[#93C5FD]",
      icon: <Radio className="w-3 h-3 text-[#60A5FA] animate-pulse" />,
    };
  } else if (normalized === "draft" || normalized === "generated" || normalized === "verification") {
    config = {
      label: status,
      bg: "bg-[#1F1F1F] border border-[#333333]",
      text: "text-[#A3A3A3]",
      icon: <FileEdit className="w-3 h-3 text-[#A3A3A3]" />,
    };
  }

  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-[10px] gap-1" : "px-3 py-1 text-xs gap-1.5";

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium select-none ${sizeClasses} ${config.bg} ${config.text} ${className}`}
    >
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
}
