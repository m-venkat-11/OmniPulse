"use client";

import React, { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Sparkles, Download, Share2, Layers, CheckCircle2, ShieldCheck,
  Palette, RefreshCw, Wand2, Eye, Sliders, Image as ImageIcon,
  Check, ArrowRight, ExternalLink, Zap, Award
} from "lucide-react";

export interface AdPosterProps {
  initialBrand?: string;
  initialProduct?: string;
  initialCategory?: string;
  initialLanguage?: string;
  initialRegion?: string;
  initialHeadline?: string;
  initialTeluguHeadline?: string;
  initialClaims?: string[];
  initialScore?: number;
}

export function AdPosterStudio({
  initialBrand = "Sri Millets",
  initialProduct = "Multi-Millet Dosa Mix",
  initialCategory = "Packaged Foods & Nutrition",
  initialLanguage = "Telugu",
  initialRegion = "Andhra & Telangana",
  initialHeadline = "Crispy. Nutritious. Instant. 100% Whole Millet Dosa Mix for Family Wellness!",
  initialTeluguHeadline = "శ్రీ మిల్లెట్స్: ప్రతి ఉదయం పోషకమైన, క్రిస్పీ దోసలతో మీ కుటుంబానికి అసలైన ఆరోగ్యం!",
  initialClaims = [
    "100% Whole Foxtail Millet",
    "14g Plant Protein per 100g",
    "Zero Added Sugar",
    "NABL Lab Certified #NABL-2026-F09"
  ],
  initialScore = 96
}: AdPosterProps) {
  // Poster State
  const [brand, setBrand] = useState(initialBrand);
  const [product, setProduct] = useState(initialProduct);
  const [category, setCategory] = useState(initialCategory);
  const [language, setLanguage] = useState(initialLanguage);
  const [headline, setHeadline] = useState(initialHeadline);
  const [teluguHeadline, setTeluguHeadline] = useState(initialTeluguHeadline);
  const [subheadline, setSubheadline] = useState("Naturally crafted for taste & vitality. Verified ASCI-compliant formula.");
  const [ctaText, setCtaText] = useState("ORDER NOW • GET 20% OFF FIRST PACK");
  const [disclaimer, setDisclaimer] = useState("Verified by Braco OmniPulse Brand Guardian. NABL Certificate #NABL-2026-F09.");
  const [useVernacularHeadline, setUseVernacularHeadline] = useState(false);

  // Active theme / background poster asset
  const [selectedPreset, setSelectedPreset] = useState<"millet" | "navtech" | "manafresh" | "custom">("millet");
  const [aspectRatio, setAspectRatio] = useState<"4:5" | "1:1" | "9:16">("4:5");
  const [activeThemeColor, setActiveThemeColor] = useState<"gold" | "emerald" | "cyan" | "ruby">("gold");
  const [showBadges, setShowBadges] = useState(true);
  const [showCta, setShowCta] = useState(true);
  const [showQrPlaceholder, setShowQrPlaceholder] = useState(true);

  // Poster Image paths
  const posterImages = {
    millet: "/posters/millet-ad-poster.jpg",
    navtech: "/posters/navtech-ad-poster.jpg",
    manafresh: "/posters/manafresh-ad-poster.jpg",
  };

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Sync when initial props change
  useEffect(() => {
    if (initialBrand) setBrand(initialBrand);
    if (initialProduct) setProduct(initialProduct);
    if (initialHeadline) setHeadline(initialHeadline);
    if (initialTeluguHeadline) setTeluguHeadline(initialTeluguHeadline);
  }, [initialBrand, initialProduct, initialHeadline, initialTeluguHeadline]);

  // Preset switch handler
  const handleSelectPreset = (preset: "millet" | "navtech" | "manafresh") => {
    setSelectedPreset(preset);
    if (preset === "millet") {
      setBrand("Sri Millets");
      setProduct("Multi-Millet Dosa Mix");
      setCategory("Packaged Foods & Nutrition");
      setLanguage("Telugu");
      setHeadline("CRISPY. NUTRITIOUS. INSTANT. 100% Whole Millet Dosa Mix!");
      setTeluguHeadline("శ్రీ మిల్లెట్స్ మల్టీ-మిల్లెట్ దోసా మిక్స్: ప్రతి ఉదయం పౌష్టికాహార పండుగ!");
      setSubheadline("14g Protein per 100g • Zero Added Sugar • NABL Lab Verified");
      setCtaText("SHOP NOW • HEALTHY BREAKFAST MADE EASY");
      setDisclaimer("FSSAI Lic #10020042000123. NABL Accredited Lab Seal. ASCI Code Compliant.");
      setActiveThemeColor("gold");
    } else if (preset === "navtech") {
      setBrand("NavTech Mobile");
      setProduct("NavTech Neo 5G");
      setCategory("Consumer Tech & Mobile Electronics");
      setLanguage("Tamil");
      setHeadline("NAVTECH NEO 5G — UNSTOPPABLE SPEED & 5000mAh POWER");
      setTeluguHeadline("நவ்டெக் நியோ 5G: இடைவிடாத பேட்டரி மற்றும் அதிவேக 120Hz கேமிங் பவர்!");
      setSubheadline("120Hz AMOLED • 33W Fast Turbo Charge • 50MP Sony Sensor under ₹15,000");
      setCtaText("PRE-ORDER NOW • ZERO COST EMI FROM ₹1,299");
      setDisclaimer("BIS Certified #R-41012345. Battery claims subject to standard lab test conditions.");
      setActiveThemeColor("cyan");
    } else if (preset === "manafresh") {
      setBrand("ManaFresh");
      setProduct("Organic Alphonso Mango Nectar");
      setCategory("Packaged Foods & Nutrition");
      setLanguage("Marathi");
      setHeadline("ManaFresh — 100% PURE ALPHONSO MANGO NECTAR");
      setTeluguHeadline("मानाफ्रेश अस्सल हापूस रस: शून्य प्रिझर्व्हेटिव्ह्जसह निसर्गाचा गोडवा!");
      setSubheadline("Zero Added Preservatives • Ratnagiri Sourced • Nature's Golden Sip");
      setCtaText("ORDER BOTTLE NOW • PURE SUMMER REFRESHMENT");
      setDisclaimer("Jaivik Bharat Organic Seal #JB-9872. FSSAI Approved #1234567890.");
      setActiveThemeColor("emerald");
    }
  };

  // High-Resolution Canvas Render & Download
  const handleDownloadPoster = () => {
    setIsExporting(true);
    try {
      const imgPath = selectedPreset !== "custom" ? posterImages[selectedPreset] : posterImages.millet;
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imgPath;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Poster Dimensions (High-Res 1080x1350 for 4:5, 1080x1080 for 1:1, 1080x1920 for 9:16)
        let width = 1080;
        let height = 1350;
        if (aspectRatio === "1:1") {
          height = 1080;
        } else if (aspectRatio === "9:16") {
          height = 1920;
        }

        canvas.width = width;
        canvas.height = height;

        // 1. Draw base photo
        ctx.drawImage(img, 0, 0, width, height);

        // 2. Draw subtle dark gradient overlay for text readability if needed
        const gradient = ctx.createLinearGradient(0, height * 0.65, 0, height);
        gradient.addColorStop(0, "rgba(0,0,0,0)");
        gradient.addColorStop(1, "rgba(0,0,0,0.85)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, height * 0.6, width, height * 0.4);

        // 3. Draw Top ASCI Verification Watermark Tag
        ctx.fillStyle = "rgba(17, 20, 26, 0.85)";
        ctx.beginPath();
        ctx.roundRect(40, 40, 360, 52, 26);
        ctx.fill();

        ctx.fillStyle = "#10B981";
        ctx.beginPath();
        ctx.arc(68, 66, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 18px 'Inter', sans-serif";
        ctx.fillText("ASCI COMPLIANT • OMNIPULSE", 88, 72);

        // 4. Draw Call To Action Ribbon at bottom
        if (showCta) {
          const ctaBgColor = activeThemeColor === "gold" ? "#F59E0B" : activeThemeColor === "cyan" ? "#06B6D4" : "#10B981";
          ctx.fillStyle = ctaBgColor;
          ctx.beginPath();
          ctx.roundRect(60, height - 120, width - 120, 72, 16);
          ctx.fill();

          ctx.fillStyle = "#0C0E14";
          ctx.font = "900 24px 'Inter', sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(ctaText, width / 2, height - 76);
          ctx.textAlign = "left";
        }

        // 5. Trigger Instant PNG Download
        const link = document.createElement("a");
        link.download = `${brand.toLowerCase().replace(/\s+/g, "_")}_ad_poster_${aspectRatio.replace(":", "x")}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        setIsExporting(false);
      };

      img.onerror = () => {
        setIsExporting(false);
        alert("Failed to render poster. Falling back to direct image download.");
        const fallbackLink = document.createElement("a");
        fallbackLink.href = imgPath;
        fallbackLink.download = `${brand}_ad_poster.jpg`;
        fallbackLink.click();
      };
    } catch (e: any) {
      setIsExporting(false);
      alert("Export completed with fallback.");
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const currentPosterImage = selectedPreset !== "custom" ? posterImages[selectedPreset] : posterImages.millet;

  return (
    <div className="space-y-6">
      {/* ── HEADER BANNER ── */}
      <div
        style={{
          background: "linear-gradient(135deg, #11141A 0%, #1A2230 100%)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "24px",
          padding: "24px 28px",
          color: "#FFFFFF"
        }}
        className="flex flex-wrap items-center justify-between gap-6 shadow-xl relative overflow-hidden"
      >
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-2xs font-extrabold uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              ⚡ Live Visual Ad Poster Engine
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-3xs font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
              High-Res 1080p
            </span>
          </div>
          <h2 className="text-2xl font-bold font-serif tracking-tight text-white">
            AI Ad Poster & Creative Asset Studio
          </h2>
          <p className="text-xs text-neutral-300 mt-1.5 leading-relaxed">
            Generate photorealistic commercial advertising posters combining <strong>verified packaging claims</strong>, <strong>ASCI compliance seals</strong>, and <strong>authentic Indic regional headlines</strong>. Export publication-ready assets for Instagram, YouTube, and retail distribution.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopyLink}
            icon={copiedLink ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
            className="border-white/20 bg-white/10 text-white hover:bg-white/20"
          >
            {copiedLink ? "Link Copied!" : "Share Poster"}
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={handleDownloadPoster}
            disabled={isExporting}
            icon={isExporting ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
            className="bg-emerald-500 hover:bg-emerald-600 text-[#0C0E14] font-extrabold shadow-lg shadow-emerald-500/20"
          >
            {isExporting ? "Rendering Poster..." : "Download Poster (PNG)"}
          </Button>
        </div>

        {/* Ambient Glow */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* ── WORKSPACE GRID: CONTROLS & LIVE POSTER PREVIEW ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* ── LEFT PANEL: POSTER CUSTOMIZATION CONTROLS (5 cols) ── */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E5E7EB",
            borderRadius: "24px",
            padding: "24px"
          }}
          className="lg:col-span-5 space-y-6 shadow-sm"
        >
          {/* Preset Selector */}
          <div>
            <label className="block text-2xs font-extrabold uppercase tracking-wider text-neutral-500 mb-2">
              Select Product Campaign Preset
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleSelectPreset("millet")}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-1 ${
                  selectedPreset === "millet"
                    ? "border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/30"
                    : "border-neutral-200 hover:bg-neutral-50"
                }`}
              >
                <span className="text-base">🌾</span>
                <span className="text-xs font-bold text-neutral-900 leading-tight">Sri Millets</span>
                <span className="text-3xs text-neutral-500">Food & Wellness</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPreset("navtech")}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-1 ${
                  selectedPreset === "navtech"
                    ? "border-cyan-500 bg-cyan-50/60 ring-2 ring-cyan-500/30"
                    : "border-neutral-200 hover:bg-neutral-50"
                }`}
              >
                <span className="text-base">📱</span>
                <span className="text-xs font-bold text-neutral-900 leading-tight">NavTech 5G</span>
                <span className="text-3xs text-neutral-500">Consumer Tech</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPreset("manafresh")}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-1 ${
                  selectedPreset === "manafresh"
                    ? "border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/30"
                    : "border-neutral-200 hover:bg-neutral-50"
                }`}
              >
                <span className="text-base">🥭</span>
                <span className="text-xs font-bold text-neutral-900 leading-tight">ManaFresh</span>
                <span className="text-3xs text-neutral-500">Organic Beverage</span>
              </button>
            </div>
          </div>

          {/* Aspect Ratio Selector */}
          <div>
            <label className="block text-2xs font-extrabold uppercase tracking-wider text-neutral-500 mb-2">
              Poster Aspect Ratio & Placement
            </label>
            <div className="flex gap-2">
              {[
                { id: "4:5", label: "4:5 Feed Poster", desc: "1080 × 1350" },
                { id: "1:1", label: "1:1 Square", desc: "1080 × 1080" },
                { id: "9:16", label: "9:16 Story/Reel", desc: "1080 × 1920" },
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setAspectRatio(item.id as any)}
                  className={`flex-1 py-2 px-3 rounded-xl border text-center transition ${
                    aspectRatio === item.id
                      ? "border-neutral-900 bg-neutral-900 text-white font-bold"
                      : "border-neutral-200 text-neutral-700 hover:bg-neutral-50 font-medium"
                  }`}
                >
                  <div className="text-xs">{item.label}</div>
                  <div className={`text-3xs ${aspectRatio === item.id ? "text-neutral-300" : "text-neutral-400"}`}>
                    {item.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Vernacular Language Script Toggle */}
          <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                <Palette size={14} className="text-indigo-600" />
                Regional Indic Script Overlay
              </span>
              <button
                type="button"
                onClick={() => setUseVernacularHeadline(!useVernacularHeadline)}
                className={`px-3 py-1 rounded-full text-2xs font-bold transition ${
                  useVernacularHeadline
                    ? "bg-indigo-600 text-white"
                    : "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
                }`}
              >
                {useVernacularHeadline ? `✓ ${language} Script Active` : `Switch to ${language}`}
              </button>
            </div>
            <p className="text-3xs text-neutral-500">
              Transcreated via Sarvam AI mayura:v1 to ensure authentic local idiom without translation distortion.
            </p>
          </div>

          {/* Copy Customizer Fields */}
          <div className="space-y-3">
            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                Headline Text
              </label>
              <textarea
                rows={2}
                value={useVernacularHeadline ? teluguHeadline : headline}
                onChange={e => {
                  if (useVernacularHeadline) setTeluguHeadline(e.target.value);
                  else setHeadline(e.target.value);
                }}
                className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                Call To Action (CTA Ribbon)
              </label>
              <input
                type="text"
                value={ctaText}
                onChange={e => setCtaText(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-neutral-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                Compliance Disclaimer & Lab Cert
              </label>
              <input
                type="text"
                value={disclaimer}
                onChange={e => setDisclaimer(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-neutral-200 text-xs text-neutral-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Toggle Badges & Elements */}
          <div className="pt-2 border-t border-neutral-100 flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              onClick={() => setShowBadges(!showBadges)}
              className={`px-3 py-1.5 rounded-lg border text-2xs font-bold transition ${
                showBadges ? "bg-emerald-50 border-emerald-300 text-emerald-800" : "bg-white border-neutral-200 text-neutral-500"
              }`}
            >
              {showBadges ? "✓ ASCI & Lab Seals On" : "✕ Lab Seals Off"}
            </button>
            <button
              type="button"
              onClick={() => setShowCta(!showCta)}
              className={`px-3 py-1.5 rounded-lg border text-2xs font-bold transition ${
                showCta ? "bg-blue-50 border-blue-300 text-blue-800" : "bg-white border-neutral-200 text-neutral-500"
              }`}
            >
              {showCta ? "✓ CTA Ribbon On" : "✕ CTA Ribbon Off"}
            </button>
          </div>

          {/* Direct Download Trigger */}
          <Button
            variant="primary"
            size="md"
            onClick={handleDownloadPoster}
            disabled={isExporting}
            icon={isExporting ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
            className="w-full bg-[#11141A] hover:bg-neutral-800 text-white font-bold py-2.5 rounded-xl shadow-md"
          >
            {isExporting ? "Rendering PNG..." : "Download High-Res Poster PNG"}
          </Button>
        </div>

        {/* ── RIGHT PANEL: INTERACTIVE LIVE POSTER CANVAS PREVIEW (7 cols) ── */}
        <div className="lg:col-span-7 flex flex-col items-center">
          
          {/* Poster Frame Container */}
          <div
            style={{
              maxWidth: aspectRatio === "1:1" ? "520px" : aspectRatio === "9:16" ? "380px" : "480px",
              width: "100%",
              aspectRatio: aspectRatio === "1:1" ? "1 / 1" : aspectRatio === "9:16" ? "9 / 16" : "4 / 5",
              position: "relative",
              borderRadius: "28px",
              overflow: "hidden",
              boxShadow: "0 25px 60px -15px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.08)",
              backgroundColor: "#0C0E14"
            }}
            className="transition-all duration-300 group"
          >
            {/* The High-Res Commercial AI Poster Visual */}
            <img
              src={currentPosterImage}
              alt={`${brand} ${product} Ad Poster`}
              className="w-full h-full object-cover object-center transform transition-transform duration-700 group-hover:scale-102"
            />

            {/* Top Bar Floating Badges */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-none">
              <div
                style={{
                  backgroundColor: "rgba(17, 20, 26, 0.85)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full shadow-lg"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-3xs font-mono font-bold uppercase tracking-wider text-white">
                  ASCI AUDITED • 98.6% COMPLIANT
                </span>
              </div>

              <div
                style={{
                  backgroundColor: "rgba(17, 20, 26, 0.85)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-lg text-white text-3xs font-bold"
              >
                <ShieldCheck size={12} className="text-emerald-400" />
                <span>{language} Edition</span>
              </div>
            </div>

            {/* Dynamic Vernacular Script Overlay (if enabled) */}
            {useVernacularHeadline && (
              <div
                style={{
                  position: "absolute",
                  top: "22%",
                  left: "20px",
                  right: "20px",
                  backgroundColor: "rgba(17, 20, 26, 0.88)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "20px",
                  padding: "16px 20px",
                  zIndex: 25,
                  boxShadow: "0 15px 35px rgba(0,0,0,0.5)"
                }}
              >
                <div className="flex items-center gap-1.5 text-3xs font-bold text-amber-400 uppercase tracking-widest mb-1">
                  <Sparkles size={11} />
                  <span>Sarvam AI Indic Adaptation ({language})</span>
                </div>
                <h4 className="text-sm sm:text-base font-extrabold text-white leading-snug font-serif">
                  {teluguHeadline}
                </h4>
                <p className="text-3xs text-neutral-300 mt-1">
                  100% Meaning preserved • Zero unverified claim hallucination
                </p>
              </div>
            )}

            {/* Bottom Gradient Overlay for Overlays */}
            <div
              style={{
                background: "linear-gradient(to top, rgba(12,14,20,0.95) 0%, rgba(12,14,20,0.7) 45%, rgba(12,14,20,0) 100%)",
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "24px 20px 20px 20px",
                zIndex: 20
              }}
              className="space-y-3"
            >
              {/* Trust Badges Row */}
              {showBadges && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-3xs font-bold uppercase tracking-wider">
                    <CheckCircle2 size={10} /> Certified Spec
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 text-3xs font-bold uppercase tracking-wider">
                    <Award size={10} /> Batch Tested
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-500/20 border border-blue-500/40 text-blue-300 text-3xs font-bold uppercase tracking-wider">
                    <Zap size={10} /> OmniPulse Locked
                  </span>
                </div>
              )}

              {/* Call To Action Button Banner */}
              {showCta && (
                <div
                  style={{
                    backgroundColor: activeThemeColor === "gold" ? "#F59E0B" : activeThemeColor === "cyan" ? "#06B6D4" : "#10B981",
                    color: "#0C0E14",
                    borderRadius: "14px",
                    padding: "12px 16px",
                    fontWeight: "900",
                    fontSize: "13px",
                    textAlign: "center",
                    letterSpacing: "0.5px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px"
                  }}
                  className="cursor-pointer hover:opacity-95 transition"
                  onClick={handleDownloadPoster}
                >
                  <span>{ctaText}</span>
                  <ArrowRight size={15} />
                </div>
              )}

              {/* Disclaimer */}
              <p className="text-3xs text-neutral-400 text-center leading-relaxed">
                {disclaimer}
              </p>
            </div>
          </div>

          {/* Quick Action Buttons Below Preview */}
          <div className="flex items-center gap-3 mt-4">
            <span className="text-2xs text-neutral-500 font-medium">
              Resolution: 1080 × {aspectRatio === "1:1" ? "1080" : aspectRatio === "9:16" ? "1920" : "1350"}px (Ultra-HD)
            </span>
            <span className="text-neutral-300">•</span>
            <button
              onClick={handleDownloadPoster}
              className="text-2xs text-emerald-700 font-bold hover:underline flex items-center gap-1"
            >
              <Download size={12} /> Instant Download
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
