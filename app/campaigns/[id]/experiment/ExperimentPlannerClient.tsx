"use client";

import React, { useState } from "react";
import { Card } from "@/components/design-system/Card";
import { PillButton } from "@/components/design-system/PillButton";
import { StatusChip } from "@/components/design-system/StatusChip";
import { EmptyState } from "@/components/design-system/EmptyState";
import { createExperimentAction, lockExperimentAction } from "./actions";
import { useRouter } from "next/navigation";
import {
  FlaskConical,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
} from "lucide-react";
import Link from "next/link";

interface ExperimentPlannerClientProps {
  campaignId: string;
  campaignName: string;
  brandName: string;
  productName: string;
  approvedVersions: Array<{
    id: string;
    version_no: number;
    headline: string;
    target_language: string;
    status: string;
    content_hash: string;
  }>;
  metrics: Array<{
    id: string;
    name: string;
    formula: string;
    unit: string;
  }>;
  experiments: Array<{
    id: string;
    hypothesis: string;
    primary_metric_name: string;
    decision_rule: string;
    is_locked: boolean;
    locked_at: string;
    created_at: string;
  }>;
}

export function ExperimentPlannerClient({
  campaignId,
  campaignName,
  brandName,
  productName,
  approvedVersions,
  metrics,
  experiments,
}: ExperimentPlannerClientProps) {
  const router = useRouter();
  const [hypothesis, setHypothesis] = useState("");
  const [variantAId, setVariantAId] = useState(approvedVersions[0]?.id || "");
  const [variantBId, setVariantBId] = useState(approvedVersions[1]?.id || approvedVersions[0]?.id || "");
  const [primaryMetricId, setPrimaryMetricId] = useState(metrics[0]?.id || "");
  const [decisionRule, setDecisionRule] = useState("Variant with highest CTR at 95% Wilson confidence and >= 30 events wins.");
  const [attributionWindow, setAttributionWindow] = useState("7 days");
  const [duration, setDuration] = useState("14 days");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocking, setIsLocking] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleCreate = async () => {
    if (!hypothesis || !variantAId || !variantBId || !primaryMetricId || !decisionRule) {
      setErrorMsg("Please fill in hypothesis, both variants, primary metric and decision rule.");
      return;
    }

    // Check language match
    const vA = approvedVersions.find((v) => v.id === variantAId);
    const vB = approvedVersions.find((v) => v.id === variantBId);
    if (vA && vB && vA.target_language !== vB.target_language) {
      setErrorMsg(`Cross-language tests are blocked: Variant A (${vA.target_language}) and Variant B (${vB.target_language}) must have identical languages.`);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await createExperimentAction({
        campaignId,
        hypothesis,
        primaryMetricId,
        variantAId,
        variantBId,
        decisionRule,
        attributionWindow,
        duration,
      });

      if (res.success) {
        setHypothesis("");
        router.refresh();
      } else {
        setErrorMsg(res.error || "Failed to create experiment.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLock = async (expId: string) => {
    setIsLocking(expId);
    setErrorMsg("");

    try {
      const res = await lockExperimentAction(expId);
      if (res.success) {
        router.refresh();
      } else {
        setErrorMsg(res.error || "Failed to lock experiment.");
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLocking(null);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-[#2BD64F] uppercase tracking-wider">
            {brandName} • {productName}
          </span>
          <span className="text-xs text-[#777777]">•</span>
          <span className="text-[11px] text-[#A3A3A3]">Section 5 F9 Experiment Planner</span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight mt-1">
          Experiment Planner & Causal Testing
        </h1>
        <p className="text-xs text-[#A3A3A3]">
          A/B testing plans bound to approved versions with pre-test locking and attribution windows.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-[18px] bg-[#2A1414] border border-[#FF5C5C]/30 text-xs text-[#FF8585] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Experiment Design Card */}
      {approvedVersions.length >= 2 ? (
        <Card title="Design New A/B Experiment" icon={<FlaskConical className="w-3.5 h-3.5 text-[#2BD64F]" />}>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#777777] uppercase mb-1.5">
                Testable Hypothesis *
              </label>
              <textarea
                rows={2}
                value={hypothesis}
                onChange={(e) => setHypothesis(e.target.value)}
                placeholder="e.g. Culturally adapted festive colloquial copy will achieve higher CTR than standard literary copy..."
                className="w-full bg-[#1C1C1C] text-white text-xs rounded-[16px] p-3 border border-[#262626]"
              />
            </div>

            {/* Variants Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-[#777777] uppercase mb-1.5">
                  Variant A (Control - Approved Version) *
                </label>
                <select
                  value={variantAId}
                  onChange={(e) => setVariantAId(e.target.value)}
                  className="w-full bg-[#1C1C1C] text-white text-xs rounded-full px-4 py-2.5 border border-[#262626] cursor-pointer"
                >
                  {approvedVersions.map((v) => (
                    <option key={v.id} value={v.id} className="bg-[#1C1C1C]">
                      v{v.version_no} ({v.target_language}) — &ldquo;{v.headline.slice(0, 35)}...&rdquo;
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#777777] uppercase mb-1.5">
                  Variant B (Challenger - Approved Version) *
                </label>
                <select
                  value={variantBId}
                  onChange={(e) => setVariantBId(e.target.value)}
                  className="w-full bg-[#1C1C1C] text-white text-xs rounded-full px-4 py-2.5 border border-[#262626] cursor-pointer"
                >
                  {approvedVersions.map((v) => (
                    <option key={v.id} value={v.id} className="bg-[#1C1C1C]">
                      v{v.version_no} ({v.target_language}) — &ldquo;{v.headline.slice(0, 35)}...&rdquo;
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Metrics & Decision Rules */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-[#777777] uppercase mb-1.5">
                  Primary Outcome Metric *
                </label>
                <select
                  value={primaryMetricId}
                  onChange={(e) => setPrimaryMetricId(e.target.value)}
                  className="w-full bg-[#1C1C1C] text-white text-xs rounded-full px-4 py-2.5 border border-[#262626] cursor-pointer"
                >
                  {metrics.map((m) => (
                    <option key={m.id} value={m.id} className="bg-[#1C1C1C]">
                      {m.name} ({m.formula})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#777777] uppercase mb-1.5">
                  Attribution Window
                </label>
                <input
                  type="text"
                  value={attributionWindow}
                  onChange={(e) => setAttributionWindow(e.target.value)}
                  className="w-full bg-[#1C1C1C] text-white text-xs rounded-full px-4 py-2.5 border border-[#262626]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#777777] uppercase mb-1.5">
                  Test Duration
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-[#1C1C1C] text-white text-xs rounded-full px-4 py-2.5 border border-[#262626]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#777777] uppercase mb-1.5">
                Decision Rule & Sufficiency Gate *
              </label>
              <input
                type="text"
                value={decisionRule}
                onChange={(e) => setDecisionRule(e.target.value)}
                className="w-full bg-[#1C1C1C] text-white text-xs rounded-full px-4 py-2.5 border border-[#262626]"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <PillButton
                variant="white"
                size="md"
                onClick={handleCreate}
                disabled={isSubmitting}
                icon={<FlaskConical className="w-4 h-4 text-black" />}
              >
                Create Experiment Plan
              </PillButton>
            </div>
          </div>
        </Card>
      ) : (
        <Card title="Prerequisite: Approved Creative Variants Required" icon={<AlertTriangle className="w-3.5 h-3.5 text-[#FFE234]" />}>
          <div className="p-4 text-xs text-[#A3A3A3] leading-relaxed">
            Planning a valid causal experiment requires at least <strong>two approved asset versions</strong> with identical language and region. Currently, this campaign has {approvedVersions.length} approved version(s).
            <div className="mt-4">
              <PillButton variant="white" size="sm" href={`/campaigns/${campaignId}/studio`}>
                Generate and Review Variants First
              </PillButton>
            </div>
          </div>
        </Card>
      )}

      {/* Existing Experiments List */}
      <Card title={`Active & Locked Experiments (${experiments.length})`} icon={<FlaskConical className="w-3.5 h-3.5" />}>
        {experiments.length > 0 ? (
          <div className="flex flex-col divide-y divide-[#202020]">
            {experiments.map((exp) => (
              <div key={exp.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white truncate">{exp.hypothesis}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        exp.is_locked ? "bg-[#142618] text-[#2BD64F]" : "bg-[#252525] text-[#FFE234]"
                      }`}
                    >
                      {exp.is_locked ? "Locked" : "Unlocked (Draft)"}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#A3A3A3] mt-1">
                    <span>Metric: <strong className="text-white">{exp.primary_metric_name}</strong></span>
                    <span>Rule: {exp.decision_rule}</span>
                    {exp.locked_at && <span>Locked: {new Date(exp.locked_at).toLocaleDateString()}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {!exp.is_locked ? (
                    <PillButton
                      variant="primary"
                      size="sm"
                      onClick={() => handleLock(exp.id)}
                      disabled={isLocking === exp.id}
                      icon={<Lock className="w-3.5 h-3.5 text-black" />}
                    >
                      {isLocking === exp.id ? "Locking..." : "Lock Experiment"}
                    </PillButton>
                  ) : (
                    <PillButton
                      variant="white"
                      size="sm"
                      href={`/campaigns/${campaignId}/analytics?experimentId=${exp.id}`}
                      icon={<FileSpreadsheet className="w-3.5 h-3.5 text-black" />}
                    >
                      Import & View Results
                    </PillButton>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#777777] py-4 text-center">
            No experiments planned yet for this campaign.
          </p>
        )}
      </Card>
    </div>
  );
}
