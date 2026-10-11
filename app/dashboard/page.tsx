"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Sparkles, ShieldCheck, Plus, Globe2, AlertTriangle, CheckCircle2,
  Lock, Trash2, ArrowRight, RefreshCw, XCircle, FileText, FlaskConical,
  Award, Layers, Check, ExternalLink, HelpCircle
} from "lucide-react";
import Link from "next/link";
import {
  getCampaigns, getDashboardStats, seedDemoCampaignAction,
  deleteCampaign, analyzeAdEvidenceLiveAction, createCampaign
} from "@/app/actions";

export default function DashboardOverviewPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    pendingReviews: 0,
    verificationBlockers: 0,
    approvedVersions: 0
  });
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState<string | null>(null);

  // ── LIVE USER INPUT AD-EVIDENCE & CLAIM ENGINE STATE ──
  const [liveAdCopy, setLiveAdCopy] = useState(
    "Rasa Festive Millet Bites are baked with 100% whole grain barnyard millet and offer 4x higher dietary fiber than ordinary wheat cookies. Our patented herbal formula permanently cures morning acidity in 24 hours!"
  );
  const [liveBrand, setLiveBrand] = useState("Rasa Foods");
  const [liveProduct, setLiveProduct] = useState("Festive Millet Bites");
  const [isAnalyzingLive, setIsAnalyzingLive] = useState(false);
  const [liveResult, setLiveResult] = useState<any>(null);
  const [isSavingLiveCampaign, setIsSavingLiveCampaign] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [campaignData, statsData] = await Promise.all([
        getCampaigns(),
        getDashboardStats(),
      ]);
      setCampaigns(campaignData as any[]);
      setStats(statsData);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async (type: 'festive_snack' | 'personal_care' | 'public_awareness') => {
    setIsSeeding(type);
    try {
      await seedDemoCampaignAction(type);
      await loadData();
    } catch (err: any) {
      alert("Seeding failed: " + err.message);
    } finally {
      setIsSeeding(null);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this campaign?")) return;
    await deleteCampaign(id);
    await loadData();
  };

  const handleRunLiveAnalysis = async (customCopy?: string, customBrand?: string, customProd?: string) => {
    const textToAnalyze = customCopy || liveAdCopy;
    const brandToAnalyze = customBrand || liveBrand;
    const prodToAnalyze = customProd || liveProduct;

    if (!textToAnalyze.trim()) return;

    setIsAnalyzingLive(true);
    try {
      const res = await analyzeAdEvidenceLiveAction({
        adCopy: textToAnalyze,
        brandName: brandToAnalyze,
        productName: prodToAnalyze,
      });
      setLiveResult(res);
    } catch (err: any) {
      alert("AI Analysis Error: " + err.message);
    } finally {
      setIsAnalyzingLive(false);
    }
  };

  const handleSaveLiveAsCampaign = async () => {
    if (!liveResult) return;
    setIsSavingLiveCampaign(true);

    try {
      const res = await createCampaign({
        name: `${liveBrand} — ${liveProduct} Campaign`,
        brandName: liveBrand,
        productName: liveProduct,
        objective: `Regional multilingual rollout with verified Claim Atoms and ASCI compliance.`,
        targetAudience: "Regional vernacular consumers across urban and rural tiers",
        sourceLanguage: "English",
        targetLanguages: ["Telugu", "Hindi", "Marathi"],
        channels: ["social_media", "video"],
        keyMessage: liveAdCopy,
        callToAction: "Order Now / Learn More",
        tone: "Warm & Authentic",
        schedule: "Immediate",
        approvedFacts: liveResult.claims
          ?.filter((c: any) => c.evidenceStatus === 'supported')
          ?.map((c: any) => c.claimText)
          ?.join("\n") || liveAdCopy,
        prohibitedClaims: liveResult.claims
          ?.filter((c: any) => c.evidenceStatus === 'contradicted' || c.claimType === 'prohibited_claim')
          ?.map((c: any) => c.claimText)
          ?.join("\n") || "No unverified medical cures",
        requiredDisclaimers: "Include #Ad and statutory FSSAI disclaimer",
      });

      await loadData();
      alert("Campaign saved successfully! You can now adapt, verify, and approve it.");
    } catch (err: any) {
      alert("Failed to save campaign: " + err.message);
    } finally {
      setIsSavingLiveCampaign(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">

      {/* TOP EXECUTIVE BANNER */}
      <div className="bg-[#FFFDF8] rounded-2xl border border-[#1A3C29]/15 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1A3C29] animate-pulse"></span>
            <span className="text-2xs font-mono font-bold uppercase tracking-widest text-[#1A3C29]">
              Braco OmniPulse • Regional Campaign Intelligence
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A3C29] tracking-tight">
            Campaign Intelligence Workspace
          </h1>
          <p className="text-xs sm:text-sm text-[#292B29]/75 mt-1 max-w-2xl leading-relaxed">
            Turn one campaign brief into locally adapted, brand-checked, human-approved and measurable campaign options—with evidence and decision history visible at every step.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href="/campaigns/new">
            <Button variant="primary" size="md" icon={<Plus size={15}/>}>
              New Campaign Brief
            </Button>
          </Link>
        </div>
      </div>

      {/* METRIC TILES: REAL DATABASE METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-[#FFFDF8] rounded-xl border border-[#1A3C29]/15 p-5 shadow-2xs">
          <span className="text-2xs font-semibold uppercase tracking-wider text-[#292B29]/60 block mb-1">
            Persisted Campaigns
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl sm:text-3xl font-bold text-[#1A3C29]">
              {stats.totalCampaigns}
            </span>
            <span className="text-2xs text-[#292B29]/60">in workspace</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-[#FFFDF8] rounded-xl border border-[#1A3C29]/15 p-5 shadow-2xs">
          <span className="text-2xs font-semibold uppercase tracking-wider text-[#292B29]/60 block mb-1">
            Pending Review Queue
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl sm:text-3xl font-bold text-amber-700">
              {stats.pendingReviews}
            </span>
            <span className="text-2xs text-[#292B29]/60">variants awaiting review</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-[#FFFDF8] rounded-xl border border-[#1A3C29]/15 p-5 shadow-2xs">
          <span className="text-2xs font-semibold uppercase tracking-wider text-[#292B29]/60 block mb-1">
            Brand Guardian Blockers
          </span>
          <div className="flex items-baseline gap-2">
            <span className={`font-serif text-2xl sm:text-3xl font-bold ${stats.verificationBlockers > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
              {stats.verificationBlockers}
            </span>
            <span className="text-2xs text-[#292B29]/60">critical findings flagged</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-[#FFFDF8] rounded-xl border border-[#1A3C29]/15 p-5 shadow-2xs">
          <span className="text-2xs font-semibold uppercase tracking-wider text-[#292B29]/60 block mb-1">
            Certified Approvals
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl sm:text-3xl font-bold text-emerald-800">
              {stats.approvedVersions}
            </span>
            <span className="text-2xs text-[#292B29]/60">immutable versions locked</span>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* SECTION 1: DYNAMIC LIVE CLAIM DETECTION & ADAPTATION    */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div className="bg-[#FFFDF8] rounded-2xl border border-[#1A3C29]/15 p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1A3C29]/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <h2 className="font-serif text-lg font-bold text-[#1A3C29]">
                Live Ad-Evidence: Dynamic Claim Extraction & Regional Adaptation
              </h2>
              <Badge variant="default" className="text-2xs font-mono">GEMINI 3.8 LIVE</Badge>
            </div>
            <p className="text-xs text-[#292B29]/75 mt-1">
              Enter any real marketing copy or product assertion below. Gemini dynamically extracts atomic claims, evaluates ASCI compliance, and adapts the copy to Indian vernacular languages.
            </p>
          </div>

          <span className="text-2xs font-mono text-[#292B29]/60">
            PRD Diagram 1 & 4 Live Engine
          </span>
        </div>

        {/* 3 PRD Hackathon Evaluation Scenarios Quick-Pick */}
        <div>
          <span className="text-2xs font-semibold uppercase tracking-wider text-[#292B29]/60 block mb-2">
            Quick-Test PRD Section 18 Scenarios:
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setLiveBrand("Rasa Foods");
                setLiveProduct("Festive Millet Bites");
                setLiveAdCopy("Rasa Festive Millet Bites are baked with 100% whole grain barnyard millet and offer 4x higher dietary fiber than ordinary wheat cookies. Our patented herbal formula permanently cures morning acidity in 24 hours!");
                handleRunLiveAnalysis(
                  "Rasa Festive Millet Bites are baked with 100% whole grain barnyard millet and offer 4x higher dietary fiber than ordinary wheat cookies. Our patented herbal formula permanently cures morning acidity in 24 hours!",
                  "Rasa Foods",
                  "Festive Millet Bites"
                );
              }}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-[#F4E9DD] border border-[#1A3C29]/15 hover:bg-[#F4E9DD]/70 text-[#1A3C29] transition"
            >
              🌾 Scenario 1: Rasa Festive Millet (Planted Acidity Cure)
            </button>

            <button
              type="button"
              onClick={() => {
                setLiveBrand("VedaCare");
                setLiveProduct("Bhringraj Bio Hair Oil");
                setLiveAdCopy("VedaCare 100% Organic Cold-Pressed Bhringraj Hair Oil is clinically proven to reduce hair fall by 85% in 4 weeks. Guaranteed to permanently stop balding within 7 days with zero doctor visits!");
                handleRunLiveAnalysis(
                  "VedaCare 100% Organic Cold-Pressed Bhringraj Hair Oil is clinically proven to reduce hair fall by 85% in 4 weeks. Guaranteed to permanently stop balding within 7 days with zero doctor visits!",
                  "VedaCare",
                  "Bhringraj Bio Hair Oil"
                );
              }}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-[#F4E9DD] border border-[#1A3C29]/15 hover:bg-[#F4E9DD]/70 text-[#1A3C29] transition"
            >
              🌿 Scenario 2: VedaCare (Contradicted 7-Day Balding Claim)
            </button>

            <button
              type="button"
              onClick={() => {
                setLiveBrand("Suraksha Jal");
                setLiveProduct("Rapid Drinking Water Test Kit");
                setLiveAdCopy("Suraksha Jal Mission test strips detect 99.9% coliform bacterial contamination within 3 minutes under ISO-17025 certified laboratory standards for rural households.");
                handleRunLiveAnalysis(
                  "Suraksha Jal Mission test strips detect 99.9% coliform bacterial contamination within 3 minutes under ISO-17025 certified laboratory standards for rural households.",
                  "Suraksha Jal",
                  "Rapid Drinking Water Test Kit"
                );
              }}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-[#F4E9DD] border border-[#1A3C29]/15 hover:bg-[#F4E9DD]/70 text-[#1A3C29] transition"
            >
              💧 Scenario 3: Suraksha Jal (ISO Water Testing Drive)
            </button>
          </div>
        </div>

        {/* Input Text Box */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-2xs font-semibold text-[#292B29]/60 uppercase tracking-wider mb-1">
                Brand Name
              </label>
              <input
                type="text"
                value={liveBrand}
                onChange={e => setLiveBrand(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-[#1A3C29]/20 bg-white text-xs font-medium focus:ring-2 focus:ring-[#1A3C29]/20 outline-none"
              />
            </div>
            <div>
              <label className="block text-2xs font-semibold text-[#292B29]/60 uppercase tracking-wider mb-1">
                Product / Service Name
              </label>
              <input
                type="text"
                value={liveProduct}
                onChange={e => setLiveProduct(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-[#1A3C29]/20 bg-white text-xs font-medium focus:ring-2 focus:ring-[#1A3C29]/20 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-2xs font-semibold text-[#292B29]/60 uppercase tracking-wider mb-1">
              Campaign Message / Ad Copy to Analyze *
            </label>
            <textarea
              rows={3}
              value={liveAdCopy}
              onChange={e => setLiveAdCopy(e.target.value)}
              placeholder="Type any campaign copy to test claim detection and adaptation..."
              className="w-full p-3.5 rounded-lg border border-[#1A3C29]/20 bg-white text-sm focus:ring-2 focus:ring-[#1A3C29]/20 outline-none resize-none font-medium leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-2xs text-[#292B29]/60">
              Evaluates claims against ASCI advertising guidelines and translates to Indic vernaculars.
            </span>
            <Button
              variant="primary"
              size="md"
              onClick={() => handleRunLiveAnalysis()}
              disabled={isAnalyzingLive || !liveAdCopy.trim()}
              icon={isAnalyzingLive ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
            >
              {isAnalyzingLive ? "Analyzing with Gemini..." : "Run AI Claim Detection & Adaptation"}
            </Button>
          </div>
        </div>

        {/* Live Result Display */}
        {liveResult && (
          <div className="pt-4 border-t border-[#1A3C29]/10 space-y-4 animate-fade-in">
            {/* Header Result Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#F4E9DD]/60 p-4 rounded-xl border border-[#1A3C29]/10">
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                  liveResult.asciComplianceStatus === 'violation'
                    ? 'bg-red-100 text-red-900 border border-red-300'
                    : liveResult.asciComplianceStatus === 'warning'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-green-100 text-green-900 border border-green-300'
                }`}>
                  {liveResult.asciComplianceStatus === 'violation' ? '❌ ASCI Violation Flagged' : '✅ ASCI Compliant'}
                </span>

                <span className="text-xs font-semibold text-[#292B29]">
                  Compliance Safety Score: <strong>{liveResult.overallScore}/100</strong>
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveLiveAsCampaign}
                disabled={isSavingLiveCampaign}
                iconRight={<ArrowRight size={13}/>}
              >
                {isSavingLiveCampaign ? "Saving..." : "Save as Active Campaign"}
              </Button>
            </div>

            <p className="text-xs text-[#292B29]/80 bg-white p-3 rounded-lg border border-[#1A3C29]/10">
              <strong>Audit Summary:</strong> {liveResult.summary}
            </p>

            {/* Extracted Claim Atoms Grid */}
            <div>
              <h4 className="text-xs font-semibold text-[#1A3C29] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Lock size={13} className="text-[#1A3C29]" />
                Extracted Atomic Claims ({liveResult.claims?.length || 0})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {liveResult.claims?.map((c: any, idx: number) => {
                  const isBad = c.evidenceStatus === 'contradicted' || c.evidenceStatus === 'unsupported';
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border text-xs flex flex-col justify-between ${
                        isBad ? 'bg-red-50/70 border-red-200 text-red-950' : 'bg-white border-[#1A3C29]/15 text-[#292B29]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className="text-3xs font-mono uppercase font-bold text-[#292B29]/60">
                            {c.claimType?.replace(/_/g, " ")}
                          </span>
                          <span className={`text-3xs font-bold px-1.5 py-0.5 rounded ${
                            isBad ? 'bg-red-200 text-red-900' : 'bg-green-100 text-green-900'
                          }`}>
                            {c.evidenceStatus?.toUpperCase()}
                          </span>
                        </div>
                        <p className="font-semibold text-xs leading-relaxed">&quot;{c.claimText}&quot;</p>
                      </div>
                      <div className="mt-2 pt-2 border-t border-black/5 text-3xs font-mono text-[#292B29]/60">
                        Citation: {c.evidenceCitation || c.qualifications}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Vernacular Adaptations */}
            {liveResult.regionalAdaptations && liveResult.regionalAdaptations.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-[#1A3C29] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Globe2 size={13} className="text-[#1A3C29]" />
                  Dynamic Regional Vernacular Adaptations
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {liveResult.regionalAdaptations.map((ra: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-xl bg-white border border-[#1A3C29]/15 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#1A3C29] text-sm">{ra.language} Adaptation</span>
                        <span className="text-3xs font-semibold px-2 py-0.5 rounded bg-green-100 text-green-800 uppercase">
                          {ra.status}
                        </span>
                      </div>
                      <p className="text-base font-medium text-[#292B29] leading-relaxed">
                        {ra.adaptation}
                      </p>
                      {ra.note && (
                        <p className="text-2xs text-[#292B29]/70 italic pt-1 border-t border-black/5">
                          Note: {ra.note}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* SECTION 2: WORKSPACE CAMPAIGNS DIRECTORY TABLE         */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div className="bg-[#FFFDF8] rounded-2xl border border-[#1A3C29]/15 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#1A3C29]/10">
          <div>
            <h2 className="font-serif text-lg font-bold text-[#1A3C29]">
              Workspace Campaigns Directory ({campaigns.length})
            </h2>
            <p className="text-xs text-[#292B29]/70 mt-0.5">
              Persisted campaign briefs in Turso libSQL with version-locked asset lineages.
            </p>
          </div>

          <Link href="/campaigns/new">
            <Button variant="outline" size="sm" icon={<Plus size={13}/>}>
              Create Brief
            </Button>
          </Link>
        </div>

        {campaigns.length === 0 ? (
          <div className="p-12 text-center bg-[#F4E9DD]/30 rounded-xl border border-[#1A3C29]/10 space-y-3">
            <FileText size={32} className="text-[#1A3C29] mx-auto opacity-40" />
            <h3 className="font-serif text-base font-semibold text-[#1A3C29]">No Campaigns Found</h3>
            <p className="text-xs text-[#292B29]/70 max-w-md mx-auto">
              Get started by creating a campaign brief or seeding one of the three PRD Section 18 test scenarios below.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <Button variant="primary" size="sm" onClick={() => handleSeed('festive_snack')}>
                Seed Festive Snack Scenario
              </Button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#1A3C29]/10 text-2xs font-semibold text-[#292B29]/60 uppercase tracking-wider">
                  <th className="py-3 px-4">Campaign Name</th>
                  <th className="py-3 px-4">Brand / Product</th>
                  <th className="py-3 px-4">Target Languages</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Workflow Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A3C29]/5 font-medium">
                {campaigns.map((c) => {
                  let targetLangs: string[] = [];
                  try {
                    targetLangs = JSON.parse(String(c.target_languages || "[]"));
                  } catch {
                    targetLangs = ["Telugu", "Hindi"];
                  }

                  return (
                    <tr key={c.id} className="hover:bg-[#F4E9DD]/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <Link href={`/campaigns/${c.id}`} className="font-bold text-[#1A3C29] hover:underline block text-sm">
                          {c.name}
                        </Link>
                        <span className="text-3xs text-[#292B29]/60 line-clamp-1 mt-0.5">
                          {c.objective}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-[#292B29]">
                        <strong>{c.brand_name}</strong>
                        <span className="text-2xs text-[#292B29]/70 block">{c.product_name}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {targetLangs.map((lang, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-[#1A3C29]/10 text-[#1A3C29] text-3xs font-semibold">
                              {lang}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge variant={c.status === 'approved' ? 'success' : c.status === 'in_review' ? 'warning' : 'demo'}>
                          {c.status.toUpperCase()}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          <Link href={`/campaigns/${c.id}/studio`}>
                            <button className="px-2.5 py-1 rounded bg-[#F4E9DD] hover:bg-[#F4E9DD]/80 text-[#1A3C29] text-2xs font-bold border border-[#1A3C29]/15">
                              Studio
                            </button>
                          </Link>
                          <Link href={`/campaigns/${c.id}/guardian`}>
                            <button className="px-2.5 py-1 rounded bg-[#F4E9DD] hover:bg-[#F4E9DD]/80 text-[#1A3C29] text-2xs font-bold border border-[#1A3C29]/15">
                              Guardian
                            </button>
                          </Link>
                          <Link href={`/campaigns/${c.id}/experiment`}>
                            <button className="px-2.5 py-1 rounded bg-[#F4E9DD] hover:bg-[#F4E9DD]/80 text-[#1A3C29] text-2xs font-bold border border-[#1A3C29]/15">
                              A/B Test
                            </button>
                          </Link>
                          <Link href={`/campaigns/${c.id}/passport`}>
                            <button className="px-2.5 py-1 rounded bg-[#F4E9DD] hover:bg-[#F4E9DD]/80 text-[#1A3C29] text-2xs font-bold border border-[#1A3C29]/15">
                              Passport
                            </button>
                          </Link>
                          <button
                            onClick={(e) => handleDelete(e, c.id)}
                            className="p-1 rounded text-red-700 hover:bg-red-50 transition"
                            title="Delete Campaign"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* SECTION 3: OFFICIAL DEMO FIXTURES (PRD SECTION 18)      */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div className="bg-[#FFFDF8] rounded-2xl border border-[#1A3C29]/15 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#1A3C29]/10">
          <div>
            <h3 className="font-serif text-base font-bold text-[#1A3C29]">
              Official Evaluation Scenarios (PRD Section 18)
            </h3>
            <p className="text-xs text-[#292B29]/70 mt-0.5">
              Seed end-to-end campaigns with pre-planted proof points for hackathon judging and validation.
            </p>
          </div>
          <Badge variant="demo">[DEMO DATA]</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Demo 1 */}
          <div className="p-4 rounded-xl border border-[#1A3C29]/15 bg-[#F4E9DD]/40 flex flex-col justify-between gap-3">
            <div>
              <span className="text-3xs font-mono font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                SCENARIO 1 • FESTIVE SNACK
              </span>
              <h4 className="font-serif text-sm font-bold text-[#1A3C29] mt-2">
                Rasa Crispy Millet Bites
              </h4>
              <p className="text-xs text-[#292B29]/70 mt-0.5">Telugu & Hindi • Packaged breakfast snack.</p>
              <p className="text-3xs text-neutral-600 mt-2 bg-white/70 p-2 rounded border border-black/5">
                <strong>Planted Proof:</strong> Unsupported claim &quot;100% permanently cures acidity&quot; flagged by Brand Guardian with suggested fix.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSeed('festive_snack')}
              disabled={isSeeding !== null}
              className="w-full"
            >
              {isSeeding === 'festive_snack' ? "Seeding..." : "Seed Scenario 1"}
            </Button>
          </div>

          {/* Demo 2 */}
          <div className="p-4 rounded-xl border border-[#1A3C29]/15 bg-[#F4E9DD]/40 flex flex-col justify-between gap-3">
            <div>
              <span className="text-3xs font-mono font-bold uppercase tracking-wider text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded border border-indigo-300">
                SCENARIO 2 • BOTANICAL
              </span>
              <h4 className="font-serif text-sm font-bold text-[#1A3C29] mt-2">
                VedaCare Hair Oil
              </h4>
              <p className="text-xs text-[#292B29]/70 mt-0.5">Marathi & Bengali • Ayurvedic hair care.</p>
              <p className="text-3xs text-neutral-600 mt-2 bg-white/70 p-2 rounded border border-black/5">
                <strong>Planted Proof:</strong> Contradicts 4-week clinical study by claiming instant 24h cure; caught by Pass B.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSeed('personal_care')}
              disabled={isSeeding !== null}
              className="w-full"
            >
              {isSeeding === 'personal_care' ? "Seeding..." : "Seed Scenario 2"}
            </Button>
          </div>

          {/* Demo 3 */}
          <div className="p-4 rounded-xl border border-[#1A3C29]/15 bg-[#F4E9DD]/40 flex flex-col justify-between gap-3">
            <div>
              <span className="text-3xs font-mono font-bold uppercase tracking-wider text-rose-800 bg-rose-100 px-2 py-0.5 rounded border border-rose-300">
                SCENARIO 3 • PUBLIC HEALTH
              </span>
              <h4 className="font-serif text-sm font-bold text-[#1A3C29] mt-2">
                Suraksha Jal Mission
              </h4>
              <p className="text-xs text-[#292B29]/70 mt-0.5">Tamil & Kannada • Water testing drive.</p>
              <p className="text-3xs text-neutral-600 mt-2 bg-white/70 p-2 rounded border border-black/5">
                <strong>Planted Proof:</strong> Missing statutory eligibility details; flagged as Evidence Missing for human sign-off.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSeed('public_awareness')}
              disabled={isSeeding !== null}
              className="w-full"
            >
              {isSeeding === 'public_awareness' ? "Seeding..." : "Seed Scenario 3"}
            </Button>
          </div>
        </div>
      </div>

    </div>
  );
}
