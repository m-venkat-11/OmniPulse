"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Sparkles, ShieldCheck, Zap, ChevronRight, FileText,
  Plus, Globe2, AlertTriangle, CheckCircle2, Lock, Flame,
  Award, Layers, Trash2, Bell, MoreHorizontal
} from "lucide-react";
import Link from "next/link";
import {
  getCampaigns, getDashboardStats, seedDemoCampaignAction,
  deleteCampaign, getClaimAtoms, getAssetVersionsForCampaign
} from "@/app/actions";
import { ClaimEvidenceGraph } from "@/components/graph/ClaimEvidenceGraph";

export default function DashboardOverviewPage() {
  const [mounted, setMounted] = useState(false);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalCampaigns: 0, pendingReviews: 0, verificationBlockers: 0, approvedVersions: 0 });
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState<string | null>(null);

  // Tabs
  const [activeTab, setActiveTab] = useState<"overview" | "graph" | "demos">("overview");

  // Filter chips for modular cards
  const [filterLevel, setFilterLevel] = useState<"all" | "beginner" | "intermediate" | "advanced">("all");

  const [activeClaims, setActiveClaims] = useState<any[]>([]);
  const [activeVariants, setActiveVariants] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
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

      if (campaignData.length > 0) {
        const topCampaign = campaignData[0];
        const [cl, vr] = await Promise.all([
          getClaimAtoms(String(topCampaign.id)),
          getAssetVersionsForCampaign(String(topCampaign.id)),
        ]);
        setActiveClaims(cl as any[]);
        setActiveVariants(vr as any[]);
      }
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
      setActiveTab("overview");
    } catch (err: any) {
      alert("Seeding failed: " + err.message);
    } finally {
      setIsSeeding(null);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this campaign?")) return;
    await deleteCampaign(id);
    await loadData();
  };

  const activeCampaign = campaigns[0] || null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="text-[#11141A]">

      {/* TOP ROW: Greeting & 4 Stat Cards (Exact Reference Image Style) */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#11141A] tracking-tight">
            Good Morning, Ajeng!
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 font-medium mt-1 flex items-center gap-1.5">
            <span>You&apos;re 37% closer to your goal.</span>
            <span className="text-amber-500 font-bold">⚡</span>
            <span className="text-neutral-400 font-normal ml-2 hidden sm:inline">
              (98% verified brand accuracy across regional markets)
            </span>
          </p>
        </div>

        {/* 4 Stat Cards in a Row (Points, Courses, Certificates, Challenges) */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px" }}>
          
          {/* Card 1: Gold / Points */}
          <div
            style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "18px", padding: "10px 16px", display: "flex", alignItems: "center", gap: "12px", minWidth: "120px" }}
            className="shadow-xs"
          >
            <div
              style={{ backgroundColor: "#FFF5D6", border: "1px solid #FFE7A3", width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}
            >
              🪙
            </div>
            <div>
              <span style={{ fontSize: "16px", fontWeight: "800", color: "#11141A", display: "block", lineHeight: "1" }}>
                248
              </span>
              <span style={{ fontSize: "10px", color: "#6B7280", fontWeight: "600", display: "block", marginTop: "3px" }}>
                Points
              </span>
            </div>
          </div>

          {/* Card 2: Lavender / Courses */}
          <div
            style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "18px", padding: "10px 16px", display: "flex", alignItems: "center", gap: "12px", minWidth: "120px" }}
            className="shadow-xs"
          >
            <div
              style={{ backgroundColor: "#EFEAFF", border: "1px solid #DDD4FF", width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}
            >
              ⛳
            </div>
            <div>
              <span style={{ fontSize: "16px", fontWeight: "800", color: "#11141A", display: "block", lineHeight: "1" }}>
                17
              </span>
              <span style={{ fontSize: "10px", color: "#6B7280", fontWeight: "600", display: "block", marginTop: "3px" }}>
                Courses
              </span>
            </div>
          </div>

          {/* Card 3: Orange / Certificates */}
          <div
            style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "18px", padding: "10px 16px", display: "flex", alignItems: "center", gap: "12px", minWidth: "120px" }}
            className="shadow-xs"
          >
            <div
              style={{ backgroundColor: "#FFF0E6", border: "1px solid #FFD5BA", width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}
            >
              📜
            </div>
            <div>
              <span style={{ fontSize: "16px", fontWeight: "800", color: "#11141A", display: "block", lineHeight: "1" }}>
                120
              </span>
              <span style={{ fontSize: "10px", color: "#6B7280", fontWeight: "600", display: "block", marginTop: "3px" }}>
                Certificates
              </span>
            </div>
          </div>

          {/* Card 4: Purple / Challenges */}
          <div
            style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "18px", padding: "10px 16px", display: "flex", alignItems: "center", gap: "12px", minWidth: "120px" }}
            className="shadow-xs"
          >
            <div
              style={{ backgroundColor: "#F5ECFF", border: "1px solid #E7D1FF", width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}
            >
              🎮
            </div>
            <div>
              <span style={{ fontSize: "16px", fontWeight: "800", color: "#11141A", display: "block", lineHeight: "1" }}>
                31
              </span>
              <span style={{ fontSize: "10px", color: "#6B7280", fontWeight: "600", display: "block", marginTop: "3px" }}>
                Challenges
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* VIEW TABS BAR */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "12px", borderBottom: "1px solid #F3F4F6", paddingBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={() => setActiveTab("overview")}
            style={{
              backgroundColor: activeTab === "overview" ? "#11141A" : "transparent",
              color: activeTab === "overview" ? "#FFFFFF" : "#6B7280",
              borderRadius: "9999px",
              padding: "8px 16px",
              fontSize: "12px",
              fontWeight: "700",
              border: "none",
              cursor: "pointer"
            }}
          >
            Overview & Curriculum
          </button>
          <button
            onClick={() => setActiveTab("graph")}
            style={{
              backgroundColor: activeTab === "graph" ? "#11141A" : "transparent",
              color: activeTab === "graph" ? "#FFFFFF" : "#6B7280",
              borderRadius: "9999px",
              padding: "8px 16px",
              fontSize: "12px",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              border: "none",
              cursor: "pointer"
            }}
          >
            <Sparkles size={13} className="text-emerald-500" />
            Claim Evidence Graph (Ad-Evidence)
          </button>
          <button
            onClick={() => setActiveTab("demos")}
            style={{
              backgroundColor: activeTab === "demos" ? "#11141A" : "transparent",
              color: activeTab === "demos" ? "#FFFFFF" : "#6B7280",
              borderRadius: "9999px",
              padding: "8px 16px",
              fontSize: "12px",
              fontWeight: "700",
              border: "none",
              cursor: "pointer"
            }}
          >
            Seeded Evaluation Scenarios
          </button>
        </div>

        <Link href="/campaigns/new">
          <button
            style={{ backgroundColor: "#11141A", color: "#FFFFFF", borderRadius: "9999px", padding: "8px 18px", fontSize: "12px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px", border: "none", cursor: "pointer" }}
            className="hover:bg-black shadow-xs"
          >
            <Plus size={14} />
            <span>Create Campaign</span>
          </button>
        </Link>
      </div>

      {/* TAB 1: CLAIM EVIDENCE GRAPH VIEW (AD-EVIDENCE) */}
      {activeTab === "graph" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <ClaimEvidenceGraph
            campaign={activeCampaign}
            claims={activeClaims}
            variants={activeVariants}
          />

          <div
            style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "20px", padding: "24px" }}
            className="shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif text-base font-bold text-[#11141A]">
                AD-EVIDENCE Integration: How Dynamic Graph Verification Works
              </h3>
              <Badge variant="success">PATENT-PENDING VERIFICATION</Badge>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed mb-4">
              Directly inspired by the <strong>Ad-Evidence</strong> architecture, every claim in the brief is extracted into an atomic claim entity (Claim Atom) with immutable tokens. The graph traces evidence from lab certificates to regional script translations. When any copy is modified in the studio, the verification engine checks for claim drift, superlative inflation, or missing statutory qualifications in real time.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div
                style={{ backgroundColor: "rgba(16, 185, 129, 0.08)", borderColor: "rgba(16, 185, 129, 0.25)" }}
                className="p-4 rounded-xl border"
              >
                <span className="font-bold text-emerald-800 block mb-1">1. Atom Extraction</span>
                <p className="text-neutral-600">Gemini AI breaks down marketing copy into factual assertions, numerical bounds, and required disclaimers.</p>
              </div>
              <div
                style={{ backgroundColor: "rgba(59, 130, 246, 0.08)", borderColor: "rgba(59, 130, 246, 0.25)" }}
                className="p-4 rounded-xl border"
              >
                <span className="font-bold text-blue-800 block mb-1">2. Grounded Evidence</span>
                <p className="text-neutral-600">Claims link to NABL lab tests (e.g. 4x fiber) or statutory codes (e.g. FSSAI & ASCI guidelines).</p>
              </div>
              <div
                style={{ backgroundColor: "rgba(244, 63, 94, 0.08)", borderColor: "rgba(244, 63, 94, 0.25)" }}
                className="p-4 rounded-xl border"
              >
                <span className="font-bold text-rose-800 block mb-1">3. Cross-Source Conflict</span>
                <p className="text-neutral-600">Detects unsubstantiated claims (e.g. planted acidity cure in Telugu) before assets reach reviewers.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SEEDED EVALUATION DEMOS (PRD Section 18) */}
      {activeTab === "demos" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div
            style={{ background: "linear-gradient(90deg, #ECFDF5 0%, #F0FDFA 100%)", border: "1px solid #A7F3D0", borderRadius: "20px", padding: "24px" }}
            className="shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-serif text-lg font-bold text-[#11141A]">
                Official Evaluation Scenarios (PRD Section 18)
              </h3>
              <Badge variant="demo">[DEMO FIXTURES]</Badge>
            </div>
            <p className="text-xs text-neutral-600 max-w-2xl">
              Seed one-click realistic multi-stage campaigns with planted proof points to test the 3-pass Brand Guardian, Claim Evidence Graph, and Honest Analytics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Demo 1 */}
            <div
              style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "20px", padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "16px" }}
              className="shadow-sm hover:border-emerald-500 transition-all"
            >
              <div>
                <span className="text-3xs font-mono font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  SCENARIO 1 • FESTIVE SNACK
                </span>
                <h4 className="font-serif text-base font-bold text-[#11141A] mt-2">
                  Rasa Crispy Millet Bites
                </h4>
                <p className="text-xs text-neutral-500 mt-1">
                  Telugu & Hindi • Packaged breakfast snack.
                </p>
                <div className="mt-3 p-3 rounded-xl bg-neutral-50 border border-neutral-100 text-xs">
                  <strong className="text-neutral-700 block mb-0.5">Planted Proof Point:</strong>
                  <span className="text-neutral-500">
                    Variant B claims &quot;100% permanently cures acidity&quot; — Brand Guardian Pass A & Pass B flag it with severity critical!
                  </span>
                </div>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => handleSeed('festive_snack')}
                disabled={isSeeding !== null}
                className="w-full rounded-xl"
              >
                {isSeeding === 'festive_snack' ? "Seeding Scenario..." : "Seed Scenario 1"}
              </Button>
            </div>

            {/* Demo 2 */}
            <div
              style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "20px", padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "16px" }}
              className="shadow-sm hover:border-emerald-500 transition-all"
            >
              <div>
                <span className="text-3xs font-mono font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                  SCENARIO 2 • BOTANICAL
                </span>
                <h4 className="font-serif text-base font-bold text-[#11141A] mt-2">
                  VedaCare Hair Oil
                </h4>
                <p className="text-xs text-neutral-500 mt-1">
                  Marathi & Bengali • Ayurvedic hair care.
                </p>
                <div className="mt-3 p-3 rounded-xl bg-neutral-50 border border-neutral-100 text-xs">
                  <strong className="text-neutral-700 block mb-0.5">Planted Proof Point:</strong>
                  <span className="text-neutral-500">
                    Contradicts approved clinical study (promises instant 24h cure instead of 4 weeks) — caught by Brand Guardian.
                  </span>
                </div>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => handleSeed('personal_care')}
                disabled={isSeeding !== null}
                className="w-full rounded-xl"
              >
                {isSeeding === 'personal_care' ? "Seeding Scenario..." : "Seed Scenario 2"}
              </Button>
            </div>

            {/* Demo 3 */}
            <div
              style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "20px", padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "16px" }}
              className="shadow-sm hover:border-emerald-500 transition-all"
            >
              <div>
                <span className="text-3xs font-mono font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                  SCENARIO 3 • PUBLIC HEALTH
                </span>
                <h4 className="font-serif text-base font-bold text-[#11141A] mt-2">
                  Suraksha Jal Mission
                </h4>
                <p className="text-xs text-neutral-500 mt-1">
                  Tamil & Kannada • Water testing drive.
                </p>
                <div className="mt-3 p-3 rounded-xl bg-neutral-50 border border-neutral-100 text-xs">
                  <strong className="text-neutral-700 block mb-0.5">Planted Proof Point:</strong>
                  <span className="text-neutral-500">
                    Missing statutory eligibility criteria — flagged as evidence-missing and routed for human review.
                  </span>
                </div>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => handleSeed('public_awareness')}
                disabled={isSeeding !== null}
                className="w-full rounded-xl"
              >
                {isSeeding === 'public_awareness' ? "Seeding Scenario..." : "Seed Scenario 3"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: OVERVIEW & CURRICULUM (Exact Side-by-Side Reference Layout via CSS Grid) */}
      {activeTab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.62fr) minmax(0, 1fr)", gap: "24px", alignItems: "start" }}>

          {/* ═════════════════════════════════════════════════ */}
          {/* LEFT COLUMN: Hero Card + 2x2 Recommended Grid */}
          {/* ═════════════════════════════════════════════════ */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

            {/* SECTION 1: Continue Learning (Hero Card) */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#11141A" }}>
                Continue learning
              </h2>

              {/* HERO CARD (Exact Reference Layout with Curvy Lime Patch & 3D Brain) */}
              <div
                style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "24px", padding: "20px" }}
                className="shadow-xs"
              >
                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                  
                  {/* Organic Curvy Lime-Green Shape with 3D Brain */}
                  <div
                    style={{
                      backgroundColor: "#E2F87A",
                      borderRadius: "24px",
                      width: "105px",
                      height: "105px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0
                    }}
                  >
                    <div
                      style={{
                        background: "linear-gradient(135deg, #7B61FF 0%, #5136E8 100%)",
                        borderRadius: "18px",
                        width: "65px",
                        height: "65px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "30px",
                        boxShadow: "0 8px 16px rgba(123, 97, 255, 0.35)"
                      }}
                    >
                      🧠
                    </div>
                  </div>

                  {/* Main Details */}
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
                    
                    {/* Top row with Category and Action Icons */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "12px", fontWeight: "600", color: "#9CA3AF", display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ color: "#6D5BFF" }}>🔷</span> Course
                      </span>
                      
                      {/* Bell & More Circle Buttons */}
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <button
                          style={{ border: "1px solid #E5E7EB", backgroundColor: "#F9FAFB", width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#6B7280", cursor: "pointer" }}
                        >
                          <Bell size={12} />
                        </button>
                        <button
                          style={{ border: "1px solid #E5E7EB", backgroundColor: "#F9FAFB", width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#6B7280", cursor: "pointer" }}
                        >
                          <MoreHorizontal size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Course Title */}
                    <div>
                      <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#11141A", letterSpacing: "-0.02em", margin: 0 }}>
                        {activeCampaign?.name || "Design Thinking I"}
                      </h3>
                    </div>

                    {/* Progress Bar & Percentage */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <div style={{ fontSize: "11px", fontWeight: "600", color: "#9CA3AF" }}>
                        46% of 100% Completed
                      </div>
                      <div style={{ width: "100%", backgroundColor: "#F3F4F6", borderRadius: "9999px", height: "8px", overflow: "hidden" }}>
                        <div
                          style={{
                            width: "46%",
                            height: "100%",
                            background: "linear-gradient(90deg, #6D5BFF 0%, #8C7AFF 100%)",
                            borderRadius: "9999px"
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Rounded Black Action Pill Button */}
                    <div style={{ paddingTop: "4px" }}>
                      {activeCampaign ? (
                        <Link href={`/campaigns/${activeCampaign.id}`}>
                          <button
                            style={{ backgroundColor: "#11141A", color: "#FFFFFF", fontSize: "12px", fontWeight: "700", padding: "9px 24px", borderRadius: "9999px", border: "none", cursor: "pointer" }}
                            className="hover:bg-black shadow-xs"
                          >
                            Resume learning
                          </button>
                        </Link>
                      ) : (
                        <Link href="/campaigns/new">
                          <button
                            style={{ backgroundColor: "#11141A", color: "#FFFFFF", fontSize: "12px", fontWeight: "700", padding: "9px 24px", borderRadius: "9999px", border: "none", cursor: "pointer" }}
                            className="hover:bg-black shadow-xs"
                          >
                            Start First Course
                          </button>
                        </Link>
                      )}
                    </div>

                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: Recommended For You (2x2 Grid) */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#11141A", margin: 0 }}>
                  Recommended For You
                </h2>

                {/* Filter Tabs: All, Beginner, Intermediate, Advanced */}
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  {(["all", "beginner", "intermediate", "advanced"] as const).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setFilterLevel(lvl)}
                      style={{
                        backgroundColor: filterLevel === lvl ? "#11141A" : "transparent",
                        color: filterLevel === lvl ? "#FFFFFF" : "#9CA3AF",
                        borderRadius: "9999px",
                        padding: "4px 10px",
                        fontSize: "11px",
                        fontWeight: "600",
                        textTransform: "capitalize",
                        border: "none",
                        cursor: "pointer"
                      }}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2x2 Modular Grid (Typography, 3D Design, UX Writing, Color Psychology) */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>

                {/* Card 1: Typography */}
                <Link
                  href={activeCampaign ? `/campaigns/${activeCampaign.id}/claims` : "/campaigns/new"}
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E5E7EB",
                    borderRadius: "22px",
                    padding: "16px 18px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    textDecoration: "none"
                  }}
                  className="shadow-2xs hover:border-[#D4F754] transition-all"
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span style={{ fontSize: "10px", fontWeight: "600", color: "#9CA3AF", display: "flex", alignItems: "center", gap: "4px" }}>
                      <span style={{ color: "#6D5BFF" }}>🔷</span> Course
                    </span>
                    <h4 style={{ fontSize: "15px", fontWeight: "800", color: "#11141A", margin: 0 }}>
                      Typography
                    </h4>
                    <span style={{ fontSize: "10px", color: "#6B7280", backgroundColor: "#F3F4F6", padding: "2px 8px", borderRadius: "6px", width: "fit-content", fontWeight: "500" }}>
                      Beginner • 1 hour
                    </span>
                  </div>

                  {/* Lime Curvy Shape with 3D ABC Blocks */}
                  <div
                    style={{
                      backgroundColor: "#E2F87A",
                      borderRadius: "18px",
                      width: "68px",
                      height: "68px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "30px",
                      flexShrink: 0
                    }}
                  >
                    🧱
                  </div>
                </Link>

                {/* Card 2: Basic 3D Design */}
                <Link
                  href={activeCampaign ? `/campaigns/${activeCampaign.id}/studio` : "/campaigns/new"}
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E5E7EB",
                    borderRadius: "22px",
                    padding: "16px 18px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    textDecoration: "none"
                  }}
                  className="shadow-2xs hover:border-indigo-400 transition-all"
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span style={{ fontSize: "10px", fontWeight: "600", color: "#9CA3AF", display: "flex", alignItems: "center", gap: "4px" }}>
                      <span style={{ color: "#6D5BFF" }}>🔷</span> Course
                    </span>
                    <h4 style={{ fontSize: "15px", fontWeight: "800", color: "#11141A", margin: 0 }}>
                      Basic 3D Design
                    </h4>
                    <span style={{ fontSize: "10px", color: "#6B7280", backgroundColor: "#F3F4F6", padding: "2px 8px", borderRadius: "6px", width: "fit-content", fontWeight: "500" }}>
                      Advanced • 3 hours
                    </span>
                  </div>

                  {/* Lavender Shape with 3D Calendar */}
                  <div
                    style={{
                      backgroundColor: "#EDE8FF",
                      borderRadius: "18px",
                      width: "68px",
                      height: "68px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "30px",
                      flexShrink: 0
                    }}
                  >
                    🗓️
                  </div>
                </Link>

                {/* Card 3: UX Writing */}
                <Link
                  href={activeCampaign ? `/campaigns/${activeCampaign.id}/guardian` : "/campaigns/new"}
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E5E7EB",
                    borderRadius: "22px",
                    padding: "16px 18px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    textDecoration: "none"
                  }}
                  className="shadow-2xs hover:border-emerald-400 transition-all"
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span style={{ fontSize: "10px", fontWeight: "600", color: "#9CA3AF", display: "flex", alignItems: "center", gap: "4px" }}>
                      <span style={{ color: "#6D5BFF" }}>🔷</span> Challenge
                    </span>
                    <h4 style={{ fontSize: "15px", fontWeight: "800", color: "#11141A", margin: 0 }}>
                      UX Writing
                    </h4>
                    <span style={{ fontSize: "10px", color: "#6B7280", backgroundColor: "#F3F4F6", padding: "2px 8px", borderRadius: "6px", width: "fit-content", fontWeight: "500" }}>
                      Beginner • 8 questions
                    </span>
                  </div>

                  {/* Chartreuse Shape with 3D Notepad */}
                  <div
                    style={{
                      backgroundColor: "#D4F754",
                      borderRadius: "18px",
                      width: "68px",
                      height: "68px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "30px",
                      flexShrink: 0
                    }}
                  >
                    📝
                  </div>
                </Link>

                {/* Card 4: Color Psychology */}
                <Link
                  href={activeCampaign ? `/campaigns/${activeCampaign.id}/passport` : "/campaigns/new"}
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E5E7EB",
                    borderRadius: "22px",
                    padding: "16px 18px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    textDecoration: "none"
                  }}
                  className="shadow-2xs hover:border-amber-400 transition-all"
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span style={{ fontSize: "10px", fontWeight: "600", color: "#9CA3AF", display: "flex", alignItems: "center", gap: "4px" }}>
                      <span style={{ color: "#6D5BFF" }}>🔷</span> Challenge
                    </span>
                    <h4 style={{ fontSize: "15px", fontWeight: "800", color: "#11141A", margin: 0 }}>
                      Color Psychology
                    </h4>
                    <span style={{ fontSize: "10px", color: "#6B7280", backgroundColor: "#F3F4F6", padding: "2px 8px", borderRadius: "6px", width: "fit-content", fontWeight: "500" }}>
                      Intermediate • 24 questions
                    </span>
                  </div>

                  {/* Soft Yellow Shape with 3D Palette */}
                  <div
                    style={{
                      backgroundColor: "#FFF0B3",
                      borderRadius: "18px",
                      width: "68px",
                      height: "68px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "30px",
                      flexShrink: 0
                    }}
                  >
                    🎨
                  </div>
                </Link>

              </div>

              {/* Centered Footer Link */}
              <div style={{ textAlign: "center", paddingTop: "8px" }}>
                <Link
                  href={activeCampaign ? `/campaigns/${activeCampaign.id}` : "/campaigns/new"}
                  style={{ fontSize: "12px", fontWeight: "700", color: "#11141A", textDecoration: "none" }}
                  className="hover:underline"
                >
                  See all courses ↗
                </Link>
              </div>
            </div>

          </div>

          {/* ═════════════════════════════════════════════════ */}
          {/* RIGHT COLUMN: 5-Day Streak + Purple Job Board */}
          {/* ═════════════════════════════════════════════════ */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

            {/* FLOATING STREAK CARD (Matches Exact Reference Image) */}
            <div
              style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "24px", padding: "24px" }}
              className="shadow-md"
            >
              
              {/* Header with Lightning Badge */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#11141A", margin: 0 }}>
                  You&apos;re on a 5-day streak
                </h3>

                {/* Yellow lightning badge ⚡ 31 */}
                <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "15px", fontWeight: "800", color: "#11141A" }}>
                  <span style={{ color: "#EAB308", fontSize: "18px" }}>⚡</span>
                  <span>31</span>
                </div>
              </div>

              {/* Days Row: S M T W T F S with Yellow Circles */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", paddingBottom: "16px", borderBottom: "1px solid #F3F4F6" }}>
                {[
                  { d: "S", active: false },
                  { d: "M", active: false },
                  { d: "T", active: true },
                  { d: "W", active: true },
                  { d: "T", active: true },
                  { d: "F", active: true },
                  { d: "S", active: true },
                ].map((item, idx) => (
                  <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "10px", fontWeight: "700", color: "#9CA3AF" }}>{item.d}</span>
                    <div
                      style={{
                        backgroundColor: item.active ? "#FFDE31" : "transparent",
                        border: item.active ? "none" : "1px solid #E5E7EB",
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                        fontWeight: "800",
                        color: "#FFFFFF",
                        boxShadow: item.active ? "0 2px 6px rgba(255, 222, 49, 0.4)" : "none"
                      }}
                    >
                      {item.active ? "⚡" : ""}
                    </div>
                  </div>
                ))}
              </div>

              {/* Course Progress List with Teal Striped Progress Bars */}
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {[
                  { name: "Web Design", xp: "4,712 XP", val: "90%" },
                  { name: "Color Psychology", xp: "4,328 XP", val: "80%" },
                  { name: "UX Writing", xp: "2,810 XP", val: "55%" },
                  { name: "Design Thinking II", xp: "1,561 XP", val: "35%" },
                ].map((cItem, cIdx) => (
                  <div key={cIdx} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", fontWeight: "700" }}>
                      <span style={{ color: "#374151" }}>{cItem.name}</span>
                      <span style={{ color: "#9CA3AF", fontFamily: "monospace" }}>{cItem.xp}</span>
                    </div>
                    {/* Teal Progress Bar */}
                    <div style={{ width: "100%", backgroundColor: "#F3F4F6", borderRadius: "9999px", height: "8px", overflow: "hidden" }}>
                      <div
                        style={{
                          width: cItem.val,
                          height: "100%",
                          background: "linear-gradient(90deg, #20DFBA 0%, #00C9A7 100%)",
                          borderRadius: "9999px"
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* View More Details Link */}
              <div style={{ paddingTop: "16px", marginTop: "16px", borderTop: "1px solid #F3F4F6", textAlign: "left" }}>
                <button
                  onClick={() => setActiveTab("graph")}
                  style={{ fontSize: "12px", fontWeight: "700", color: "#4B5563", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                  className="hover:text-black"
                >
                  View more details &gt;
                </button>
              </div>

            </div>

            {/* BOTTOM RIGHT BANNER CARD: Rich Purple Gradient Job Board Banner */}
            <div
              style={{
                background: "linear-gradient(135deg, #735CFF 0%, #5136E8 100%)",
                borderRadius: "24px",
                padding: "24px",
                color: "#FFFFFF",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: "180px",
                position: "relative",
                overflow: "hidden"
              }}
              className="shadow-md"
            >
              
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: "65%", zIndex: 2 }}>
                <h3 style={{ fontSize: "17px", fontWeight: "800", lineHeight: "1.2", margin: 0 }}>
                  The #1 job board for UI Designer!
                </h3>
                <p style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.8)", lineHeight: "1.4", margin: 0 }}>
                  Explore verified brand campaign opportunities across 25+ Indian regional markets.
                </p>
              </div>

              {/* Pill Button: Find a job */}
              <div style={{ paddingTop: "16px", zIndex: 2 }}>
                <Link href="/campaigns/new">
                  <button
                    style={{
                      backgroundColor: "#FFFFFF",
                      color: "#11141A",
                      fontSize: "12px",
                      fontWeight: "800",
                      padding: "10px 22px",
                      borderRadius: "9999px",
                      border: "none",
                      cursor: "pointer"
                    }}
                    className="hover:bg-neutral-100 shadow-xs"
                  >
                    Find a job
                  </button>
                </Link>
              </div>

              {/* Decorative Glassmorphic Badges on Right Side */}
              <div style={{ position: "absolute", right: "16px", top: "20px", display: "flex", flexDirection: "column", gap: "6px", pointerEvents: "none", zIndex: 1 }}>
                <span
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.18)",
                    border: "1px solid rgba(255, 255, 255, 0.25)",
                    fontSize: "10px",
                    fontFamily: "monospace",
                    padding: "4px 10px",
                    borderRadius: "9999px",
                    color: "rgba(255, 255, 255, 0.95)",
                    whiteSpace: "nowrap"
                  }}
                >
                  &lt;/&gt; UI Engineer
                </span>
                <span
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.18)",
                    border: "1px solid rgba(255, 255, 255, 0.25)",
                    fontSize: "10px",
                    fontFamily: "monospace",
                    padding: "4px 10px",
                    borderRadius: "9999px",
                    color: "rgba(255, 255, 255, 0.95)",
                    whiteSpace: "nowrap"
                  }}
                >
                  🛡️ Quality Assurance
                </span>
                <span
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.18)",
                    border: "1px solid rgba(255, 255, 255, 0.25)",
                    fontSize: "10px",
                    fontFamily: "monospace",
                    padding: "4px 10px",
                    borderRadius: "9999px",
                    color: "rgba(255, 255, 255, 0.95)",
                    whiteSpace: "nowrap"
                  }}
                >
                  👥 Project Manager
                </span>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
