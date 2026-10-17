"use client";

import React, { useState } from "react";
import { Card } from "@/components/design-system/Card";
import { PillButton } from "@/components/design-system/PillButton";
import { StatusChip } from "@/components/design-system/StatusChip";
import { generateAdaptationAction, createEditedVersionAction, submitReviewerFeedbackAction } from "./actions";
import { LANGUAGE_REGISTRY } from "@/lib/languages/registry";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Globe2,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Layers,
  Edit3,
  Save,
  Tag,
  Radio,
} from "lucide-react";
import Link from "next/link";

interface StudioClientProps {
  campaignId: string;
  campaignName: string;
  brandName: string;
  productName: string;
  sourceText: string;
  sourceLanguage: string;
  initialTargetLanguage: string;
  availableTargetLanguages: string[];
  region: string;
  briefVersionNo: number;
}

export function StudioClient({
  campaignId,
  campaignName,
  brandName,
  productName,
  sourceText,
  sourceLanguage,
  initialTargetLanguage,
  availableTargetLanguages,
  region,
  briefVersionNo,
}: StudioClientProps) {
  const [targetLang, setTargetLang] = useState(initialTargetLanguage);
  const [dialect, setDialect] = useState("standard");
  const [tone, setTone] = useState("Festive Warm & Trustworthy");
  const [formality, setFormality] = useState("conversational");
  const [slangIntensity, setSlangIntensity] = useState("light");
  const [culturalContext, setCulturalContext] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Result state
  const [result, setResult] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFields, setEditFields] = useState({
    headline: "",
    subline: "",
    body: "",
    cta: "",
    disclosure: "",
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  // Language dialects
  const langEntry = LANGUAGE_REGISTRY.find((l) => l.name === targetLang || l.id === targetLang.toLowerCase());
  const dialects = langEntry?.dialects || [{ id: "standard", name: "Standard / Literary", region: "General", description: "" }];

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMsg("");
    setFeedbackSuccess(null);

    try {
      const res = await generateAdaptationAction({
        campaignId,
        sourceText,
        sourceLanguage,
        targetLanguage: targetLang,
        region,
        dialect,
        tone,
        formality,
        slangIntensity,
        culturalContext,
        channel: "social_media",
      });

      if (res.success && res.data) {
        setResult(res.data);
        setEditFields({
          headline: res.data.regionalAdaptation?.headline || "",
          subline: res.data.regionalAdaptation?.subline || "",
          body: res.data.regionalAdaptation?.body || "",
          cta: res.data.regionalAdaptation?.cta || "",
          disclosure: res.data.regionalAdaptation?.disclosure || "",
        });
      } else {
        setErrorMsg(res.error || "Generation failed.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!result?.creativeAssetId) return;
    setIsSavingEdit(true);
    setErrorMsg("");

    try {
      const res = await createEditedVersionAction({
        creativeAssetId: result.creativeAssetId,
        headline: editFields.headline,
        subline: editFields.subline,
        body: editFields.body,
        cta: editFields.cta,
        disclosure: editFields.disclosure,
        literalTranslation: result.literalTranslation,
      });

      if (res.success && res.data) {
        setResult({
          ...result,
          assetVersionId: res.data.assetVersionId,
          versionNo: res.data.versionNo,
          contentHash: res.data.contentHash,
          regionalAdaptation: editFields,
        });
        setIsEditing(false);
      } else {
        setErrorMsg(res.error || "Failed to save edited version.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save edit.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleReviewTag = async (tag: any) => {
    if (!result?.assetVersionId) return;
    try {
      const res = await submitReviewerFeedbackAction({
        languagePair: `${sourceLanguage}->${targetLang}`,
        region,
        assetVersionId: result.assetVersionId,
        phraseOriginal: sourceText.slice(0, 100),
        phraseAdapted: editFields.headline || result.regionalAdaptation?.headline || "",
        tag,
      });
      if (res.success) {
        setFeedbackSuccess(`Tagged as "${tag.replace(/_/g, " ")}" for Regional Review Loop.`);
        setTimeout(() => setFeedbackSuccess(null), 3500);
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#2BD64F] uppercase tracking-wider">
              {brandName} • {productName}
            </span>
            <span className="text-xs text-[#777777]">•</span>
            <span className="text-[11px] font-mono text-[#A3A3A3]">
              Brief v{briefVersionNo}
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Regional Adaptation Studio
          </h1>
          <p className="text-xs text-[#A3A3A3]">
            Diagram 4.2: Side-by-side comparison of Literal Translation vs Natural Cultural Adaptation.
          </p>
        </div>

        {result?.assetVersionId && (
          <PillButton
            variant="primary"
            size="md"
            href={`/campaigns/${campaignId}/guardian?versionId=${result.assetVersionId}`}
            icon={<ShieldCheck className="w-4 h-4 text-black" />}
          >
            Verify with Brand Guardian
          </PillButton>
        )}
      </div>

      {errorMsg && (
        <div className="p-4 rounded-[18px] bg-[#2A1414] border border-[#FF5C5C]/30 text-xs text-[#FF8585] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {feedbackSuccess && (
        <div className="p-4 rounded-[18px] bg-[#142618] border border-[#2BD64F]/30 text-xs text-[#2BD64F] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{feedbackSuccess}</span>
        </div>
      )}

      {/* Control Panel Card */}
      <Card title="Adaptation Controls & Cultural Levers" icon={<Globe2 className="w-3.5 h-3.5" />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-[#777777] uppercase mb-1.5">
              Target Language
            </label>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="w-full bg-[#1C1C1C] text-white text-xs rounded-full px-4 py-2.5 border border-[#262626] cursor-pointer"
            >
              {availableTargetLanguages.map((l) => (
                <option key={l} value={l} className="bg-[#1C1C1C]">
                  {l}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#777777] uppercase mb-1.5">
              Regional Dialect / Variety
            </label>
            <select
              value={dialect}
              onChange={(e) => setDialect(e.target.value)}
              className="w-full bg-[#1C1C1C] text-white text-xs rounded-full px-4 py-2.5 border border-[#262626] cursor-pointer"
            >
              <option value="standard">Standard (No specific dialect)</option>
              {dialects.map((d) => (
                <option key={d.id} value={d.name} className="bg-[#1C1C1C]">
                  {d.name} ({d.region})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#777777] uppercase mb-1.5">
              Formality Level
            </label>
            <select
              value={formality}
              onChange={(e) => setFormality(e.target.value)}
              className="w-full bg-[#1C1C1C] text-white text-xs rounded-full px-4 py-2.5 border border-[#262626] cursor-pointer"
            >
              <option value="conversational">Conversational (Warm / Everyday)</option>
              <option value="formal">Formal / Literary</option>
              <option value="code-mixed">Code-Mixed (Colloquial Urban)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#777777] uppercase mb-1.5">
              Slang Intensity
            </label>
            <select
              value={slangIntensity}
              onChange={(e) => setSlangIntensity(e.target.value)}
              className="w-full bg-[#1C1C1C] text-white text-xs rounded-full px-4 py-2.5 border border-[#262626] cursor-pointer"
            >
              <option value="none">None (Universal Standard)</option>
              <option value="light">Light (Natural colloquialisms)</option>
              <option value="moderate">Moderate (Youth/Regional slang)</option>
              <option value="strong">Strong (Hyper-local dialect)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-[#222222]">
          <div>
            <label className="block text-[11px] font-bold text-[#777777] uppercase mb-1.5">
              Tone of Voice
            </label>
            <input
              type="text"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              placeholder="e.g. Festive Warm, Inspiring, Youthful"
              className="w-full bg-[#1C1C1C] text-white text-xs rounded-full px-4 py-2.5 border border-[#262626]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#777777] uppercase mb-1.5">
              Cultural Context / Festival (Optional)
            </label>
            <input
              type="text"
              value={culturalContext}
              onChange={(e) => setCulturalContext(e.target.value)}
              placeholder="e.g. Diwali festive family gathering, harvest season"
              className="w-full bg-[#1C1C1C] text-white text-xs rounded-full px-4 py-2.5 border border-[#262626]"
            />
          </div>
        </div>

        <div className="flex justify-end mt-5 pt-4 border-t border-[#222222]">
          <PillButton
            variant="white"
            size="md"
            onClick={handleGenerate}
            disabled={isGenerating}
            icon={<Sparkles className="w-4 h-4 text-black" />}
          >
            {isGenerating ? "Transcreating via Dual AI..." : "Generate Side-by-Side Adaptation"}
          </PillButton>
        </div>
      </Card>

      {/* ── SIDE-BY-SIDE COMPARISON PANELS (Diagram 4.2) ── */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* LEFT PANEL: Source & Literal Translation (Sarvam) */}
          <div className="flex flex-col gap-5">
            <Card title="Source Brief Master Copy" icon={<FileText className="w-3.5 h-3.5" />}>
              <div className="p-4 rounded-[18px] bg-[#1C1C1C] text-xs text-[#D4D4D4] leading-relaxed">
                {sourceText}
              </div>
            </Card>

            <Card
              title="Literal Translation (Sarvam mayura:v1)"
              icon={<Globe2 className="w-3.5 h-3.5 text-[#2BD64F]" />}
            >
              <div className="p-5 rounded-[20px] bg-[#142618] border border-[#2BD64F]/20 text-white leading-relaxed text-sm indic-text font-medium">
                {result.literalTranslation}
              </div>
              <p className="text-[10px] text-[#A3A3A3] mt-2">
                Word-for-word baseline translation used for semantic integrity and claim preservation.
              </p>
            </Card>
          </div>

          {/* RIGHT PANEL: Natural Regional Adaptation (Gemini) */}
          <div className="flex flex-col gap-5">
            <Card
              title={`Natural Cultural Adaptation (${targetLang})`}
              icon={<Sparkles className="w-3.5 h-3.5 text-[#FFE234]" />}
              actionLabel={isEditing ? "Editing" : "Edit Copy"}
              onActionClick={() => setIsEditing(!isEditing)}
            >
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#222222] text-xs">
                <span className="font-mono text-[#A3A3A3] flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-[#2BD64F]" /> Version v{result.versionNo}
                </span>
                <span className="font-mono text-[10px] text-[#777777]">
                  Hash: {result.contentHash?.slice(0, 10)}
                </span>
              </div>

              {!isEditing ? (
                <div className="flex flex-col gap-3">
                  {/* Headline */}
                  <div className="p-4 rounded-[18px] bg-[#1C1C1C] border border-[#2A2A2A]">
                    <span className="text-[10px] text-[#777777] uppercase font-bold tracking-wider block mb-1">
                      Headline
                    </span>
                    <h3 className="text-base font-bold text-white leading-snug indic-text">
                      {result.regionalAdaptation?.headline}
                    </h3>
                  </div>

                  {/* Subline */}
                  {result.regionalAdaptation?.subline && (
                    <div className="p-3.5 rounded-[18px] bg-[#1C1C1C] border border-[#2A2A2A]">
                      <span className="text-[10px] text-[#777777] uppercase font-bold tracking-wider block mb-1">
                        Subline
                      </span>
                      <p className="text-xs text-[#D4D4D4] leading-relaxed indic-text">
                        {result.regionalAdaptation?.subline}
                      </p>
                    </div>
                  )}

                  {/* Body Copy */}
                  {result.regionalAdaptation?.body && (
                    <div className="p-3.5 rounded-[18px] bg-[#1C1C1C] border border-[#2A2A2A]">
                      <span className="text-[10px] text-[#777777] uppercase font-bold tracking-wider block mb-1">
                        Body
                      </span>
                      <p className="text-xs text-[#D4D4D4] leading-relaxed indic-text">
                        {result.regionalAdaptation?.body}
                      </p>
                    </div>
                  )}

                  {/* CTA & Disclosure */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-[18px] bg-[#1C1C1C] border border-[#2A2A2A]">
                      <span className="text-[10px] text-[#777777] uppercase font-bold tracking-wider block mb-1">
                        Call to Action
                      </span>
                      <p className="text-xs font-semibold text-[#2BD64F] indic-text">
                        {result.regionalAdaptation?.cta}
                      </p>
                    </div>
                    <div className="p-3 rounded-[18px] bg-[#1C1C1C] border border-[#2A2A2A]">
                      <span className="text-[10px] text-[#777777] uppercase font-bold tracking-wider block mb-1">
                        Disclosure
                      </span>
                      <p className="text-[11px] text-[#A3A3A3] indic-text">
                        {result.regionalAdaptation?.disclosure}
                      </p>
                    </div>
                  </div>

                  {/* Human Edit Button */}
                  <div className="pt-2 flex justify-end">
                    <PillButton
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      icon={<Edit3 className="w-3 h-3" />}
                    >
                      Edit Content (Creates v{result.versionNo + 1})
                    </PillButton>
                  </div>
                </div>
              ) : (
                /* Human Edit Mode */
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="text-[10px] text-[#777777] uppercase font-bold block mb-1">
                      Headline
                    </label>
                    <input
                      type="text"
                      value={editFields.headline}
                      onChange={(e) => setEditFields({ ...editFields, headline: e.target.value })}
                      className="w-full bg-[#1C1C1C] text-white text-xs rounded-full px-4 py-2.5 border border-[#333333]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#777777] uppercase font-bold block mb-1">
                      Subline
                    </label>
                    <input
                      type="text"
                      value={editFields.subline}
                      onChange={(e) => setEditFields({ ...editFields, subline: e.target.value })}
                      className="w-full bg-[#1C1C1C] text-white text-xs rounded-full px-4 py-2.5 border border-[#333333]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#777777] uppercase font-bold block mb-1">
                      Body
                    </label>
                    <textarea
                      rows={2}
                      value={editFields.body}
                      onChange={(e) => setEditFields({ ...editFields, body: e.target.value })}
                      className="w-full bg-[#1C1C1C] text-white text-xs rounded-[16px] p-3 border border-[#333333]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-[#777777] uppercase font-bold block mb-1">
                        Call to Action
                      </label>
                      <input
                        type="text"
                        value={editFields.cta}
                        onChange={(e) => setEditFields({ ...editFields, cta: e.target.value })}
                        className="w-full bg-[#1C1C1C] text-white text-xs rounded-full px-4 py-2.5 border border-[#333333]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#777777] uppercase font-bold block mb-1">
                        Disclosure
                      </label>
                      <input
                        type="text"
                        value={editFields.disclosure}
                        onChange={(e) => setEditFields({ ...editFields, disclosure: e.target.value })}
                        className="w-full bg-[#1C1C1C] text-white text-xs rounded-full px-4 py-2.5 border border-[#333333]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <PillButton variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                      Cancel
                    </PillButton>
                    <PillButton
                      variant="primary"
                      size="sm"
                      onClick={handleSaveEdit}
                      disabled={isSavingEdit}
                      icon={<Save className="w-3 h-3 text-black" />}
                    >
                      {isSavingEdit ? "Saving v" + (result.versionNo + 1) : "Save as Version " + (result.versionNo + 1)}
                    </PillButton>
                  </div>
                </div>
              )}

              {/* Regional Review Loop Tagging Buttons */}
              <div className="mt-5 pt-4 border-t border-[#222222]">
                <span className="text-[11px] font-bold text-[#A3A3A3] uppercase block mb-2">
                  Regional Review Loop Tags
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { tag: "accurate", label: "Accurate", color: "text-[#2BD64F] border-[#2BD64F]/30" },
                    { tag: "awkward", label: "Awkward", color: "text-[#FFE234] border-[#FFE234]/30" },
                    { tag: "culturally_mismatched", label: "Culturally Mismatched", color: "text-[#FF5C5C] border-[#FF5C5C]/30" },
                    { tag: "brand_risk", label: "Brand Risk", color: "text-[#FF5C5C] border-[#FF5C5C]/30" },
                    { tag: "needs_native_review", label: "Needs Native Review", color: "text-[#60A5FA] border-[#60A5FA]/30" },
                  ].map((btn) => (
                    <button
                      key={btn.tag}
                      type="button"
                      onClick={() => handleReviewTag(btn.tag)}
                      className={`px-3 py-1 rounded-full text-[11px] font-medium border bg-[#1A1A1A] hover:bg-[#252525] transition-colors ${btn.color}`}
                    >
                      + {btn.label}
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Adaptation Rationale Table */}
            {result.rationale && result.rationale.length > 0 && (
              <Card title="Transcreation Rationale & Cultural Nuance" icon={<Layers className="w-3.5 h-3.5" />}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#222222] text-[#777777]">
                        <th className="pb-2.5 font-medium">Original Phrase</th>
                        <th className="pb-2.5 font-medium">Regional Transcreation</th>
                        <th className="pb-2.5 font-medium">Linguistic Rationale</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1F1F1F]">
                      {result.rationale.map((r: any, idx: number) => (
                        <tr key={idx} className="py-2">
                          <td className="py-2.5 text-[#D4D4D4] max-w-xs">{r.original_phrase}</td>
                          <td className="py-2.5 font-bold text-[#2BD64F] indic-text max-w-xs">
                            {r.adapted_phrase}
                          </td>
                          <td className="py-2.5 text-[#A3A3A3] leading-relaxed">{r.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
