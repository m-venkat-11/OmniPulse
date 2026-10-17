"use client";

import React, { useState } from "react";
import { Card } from "@/components/design-system/Card";
import { PillButton } from "@/components/design-system/PillButton";
import { StatusChip } from "@/components/design-system/StatusChip";
import { EmptyState } from "@/components/design-system/EmptyState";
import { runVerificationAction } from "./actions";
import { createEditedVersionAction } from "../studio/actions";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Lock,
  Layers,
  Wand2,
  FileCheck2,
  Clock,
} from "lucide-react";
import Link from "next/link";

interface GuardianClientProps {
  campaignId: string;
  campaignName: string;
  brandName: string;
  productName: string;
  allVersions: Array<{
    id: string;
    version_no: number;
    headline: string;
    target_language: string;
    status: string;
    content_hash: string;
    created_at: string;
  }>;
  activeVersion: any | null;
  initialFindings: any | null;
}

export function GuardianClient({
  campaignId,
  campaignName,
  brandName,
  productName,
  allVersions,
  activeVersion,
  initialFindings,
}: GuardianClientProps) {
  const router = useRouter();
  const [selectedVersionId, setSelectedVersionId] = useState(activeVersion?.id || allVersions[0]?.id || "");
  const [isRunning, setIsRunning] = useState(false);
  const [findingsData, setFindingsData] = useState<any>(initialFindings);
  const [errorMessage, setErrorMessage] = useState("");
  const [isApplyingFix, setIsApplyingFix] = useState(false);

  const currentVer = allVersions.find((v) => v.id === selectedVersionId) || activeVersion;

  const handleRunChecks = async () => {
    if (!selectedVersionId) return;
    setIsRunning(true);
    setErrorMessage("");

    try {
      const res = await runVerificationAction(selectedVersionId);
      if (res.success && res.data) {
        setFindingsData({
          run: { id: res.data.runId, status: res.data.status },
          findings: res.data.findings,
        });
        router.refresh();
      } else {
        setErrorMessage(res.error || "Verification run failed.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to execute Brand Guardian.");
    } finally {
      setIsRunning(false);
    }
  };

  const handleAcceptCorrection = async (finding: any) => {
    if (!activeVersion || !finding.suggested_correction) return;
    setIsApplyingFix(true);
    setErrorMessage("");

    try {
      // Replace the flagged text with suggested correction in headline or body
      const newHeadline = activeVersion.headline.replace(
        finding.quoted_text,
        finding.suggested_correction
      );

      const res = await createEditedVersionAction({
        creativeAssetId: activeVersion.creative_asset_id,
        headline: newHeadline,
        subline: activeVersion.subline,
        body: activeVersion.body,
        cta: activeVersion.cta,
        disclosure: activeVersion.disclosure,
        literalTranslation: activeVersion.literal_translation,
      });

      if (res.success && res.data) {
        router.push(`/campaigns/${campaignId}/guardian?versionId=${res.data.assetVersionId}`);
      } else {
        setErrorMessage(res.error || "Failed to create corrected version.");
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsApplyingFix(false);
    }
  };

  const findingsList = findingsData?.findings || [];
  const blockerCount = findingsList.filter(
    (f: any) => f.severity === "Critical" || f.result_class === "Contradicted"
  ).length;

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
            <span className="text-[11px] text-[#A3A3A3]">Diagram 4.3</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Evidence-First Brand Guardian
          </h1>
          <p className="text-xs text-[#A3A3A3]">
            Deterministic rule matching, locked tokens, and AI claim verification with exact spans.
          </p>
        </div>

        {activeVersion && (
          <div className="flex items-center gap-3">
            <PillButton
              variant="white"
              size="md"
              onClick={handleRunChecks}
              disabled={isRunning}
              icon={<ShieldCheck className="w-4 h-4 text-black" />}
            >
              {isRunning ? "Verifying Rules..." : "Run Guardian Checks"}
            </PillButton>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="p-4 rounded-[18px] bg-[#2A1414] border border-[#FF5C5C]/30 text-xs text-[#FF8585] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Version Selector & Content Preview Card */}
      {activeVersion ? (
        <Card title="Inspected Asset Version" icon={<Lock className="w-3.5 h-3.5 text-[#2BD64F]" />}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#222222] text-xs">
              <div className="flex items-center gap-3">
                <span className="text-[#777777]">Select Version:</span>
                <select
                  value={selectedVersionId}
                  onChange={(e) => {
                    setSelectedVersionId(e.target.value);
                    router.push(`/campaigns/${campaignId}/guardian?versionId=${e.target.value}`);
                  }}
                  className="bg-[#1C1C1C] text-white font-semibold rounded-full px-4 py-1.5 border border-[#2A2A2A] cursor-pointer"
                >
                  {allVersions.map((v) => (
                    <option key={v.id} value={v.id} className="bg-[#1C1C1C]">
                      v{v.version_no} — {v.target_language} ({v.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 font-mono text-[11px]">
                <span className="text-[#A3A3A3]">
                  Hash: {activeVersion.content_hash?.slice(0, 10)}
                </span>
                <StatusChip status={activeVersion.status} size="sm" />
              </div>
            </div>

            {/* Content preview */}
            <div className="p-5 rounded-[22px] bg-[#141414] border border-[#222222] flex flex-col gap-3">
              <div>
                <span className="text-[10px] text-[#777777] uppercase font-bold block mb-1">
                  Headline ({activeVersion.target_language})
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

              {activeVersion.disclosure && (
                <div className="pt-2 border-t border-[#1F1F1F]">
                  <span className="text-[10px] text-[#777777] uppercase font-bold block mb-0.5">Disclosure</span>
                  <p className="text-[11px] text-[#A3A3A3] indic-text">{activeVersion.disclosure}</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      ) : (
        <EmptyState
          icon={<ShieldCheck className="w-6 h-6" />}
          title="No asset versions generated yet"
          description="Create your first regional adaptation variant in the studio before verifying brand rules."
          actionLabel="Open Adaptation Studio"
          actionHref={`/campaigns/${campaignId}/studio`}
        />
      )}

      {/* ── VERIFICATION FINDINGS (Diagram 4.3 Contract) ── */}
      {findingsData && (
        <div className="flex flex-col gap-6">
          {/* Status Banner */}
          <div
            className={`p-5 rounded-[24px] border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              blockerCount > 0
                ? "bg-[#241313] border-[#FF5C5C]/40 text-[#FF8585]"
                : "bg-[#142618] border-[#2BD64F]/40 text-[#2BD64F]"
            }`}
          >
            <div className="flex items-center gap-3">
              {blockerCount > 0 ? (
                <XCircle className="w-6 h-6 text-[#FF5C5C] flex-shrink-0" />
              ) : (
                <CheckCircle2 className="w-6 h-6 text-[#2BD64F] flex-shrink-0" />
              )}
              <div>
                <h3 className="text-sm font-bold text-white">
                  {blockerCount > 0
                    ? `${blockerCount} Blocking Issue${blockerCount > 1 ? "s" : ""} Found`
                    : "All Brand Guardian Checks Completed"}
                </h3>
                <p className="text-xs opacity-80 mt-0.5">
                  {blockerCount > 0
                    ? "Content cannot be approved until blocking issues are corrected or explicitly overridden."
                    : "No critical rule violations or contradicted claims detected. Ready for human review."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <PillButton
                variant={blockerCount > 0 ? "outline" : "white"}
                size="sm"
                href={`/campaigns/${campaignId}/review?versionId=${selectedVersionId}`}
                icon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Proceed to Review Queue
              </PillButton>
            </div>
          </div>

          {/* Findings List */}
          <Card title={`Findings & Evidence Verification (${findingsList.length})`} icon={<FileCheck2 className="w-3.5 h-3.5" />}>
            {findingsList.length > 0 ? (
              <div className="flex flex-col gap-4">
                {findingsList.map((f: any, idx: number) => {
                  const isBlocker = f.severity === "Critical" || f.result_class === "Contradicted";
                  return (
                    <div
                      key={f.id || idx}
                      className={`p-5 rounded-[22px] border transition-all ${
                        isBlocker
                          ? "bg-[#1C1414] border-[#FF5C5C]/30"
                          : f.severity === "High"
                          ? "bg-[#1F1A12] border-[#FFE234]/30"
                          : "bg-[#161616] border-[#262626]"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <StatusChip status={f.result_class || "Rule violation"} size="sm" />
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              f.severity === "Critical"
                                ? "bg-[#FF5C5C] text-black"
                                : f.severity === "High"
                                ? "bg-[#FFE234] text-black"
                                : "bg-[#2A2A2A] text-white"
                            }`}
                          >
                            {f.severity}
                          </span>
                          <span className="text-xs font-semibold text-[#D4D4D4]">
                            {f.category}
                          </span>
                        </div>

                        <span className="text-[10px] text-[#777777] font-mono">
                          Layer: {f.detection_layer === "deterministic_layer1" ? "Deterministic" : "AI Claim Check"}
                        </span>
                      </div>

                      {/* Quoted Text Span */}
                      <div className="mb-3 p-3 rounded-[14px] bg-[#111111] text-xs font-mono text-white border border-[#222222]">
                        <span className="text-[#777777] text-[10px] uppercase font-bold block mb-1">
                          Exact Quoted Span
                        </span>
                        &ldquo;{f.quoted_text}&rdquo;
                      </div>

                      {/* Explanation */}
                      <p className="text-xs text-[#CCCCCC] leading-relaxed mb-3">
                        {f.explanation}
                      </p>

                      {/* Suggested Correction */}
                      {f.suggested_correction && (
                        <div className="p-3.5 rounded-[16px] bg-[#162419] border border-[#2BD64F]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div>
                            <span className="text-[10px] text-[#2BD64F] uppercase font-bold block mb-0.5">
                              Suggested Fix
                            </span>
                            <span className="text-white font-medium">
                              &ldquo;{f.suggested_correction}&rdquo;
                            </span>
                          </div>

                          <PillButton
                            variant="primary"
                            size="sm"
                            onClick={() => handleAcceptCorrection(f)}
                            disabled={isApplyingFix}
                            icon={<Wand2 className="w-3 h-3 text-black" />}
                          >
                            Accept Fix & Create v{activeVersion.version_no + 1}
                          </PillButton>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-[#2BD64F] flex flex-col items-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-[#2BD64F]" />
                <span className="font-semibold">Zero issues found.</span>
                <span className="text-[#A3A3A3]">All configured rules and claim checks passed.</span>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
