"use client";

import React, { useState } from "react";
import { Card } from "@/components/design-system/Card";
import { PillButton } from "@/components/design-system/PillButton";
import { StatusChip } from "@/components/design-system/StatusChip";
import { EmptyState } from "@/components/design-system/EmptyState";
import { submitReviewDecisionAction } from "./actions";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  ShieldAlert,
  ArrowRight,
  FileCheck2,
  Clock,
  UserCheck,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";

interface ReviewQueueClientProps {
  campaignId: string;
  campaignName: string;
  brandName: string;
  productName: string;
  currentUserId: string;
  currentUserRole: string;
  allVersions: Array<{
    id: string;
    version_no: number;
    headline: string;
    target_language: string;
    status: string;
    content_hash: string;
    author_name: string;
    created_by: string;
    created_at: string;
  }>;
  activeVersion: any | null;
  findings: any[];
  approvalHistory: any[];
}

export function ReviewQueueClient({
  campaignId,
  campaignName,
  brandName,
  productName,
  currentUserId,
  currentUserRole,
  allVersions,
  activeVersion,
  findings,
  approvalHistory,
}: ReviewQueueClientProps) {
  const router = useRouter();
  const [rationale, setRationale] = useState("");
  const [overrideReason, setOverrideReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const isAuthor = activeVersion && activeVersion.created_by === currentUserId;
  const blockerFindings = findings.filter(
    (f: any) => f.severity === "Critical" || f.result_class === "Contradicted"
  );
  const hasBlockers = blockerFindings.length > 0;
  const checksRan = findings.length > 0 || (activeVersion && activeVersion.status !== "Draft");

  const handleDecision = async (decision: "Approve" | "RequestChanges" | "Reject") => {
    if (!activeVersion) return;
    setIsSubmitting(true);
    setActionError("");
    setSuccessMsg("");

    try {
      const res = await submitReviewDecisionAction({
        assetVersionId: activeVersion.id,
        expectedContentHash: activeVersion.content_hash,
        decision,
        rationale,
        overrideReason: (isAuthor || hasBlockers) ? overrideReason : undefined,
      });

      if (res.success && res.data) {
        setSuccessMsg(`Decision "${decision}" recorded successfully. Version is now ${res.data.status}.`);
        router.refresh();
      } else {
        setActionError(res.error || "Failed to record decision.");
      }
    } catch (err: any) {
      setActionError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#2BD64F] uppercase tracking-wider">
              {brandName} • {productName}
            </span>
            <span className="text-xs text-[#777777]">•</span>
            <span className="text-[11px] text-[#A3A3A3]">Diagram 4.4</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Review Queue & Version-Locked Approval
          </h1>
          <p className="text-xs text-[#A3A3A3]">
            Enforcing version locks, author/reviewer separation, and explicit override gates.
          </p>
        </div>

        {activeVersion?.status === "Approved" && (
          <PillButton
            variant="primary"
            size="md"
            href={`/campaigns/${campaignId}/experiment`}
            icon={<ArrowRight className="w-4 h-4 text-black" />}
          >
            Create Experiment with Approved Version
          </PillButton>
        )}
      </div>

      {actionError && (
        <div className="p-4 rounded-[18px] bg-[#2A1414] border border-[#FF5C5C]/30 text-xs text-[#FF8585] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-[18px] bg-[#142618] border border-[#2BD64F]/30 text-xs text-[#2BD64F] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {activeVersion ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Review Packet & Content */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <Card title="Review Packet: Creative Copy" icon={<Lock className="w-3.5 h-3.5 text-[#2BD64F]" />}>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#222222] text-xs">
                <div className="flex items-center gap-2 font-mono">
                  <span className="font-bold text-white">v{activeVersion.version_no}</span>
                  <span className="text-[#777777]">({activeVersion.target_language})</span>
                </div>
                <StatusChip status={activeVersion.status} size="sm" />
              </div>

              {/* Exact Text Display */}
              <div className="p-5 rounded-[22px] bg-[#141414] border border-[#222222] flex flex-col gap-3">
                <div>
                  <span className="text-[10px] text-[#777777] uppercase font-bold block mb-1">
                    Headline
                  </span>
                  <h3 className="text-base font-bold text-white leading-snug indic-text">
                    {activeVersion.headline}
                  </h3>
                </div>

                {activeVersion.subline && (
                  <div>
                    <span className="text-[10px] text-[#777777] uppercase font-bold block mb-1">Subline</span>
                    <p className="text-xs text-[#D4D4D4] indic-text">{activeVersion.subline}</p>
                  </div>
                )}

                {activeVersion.cta && (
                  <div>
                    <span className="text-[10px] text-[#777777] uppercase font-bold block mb-1">CTA</span>
                    <p className="text-xs font-semibold text-[#2BD64F] indic-text">{activeVersion.cta}</p>
                  </div>
                )}

                {activeVersion.disclosure && (
                  <div className="pt-2 border-t border-[#1F1F1F]">
                    <span className="text-[10px] text-[#777777] uppercase font-bold block mb-0.5">Disclosure</span>
                    <p className="text-[11px] text-[#A3A3A3] indic-text">{activeVersion.disclosure}</p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-[#222222] flex flex-wrap items-center justify-between text-[11px] text-[#777777] font-mono">
                <span>Author: {activeVersion.author_name}</span>
                <span>SHA-256: {activeVersion.content_hash?.slice(0, 16)}...</span>
              </div>
            </Card>

            {/* Findings Summary */}
            <Card title={`Guardian Verification Summary (${findings.length})`} icon={<FileCheck2 className="w-3.5 h-3.5" />}>
              {findings.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {findings.map((f: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-[16px] bg-[#1A1A1A] border border-[#262626] flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <StatusChip status={f.result_class || "Rule"} size="sm" />
                          <span className="font-semibold text-white truncate">{f.category}</span>
                        </div>
                        <p className="text-[11px] text-[#A3A3A3] line-clamp-2">{f.explanation}</p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase flex-shrink-0 ${
                          f.severity === "Critical" ? "bg-[#FF5C5C] text-black" : "bg-[#2A2A2A] text-white"
                        }`}
                      >
                        {f.severity}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#777777] py-2">
                  No issues flagged by Brand Guardian.
                </p>
              )}
            </Card>
          </div>

          {/* Right Column: Approval Gates & Decision Actions */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <Card title="Approval Governance Gates" icon={<UserCheck className="w-3.5 h-3.5 text-[#2BD64F]" />}>
              <div className="flex flex-col divide-y divide-[#202020] text-xs">
                {/* Gate 1: Version Hash */}
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-[#D4D4D4]">Content Hash Lock</span>
                  <span className="font-mono text-[#2BD64F] flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Matched
                  </span>
                </div>

                {/* Gate 2: Checks Ran */}
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-[#D4D4D4]">Brand Guardian Checks</span>
                  <span className={`flex items-center gap-1 font-semibold ${checksRan ? "text-[#2BD64F]" : "text-[#FF5C5C]"}`}>
                    {checksRan ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    {checksRan ? "Completed" : "Not Run"}
                  </span>
                </div>

                {/* Gate 3: Blocking Findings */}
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-[#D4D4D4]">Open Blocking Issues</span>
                  <span className={`font-semibold flex items-center gap-1 ${hasBlockers ? "text-[#FF5C5C]" : "text-[#2BD64F]"}`}>
                    {hasBlockers ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    {hasBlockers ? `${blockerFindings.length} Open` : "0 Blockers"}
                  </span>
                </div>

                {/* Gate 4: Author != Approver */}
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-[#D4D4D4]">Separation of Duties</span>
                  <span className={`font-semibold flex items-center gap-1 ${!isAuthor ? "text-[#2BD64F]" : "text-[#FFE234]"}`}>
                    {!isAuthor ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                    {!isAuthor ? "Valid Reviewer" : "Author Acting (Needs Override)"}
                  </span>
                </div>
              </div>

              {/* Decision Form */}
              <div className="mt-5 pt-4 border-t border-[#222222] flex flex-col gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#A3A3A3] uppercase mb-1.5">
                    Reviewer Rationale & Notes
                  </label>
                  <textarea
                    rows={2}
                    value={rationale}
                    onChange={(e) => setRationale(e.target.value)}
                    placeholder="Document quality, linguistic nuance, or compliance reason..."
                    className="w-full bg-[#1C1C1C] text-white text-xs rounded-[16px] p-3 border border-[#2A2A2A] focus:outline-none"
                  />
                </div>

                {(isAuthor || hasBlockers) && (
                  <div>
                    <label className="block text-[11px] font-bold text-[#FF5C5C] uppercase mb-1.5 flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Required Written Override Rationale
                    </label>
                    <textarea
                      rows={2}
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                      placeholder="Explain why this version is approved despite self-authoring or open findings..."
                      className="w-full bg-[#2A1414] text-white text-xs rounded-[16px] p-3 border border-[#FF5C5C]/40 focus:outline-none"
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-2 pt-2">
                  <PillButton
                    variant="primary"
                    size="md"
                    className="w-full font-bold"
                    onClick={() => handleDecision("Approve")}
                    disabled={isSubmitting || (activeVersion?.status === "Approved")}
                    icon={<CheckCircle2 className="w-4 h-4 text-black" />}
                  >
                    {activeVersion?.status === "Approved" ? "Already Approved (Version-Locked)" : "Approve Exact Version"}
                  </PillButton>

                  <div className="grid grid-cols-2 gap-2">
                    <PillButton
                      variant="dark"
                      size="sm"
                      onClick={() => handleDecision("RequestChanges")}
                      disabled={isSubmitting}
                    >
                      Request Changes
                    </PillButton>

                    <PillButton
                      variant="danger"
                      size="sm"
                      onClick={() => handleDecision("Reject")}
                      disabled={isSubmitting}
                    >
                      Reject
                    </PillButton>
                  </div>
                </div>
              </div>
            </Card>

            {/* Approval Decision Audit History */}
            {approvalHistory.length > 0 && (
              <Card title="Decision History" icon={<Clock className="w-3.5 h-3.5 text-[#A3A3A3]" />}>
                <div className="flex flex-col divide-y divide-[#202020] text-xs">
                  {approvalHistory.map((h: any) => (
                    <div key={h.id} className="py-2.5 flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{h.decision}</span>
                        <span className="text-[10px] text-[#777777]">
                          {new Date(h.decided_at).toLocaleString()}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#A3A3A3]">
                        Reviewer: {h.reviewer_name}
                      </span>
                      {h.rationale && (
                        <p className="text-[11px] text-[#888888] italic">&ldquo;{h.rationale}&rdquo;</p>
                      )}
                      {h.override_reason && (
                        <p className="text-[11px] text-[#FF5C5C]">
                          Override: {h.override_reason}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      ) : (
        <EmptyState
          icon={<Lock className="w-6 h-6" />}
          title="No asset versions awaiting review"
          description="Create a regional adaptation variant in the studio to submit for human review."
          actionLabel="Go to Studio"
          actionHref={`/campaigns/${campaignId}/studio`}
        />
      )}
    </div>
  );
}
