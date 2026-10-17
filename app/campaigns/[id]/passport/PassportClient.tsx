"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Hash,
  ArrowLeft,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Globe2,
  FileText,
  User,
  FlaskConical,
  BarChart3,
  Palette,
  Sparkles,
  Layers,
  ChevronRight,
  ExternalLink,
  RefreshCw,
  Clock,
  Fingerprint,
} from "lucide-react";
import { Card } from "@/components/design-system/Card";
import { PillButton } from "@/components/design-system/PillButton";
import { StatusChip } from "@/components/design-system/StatusChip";
import { EmptyState } from "@/components/design-system/EmptyState";
import { verifyAuditChainAction } from "./actions";

interface PassportClientProps {
  campaignId: string;
  data: {
    campaign: any;
    briefVersions: any[];
    claimAtoms: any[];
    assetVersions: any[];
    findings: any[];
    approvals: any[];
    posters: any[];
    creatorBriefs: any[];
    experiments: any[];
    observations: any[];
    auditEvents: any[];
    chainIntegrity: {
      isValid: boolean;
      totalEvents: number;
      tamperedEventId?: string;
      error?: string;
    };
  };
}

export function PassportClient({ campaignId, data }: PassportClientProps) {
  const {
    campaign,
    briefVersions,
    claimAtoms,
    assetVersions,
    findings,
    approvals,
    posters,
    creatorBriefs,
    experiments,
    observations,
    auditEvents,
    chainIntegrity: initialIntegrity,
  } = data;

  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    assetVersions.length > 0 ? String(assetVersions[0].id) : ""
  );
  const [chainIntegrity, setChainIntegrity] = useState(initialIntegrity);
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeTab, setActiveTab] = useState<"certificate" | "trace" | "audit">("certificate");

  const selectedVariant =
    assetVersions.find((v) => String(v.id) === selectedVariantId) || assetVersions[0];

  const variantFindings = findings.filter(
    (f) => String(f.asset_version_id) === String(selectedVariant?.id)
  );
  const variantApprovals = approvals.filter(
    (a) => String(a.asset_version_id) === String(selectedVariant?.id)
  );
  const variantPosters = posters.filter(
    (p) => String(p.asset_version_id) === String(selectedVariant?.id)
  );
  const variantBriefs = creatorBriefs.filter(
    (c) => String(c.asset_version_id) === String(selectedVariant?.id)
  );

  const latestApproval = variantApprovals[0];

  async function handleReverifyChain() {
    setIsVerifying(true);
    try {
      const res = await verifyAuditChainAction();
      setChainIntegrity(res);
    } catch (err) {
      console.error("Chain verification failed:", err);
    } finally {
      setIsVerifying(false);
    }
  }

  // Parse brief JSON safely
  const latestBriefVersion = briefVersions[briefVersions.length - 1];
  let briefData: any = {};
  try {
    if (latestBriefVersion?.brief_json) {
      briefData = JSON.parse(String(latestBriefVersion.brief_json));
    }
  } catch (e) {
    briefData = {};
  }

  return (
    <div className="space-y-8">
      {/* Top Controls & Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#222222]">
        <div className="flex items-center gap-4">
          <Link
            href={`/campaigns/${campaignId}`}
            className="w-10 h-10 rounded-full bg-[#161616] border border-[#2A2A2A] flex items-center justify-center text-white hover:border-[#2BD64F] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-white tracking-tight">Campaign Passport</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#2BD64F]/10 text-[#2BD64F] border border-[#2BD64F]/30">
                Decision Trace Lineage
              </span>
            </div>
            <p className="text-xs text-[#8E8E93] mt-0.5">
              {campaign.name} • {campaign.brand_name} • Cryptographic Provenance Record
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 print:hidden">
          <div className="bg-[#161616] p-1 rounded-full border border-[#2A2A2A] flex">
            <button
              onClick={() => setActiveTab("certificate")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === "certificate"
                  ? "bg-white text-black shadow-md"
                  : "text-[#8E8E93] hover:text-white"
              }`}
            >
              Certificate
            </button>
            <button
              onClick={() => setActiveTab("trace")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === "trace"
                  ? "bg-white text-black shadow-md"
                  : "text-[#8E8E93] hover:text-white"
              }`}
            >
              Full Lineage
            </button>
            <button
              onClick={() => setActiveTab("audit")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === "audit"
                  ? "bg-white text-black shadow-md"
                  : "text-[#8E8E93] hover:text-white"
              }`}
            >
              SHA-256 Ledger
            </button>
          </div>

          <PillButton
            variant="white"
            onClick={() => window.print()}
            icon={<Printer className="w-4 h-4" />}
          >
            Print Certificate
          </PillButton>
        </div>
      </div>

      {/* Chain Integrity Banner */}
      <div
        className={`p-4 rounded-[22px] border flex flex-wrap items-center justify-between gap-4 transition-all ${
          chainIntegrity.isValid
            ? "bg-[#111A13] border-[#2BD64F]/30 text-white"
            : "bg-[#251212] border-[#FF5C5C]/50 text-white"
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              chainIntegrity.isValid
                ? "bg-[#2BD64F]/20 text-[#2BD64F]"
                : "bg-[#FF5C5C]/20 text-[#FF5C5C]"
            }`}
          >
            {chainIntegrity.isValid ? (
              <ShieldCheck className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wide">
                {chainIntegrity.isValid
                  ? "CRYPTOGRAPHIC SHA-256 CHAIN VERIFIED"
                  : "TAMPER DETECTED IN AUDIT LEDGER"}
              </span>
              <span className="text-[11px] font-mono opacity-70">
                ({chainIntegrity.totalEvents} events chained from GENESIS)
              </span>
            </div>
            <p className="text-[11px] text-[#A3A3A3] mt-0.5">
              {chainIntegrity.isValid
                ? "Every decision, brief mutation, human approval, and observation matches its mathematical hash signature."
                : chainIntegrity.error || "A hash mismatch was detected in stored event payloads."}
            </p>
          </div>
        </div>

        <button
          onClick={handleReverifyChain}
          disabled={isVerifying}
          className="text-xs font-semibold px-4 py-2 rounded-full bg-[#1C1C1E] border border-[#2A2A2A] text-white hover:border-[#2BD64F] transition flex items-center gap-1.5 print:hidden"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? "animate-spin" : ""}`} />
          {isVerifying ? "Verifying..." : "Re-Verify Chain"}
        </button>
      </div>

      {/* Target Variant Selector (if multiple variants exist) */}
      {assetVersions.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 print:hidden">
          <span className="text-xs font-semibold text-[#8E8E93] mr-2">Target Variant:</span>
          {assetVersions.map((v) => {
            const isSelected = String(v.id) === String(selectedVariant?.id);
            return (
              <button
                key={v.id}
                onClick={() => setSelectedVariantId(String(v.id))}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all flex items-center gap-2 shrink-0 ${
                  isSelected
                    ? "bg-[#2BD64F] text-black font-bold shadow-md"
                    : "bg-[#161616] text-[#A3A3A3] border border-[#222222] hover:border-[#444444]"
                }`}
              >
                <Globe2 className="w-3.5 h-3.5" />
                <span>
                  {v.target_language} (v{v.version_no})
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${
                    v.status === "Approved"
                      ? "bg-black/20 text-black"
                      : "bg-[#2A2A2A] text-[#8E8E93]"
                  }`}
                >
                  {v.status}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* TAB 1: OFFICIAL DECISION PASSPORT CERTIFICATE */}
      {activeTab === "certificate" && (
        <div className="bg-[#121212] border border-[#2A2A2A] rounded-[32px] p-8 md:p-12 relative overflow-hidden shadow-2xl print:bg-white print:text-black print:border-none print:p-0">
          {/* Subtle Watermark Seal */}
          <div className="absolute top-8 right-8 opacity-5 pointer-events-none select-none print:opacity-10">
            <ShieldCheck className="w-64 h-64 text-[#2BD64F] print:text-black" />
          </div>

          {/* Certificate Header */}
          <div className="flex flex-wrap items-start justify-between gap-6 pb-8 border-b border-[#2A2A2A] print:border-black/20">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-[#2BD64F]/20 text-[#2BD64F] flex items-center justify-center print:bg-black/10 print:text-black">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white print:text-black">
                    Decision Passport Certificate
                  </h2>
                  <p className="text-[11px] font-mono tracking-widest text-[#2BD64F] uppercase font-bold print:text-black">
                    BRACO OMNIPULSE • REGIONAL CAMPAIGN INTELLIGENCE
                  </p>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-block mb-2">
                <StatusChip status={selectedVariant?.status || "Draft"} />
              </div>
              <div className="text-[11px] font-mono text-[#8E8E93] print:text-neutral-600">
                Asset Version: v{selectedVariant?.version_no || 1}
              </div>
              <div className="text-[11px] font-mono text-[#8E8E93] print:text-neutral-600">
                Issued:{" "}
                {new Date().toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </div>
            </div>
          </div>

          {/* Campaign & Context Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-b border-[#2A2A2A] text-xs print:border-black/20">
            <div className="space-y-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#8E8E93] block">
                Campaign & Product Context
              </span>
              <div className="bg-[#181818] p-4 rounded-[18px] border border-[#262626] print:bg-neutral-50 print:border-neutral-200">
                <div className="text-sm font-bold text-white print:text-black">{campaign.name}</div>
                <div className="text-xs text-[#A3A3A3] mt-1 print:text-neutral-700">
                  Brand: <span className="text-white font-medium print:text-black">{campaign.brand_name}</span> • Product:{" "}
                  <span className="text-white font-medium print:text-black">{campaign.product_name}</span>
                </div>
                <div className="text-xs text-[#A3A3A3] mt-1 print:text-neutral-700">
                  Target Region: <span className="text-white font-medium print:text-black">{campaign.region || "All India"}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#8E8E93] block">
                Linguistic & Regional Specification
              </span>
              <div className="bg-[#181818] p-4 rounded-[18px] border border-[#262626] print:bg-neutral-50 print:border-neutral-200">
                <div className="text-sm font-bold text-white print:text-black">
                  {selectedVariant?.target_language || "All Target Languages"}
                  {selectedVariant?.dialect ? ` (${selectedVariant.dialect})` : ""}
                </div>
                <div className="text-xs text-[#A3A3A3] mt-1 print:text-neutral-700">
                  Channel: <span className="text-white font-medium print:text-black">{selectedVariant?.channel || "Omnichannel"}</span> • Tone:{" "}
                  <span className="text-white font-medium print:text-black">{selectedVariant?.angle || "General"}</span>
                </div>
                <div className="text-xs text-[#A3A3A3] mt-1 print:text-neutral-700">
                  Author: <span className="text-white font-medium print:text-black">{selectedVariant?.author_name || "System"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Exact Regional Copy & Translation Diff */}
          <div className="py-8 border-b border-[#2A2A2A] space-y-6 print:border-black/20">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#2BD64F] block mb-2 print:text-black">
                Certified Regional Creative Copy ({selectedVariant?.target_language})
              </span>
              <div className="bg-[#161616] p-6 rounded-[22px] border-l-4 border-[#2BD64F] print:bg-neutral-50 print:border-black">
                <h3 className="text-lg md:text-xl font-bold text-white leading-relaxed print:text-black">
                  {selectedVariant?.headline || selectedVariant?.regional_adaptation || "No adaptation generated."}
                </h3>
                {selectedVariant?.subline && (
                  <p className="text-sm text-[#CCCCCC] mt-2 print:text-neutral-800">
                    {selectedVariant.subline}
                  </p>
                )}
                {selectedVariant?.body && (
                  <p className="text-xs text-[#A3A3A3] mt-3 whitespace-pre-wrap leading-relaxed print:text-neutral-700">
                    {selectedVariant.body}
                  </p>
                )}
              </div>
            </div>

            {selectedVariant?.literal_translation && (
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#8E8E93] block mb-2 print:text-neutral-600">
                  Literal English Back-Translation
                </span>
                <div className="bg-[#181818] p-4 rounded-[18px] border border-[#262626] text-xs text-[#CCCCCC] italic print:bg-neutral-50 print:text-neutral-800 print:border-neutral-200">
                  &ldquo;{selectedVariant.literal_translation}&rdquo;
                </div>
              </div>
            )}
          </div>

          {/* Certified Claim Atoms Preserved */}
          <div className="py-8 border-b border-[#2A2A2A] space-y-4 print:border-black/20">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#2BD64F] print:text-black" />
              <span className="text-[10px] uppercase font-bold tracking-wider text-white print:text-black">
                Certified Claim Atoms Preserved
              </span>
            </div>

            {claimAtoms.length === 0 ? (
              <p className="text-xs text-[#8E8E93]">No specific Claim Atoms registered for this campaign.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {claimAtoms.map((cl) => (
                  <div
                    key={cl.id}
                    className="p-3.5 rounded-[16px] bg-[#181818] border border-[#262626] text-xs space-y-1.5 print:bg-neutral-50 print:border-neutral-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[#2BD64F] font-semibold text-[11px] print:text-black">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span className="uppercase">{cl.type || "Product Fact"}</span>
                      </div>
                      <span className="text-[10px] font-mono text-[#8E8E93]">
                        Status: {cl.status}
                      </span>
                    </div>
                    <p className="font-medium text-white print:text-black">&ldquo;{cl.claim_text}&rdquo;</p>
                    {cl.qualifications && (
                      <p className="text-[11px] text-[#A3A3A3] font-mono print:text-neutral-600">
                        Evidence: {cl.qualifications}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Review Decision Sign-Off & Cryptographic Fingerprint */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 text-xs">
            {/* Cryptographic Stamp */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-[#2BD64F] print:text-black" />
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#8E8E93] print:text-neutral-600">
                  Cryptographic Integrity Stamp
                </span>
              </div>
              <div className="bg-[#181818] p-4 rounded-[18px] border border-[#262626] font-mono text-[11px] space-y-2 text-[#CCCCCC] print:bg-neutral-50 print:border-neutral-200 print:text-neutral-800">
                <div>
                  <span className="text-[#8E8E93] block text-[10px]">CONTENT SHA-256 HASH:</span>
                  <span className="text-[#2BD64F] font-bold break-all print:text-black">
                    {selectedVariant?.content_hash || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-[#8E8E93] block text-[10px]">ASSET VERSION ID:</span>
                  <span className="break-all">{selectedVariant?.id || "—"}</span>
                </div>
                <div>
                  <span className="text-[#8E8E93] block text-[10px]">CREATIVE ASSET ID:</span>
                  <span className="break-all">{selectedVariant?.creative_asset_id || "—"}</span>
                </div>
              </div>
            </div>

            {/* Human Reviewer Sign-Off */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#2BD64F] print:text-black" />
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#8E8E93] print:text-neutral-600">
                  Human Reviewer Sign-Off
                </span>
              </div>
              <div className="bg-[#181818] p-4 rounded-[18px] border border-[#262626] text-xs space-y-2 text-[#CCCCCC] print:bg-neutral-50 print:border-neutral-200 print:text-neutral-800">
                {latestApproval ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-[#8E8E93]">Reviewer:</span>
                      <span className="font-bold text-white print:text-black">
                        {latestApproval.reviewer_name || "Assigned Reviewer"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#8E8E93]">Decision:</span>
                      <span className="font-bold text-[#2BD64F] uppercase print:text-black">
                        {latestApproval.decision}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#8E8E93]">Signed At:</span>
                      <span className="font-mono text-[11px]">
                        {new Date(latestApproval.decided_at).toLocaleString("en-IN")}
                      </span>
                    </div>
                    {latestApproval.rationale && (
                      <div className="pt-2 border-t border-[#262626] text-[11px] text-[#A3A3A3] italic print:border-neutral-300">
                        &ldquo;{latestApproval.rationale}&rdquo;
                      </div>
                    )}
                    {latestApproval.override_reason && (
                      <div className="pt-1 text-[11px] text-[#FFE234]">
                        Override Applied: {latestApproval.override_reason}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-2 text-center text-[#8E8E93]">
                    No human approval recorded for this variant yet.
                    <div className="mt-2">
                      <Link
                        href={`/campaigns/${campaignId}/review?versionId=${selectedVariant?.id}`}
                        className="text-[#2BD64F] hover:underline text-xs font-semibold print:hidden"
                      >
                        Open Review Queue &rarr;
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Certificate Footer */}
          <div className="mt-12 pt-6 border-t border-[#2A2A2A] flex flex-wrap items-center justify-between text-[10px] text-[#8E8E93] print:border-black/20 print:text-neutral-500">
            <span>Braco OmniPulse • Samartha Stage 1 • Regional Campaign Intelligence</span>
            <span>Immutable Hash-Verified Document • LibSQL Backed</span>
          </div>
        </div>
      )}

      {/* TAB 2: FULL DECISION TRACE LINEAGE (10 STAGES) */}
      {activeTab === "trace" && (
        <div className="space-y-6">
          {/* Stage 1: Brief Origin */}
          <Card title="Stage 1: Source Brief Origin" icon={<FileText className="w-4 h-4 text-[#2BD64F]" />}>
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#1F1F1F] p-4 rounded-[18px]">
                  <span className="text-[#8E8E93] text-[10px] uppercase font-bold block mb-1">
                    Brief Version
                  </span>
                  <div className="text-white font-bold text-sm">
                    v{latestBriefVersion?.version_no || 1}
                  </div>
                  <div className="text-[10px] font-mono text-[#8E8E93] mt-1 break-all">
                    Hash: {latestBriefVersion?.content_hash || "—"}
                  </div>
                </div>

                <div className="bg-[#1F1F1F] p-4 rounded-[18px]">
                  <span className="text-[#8E8E93] text-[10px] uppercase font-bold block mb-1">
                    Created By & At
                  </span>
                  <div className="text-white font-bold text-sm">
                    {latestBriefVersion?.author_name || campaign.owner_name || "Admin"}
                  </div>
                  <div className="text-[10px] font-mono text-[#8E8E93] mt-1">
                    {latestBriefVersion?.created_at
                      ? new Date(latestBriefVersion.created_at).toLocaleString("en-IN")
                      : "—"}
                  </div>
                </div>

                <div className="bg-[#1F1F1F] p-4 rounded-[18px]">
                  <span className="text-[#8E8E93] text-[10px] uppercase font-bold block mb-1">
                    Target Languages
                  </span>
                  <div className="text-white font-bold text-sm">
                    {campaign.target_languages_json
                      ? JSON.parse(campaign.target_languages_json).join(", ")
                      : "English"}
                  </div>
                  <div className="text-[10px] text-[#8E8E93] mt-1">
                    Region: {campaign.region || "All India"}
                  </div>
                </div>
              </div>

              <div className="bg-[#181818] p-4 rounded-[18px] border border-[#222222]">
                <span className="text-[#8E8E93] text-[10px] uppercase font-bold block mb-1">
                  Core Objective
                </span>
                <p className="text-white text-xs leading-relaxed">{campaign.objective}</p>
              </div>

              {briefData.mandatory_disclosures && briefData.mandatory_disclosures.length > 0 && (
                <div className="bg-[#181818] p-4 rounded-[18px] border border-[#222222]">
                  <span className="text-[#8E8E93] text-[10px] uppercase font-bold block mb-2">
                    Mandatory Disclosures
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-[#CCCCCC]">
                    {briefData.mandatory_disclosures.map((d: string, i: number) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Card>

          {/* Stage 2: Claim Atoms */}
          <Card title="Stage 2: Claim Atoms & Evidence References" icon={<Lock className="w-4 h-4 text-[#2BD64F]" />}>
            {claimAtoms.length === 0 ? (
              <EmptyState
                title="No Claim Atoms"
                description="No specific claim atoms were locked for this campaign brief."
              />
            ) : (
              <div className="space-y-3">
                {claimAtoms.map((cl) => (
                  <div
                    key={cl.id}
                    className="p-4 rounded-[18px] bg-[#181818] border border-[#222222] flex flex-wrap items-start justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1.5 max-w-xl">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#2BD64F]/10 text-[#2BD64F]">
                          {cl.type}
                        </span>
                        <span className="text-[10px] font-mono text-[#8E8E93]">
                          Status: {cl.status}
                        </span>
                      </div>
                      <div className="font-semibold text-white">&ldquo;{cl.claim_text}&rdquo;</div>
                      {cl.qualifications && (
                        <div className="text-[11px] text-[#A3A3A3]">
                          Qualifications: {cl.qualifications}
                        </div>
                      )}
                      {cl.source_uri && (
                        <div className="text-[11px] text-[#60A5FA] flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" />
                          <span>Source: {cl.source_uri}</span>
                        </div>
                      )}
                    </div>

                    <div className="text-right text-[11px] font-mono text-[#8E8E93]">
                      <div>Atom ID: {cl.id}</div>
                      <div>Registered: {new Date(cl.created_at).toLocaleDateString("en-IN")}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Stage 3: Regional Adaptation */}
          <Card title="Stage 3: Linguistic Adaptation & Asset Versions" icon={<Globe2 className="w-4 h-4 text-[#2BD64F]" />}>
            <div className="space-y-4">
              {assetVersions.map((av) => (
                <div
                  key={av.id}
                  className="p-5 rounded-[20px] bg-[#181818] border border-[#222222] space-y-3 text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">
                        {av.target_language} (v{av.version_no})
                      </span>
                      {av.dialect && (
                        <span className="text-[11px] text-[#8E8E93]">Dialect: {av.dialect}</span>
                      )}
                      <StatusChip status={av.status} />
                    </div>
                    <div className="font-mono text-[10px] text-[#8E8E93] break-all">
                      Hash: {av.content_hash}
                    </div>
                  </div>

                  <div className="p-4 rounded-[16px] bg-[#121212] border border-[#2A2A2A]">
                    <div className="font-bold text-white text-base leading-relaxed">
                      {av.headline || av.regional_adaptation}
                    </div>
                    {av.subline && <div className="text-xs text-[#CCCCCC] mt-1">{av.subline}</div>}
                    {av.body && <div className="text-xs text-[#A3A3A3] mt-2">{av.body}</div>}
                  </div>

                  {av.literal_translation && (
                    <div className="text-[11px] text-[#A3A3A3] italic">
                      Literal Back-Translation: &ldquo;{av.literal_translation}&rdquo;
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Stage 4: Brand Guardian Verification */}
          <Card title="Stage 4: Evidence-First Brand Guardian Scan" icon={<ShieldCheck className="w-4 h-4 text-[#2BD64F]" />}>
            {variantFindings.length === 0 ? (
              <div className="p-6 rounded-[20px] bg-[#181818] border border-[#222222] text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#2BD64F] mx-auto" />
                <div className="text-xs font-bold text-white">Zero Blocker Findings</div>
                <p className="text-[11px] text-[#8E8E93]">
                  All deterministic Layer 1 checks (Unicode NFC, zero-width stripping, locked tokens) and Layer 2 claim checks passed with clean verification.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {variantFindings.map((f) => (
                  <div
                    key={f.id}
                    className="p-4 rounded-[18px] bg-[#181818] border border-[#222222] text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            f.severity === "Critical" || f.severity === "High"
                              ? "bg-[#FF5C5C]/20 text-[#FF5C5C]"
                              : "bg-[#FFE234]/20 text-[#FFE234]"
                          }`}
                        >
                          {f.severity} • {f.category}
                        </span>
                        <span className="text-[11px] font-mono text-[#8E8E93]">
                          Layer: {f.detection_layer}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-[#8E8E93]">
                        Result: {f.result_class}
                      </span>
                    </div>

                    <div className="text-white font-medium">
                      Quoted text: &ldquo;{f.quoted_text}&rdquo;
                    </div>
                    <p className="text-[#A3A3A3] text-[11px]">{f.explanation}</p>
                    {f.suggested_correction && (
                      <p className="text-[#2BD64F] text-[11px] font-mono">
                        Suggestion: {f.suggested_correction}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Stage 5: Review Decisions */}
          <Card title="Stage 5: Review Decisions & Audit Gates" icon={<User className="w-4 h-4 text-[#2BD64F]" />}>
            {variantApprovals.length === 0 ? (
              <EmptyState
                title="Pending Human Sign-Off"
                description="This variant has not completed the four-gate review queue yet."
              />
            ) : (
              <div className="space-y-3">
                {variantApprovals.map((ap) => (
                  <div
                    key={ap.id}
                    className="p-4 rounded-[18px] bg-[#181818] border border-[#222222] text-xs flex flex-wrap items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{ap.reviewer_name}</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#2BD64F]/20 text-[#2BD64F]">
                          {ap.decision}
                        </span>
                      </div>
                      <div className="text-[#A3A3A3] text-[11px]">
                        Rationale: {ap.rationale || "Approved under Brand Guardian criteria."}
                      </div>
                      {ap.override_reason && (
                        <div className="text-[#FFE234] text-[11px]">
                          Override: {ap.override_reason}
                        </div>
                      )}
                    </div>

                    <div className="text-right text-[11px] font-mono text-[#8E8E93]">
                      <div>Decision ID: {ap.id}</div>
                      <div>{new Date(ap.decided_at).toLocaleString("en-IN")}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Stage 6: Poster Generation */}
          <Card title="Stage 6: Ad Poster Studio Artifacts" icon={<Palette className="w-4 h-4 text-[#2BD64F]" />}>
            {variantPosters.length === 0 ? (
              <EmptyState
                title="No Posters Generated"
                description="No visual poster layout has been generated for this variant yet."
              />
            ) : (
              <div className="space-y-3">
                {variantPosters.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-[18px] bg-[#181818] border border-[#222222] text-xs flex flex-wrap items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">Format: {p.format}</span>
                        <span className="text-[10px] font-mono text-[#8E8E93]">
                          Template: {p.layout_template_id}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            p.is_approved ? "bg-[#2BD64F]/20 text-[#2BD64F]" : "bg-[#FFE234]/20 text-[#FFE234]"
                          }`}
                        >
                          {p.is_approved ? "Approved Export" : "Draft Watermarked"}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-[#A3A3A3] break-all">
                        Text Hash: {p.text_hash}
                      </div>
                    </div>

                    <div className="text-right text-[11px] font-mono text-[#8E8E93]">
                      <div>Poster ID: {p.id}</div>
                      <div>{new Date(p.created_at).toLocaleString("en-IN")}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Stage 7: Creator Briefs */}
          <Card title="Stage 7: Creator Match & Outbound Briefs" icon={<User className="w-4 h-4 text-[#2BD64F]" />}>
            {variantBriefs.length === 0 ? (
              <EmptyState
                title="No Creator Briefs"
                description="No influencer or creator briefs have been created from this approved variant."
              />
            ) : (
              <div className="space-y-3">
                {variantBriefs.map((cb) => (
                  <div
                    key={cb.id}
                    className="p-4 rounded-[18px] bg-[#181818] border border-[#222222] text-xs flex flex-wrap items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-white text-sm">
                        {cb.display_name} ({cb.handle})
                      </div>
                      <div className="text-[#A3A3A3] text-[11px]">
                        Primary Language: {cb.primary_language} • Objective: {cb.objective}
                      </div>
                      <div className="text-[11px] text-[#2BD64F] font-mono">
                        Required Disclosure: &ldquo;{cb.required_disclosure}&rdquo;
                      </div>
                    </div>

                    <div className="text-right text-[11px] font-mono text-[#8E8E93]">
                      <div>Brief ID: {cb.id}</div>
                      <div>Sent: {new Date(cb.created_at).toLocaleDateString("en-IN")}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Stage 8: Experiments */}
          <Card title="Stage 8: Experiment Hypotheses & Guardrails" icon={<FlaskConical className="w-4 h-4 text-[#2BD64F]" />}>
            {experiments.length === 0 ? (
              <EmptyState
                title="No Experiments Configured"
                description="No A/B test or regional experiment has been planned for this campaign yet."
              />
            ) : (
              <div className="space-y-3">
                {experiments.map((exp) => (
                  <div
                    key={exp.id}
                    className="p-4 rounded-[18px] bg-[#181818] border border-[#222222] text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">Hypothesis</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            exp.is_locked ? "bg-[#2BD64F]/20 text-[#2BD64F]" : "bg-[#FFE234]/20 text-[#FFE234]"
                          }`}
                        >
                          {exp.is_locked ? "Locked" : "Draft"}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-[#8E8E93]">
                        Metric: {exp.metric_name || "CTR"}
                      </span>
                    </div>

                    <p className="text-white text-xs">&ldquo;{exp.hypothesis}&rdquo;</p>
                    <div className="text-[11px] text-[#8E8E93]">
                      Allocation: {exp.allocation} • Duration: {exp.duration} • Attribution:{" "}
                      {exp.attribution_window}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Stage 9: Performance Observations */}
          <Card title="Stage 9: Observed Performance Metrics" icon={<BarChart3 className="w-4 h-4 text-[#2BD64F]" />}>
            {observations.length === 0 ? (
              <EmptyState
                title="No Metrics Imported"
                description="No campaign analytics observations have been imported from verified CSV files."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#222222] text-[#8E8E93]">
                      <th className="pb-3 font-semibold">Variant</th>
                      <th className="pb-3 font-semibold">Observed Value</th>
                      <th className="pb-3 font-semibold">Provenance</th>
                      <th className="pb-3 font-semibold">Batch Source</th>
                      <th className="pb-3 font-semibold">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F1F1F]">
                    {observations.map((obs: any, i: number) => (
                      <tr key={i} className="py-2.5">
                        <td className="py-2.5 font-bold text-white">{obs.variant_label}</td>
                        <td className="py-2.5 font-mono text-[#2BD64F]">{obs.value}</td>
                        <td className="py-2.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#2BD64F]/10 text-[#2BD64F]">
                            {obs.provenance || "IMPORTED_OBSERVED"}
                          </span>
                        </td>
                        <td className="py-2.5 text-[#8E8E93] font-mono text-[11px]">
                          {obs.import_filename || "Direct CSV"}
                        </td>
                        <td className="py-2.5 text-[#8E8E93] font-mono text-[11px]">
                          {new Date(obs.observed_at).toLocaleDateString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB 3: SHA-256 AUDIT TRAIL LEDGER */}
      {activeTab === "audit" && (
        <Card
          title="Cryptographic SHA-256 Hash-Chained Audit Ledger"
          icon={<Fingerprint className="w-4 h-4 text-[#2BD64F]" />}
        >
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-[#141414] p-4 rounded-[18px] border border-[#222222]">
              <div>
                <span className="text-white font-bold block">
                  Workspace Hash-Chaining Standard (HMAC / SHA-256)
                </span>
                <span className="text-[11px] text-[#8E8E93]">
                  Each event payload is hashed with the previous event&apos;s SHA-256 digest, preventing retrospective modification.
                </span>
              </div>
              <div className="font-mono text-xs text-[#2BD64F] font-bold">
                {auditEvents.length} Events Logged
              </div>
            </div>

            {auditEvents.length === 0 ? (
              <EmptyState
                title="No Audit Events"
                description="No recorded audit actions found for this campaign."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-[#222222] text-[#8E8E93] text-[11px]">
                      <th className="pb-3 font-semibold">Timestamp</th>
                      <th className="pb-3 font-semibold">Event Type</th>
                      <th className="pb-3 font-semibold">Actor</th>
                      <th className="pb-3 font-semibold">Previous Hash</th>
                      <th className="pb-3 font-semibold">Event Hash</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F1F1F]">
                    {auditEvents.map((ev: any, idx: number) => (
                      <tr key={ev.id} className="py-2 text-[11px]">
                        <td className="py-2.5 text-[#8E8E93] whitespace-nowrap">
                          {new Date(ev.created_at).toLocaleString("en-IN")}
                        </td>
                        <td className="py-2.5 text-white font-bold whitespace-nowrap">
                          {ev.event_type}
                        </td>
                        <td className="py-2.5 text-[#CCCCCC] whitespace-nowrap">
                          {ev.actor_name || "System"}
                        </td>
                        <td className="py-2.5 text-[#8E8E93] max-w-[120px] truncate" title={ev.prev_hash || "GENESIS"}>
                          {ev.prev_hash ? `${ev.prev_hash.substring(0, 10)}...` : "GENESIS"}
                        </td>
                        <td className="py-2.5 text-[#2BD64F] max-w-[140px] truncate font-bold" title={ev.hash}>
                          {ev.hash.substring(0, 12)}...
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
