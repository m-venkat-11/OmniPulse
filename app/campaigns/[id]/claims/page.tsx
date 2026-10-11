"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  ArrowLeft, CheckCircle2, AlertTriangle, Plus, Lock, ChevronRight,
  Sparkles, ShieldCheck, XCircle, FileText, ExternalLink, RefreshCw,
  Hash, ArrowRight, Database
} from "lucide-react";
import Link from "next/link";
import {
  getCampaign, getClaimAtoms, addClaimAtom, updateClaimAtomStatus,
  extractAndSaveClaimsAction
} from "@/app/actions";
import { ClaimEvidenceGraph } from "@/components/graph/ClaimEvidenceGraph";

export default function ClaimAtomsPage() {
  const params = useParams();
  const campaignId = params.id as string;
  const [campaign, setCampaign] = useState<any>(null);
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExtracting, setIsExtracting] = useState(false);
  const [filterTab, setFilterTab] = useState<"all" | "supported" | "unsupported" | "contradicted" | "evidence_missing">("all");

  // Manual Add Form State
  const [showAdd, setShowAdd] = useState(false);
  const [newClaim, setNewClaim] = useState({
    claimText: "",
    claimType: "product_fact",
    lockedTokens: "",
    evidenceStatus: "supported",
    qualifications: "NABL Lab Certificate #2026-F09"
  });

  // Dynamic Prompt Sandbox State
  const [sandboxText, setSandboxText] = useState("");
  const [isSandboxRunning, setIsSandboxRunning] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [c, cl] = await Promise.all([
          getCampaign(campaignId),
          getClaimAtoms(campaignId)
        ]);
        setCampaign(c);
        setClaims(cl as any[]);
      } catch (err) {
        console.error("Failed to load claims:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [campaignId]);

  const refreshClaims = async () => {
    const updated = await getClaimAtoms(campaignId);
    setClaims(updated as any[]);
  };

  const handleAutoExtract = async (textOverride?: string) => {
    setIsExtracting(true);
    try {
      const updated = await extractAndSaveClaimsAction(campaignId, textOverride);
      setClaims(updated as any[]);
    } catch (err: any) {
      alert("Extraction failed: " + err.message);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSandboxExtract = async () => {
    if (!sandboxText.trim()) return;
    setIsSandboxRunning(true);
    try {
      const updated = await extractAndSaveClaimsAction(campaignId, sandboxText);
      setClaims(updated as any[]);
      setSandboxText("");
    } catch (err: any) {
      alert("AI Analysis Error: " + err.message);
    } finally {
      setIsSandboxRunning(false);
    }
  };

  const handleAddClaim = async () => {
    if (!newClaim.claimText.trim()) return;
    await addClaimAtom(campaignId, {
      ...newClaim,
      lockedTokens: newClaim.lockedTokens.split(",").map(t => t.trim()).filter(Boolean),
    });
    await refreshClaims();
    setShowAdd(false);
    setNewClaim({
      claimText: "",
      claimType: "product_fact",
      lockedTokens: "",
      evidenceStatus: "supported",
      qualifications: "NABL Lab Certificate #2026-F09"
    });
  };

  const handleStatusChange = async (id: string, status: string) => {
    await updateClaimAtomStatus(id, status);
    await refreshClaims();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0C0E14] flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-8 h-8 border-3 border-emerald-400 border-t-white rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-neutral-400">Loading Fact-Locked Claim Atoms...</p>
        </div>
      </div>
    );
  }

  const supportedList = claims.filter(c => c.evidence_status === "supported");
  const unsupportedList = claims.filter(c => c.evidence_status === "unsupported");
  const contradictedList = claims.filter(c => c.evidence_status === "contradicted");
  const missingList = claims.filter(c => c.evidence_status === "evidence_missing" || c.evidence_status === "needs_human_review");

  const filteredClaims = claims.filter(c => {
    if (filterTab === "all") return true;
    if (filterTab === "supported") return c.evidence_status === "supported";
    if (filterTab === "unsupported") return c.evidence_status === "unsupported";
    if (filterTab === "contradicted") return c.evidence_status === "contradicted";
    if (filterTab === "evidence_missing") return c.evidence_status === "evidence_missing" || c.evidence_status === "needs_human_review";
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0C0E14] p-3 sm:p-5 lg:p-6 flex flex-col items-center">
      <div className="w-full max-w-[1400px] flex flex-col space-y-4">

        {/* Top Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 px-3 py-1 text-white">
          <div className="flex items-center gap-3">
            <Link href={`/campaigns/${campaignId}`} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition">
              <ArrowLeft size={16} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-sans font-bold text-lg text-white">Claim Atom Registry & Provenance</h1>
                <span className="text-3xs font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  AD-EVIDENCE LAYER
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                {campaign?.name} • {campaign?.brand_name} ({campaign?.product_name})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdd(true)}
              icon={<Plus size={14}/>}
              className="bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              Add Claim Atom
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleAutoExtract()}
              disabled={isExtracting}
              icon={<Sparkles size={14}/>}
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold"
            >
              {isExtracting ? "Extracting with Gemini..." : "Auto-Extract from Brief (Gemini 3.8)"}
            </Button>
            <Link href={`/campaigns/${campaignId}/studio`}>
              <Button variant="outline" size="sm" iconRight={<ChevronRight size={14}/>} className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                Open Regional Studio
              </Button>
            </Link>
          </div>
        </header>

        {/* Main Inner Surface: Clean White Rounded Canvas */}
        <main className="rounded-[32px] shadow-2xl p-6 sm:p-8 lg:p-10 border border-white/10 bg-white min-h-[calc(100vh-120px)] text-[#11141A] space-y-8">

          {/* ═══════════════════════════════════════════════════ */}
          {/* BANNER: DIAGRAM 1 VERIFICATION PIPELINE EXPLANATION */}
          {/* ═══════════════════════════════════════════════════ */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <h3 className="font-extrabold text-sm text-[#11141A] tracking-tight">
                  Data Flow Diagram 1: Brand Guardian Verification Pipeline
                </h3>
              </div>
              <span className="text-2xs font-mono text-neutral-500 bg-white px-2 py-1 rounded border border-neutral-200">
                Brief → Fact-Locked Atoms → NABL Evidence Grounding → Regional Adaptation
              </span>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Every marketing assertion is parsed into an atomic claim entity (Claim Atom) with immutable tokens (percentages, clinical metrics, numbers). Each claim is compared against grounded evidence references and classified into 4 verified states: <strong>Supported</strong>, <strong>Unsupported</strong>, <strong>Contradicted</strong>, or <strong>Evidence Missing</strong>.
            </p>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-neutral-200 text-xs">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                <span className="text-3xs uppercase font-bold text-emerald-800 block mb-0.5">Supported (Verified)</span>
                <span className="text-xl font-black text-emerald-900">{supportedList.length}</span>
                <span className="text-3xs text-emerald-700 block mt-0.5">Backed by NABL lab specs</span>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <span className="text-3xs uppercase font-bold text-amber-800 block mb-0.5">Unsupported</span>
                <span className="text-xl font-black text-amber-900">{unsupportedList.length}</span>
                <span className="text-3xs text-amber-700 block mt-0.5">Missing citation backing</span>
              </div>
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3">
                <span className="text-3xs uppercase font-bold text-rose-800 block mb-0.5">Contradicted</span>
                <span className="text-xl font-black text-rose-900">{contradictedList.length}</span>
                <span className="text-3xs text-rose-700 block mt-0.5">Conflicts with law / ASCI</span>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <span className="text-3xs uppercase font-bold text-blue-800 block mb-0.5">Evidence Missing</span>
                <span className="text-xl font-black text-blue-900">{missingList.length}</span>
                <span className="text-3xs text-blue-700 block mt-0.5">Requires reviewer review</span>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════ */}
          {/* INTERACTIVE INPUT: LIVE CLAIM EXTRACTION SANDBOX    */}
          {/* ═══════════════════════════════════════════════════ */}
          <div className="bg-white border-2 border-emerald-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-emerald-500" />
                <h3 className="font-bold text-sm text-[#11141A]">
                  Dynamic Input: Extract New Claim Atoms with Gemini 3.8
                </h3>
              </div>
              <span className="text-2xs text-neutral-500">Adapts dynamically to any input copy</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <textarea
                rows={2}
                value={sandboxText}
                onChange={e => setSandboxText(e.target.value)}
                placeholder="Enter new product statement or ingredient fact (e.g., 'Contains 4x higher fiber than cornflakes and zero added palm oil')..."
                className="flex-1 p-3 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-emerald-500 outline-none resize-none font-sans"
              />
              <button
                onClick={handleSandboxExtract}
                disabled={isSandboxRunning || !sandboxText.trim()}
                style={{ backgroundColor: "#11141A", color: "#FFFFFF" }}
                className="px-5 py-3 rounded-xl text-xs font-bold hover:bg-black disabled:opacity-50 transition flex items-center justify-center gap-2 shrink-0 self-center"
              >
                {isSandboxRunning ? (
                  <>
                    <RefreshCw size={14} className="animate-spin text-emerald-400" />
                    <span>Extracting...</span>
                  </>
                ) : (
                  <>
                    <Plus size={14} className="text-emerald-400" />
                    <span>Extract & Lock Atom</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════ */}
          {/* MODAL: MANUAL ADD CLAIM ATOM FORM                 */}
          {/* ═══════════════════════════════════════════════════ */}
          {showAdd && (
            <div className="bg-[#F8FAFC] rounded-2xl border border-neutral-300 p-6 shadow-md animate-fade-in space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                <h3 className="text-sm font-bold text-neutral-800 flex items-center gap-2">
                  <Plus size={16} className="text-emerald-600" />
                  Define Claim Atom & Grounded Evidence Reference
                </h3>
                <span className="text-2xs font-mono text-neutral-500 uppercase">Diagram 3 ER Entity</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Claim Statement *</label>
                <textarea
                  rows={2}
                  value={newClaim.claimText}
                  onChange={e => setNewClaim(p => ({ ...p, claimText: e.target.value }))}
                  placeholder="e.g. Delivers 100% of daily iron needs when consumed with milk"
                  className="w-full p-3 rounded-xl border border-neutral-300 text-xs font-sans outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Claim Type</label>
                  <select
                    value={newClaim.claimType}
                    onChange={e => setNewClaim(p => ({ ...p, claimType: e.target.value }))}
                    className="w-full h-10 px-3 rounded-xl border border-neutral-300 text-xs bg-white"
                  >
                    <option value="product_fact">Product Fact / Specification</option>
                    <option value="comparative">Comparative Assertion</option>
                    <option value="health_benefit">Health & Nutrition Benefit</option>
                    <option value="certification">Statutory Certification</option>
                    <option value="prohibited_claim">Prohibited Claim (Audit Test)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Evidence Status (Diagram 1)</label>
                  <select
                    value={newClaim.evidenceStatus}
                    onChange={e => setNewClaim(p => ({ ...p, evidenceStatus: e.target.value }))}
                    className="w-full h-10 px-3 rounded-xl border border-neutral-300 text-xs bg-white"
                  >
                    <option value="supported">Supported (Verified with Evidence)</option>
                    <option value="unsupported">Unsupported (No Lab Proof)</option>
                    <option value="contradicted">Contradicted (Conflicts with Law)</option>
                    <option value="needs_human_review">Evidence Missing / Needs Review</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Locked Fact Tokens (Comma-separated)</label>
                  <input
                    type="text"
                    value={newClaim.lockedTokens}
                    onChange={e => setNewClaim(p => ({ ...p, lockedTokens: e.target.value }))}
                    placeholder="e.g. 100%, daily iron, 200ml milk"
                    className="w-full h-10 px-3 rounded-xl border border-neutral-300 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Evidence Reference (NABL Certificate, Lab Report, or Statutory Code)
                </label>
                <input
                  type="text"
                  value={newClaim.qualifications}
                  onChange={e => setNewClaim(p => ({ ...p, qualifications: e.target.value }))}
                  placeholder="e.g. Validated by NABL Accredited Lab Certificate #NABL-2026-F09"
                  className="w-full h-10 px-3 rounded-xl border border-neutral-300 text-xs font-sans"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" size="sm" onClick={() => setShowAdd(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={handleAddClaim} disabled={!newClaim.claimText.trim()}>
                  Save Fact-Locked Claim Atom
                </Button>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════ */}
          {/* CLAIMS TABS & FILTER BAR                           */}
          {/* ═══════════════════════════════════════════════════ */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 pb-3">
            <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl">
              {(["all", "supported", "unsupported", "contradicted", "evidence_missing"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setFilterTab(tab)}
                  style={{
                    backgroundColor: filterTab === tab ? "#11141A" : "transparent",
                    color: filterTab === tab ? "#FFFFFF" : "#6B7280"
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition cursor-pointer"
                >
                  {tab.replace(/_/g, " ")} ({
                    tab === "all" ? claims.length :
                    tab === "supported" ? supportedList.length :
                    tab === "unsupported" ? unsupportedList.length :
                    tab === "contradicted" ? contradictedList.length : missingList.length
                  })
                </button>
              ))}
            </div>

            <span className="text-xs text-neutral-500 font-medium">
              Showing {filteredClaims.length} of {claims.length} Claim Atoms
            </span>
          </div>

          {/* ═══════════════════════════════════════════════════ */}
          {/* CLAIMS LIST ACCORDING TO DIAGRAM 1                 */}
          {/* ═══════════════════════════════════════════════════ */}
          {filteredClaims.length === 0 ? (
            <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-12 text-center">
              <Sparkles size={32} className="text-emerald-500 mx-auto mb-3" />
              <h3 className="font-bold text-base text-neutral-800 mb-1">No Claim Atoms matching filter</h3>
              <p className="text-xs text-neutral-500 max-w-md mx-auto mb-5">
                Click &quot;Auto-Extract from Brief&quot; or paste any product claims above to automatically extract and lock claims.
              </p>
              <Button variant="primary" size="sm" onClick={() => handleAutoExtract()} disabled={isExtracting}>
                {isExtracting ? "Extracting..." : "Auto-Extract Now (Gemini 3.8)"}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredClaims.map((c: any) => {
                let tokens: string[] = [];
                try { tokens = JSON.parse(c.locked_tokens || "[]"); } catch {}

                const isSupported = c.evidence_status === "supported";
                const isContradicted = c.evidence_status === "contradicted";
                const isUnsupported = c.evidence_status === "unsupported";

                return (
                  <div
                    key={c.id}
                    className={`rounded-2xl border p-5 shadow-xs transition-all ${
                      isContradicted
                        ? "bg-rose-50/50 border-rose-300"
                        : isUnsupported
                        ? "bg-amber-50/50 border-amber-300"
                        : isSupported
                        ? "bg-emerald-50/40 border-emerald-300"
                        : "bg-blue-50/40 border-blue-300"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1.5 ${
                          isContradicted ? "bg-rose-100 text-rose-800 border border-rose-300" :
                          isUnsupported ? "bg-amber-100 text-amber-800 border border-amber-300" :
                          isSupported ? "bg-emerald-100 text-emerald-800 border border-emerald-300" :
                          "bg-blue-100 text-blue-800 border border-blue-300"
                        }`}>
                          {isContradicted && <XCircle size={13}/>}
                          {isUnsupported && <AlertTriangle size={13}/>}
                          {isSupported && <CheckCircle2 size={13}/>}
                          {c.evidence_status.replace(/_/g, " ")}
                        </span>

                        <span className="text-3xs font-mono font-semibold uppercase text-neutral-500 bg-white px-2 py-0.5 rounded border border-neutral-200">
                          {c.claim_type}
                        </span>
                      </div>

                      <span className="text-3xs font-mono text-neutral-400">ID: {c.id.slice(0, 10)}</span>
                    </div>

                    <h4 className="font-extrabold text-sm sm:text-base text-[#11141A] mb-3 leading-snug">
                      {c.claim_text}
                    </h4>

                    {/* Locked Tokens & Evidence */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-3 border-t border-black/5">
                      <div>
                        <span className="text-3xs font-mono uppercase font-bold text-neutral-500 block mb-1">
                          🔒 Locked Tokens (Verbatim in All Regional Dialects)
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {tokens.length > 0 ? tokens.map((t, idx) => (
                            <span key={idx} className="bg-white border border-neutral-300 px-2 py-0.5 rounded text-xs font-bold text-neutral-800 shadow-2xs font-mono">
                              {t}
                            </span>
                          )) : (
                            <span className="text-neutral-400 italic text-2xs">None extracted</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="text-3xs font-mono uppercase font-bold text-neutral-500 block mb-1">
                          📄 Grounded Evidence Citation (Diagram 3)
                        </span>
                        <p className="text-neutral-700 font-medium text-xs bg-white/80 p-2 rounded-lg border border-neutral-200">
                          {c.qualifications || "No evidence document attached"}
                        </p>
                      </div>
                    </div>

                    {/* Diagram 1 Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-3 border-t border-black/5">
                      <div className="text-xs text-neutral-500">
                        {isContradicted && "⚠️ Conflicting Fact: Prohibited by ASCI / FSSAI. Requires correction."}
                        {isUnsupported && "⚠️ Unsubstantiated Assertion: Requires NABL lab evidence."}
                        {isSupported && "✅ Verified Claim: Cleared for multilingual transcreation."}
                      </div>

                      <div className="flex items-center gap-2">
                        {c.evidence_status !== "supported" && (
                          <button
                            onClick={() => handleStatusChange(c.id, "supported")}
                            className="text-xs font-bold text-emerald-700 bg-white hover:bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-lg transition"
                          >
                            Mark Supported
                          </button>
                        )}

                        {c.evidence_status !== "unsupported" && (
                          <button
                            onClick={() => handleStatusChange(c.id, "unsupported")}
                            className="text-xs font-bold text-amber-700 bg-white hover:bg-amber-50 border border-amber-300 px-3 py-1 rounded-lg transition"
                          >
                            Flag Unsupported
                          </button>
                        )}

                        {c.evidence_status !== "contradicted" && (
                          <button
                            onClick={() => handleStatusChange(c.id, "contradicted")}
                            className="text-xs font-bold text-rose-700 bg-white hover:bg-rose-50 border border-rose-300 px-3 py-1 rounded-lg transition"
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

          {/* ═══════════════════════════════════════════════════ */}
          {/* INTERACTIVE CLAIM EVIDENCE GRAPH                    */}
          {/* ═══════════════════════════════════════════════════ */}
          <div className="pt-4 border-t border-neutral-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-[#11141A]">
                  Dynamic Claim-Evidence Provenance Graph
                </h3>
                <p className="text-xs text-neutral-500">
                  Tracing Brand Entity → Product Entity → Claim Atoms → Evidence Citations → Regional Ads
                </p>
              </div>
              <span className="text-3xs font-mono font-bold bg-neutral-100 text-neutral-700 px-2.5 py-1 rounded-full border border-neutral-200">
                {claims.length} Atoms Plotted
              </span>
            </div>

            <ClaimEvidenceGraph
              campaign={campaign}
              claims={claims}
            />
          </div>

        </main>
      </div>
    </div>
  );
}
