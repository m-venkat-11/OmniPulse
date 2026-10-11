"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Home, ShieldCheck, Sparkles, FolderOpen, Plus,
  Share2, Users, ChevronDown, CheckCircle2, Globe2,
  Key, Cpu, ExternalLink, X, Check, AlertCircle, RefreshCw, Palette
} from "lucide-react";
import { testSarvamApiKeyAction } from "@/app/actions";

interface TopNavProps {
  userEmail?: string;
  initialTab?: string;
}

export function TopNav({ userEmail = "director@braco.ai", initialTab }: TopNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [currentTab, setCurrentTab] = useState<string>("overview");
  const [showAiModal, setShowAiModal] = useState(false);
  const [sarvamKey, setSarvamKey] = useState("");
  const [isTestingSarvam, setIsTestingSarvam] = useState(false);
  const [sarvamStatus, setSarvamStatus] = useState<"not_configured" | "connected" | "error">("not_configured");
  const [sarvamMessage, setSarvamMessage] = useState<string>("");

  // Sync tab from URL or props or hash
  useEffect(() => {
    const tabParam = searchParams?.get("tab");
    const hash = typeof window !== "undefined" ? window.location.hash.replace("#", "") : "";

    if (tabParam) {
      setCurrentTab(tabParam);
    } else if (hash === "ad-evidence" || hash === "claims") {
      setCurrentTab("ad-evidence");
    } else if (hash === "posters" || hash === "poster") {
      setCurrentTab("posters");
    } else if (hash === "claim-graph" || hash === "graph") {
      setCurrentTab("graph");
    } else if (hash === "creators") {
      setCurrentTab("creators");
    } else if (initialTab) {
      setCurrentTab(initialTab);
    }

    // Load saved Sarvam key from localStorage if present
    if (typeof window !== "undefined") {
      const savedKey = localStorage.getItem("SARVAM_API_KEY");
      if (savedKey) {
        setSarvamKey(savedKey);
        setSarvamStatus("connected");
      }
    }

    // Listen for tab switch events from page buttons
    const handleTabChange = (e: any) => {
      if (e.detail?.tab) {
        setCurrentTab(e.detail.tab);
      }
    };
    window.addEventListener("switch-dashboard-tab", handleTabChange);
    return () => window.removeEventListener("switch-dashboard-tab", handleTabChange);
  }, [searchParams, initialTab]);

  const handleSelectTab = (tab: "overview" | "ad-evidence" | "posters" | "graph" | "creators") => {
    setCurrentTab(tab);
    if (typeof window !== "undefined") {
      // Notify page
      window.dispatchEvent(new CustomEvent("switch-dashboard-tab", { detail: { tab } }));
      
      if (pathname === "/dashboard" || pathname === "/") {
        const newUrl = tab === "overview" ? "/dashboard" : `/dashboard?tab=${tab}`;
        window.history.pushState(null, "", newUrl);
        // Scroll to content if needed
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        router.push(tab === "overview" ? "/dashboard" : `/dashboard?tab=${tab}`);
      }
    }
  };

  const handleTestAndSaveSarvam = async () => {
    if (!sarvamKey.trim()) {
      alert("Please enter a valid Sarvam AI API subscription key.");
      return;
    }

    setIsTestingSarvam(true);
    setSarvamMessage("");
    try {
      const res = await testSarvamApiKeyAction(sarvamKey.trim());
      if (res.success) {
        setSarvamStatus("connected");
        setSarvamMessage("Connected! Dual AI pipeline is active for Indic dialect translation.");
        if (typeof window !== "undefined") {
          localStorage.setItem("SARVAM_API_KEY", sarvamKey.trim());
          window.dispatchEvent(new CustomEvent("sarvam-key-updated", { detail: { key: sarvamKey.trim() } }));
        }
      } else {
        setSarvamStatus("error");
        setSarvamMessage(res.message || "Failed to verify key with Sarvam AI.");
      }
    } catch (err: any) {
      setSarvamStatus("error");
      setSarvamMessage(err.message || "Error validating key");
    } finally {
      setIsTestingSarvam(false);
    }
  };

  const isOverview = (pathname === "/dashboard" || pathname === "/") && currentTab === "overview";
  const isAdEvidence = (pathname === "/dashboard" || pathname === "/") && currentTab === "ad-evidence";
  const isPosters = (pathname === "/dashboard" || pathname === "/") && currentTab === "posters";
  const isGraph = (pathname === "/dashboard" || pathname === "/") && currentTab === "graph";
  const isCreators = (pathname === "/dashboard" || pathname === "/") && currentTab === "creators";
  const isNewCampaign = pathname.startsWith("/campaigns/new");
  const isLibrary = pathname.includes("library");

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-4 px-3 py-1 text-white w-full">
        {/* Brand Logo: Clean White Logo Matching Reference Image with Braco Tag */}
        <Link
          href="/dashboard"
          onClick={() => handleSelectTab("overview")}
          className="flex items-center gap-2.5 group"
        >
          <span className="font-sans font-extrabold text-white text-2xl tracking-tight group-hover:opacity-90 transition-opacity">
            quixel
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="text-3xs font-mono text-neutral-400 uppercase tracking-widest hidden sm:inline-block">
            Braco OmniPulse
          </span>
        </Link>

        {/* Central Pill Navigation Menu */}
        <nav
          style={{ backgroundColor: "#181C23" }}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-full border border-white/10 shadow-inner overflow-x-auto max-w-full"
        >
          <button
            type="button"
            onClick={() => handleSelectTab("overview")}
            style={{ backgroundColor: isOverview ? "#262C37" : "transparent" }}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold shadow transition-all whitespace-nowrap cursor-pointer border-none ${
              isOverview ? "text-white" : "text-white/70 hover:text-white hover:bg-white/5"
            }`}
          >
            <Home size={13} className={isOverview ? "text-white" : "text-white/80"} />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectTab("ad-evidence")}
            style={{ backgroundColor: isAdEvidence ? "#262C37" : "transparent" }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer border-none ${
              isAdEvidence ? "text-white" : "text-white/70 hover:text-white hover:bg-white/5"
            }`}
          >
            <Sparkles size={12} className={isAdEvidence ? "text-emerald-400" : "text-emerald-500/70"} />
            <span>Ad-Evidence & Claims</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectTab("posters")}
            style={{ backgroundColor: isPosters ? "#262C37" : "transparent" }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer border-none ${
              isPosters ? "text-white" : "text-white/70 hover:text-white hover:bg-white/5"
            }`}
          >
            <Palette size={12} className={isPosters ? "text-amber-400" : "text-amber-500/70"} />
            <span>AI Ad Poster</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectTab("graph")}
            style={{ backgroundColor: isGraph ? "#262C37" : "transparent" }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer border-none ${
              isGraph ? "text-white" : "text-white/70 hover:text-white hover:bg-white/5"
            }`}
          >
            <Share2 size={12} className={isGraph ? "text-blue-400" : "text-blue-500/70"} />
            <span>Claim Graph</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectTab("creators")}
            style={{ backgroundColor: isCreators ? "#262C37" : "transparent" }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer border-none ${
              isCreators ? "text-white" : "text-white/70 hover:text-white hover:bg-white/5"
            }`}
          >
            <Users size={12} className={isCreators ? "text-purple-400" : "text-purple-500/70"} />
            <span>Creator Preference</span>
          </button>

          <Link
            href="/campaigns/new"
            style={{ backgroundColor: isNewCampaign ? "#262C37" : "transparent" }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
              isNewCampaign ? "text-white" : "text-white/70 hover:text-white hover:bg-white/5"
            }`}
          >
            New Campaign
          </Link>

          <Link
            href="/dashboard/library"
            style={{ backgroundColor: isLibrary ? "#262C37" : "transparent" }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
              isLibrary ? "text-white" : "text-white/70 hover:text-white hover:bg-white/5"
            }`}
          >
            Brand Library
          </Link>
        </nav>

        {/* Right Section: Dual AI Status Badge + Profile Pill */}
        <div className="flex items-center gap-2.5">
          {/* Dual AI Engine Trigger Button */}
          <button
            type="button"
            onClick={() => setShowAiModal(true)}
            style={{ backgroundColor: "#181C23" }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 hover:border-white/20 transition-all text-xs font-medium text-white/90 hover:text-white cursor-pointer shadow-xs"
            title="Configure Gemini 3.8 + Sarvam AI Coordination"
          >
            <div className="flex items-center -space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34D399]"></span>
              {sarvamStatus === "connected" && (
                <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#FBBF24]"></span>
              )}
            </div>
            <span className="text-3xs font-mono tracking-wider uppercase hidden md:inline">
              {sarvamStatus === "connected" ? "Gemini + Sarvam AI" : "Gemini 3.8 Active"}
            </span>
            <Cpu size={12} className="text-emerald-400" />
          </button>

          {/* User Profile Pill */}
          <div
            style={{ backgroundColor: "#181C23" }}
            className="flex items-center gap-2.5 pl-2 pr-3.5 py-1.5 rounded-full border border-white/10 hover:border-white/20 transition-all cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 via-rose-400 to-indigo-500 flex items-center justify-center text-[#0C0E14] font-bold text-xs shadow shrink-0">
              A
            </div>
            <div className="text-left hidden sm:block">
              <span className="text-xs font-bold text-white block leading-tight">Hi, Ajeng!</span>
              <span className="text-3xs text-neutral-400 block leading-tight truncate max-w-[130px]">{userEmail}</span>
            </div>
            <ChevronDown size={13} className="text-neutral-400 shrink-0" />
          </div>
        </div>
      </header>

      {/* ── DUAL AI ORCHESTRATION CONFIG MODAL ── */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            style={{ backgroundColor: "#11141A", borderColor: "rgba(255,255,255,0.15)" }}
            className="w-full max-w-lg rounded-2xl border p-6 text-white shadow-2xl relative"
          >
            <button
              onClick={() => setShowAiModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white transition p-1"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-indigo-600 flex items-center justify-center text-white shadow">
                <Cpu size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-serif">Dual AI Orchestration Engine</h3>
                <p className="text-2xs text-neutral-400">Coordinating Google Gemini 3.8 & Sarvam AI for regional India</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {/* Engine 1: Gemini 3.8 Flash */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34D399]"></span>
                    <strong className="text-sm text-white">Google Gemini 3.8 Flash</strong>
                  </div>
                  <p className="text-2xs text-neutral-400 mt-1">
                    Multimodal claim extraction, packaging photo audit, ASCI/FSSAI compliance rules & Claim Evidence Graph.
                  </p>
                </div>
                <span className="text-2xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-1 rounded-md shrink-0">
                  CONNECTED
                </span>
              </div>

              {/* Engine 2: Sarvam AI */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${sarvamStatus === "connected" ? "bg-amber-400 shadow-[0_0_6px_#FBBF24]" : "bg-neutral-500"}`}></span>
                      <strong className="text-sm text-white">Sarvam AI (mayura:v1 & bulbul:v1)</strong>
                    </div>
                    <p className="text-2xs text-neutral-400 mt-0.5">
                      10+ Indian languages (Telugu, Tamil, Hindi, Marathi, Kannada) dialect translation & transliteration.
                    </p>
                  </div>
                  <span className={`text-2xs font-mono font-bold px-2 py-1 rounded-md shrink-0 border ${
                    sarvamStatus === "connected"
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                      : "bg-neutral-800 text-neutral-400 border-neutral-700"
                  }`}>
                    {sarvamStatus === "connected" ? "ACTIVE" : "OPTIONAL"}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-2xs text-neutral-300 font-medium flex items-center justify-between">
                    <span>Sarvam AI Subscription Key:</span>
                    <span className="text-neutral-500">api-subscription-key</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      placeholder="Paste your Sarvam AI API Key..."
                      value={sarvamKey}
                      onChange={(e) => setSarvamKey(e.target.value)}
                      className="flex-1 bg-black/40 border border-white/15 rounded-lg px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleTestAndSaveSarvam}
                      disabled={isTestingSarvam}
                      className="px-3.5 py-1.5 rounded-lg text-2xs font-bold bg-amber-500 hover:bg-amber-400 text-black flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer shrink-0"
                    >
                      {isTestingSarvam ? (
                        <RefreshCw size={12} className="animate-spin" />
                      ) : (
                        <Key size={12} />
                      )}
                      <span>{isTestingSarvam ? "Testing..." : "Save & Verify"}</span>
                    </button>
                  </div>
                </div>

                {sarvamMessage && (
                  <p className={`text-2xs mt-1.5 ${sarvamStatus === "connected" ? "text-emerald-400" : "text-rose-400"}`}>
                    {sarvamMessage}
                  </p>
                )}
              </div>

              {/* How Coordination Works */}
              <div className="p-3 rounded-xl bg-neutral-900/80 border border-white/5 text-2xs text-neutral-400 space-y-1">
                <span className="font-bold text-neutral-300 block">How the Dual Coordination Workflow Operates:</span>
                <p>1. <strong>Gemini 3.8</strong> audits the product photo packaging text, verifies brand guidelines, flags medical/superlative breaches, and locks factual claim atoms.</p>
                <p>2. <strong>Sarvam AI</strong> takes the verified claims and transcreates them into culturally authentic Indic dialects with native idioms, phonetic transliteration, and creator pitch briefs.</p>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-white text-black hover:bg-neutral-200 transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
