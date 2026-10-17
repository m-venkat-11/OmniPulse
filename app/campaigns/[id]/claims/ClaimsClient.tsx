"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Share2,
  Sparkles,
  Plus,
  Lock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  Database,
  ArrowRight,
  Filter,
  Layers,
  HelpCircle,
  X,
} from "lucide-react";
import { Card } from "@/components/design-system/Card";
import { PillButton } from "@/components/design-system/PillButton";
import { StatusChip } from "@/components/design-system/StatusChip";
import { ClaimEvidenceGraph } from "@/components/graph/ClaimEvidenceGraph";
import {
  addClaimAtom,
  updateClaimAtomStatus,
  extractAndSaveClaimsAction,
} from "@/app/actions";

interface ClaimsClientProps {
  campaignId: string;
  campaign: any;
  initialClaims: any[];
}

export function ClaimsClient({
  campaignId,
  campaign,
  initialClaims,
}: ClaimsClientProps) {
  const [claims, setClaims] = useState<any[]>(initialClaims);
  const [isExtracting, setIsExtracting] = useState(false);
  const [filterTab, setFilterTab] = useState<
    "all" | "supported" | "unsupported" | "contradicted" | "needs_review"
  >("all");

  // Manual Add Form Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClaim, setNewClaim] = useState({
    claimText: "",
    claimType: "product_fact",
    lockedTokens: "",
    evidenceStatus: "supported",
    qualifications: "NABL Lab Certificate #2026-F09",
  });
  const [isAdding, setIsAdding] = useState(false);

  // Dynamic Prompt Sandbox State
  const [sandboxText, setSandboxText] = useState("");
  const [isSandboxRunning, setIsSandboxRunning] = useState(false);

  const supportedList = claims.filter(
    (c) => c.evidence_status === "supported" || c.evidenceStatus === "supported"
  );
  const unsupportedList = claims.filter(
    (c) => c.evidence_status === "unsupported" || c.evidenceStatus === "unsupported"
  );
  const contradictedList = claims.filter(
    (c) => c.evidence_status === "contradicted" || c.evidenceStatus === "contradicted"
  );
  const needsReviewList = claims.filter(
    (c) =>
      c.evidence_status === "evidence_missing" ||
      c.evidence_status === "needs_human_review" ||
      (!c.evidence_status && !c.evidenceStatus)
  );

  const filteredClaims = claims.filter((c) => {
    const status = c.evidence_status || c.evidenceStatus || "supported";
    if (filterTab === "all") return true;
    if (filterTab === "supported") return status === "supported";
    if (filterTab === "unsupported") return status === "unsupported";
    if (filterTab === "contradicted") return status === "contradicted";
    if (filterTab === "needs_review")
      return status === "evidence_missing" || status === "needs_human_review";
    return true;
  });

  const handleAutoExtract = async (textOverride?: string) => {
    setIsExtracting(true);
    try {
      const updated = await extractAndSaveClaimsAction(campaignId, textOverride);
      if (Array.isArray(updated)) {
        setClaims(updated);
      }
    } catch (err: any) {
      alert("Claim extraction failed: " + (err.message || String(err)));
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSandboxExtract = async () => {
    if (!sandboxText.trim()) return;
    setIsSandboxRunning(true);
    try {
      const updated = await extractAndSaveClaimsAction(campaignId, sandboxText);
      if (Array.isArray(updated)) {
        setClaims(updated);
        setSandboxText("");
      }
    } catch (err: any) {
      alert("AI Sandbox Extraction failed: " + (err.message || String(err)));
    } finally {
      setIsSandboxRunning(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateClaimAtomStatus(id, status);
      setClaims((prev) =>
        prev.map((c) => (c.id === id ? { ...c, evidence_status: status } : c))
      );
    } catch (err: any) {
      alert("Failed to update claim status: " + (err.message || String(err)));
    }
  };

  const handleAddClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClaim.claimText.trim()) return;
    setIsAdding(true);
    try {
      const tokens = newClaim.lockedTokens
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const id = await addClaimAtom(campaignId, {
        claimText: newClaim.claimText,
        claimType: newClaim.claimType,
        lockedTokens: tokens,
        evidenceStatus: newClaim.evidenceStatus,
        qualifications: newClaim.qualifications,
      });

      const newEntry = {
        id: id || `cl-${Date.now()}`,
        campaign_id: campaignId,
        claim_text: newClaim.claimText,
        claim_type: newClaim.claimType,
        locked_tokens: JSON.stringify(tokens),
        evidence_status: newClaim.evidenceStatus,
        qualifications: newClaim.qualifications,
      };

      setClaims((prev) => [newEntry, ...prev]);
      setShowAddModal(false);
      setNewClaim({
        claimText: "",
        claimType: "product_fact",
        lockedTokens: "",
        evidenceStatus: "supported",
        qualifications: "NABL Lab Certificate #2026-F09",
      });
    } catch (err: any) {
      alert("Failed to add claim: " + (err.message || String(err)));
    } finally {
      setIsAdding(false);
    }
  };

  const parseTokens = (c: any): string[] => {
    const raw = c.locked_tokens || c.lockedTokens;
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return raw.split(",").map((s) => s.trim()).filter(Boolean);
      }
    }
    return [];
  };

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto pb-12">
      {/* Top Hero Banner & Controls */}
      <div className="bg-[#161616] rounded-[28px] p-6 md:p-8 border border-[#222222] shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#222222]">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#182C1E] text-[#2BD64F] flex items-center justify-center font-bold">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
                    Claim Atom Registry & Evidence Graph
                  </h1>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#2BD64F] bg-[#16271B] border border-[#2BD64F]/30 px-2.5 py-0.5 rounded-full">
                    AD-EVIDENCE LAYER
                  </span>
                </div>
                <p className="text-xs text-[#A3A3A3] mt-1">
                  {campaign?.name} • {campaign?.brand_name} ({campaign?.product_name || "Grounded Specs"})
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <PillButton
              variant="dark"
              size="sm"
              onClick={() => setShowAddModal(true)}
              icon={<Plus className="w-3.5 h-3.5 text-white" />}
            >
              Add Claim Atom
            </PillButton>

            <PillButton
              variant="white"
              size="sm"
              onClick={() => handleAutoExtract()}
              disabled={isExtracting}
              icon={<Sparkles className="w-3.5 h-3.5 text-black" />}
            >
              {isExtracting ? "Extracting with Gemini..." : "Auto-Extract from Brief"}
            </PillButton>

            <PillButton
              variant="dark"
              size="sm"
              href={`/campaigns/${campaignId}/studio`}
              iconRight={<ChevronRight className="w-3.5 h-3.5 text-[#888888]" />}
            >
              Regional Studio
            </PillButton>
          </div>
        </div>

        {/* 4-Stat Bento Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div className="bg-[#121212] p-4 rounded-[20px] border border-[#222222]">
            <span className="text-[10px] uppercase font-bold text-[#2BD64F] block mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-[#2BD64F]" /> Supported (Verified)
            </span>
            <div className="text-2xl font-black text-white">{supportedList.length}</div>
            <span className="text-[10px] text-[#777777] block mt-1">Backed by NABL lab specs</span>
          </div>

          <div className="bg-[#121212] p-4 rounded-[20px] border border-[#222222]">
            <span className="text-[10px] uppercase font-bold text-[#F59E0B] block mb-1 flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3 text-[#F59E0B]" /> Unsupported
            </span>
            <div className="text-2xl font-black text-white">{unsupportedList.length}</div>
            <span className="text-[10px] text-[#777777] block mt-1">Lacks attached report</span>
          </div>

          <div className="bg-[#121212] p-4 rounded-[20px] border border-[#222222]">
            <span className="text-[10px] uppercase font-bold text-[#EF4444] block mb-1 flex items-center gap-1.5">
              <XCircle className="w-3 h-3 text-[#EF4444]" /> Contradicted
            </span>
            <div className="text-2xl font-black text-white">{contradictedList.length}</div>
            <span className="text-[10px] text-[#777777] block mt-1">Violates ASCI / FSSAI rules</span>
          </div>

          <div className="bg-[#121212] p-4 rounded-[20px] border border-[#222222]">
            <span className="text-[10px] uppercase font-bold text-[#3B82F6] block mb-1 flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-[#3B82F6]" /> Total Atoms
            </span>
            <div className="text-2xl font-black text-white">{claims.length}</div>
            <span className="text-[10px] text-[#777777] block mt-1">Fact-locked claim pool</span>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════ */}
      {/* INTERACTIVE DYNAMIC CLAIM-EVIDENCE PROVENANCE GRAPH */}
      {/* ═══════════════════════════════════════════════════ */}
      <div className="bg-[#161616] rounded-[28px] p-6 md:p-8 border border-[#222222] shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2BD64F] animate-pulse"></span>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Dynamic Claim-Evidence Provenance Graph
              </h2>
            </div>
            <p className="text-xs text-[#A3A3A3] mt-1">
              Visualizing Brand Entity → Product Entity → Claim Atoms → Grounded Evidence Citations → Regional Indic Ad Variants
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[#888888] bg-[#111111] px-3 py-1 rounded-full border border-[#262626]">
              {claims.length} Atoms Plotted
            </span>
          </div>
        </div>

        {/* ClaimEvidenceGraph Component */}
        <div className="rounded-[22px] overflow-hidden border border-[#262626]">
          <ClaimEvidenceGraph
            campaign={campaign}
            claims={claims}
          />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════ */}
      {/* GEMINI AI EXTRACTION SANDBOX PROMPT                 */}
      {/* ═══════════════════════════════════════════════════ */}
      <div className="bg-[#161616] rounded-[28px] p-6 md:p-8 border border-[#222222] shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#182C1E] text-[#2BD64F] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Live Gemini Claim-Atom Extraction Sandbox
              </h3>
              <p className="text-xs text-[#888888]">
                Paste new brand assertions or compliance documents to extract fact-locked tokens instantly
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <textarea
            value={sandboxText}
            onChange={(e) => setSandboxText(e.target.value)}
            rows={3}
            placeholder="e.g. Made with 100% fresh Alphonso mangoes sourced from Ratnagiri. Clinically tested to provide 2x immunity in 14 days under FSSAI-2026-X9..."
            className="flex-1 bg-[#111111] border border-[#262626] rounded-[18px] p-4 text-xs text-white placeholder-[#666666] focus:outline-none focus:border-[#2BD64F]/50 font-sans resize-none"
          />
          <div className="flex md:flex-col justify-end gap-2">
            <PillButton
              variant="white"
              size="md"
              onClick={handleSandboxExtract}
              disabled={isSandboxRunning || !sandboxText.trim()}
              icon={<Sparkles className="w-3.5 h-3.5 text-black" />}
            >
              {isSandboxRunning ? "Analyzing..." : "Extract Atoms"}
            </PillButton>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════ */}
      {/* FACT-LOCKED CLAIM ATOMS LIST                        */}
      {/* ═══════════════════════════════════════════════════ */}
      <div className="bg-[#161616] rounded-[28px] p-6 md:p-8 border border-[#222222] shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#222222]">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Fact-Locked Claim Atoms
            </h3>
            <p className="text-xs text-[#888888] mt-0.5">
              Atomic claims with immutable locked tokens protected during transcreation
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#111111] p-1 rounded-full border border-[#262626]">
            {(
              [
                { id: "all", label: `All (${claims.length})` },
                { id: "supported", label: `Verified (${supportedList.length})` },
                { id: "unsupported", label: `Unsupported (${unsupportedList.length})` },
                { id: "contradicted", label: `Contradicted (${contradictedList.length})` },
                { id: "needs_review", label: `Needs Review (${needsReviewList.length})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  filterTab === tab.id
                    ? "bg-white text-black shadow-sm font-bold"
                    : "text-[#888888] hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Claim Cards List */}
        {filteredClaims.length === 0 ? (
          <div className="text-center py-16 bg-[#111111] rounded-[22px] border border-[#222222]">
            <ShieldCheck className="w-10 h-10 text-[#444444] mx-auto mb-3" />
            <h4 className="text-sm font-bold text-white mb-1">No claims in this filter view</h4>
            <p className="text-xs text-[#777777] max-w-sm mx-auto mb-4">
              Click &quot;Auto-Extract from Brief&quot; or add custom claim atoms to initialize your evidence graph.
            </p>
            <PillButton
              variant="white"
              size="sm"
              onClick={() => handleAutoExtract()}
              icon={<Sparkles className="w-3.5 h-3.5 text-black" />}
            >
              Auto-Extract with Gemini
            </PillButton>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredClaims.map((c, idx) => {
              const status = c.evidence_status || c.evidenceStatus || "supported";
              const isSupported = status === "supported";
              const isUnsupported = status === "unsupported";
              const isContradicted = status === "contradicted";
              const tokens = parseTokens(c);

              return (
                <div
                  key={c.id || idx}
                  className={`bg-[#121212] rounded-[22px] p-5 border transition-all ${
                    isContradicted
                      ? "border-[#EF4444]/40 bg-[#1A1214]"
                      : isUnsupported
                      ? "border-[#F59E0B]/30"
                      : "border-[#222222] hover:border-[#2BD64F]/30"
                  }`}
                >
                  {/* Top Row: Badges & ID */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                          isSupported
                            ? "bg-[#16271B] text-[#2BD64F] border-[#2BD64F]/30"
                            : isContradicted
                            ? "bg-[#2A1417] text-[#EF4444] border-[#EF4444]/40"
                            : "bg-[#281E12] text-[#F59E0B] border-[#F59E0B]/30"
                        }`}
                      >
                        {isSupported
                          ? "✓ Verified Supported"
                          : isContradicted
                          ? "✕ Contradicted"
                          : "⚠ Unsupported"}
                      </span>

                      <span className="text-[10px] font-mono font-medium text-[#777777] bg-[#1A1A1A] px-2 py-0.5 rounded-md border border-[#262626]">
                        {c.claim_type || "product_fact"}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono text-[#555555]">
                      ID: {String(c.id).slice(0, 10)}
                    </span>
                  </div>

                  {/* Claim Text */}
                  <h4 className="text-sm sm:text-base font-bold text-white mb-3 leading-snug">
                    {c.claim_text || c.claimText}
                  </h4>

                  {/* Locked Tokens & Evidence */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-3 border-t border-[#1F1F1F]">
                    <div>
                      <span className="text-[10px] font-mono uppercase font-bold text-[#888888] block mb-1.5 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-[#2BD64F]" /> Locked Tokens (Verbatim in All Regional Dialects)
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {tokens.length > 0 ? (
                          tokens.map((token, tIdx) => (
                            <span
                              key={tIdx}
                              className="bg-[#1A1A1A] border border-[#2BD64F]/30 px-2.5 py-0.5 rounded-full text-xs font-bold text-[#2BD64F] font-mono shadow-xs"
                            >
                              {token}
                            </span>
                          ))
                        ) : (
                          <span className="text-[#666666] italic text-xs">
                            No tokens locked
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono uppercase font-bold text-[#888888] block mb-1.5 flex items-center gap-1">
                        <FileText className="w-3 h-3 text-[#3B82F6]" /> Grounded Evidence Citation
                      </span>
                      <p className="text-[#CCCCCC] font-medium text-xs bg-[#181818] p-2.5 rounded-xl border border-[#262626] font-mono">
                        {c.qualifications || "No evidence document attached"}
                      </p>
                    </div>
                  </div>

                  {/* Action Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-3 border-t border-[#1F1F1F]">
                    <div className="text-xs text-[#777777]">
                      {isContradicted && "⚠️ Conflicting Fact: Prohibited by ASCI / FSSAI. Must be corrected."}
                      {isUnsupported && "⚠️ Unsubstantiated Assertion: Requires NABL lab certificate."}
                      {isSupported && "✅ Verified Claim: Cleared for multilingual transcreation."}
                    </div>

                    <div className="flex items-center gap-2">
                      {status !== "supported" && (
                        <button
                          onClick={() => handleStatusChange(c.id, "supported")}
                          className="text-xs font-bold text-[#2BD64F] bg-[#16271B] hover:bg-[#1C3322] border border-[#2BD64F]/30 px-3 py-1 rounded-full transition-all"
                        >
                          Mark Supported
                        </button>
                      )}

                      {status !== "unsupported" && (
                        <button
                          onClick={() => handleStatusChange(c.id, "unsupported")}
                          className="text-xs font-bold text-[#F59E0B] bg-[#281E12] hover:bg-[#332616] border border-[#F59E0B]/30 px-3 py-1 rounded-full transition-all"
                        >
                          Flag Unsupported
                        </button>
                      )}

                      {status !== "contradicted" && (
                        <button
                          onClick={() => handleStatusChange(c.id, "contradicted")}
                          className="text-xs font-bold text-[#EF4444] bg-[#2A1417] hover:bg-[#35191D] border border-[#EF4444]/40 px-3 py-1 rounded-full transition-all"
                        >
                          Flag Contradiction
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Manual Add Claim Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161616] border border-[#282828] rounded-[28px] max-w-lg w-full p-6 md:p-8 shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-6 right-6 w-8 h-8 rounded-full bg-[#222222] text-[#888888] hover:text-white flex items-center justify-center transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">
              Add Fact-Locked Claim Atom
            </h3>
            <p className="text-xs text-[#888888] mb-6">
              Register a verified marketing assertion and attach grounded NABL evidence citations.
            </p>

            <form onSubmit={handleAddClaim} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-[#AAAAAA] uppercase tracking-wider block mb-1.5">
                  Claim Statement
                </label>
                <textarea
                  required
                  rows={3}
                  value={newClaim.claimText}
                  onChange={(e) =>
                    setNewClaim({ ...newClaim, claimText: e.target.value })
                  }
                  placeholder="e.g. 100% pure organic cold-pressed oil with zero trans fat"
                  className="w-full bg-[#111111] border border-[#262626] rounded-xl p-3 text-xs text-white placeholder-[#555555] focus:outline-none focus:border-[#2BD64F]/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#AAAAAA] uppercase tracking-wider block mb-1.5">
                    Claim Type
                  </label>
                  <select
                    value={newClaim.claimType}
                    onChange={(e) =>
                      setNewClaim({ ...newClaim, claimType: e.target.value })
                    }
                    className="w-full bg-[#111111] border border-[#262626] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#2BD64F]/50"
                  >
                    <option value="product_fact">Product Fact</option>
                    <option value="approved_term">Approved Term</option>
                    <option value="prohibited_claim">Prohibited Claim</option>
                    <option value="disclosure">Mandatory Disclosure</option>
                    <option value="offer_price">Offer / Pricing</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#AAAAAA] uppercase tracking-wider block mb-1.5">
                    Evidence Status
                  </label>
                  <select
                    value={newClaim.evidenceStatus}
                    onChange={(e) =>
                      setNewClaim({ ...newClaim, evidenceStatus: e.target.value })
                    }
                    className="w-full bg-[#111111] border border-[#262626] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#2BD64F]/50"
                  >
                    <option value="supported">Supported (Verified)</option>
                    <option value="unsupported">Unsupported</option>
                    <option value="contradicted">Contradicted</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#AAAAAA] uppercase tracking-wider block mb-1.5">
                  Locked Tokens (Comma Separated)
                </label>
                <input
                  type="text"
                  value={newClaim.lockedTokens}
                  onChange={(e) =>
                    setNewClaim({ ...newClaim, lockedTokens: e.target.value })
                  }
                  placeholder="e.g. 100% pure, cold-pressed, zero trans fat"
                  className="w-full bg-[#111111] border border-[#262626] rounded-xl p-2.5 text-xs text-white placeholder-[#555555] focus:outline-none focus:border-[#2BD64F]/50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#AAAAAA] uppercase tracking-wider block mb-1.5">
                  Grounded Evidence Citation
                </label>
                <input
                  type="text"
                  value={newClaim.qualifications}
                  onChange={(e) =>
                    setNewClaim({ ...newClaim, qualifications: e.target.value })
                  }
                  placeholder="e.g. NABL Lab Certificate #2026-F09 / Brand Spec v2.4"
                  className="w-full bg-[#111111] border border-[#262626] rounded-xl p-2.5 text-xs text-white placeholder-[#555555] focus:outline-none focus:border-[#2BD64F]/50"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 mt-4 pt-4 border-t border-[#222222]">
                <PillButton
                  variant="dark"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </PillButton>
                <PillButton
                  variant="white"
                  size="sm"
                  disabled={isAdding}
                >
                  {isAdding ? "Saving..." : "Save Claim Atom"}
                </PillButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
