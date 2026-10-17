"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/shell/AppShell";
import { Card } from "@/components/design-system/Card";
import { PillButton } from "@/components/design-system/PillButton";
import { createCampaignAction, extractClaimsFromBrief } from "./actions";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FileText,
  Shield,
  Layers,
  Plus,
  Trash2,
} from "lucide-react";

function NewCampaignWizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Stepper state (1 to 4)
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExtractingClaims, setIsExtractingClaims] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    brand_name: "",
    product_name: "",
    objective: "",
    target_audience: "",
    region: "National / Multi-Region",
    source_language: searchParams.get("sourceLang") || "English",
    target_languages: [searchParams.get("targetLang") || "Telugu"],
    channels: ["social_media", "poster"],
    content_format: "copy",
    key_message: searchParams.get("message") || "",
    call_to_action: "",
    tone: "Trustworthy & Warm",
    budget_assumptions: "",
    mandatory_disclosures: [] as string[],
    prohibited_claims: [] as string[],
    approved_claims: [] as Array<{
      claim_text: string;
      type: "product_fact" | "approved_term" | "prohibited_claim" | "disclosure" | "offer_price" | "legal_high_risk";
      locked_tokens: string[];
      qualifications: string;
    }>,
  });

  // Inputs for temporary tags
  const [tempDisclosure, setTempDisclosure] = useState("");
  const [tempProhibited, setTempProhibited] = useState("");
  const [tempClaimText, setTempClaimText] = useState("");
  const [tempClaimType, setTempClaimType] = useState<any>("product_fact");

  const availableLanguages = [
    "Telugu", "Hindi", "Tamil", "Bengali", "Marathi",
    "Kannada", "Malayalam", "Gujarati", "Punjabi", "Odia", "English"
  ];

  const availableChannels = [
    { id: "social_media", label: "Social Media (Feed / Carousel)" },
    { id: "poster", label: "Ad Poster (Print / Digital Display)" },
    { id: "video", label: "Video Storyboard & Voiceover" },
    { id: "search_ad", label: "Paid Search & Performance Ad" },
  ];

  const toggleLanguage = (lang: string) => {
    setFormData((prev) => {
      const exists = prev.target_languages.includes(lang);
      return {
        ...prev,
        target_languages: exists
          ? prev.target_languages.filter((l) => l !== lang)
          : [...prev.target_languages, lang],
      };
    });
  };

  const toggleChannel = (ch: string) => {
    setFormData((prev) => {
      const exists = prev.channels.includes(ch);
      return {
        ...prev,
        channels: exists ? prev.channels.filter((c) => c !== ch) : [...prev.channels, ch],
      };
    });
  };

  const handleAddClaim = () => {
    if (!tempClaimText.trim()) return;
    setFormData((prev) => ({
      ...prev,
      approved_claims: [
        ...prev.approved_claims,
        {
          claim_text: tempClaimText.trim(),
          type: tempClaimType,
          locked_tokens: [],
          qualifications: "",
        },
      ],
    }));
    setTempClaimText("");
  };

  const handleAddDisclosure = () => {
    if (!tempDisclosure.trim()) return;
    setFormData((prev) => ({
      ...prev,
      mandatory_disclosures: [...prev.mandatory_disclosures, tempDisclosure.trim()],
    }));
    setTempDisclosure("");
  };

  const handleAddProhibited = () => {
    if (!tempProhibited.trim()) return;
    setFormData((prev) => ({
      ...prev,
      prohibited_claims: [...prev.prohibited_claims, tempProhibited.trim()],
    }));
    setTempProhibited("");
  };

  const handleAiExtractClaims = async () => {
    const briefText = `${formData.objective}\n${formData.key_message}`;
    if (!briefText.trim()) {
      setErrorMessage("Enter an objective or key message first before extracting claims.");
      return;
    }

    setIsExtractingClaims(true);
    setErrorMessage("");
    try {
      const res = await extractClaimsFromBrief(briefText, formData.brand_name, formData.product_name);
      if (res.claims) {
        setFormData((prev) => ({
          ...prev,
          approved_claims: [
            ...prev.approved_claims,
            ...res.claims.map((c: any) => ({
              claim_text: c.claim_text,
              type: c.claim_type,
              locked_tokens: c.locked_tokens || [],
              qualifications: c.qualifications || "",
            })),
          ],
        }));
      } else if (res.error) {
        setErrorMessage(res.error);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Extraction failed.");
    } finally {
      setIsExtractingClaims(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const res = await createCampaignAction(formData);
      if (res.success && res.campaignId) {
        router.push(`/campaigns/${res.campaignId}`);
      } else {
        setErrorMessage(res.error || "Failed to create campaign brief.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell primaryActionLabel="View Campaigns" primaryActionHref="/campaigns">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        {/* Header & Stepper */}
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Campaign Brief Studio
          </h1>
          <p className="text-xs text-[#A3A3A3] mt-1">
            Author structured briefs, define verifiable Claim Atoms, and publish immutable version 1.
          </p>

          {/* Stepper Pills */}
          <div className="flex items-center gap-2 mt-6">
            {[
              { num: 1, label: "Core Brief" },
              { num: 2, label: "Languages & Market" },
              { num: 3, label: "Claim Atoms & Rules" },
              { num: 4, label: "Review & Seal" },
            ].map((s) => (
              <button
                key={s.num}
                type="button"
                onClick={() => setStep(s.num)}
                className={`flex-1 py-2 px-3 rounded-full text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  step === s.num
                    ? "bg-white text-black shadow-md"
                    : step > s.num
                    ? "bg-[#2BD64F]/20 text-[#2BD64F] border border-[#2BD64F]/30"
                    : "bg-[#161616] text-[#777777] border border-[#222222]"
                }`}
              >
                <span>{s.num}.</span>
                <span className="hidden sm:inline">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-[18px] bg-[#2A1414] border border-[#FF5C5C]/30 text-xs text-[#FF8585] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ── STEP 1: Core Details ── */}
        {step === 1 && (
          <Card title="1. Brand, Product & Objective" icon={<FileText className="w-3.5 h-3.5" />}>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#A3A3A3] mb-1.5">
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.brand_name}
                    onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
                    placeholder="e.g. Sri Millets"
                    className="w-full bg-[#1C1C1C] text-white text-xs rounded-full px-5 py-3 border border-transparent focus:border-[#333333] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A3A3A3] mb-1.5">
                    Product / Service *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.product_name}
                    onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                    placeholder="e.g. Multi-Millet Dosa Mix"
                    className="w-full bg-[#1C1C1C] text-white text-xs rounded-full px-5 py-3 border border-transparent focus:border-[#333333] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A3A3A3] mb-1.5">
                  Campaign Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Diwali Regional Health Campaign"
                  className="w-full bg-[#1C1C1C] text-white text-xs rounded-full px-5 py-3 border border-transparent focus:border-[#333333] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A3A3A3] mb-1.5">
                  Campaign Objective *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.objective}
                  onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                  placeholder="e.g. Drive regional awareness and trial of whole grain millet breakfast mix among health-conscious families..."
                  className="w-full bg-[#1C1C1C] text-white text-xs rounded-[18px] p-4 border border-transparent focus:border-[#333333] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A3A3A3] mb-1.5">
                  Non-Sensitive Target Audience (Optional)
                </label>
                <input
                  type="text"
                  value={formData.target_audience}
                  onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                  placeholder="e.g. Urban and semi-urban working parents seeking quick nutritional breakfast solutions"
                  className="w-full bg-[#1C1C1C] text-white text-xs rounded-full px-5 py-3 border border-transparent focus:border-[#333333] focus:outline-none"
                />
              </div>

              <div className="flex justify-end pt-4">
                <PillButton
                  variant="white"
                  size="md"
                  onClick={() => {
                    if (!formData.name || !formData.brand_name || !formData.product_name || !formData.objective) {
                      setErrorMessage("Please complete all required fields (*).");
                      return;
                    }
                    setErrorMessage("");
                    setStep(2);
                  }}
                  icon={<ArrowRight className="w-4 h-4 text-black" />}
                >
                  Next: Languages & Market
                </PillButton>
              </div>
            </div>
          </Card>
        )}

        {/* ── STEP 2: Language, Market & Channels ── */}
        {step === 2 && (
          <Card title="2. Regional Market, Languages & Tone" icon={<Layers className="w-3.5 h-3.5" />}>
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#A3A3A3] mb-1.5">
                    Target Region / Market *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    placeholder="e.g. Telangana & Coastal Andhra"
                    className="w-full bg-[#1C1C1C] text-white text-xs rounded-full px-5 py-3 border border-transparent focus:border-[#333333] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A3A3A3] mb-1.5">
                    Campaign Tone
                  </label>
                  <select
                    value={formData.tone}
                    onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                    className="w-full bg-[#1C1C1C] text-white text-xs rounded-full px-5 py-3 border border-transparent focus:border-[#333333] focus:outline-none cursor-pointer"
                  >
                    <option value="Trustworthy & Warm">Trustworthy & Warm</option>
                    <option value="Playful & Festive">Playful & Festive</option>
                    <option value="Premium & Editorial">Premium & Editorial</option>
                    <option value="Energetic & Action-Oriented">Energetic & Action-Oriented</option>
                    <option value="Formal & Reassuring">Formal & Reassuring</option>
                  </select>
                </div>
              </div>

              {/* Target Languages Multi-select */}
              <div>
                <label className="block text-xs font-semibold text-[#A3A3A3] mb-2">
                  Select Target Regional Languages * (Pick at least one)
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableLanguages.map((lang) => {
                    const selected = formData.target_languages.includes(lang);
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => toggleLanguage(lang)}
                        className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                          selected
                            ? "bg-[#2BD64F] text-black font-bold shadow-sm"
                            : "bg-[#1C1C1C] text-[#A3A3A3] hover:text-white hover:bg-[#252525]"
                        }`}
                      >
                        {lang}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Channels Multi-select */}
              <div>
                <label className="block text-xs font-semibold text-[#A3A3A3] mb-2">
                  Marketing Channels *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {availableChannels.map((ch) => {
                    const selected = formData.channels.includes(ch.id);
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => toggleChannel(ch.id)}
                        className={`p-3.5 rounded-[18px] text-left text-xs font-medium border transition-all ${
                          selected
                            ? "bg-[#142618] border-[#2BD64F] text-white"
                            : "bg-[#1C1C1C] border-transparent text-[#777777] hover:border-[#333333]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{ch.label}</span>
                          {selected && <CheckCircle2 className="w-4 h-4 text-[#2BD64F]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Source Message */}
              <div>
                <label className="block text-xs font-semibold text-[#A3A3A3] mb-1.5">
                  Core Campaign Message / Master Copy
                </label>
                <textarea
                  rows={3}
                  value={formData.key_message}
                  onChange={(e) => setFormData({ ...formData, key_message: e.target.value })}
                  placeholder="e.g. Celebrate health with 100% whole grain multi-millet dosa mix. 14g plant protein, 0 added sugar, lab tested."
                  className="w-full bg-[#1C1C1C] text-white text-xs rounded-[18px] p-4 border border-transparent focus:border-[#333333] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <PillButton variant="outline" size="md" onClick={() => setStep(1)}>
                  Back
                </PillButton>
                <PillButton
                  variant="white"
                  size="md"
                  onClick={() => {
                    if (formData.target_languages.length === 0 || formData.channels.length === 0) {
                      setErrorMessage("Please select at least one language and channel.");
                      return;
                    }
                    setErrorMessage("");
                    setStep(3);
                  }}
                  icon={<ArrowRight className="w-4 h-4 text-black" />}
                >
                  Next: Claim Atoms
                </PillButton>
              </div>
            </div>
          </Card>
        )}

        {/* ── STEP 3: Brand Claims, Atoms & Disclosures ── */}
        {step === 3 && (
          <Card title="3. Claim Atoms, Disclosures & Rules" icon={<Shield className="w-3.5 h-3.5" />}>
            <div className="flex flex-col gap-6">
              {/* AI Claim Extraction Helper */}
              <div className="p-4 rounded-[20px] bg-[#14221A] border border-[#2BD64F]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#2BD64F]" />
                    AI Claim Atom Extractor
                  </h4>
                  <p className="text-[11px] text-[#A5E3B5] mt-0.5">
                    Analyze your entered objective and key message to automatically parse verifiable atomic claims.
                  </p>
                </div>
                <PillButton
                  variant="primary"
                  size="sm"
                  onClick={handleAiExtractClaims}
                  disabled={isExtractingClaims}
                >
                  {isExtractingClaims ? "Extracting..." : "Auto-Extract Claims"}
                </PillButton>
              </div>

              {/* Add Single Claim Atom */}
              <div className="p-4 rounded-[20px] bg-[#1C1C1C] flex flex-col gap-3">
                <span className="text-xs font-bold text-white">Add Claim Atom</span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      value={tempClaimText}
                      onChange={(e) => setTempClaimText(e.target.value)}
                      placeholder="e.g. 14g plant protein per 100g serving"
                      className="w-full bg-[#141414] text-white text-xs rounded-full px-4 py-2.5 border border-[#262626]"
                    />
                  </div>
                  <div>
                    <select
                      value={tempClaimType}
                      onChange={(e) => setTempClaimType(e.target.value)}
                      className="w-full bg-[#141414] text-white text-xs rounded-full px-4 py-2.5 border border-[#262626] cursor-pointer"
                    >
                      <option value="product_fact">Product Fact</option>
                      <option value="approved_term">Approved Term</option>
                      <option value="disclosure">Disclosure</option>
                      <option value="offer_price">Offer/Price</option>
                      <option value="legal_high_risk">Legal / High Risk</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <PillButton variant="outline" size="sm" onClick={handleAddClaim} icon={<Plus className="w-3 h-3" />}>
                    Add Claim
                  </PillButton>
                </div>
              </div>

              {/* List of Entered Claim Atoms */}
              <div>
                <span className="text-xs font-bold text-[#A3A3A3] mb-2 block">
                  Active Claim Atoms ({formData.approved_claims.length})
                </span>
                {formData.approved_claims.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {formData.approved_claims.map((claim, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-[16px] bg-[#1C1C1C] flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#2A2A2A] text-white uppercase flex-shrink-0">
                            {claim.type.replace(/_/g, " ")}
                          </span>
                          <span className="text-white truncate">{claim.claim_text}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              approved_claims: prev.approved_claims.filter((_, i) => i !== idx),
                            }))
                          }
                          className="text-[#777777] hover:text-[#FF5C5C] flex-shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#666666] italic">No atomic claims defined yet.</p>
                )}
              </div>

              {/* Prohibited Phrases */}
              <div>
                <label className="block text-xs font-semibold text-[#A3A3A3] mb-1.5">
                  Prohibited Phrases & Claims (Brand Guardian will block these)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tempProhibited}
                    onChange={(e) => setTempProhibited(e.target.value)}
                    placeholder="e.g. 100% cure, #1 in India, permanent relief"
                    className="flex-1 bg-[#1C1C1C] text-white text-xs rounded-full px-5 py-2.5 border border-[#262626]"
                  />
                  <PillButton variant="outline" size="sm" onClick={handleAddProhibited}>
                    Add
                  </PillButton>
                </div>
                {formData.prohibited_claims.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.prohibited_claims.map((p, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full text-xs bg-[#2A1414] border border-[#FF5C5C]/30 text-[#FF8585] flex items-center gap-1.5"
                      >
                        {p}
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              prohibited_claims: prev.prohibited_claims.filter((_, idx) => idx !== i),
                            }))
                          }
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Mandatory Disclosures */}
              <div>
                <label className="block text-xs font-semibold text-[#A3A3A3] mb-1.5">
                  Mandatory Disclosures & Legal Copy
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tempDisclosure}
                    onChange={(e) => setTempDisclosure(e.target.value)}
                    placeholder="e.g. FSSAI Lic #10020042000123. ASCI Code Compliant."
                    className="flex-1 bg-[#1C1C1C] text-white text-xs rounded-full px-5 py-2.5 border border-[#262626]"
                  />
                  <PillButton variant="outline" size="sm" onClick={handleAddDisclosure}>
                    Add
                  </PillButton>
                </div>
                {formData.mandatory_disclosures.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.mandatory_disclosures.map((d, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full text-xs bg-[#1A1A1A] text-[#D4D4D4] border border-[#333333] flex items-center gap-1.5"
                      >
                        {d}
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              mandatory_disclosures: prev.mandatory_disclosures.filter((_, idx) => idx !== i),
                            }))
                          }
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4">
                <PillButton variant="outline" size="md" onClick={() => setStep(2)}>
                  Back
                </PillButton>
                <PillButton
                  variant="white"
                  size="md"
                  onClick={() => setStep(4)}
                  icon={<ArrowRight className="w-4 h-4 text-black" />}
                >
                  Review & Seal
                </PillButton>
              </div>
            </div>
          </Card>
        )}

        {/* ── STEP 4: Review & Immutable Seal ── */}
        {step === 4 && (
          <Card title="4. Review & Immutable Brief Version 1" icon={<CheckCircle2 className="w-3.5 h-3.5 text-[#2BD64F]" />}>
            <div className="flex flex-col gap-6">
              <div className="p-4 rounded-[20px] bg-[#161616] border border-[#262626] text-xs flex flex-col gap-3">
                <div className="flex justify-between pb-2 border-b border-[#222222]">
                  <span className="text-[#777777]">Campaign Title</span>
                  <span className="font-bold text-white">{formData.name}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-[#222222]">
                  <span className="text-[#777777]">Brand & Product</span>
                  <span className="font-bold text-white">{formData.brand_name} • {formData.product_name}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-[#222222]">
                  <span className="text-[#777777]">Target Market</span>
                  <span className="text-white">{formData.region}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-[#222222]">
                  <span className="text-[#777777]">Target Languages</span>
                  <span className="text-[#2BD64F] font-semibold">{formData.target_languages.join(", ")}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-[#222222]">
                  <span className="text-[#777777]">Channels</span>
                  <span className="text-white">{formData.channels.join(", ")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#777777]">Claim Atoms</span>
                  <span className="text-white font-semibold">{formData.approved_claims.length} registered</span>
                </div>
              </div>

              <div className="p-4 bg-[#142618] border border-[#2BD64F]/30 rounded-[20px] text-xs text-[#A5E3B5] leading-relaxed">
                <strong>Immutable Versioning Rule:</strong> Submitting will record this brief as immutable <code>brief_version_1</code> with a cryptographic SHA-256 hash. Any future modifications will spawn version 2 and invalidate prior approvals.
              </div>

              <div className="flex items-center justify-between pt-2">
                <PillButton variant="outline" size="md" onClick={() => setStep(3)}>
                  Back
                </PillButton>
                <PillButton
                  variant="primary"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  icon={<CheckCircle2 className="w-4 h-4 text-black" />}
                >
                  {isSubmitting ? "Sealing Brief..." : "Publish Brief & Open Studio"}
                </PillButton>
              </div>
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  );
}

export default function NewCampaignWizardPage() {
  return (
    <React.Suspense
      fallback={
        <div className="canvas-swirl-bg min-h-screen flex items-center justify-center text-white">
          <div className="text-xs text-[#888888] font-mono animate-pulse">Loading Campaign Wizard...</div>
        </div>
      }
    >
      <NewCampaignWizardContent />
    </React.Suspense>
  );
}

