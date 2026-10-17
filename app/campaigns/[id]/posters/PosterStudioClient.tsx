"use client";

import React, { useState } from "react";
import { Card } from "@/components/design-system/Card";
import { PillButton } from "@/components/design-system/PillButton";
import { StatusChip } from "@/components/design-system/StatusChip";
import { EmptyState } from "@/components/design-system/EmptyState";
import { PosterCanvas } from "@/components/poster/PosterCanvas";
import { generatePosterAction, approvePosterAction } from "./actions";
import {
  Palette,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Download,
  CheckSquare,
  Square,
} from "lucide-react";

interface PosterStudioClientProps {
  campaignId: string;
  campaignName: string;
  brandName: string;
  productName: string;
  versions: Array<{
    id: string;
    version_no: number;
    headline: string;
    subline: string;
    body: string;
    cta: string;
    disclosure: string;
    target_language: string;
    status: string;
    content_hash: string;
  }>;
}

export function PosterStudioClient({
  campaignId,
  campaignName,
  brandName,
  productName,
  versions,
}: PosterStudioClientProps) {
  const [selectedVersionId, setSelectedVersionId] = useState(versions[0]?.id || "");
  const [format, setFormat] = useState<"1:1" | "4:5" | "9:16" | "16:9">("1:1");
  const [visualBrief, setVisualBrief] = useState("Warm festive illumination, organic textures, modern commercial product staging");
  const [brandColors, setBrandColors] = useState("Emerald #2BD64F and Festive Gold");

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPoster, setGeneratedPoster] = useState<any>(null);
  const [isApproved, setIsApproved] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Reviewer compliance checkboxes
  const [verifiedNoPersons, setVerifiedNoPersons] = useState(false);
  const [verifiedContrast, setVerifiedContrast] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const activeVersion = versions.find((v) => v.id === selectedVersionId) || versions[0];

  const handleGenerate = async () => {
    if (!selectedVersionId) return;
    setIsGenerating(true);
    setErrorMsg("");

    try {
      const res = await generatePosterAction({
        assetVersionId: selectedVersionId,
        format,
        visualBrief,
        brandColors,
      });

      if (res.success && res.data) {
        setGeneratedPoster(res.data);
        setIsApproved(false);
      } else {
        setErrorMsg(res.error || "Failed to generate poster.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApprove = async () => {
    if (!generatedPoster?.posterVersionId) return;
    setIsApproving(true);
    setErrorMsg("");

    try {
      const res = await approvePosterAction(generatedPoster.posterVersionId);
      if (res.success) {
        setIsApproved(true);
      } else {
        setErrorMsg(res.error || "Failed to approve poster.");
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsApproving(false);
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
          <span className="text-[11px] text-[#A3A3A3]">Section 7 Poster Studio</span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight mt-1">
          Ad Poster Generation Studio
        </h1>
        <p className="text-xs text-[#A3A3A3]">
          Principle: AI creates the visual background; the application composites verified Indic typography.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-[18px] bg-[#2A1414] border border-[#FF5C5C]/30 text-xs text-[#FF8585] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {versions.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form & Art Direction Controls */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <Card title="Poster Parameters" icon={<Palette className="w-3.5 h-3.5" />}>
              <div className="flex flex-col gap-4">
                {/* Select Asset Version */}
                <div>
                  <label className="block text-[11px] font-bold text-[#777777] uppercase mb-1.5">
                    Source Asset Copy Version *
                  </label>
                  <select
                    value={selectedVersionId}
                    onChange={(e) => setSelectedVersionId(e.target.value)}
                    className="w-full bg-[#1C1C1C] text-white text-xs rounded-full px-4 py-2.5 border border-[#262626] cursor-pointer"
                  >
                    {versions.map((v) => (
                      <option key={v.id} value={v.id} className="bg-[#1C1C1C]">
                        v{v.version_no} — {v.target_language} ({v.status})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Aspect Ratio / Format */}
                <div>
                  <label className="block text-[11px] font-bold text-[#777777] uppercase mb-1.5">
                    Canvas Format Ratio
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "1:1", label: "1:1 Square (Feed)" },
                      { id: "4:5", label: "4:5 Portrait Social" },
                      { id: "9:16", label: "9:16 Story / Reel" },
                      { id: "16:9", label: "16:9 Landscape" },
                    ].map((fmt) => (
                      <button
                        key={fmt.id}
                        type="button"
                        onClick={() => setFormat(fmt.id as any)}
                        className={`p-2.5 rounded-full text-xs font-semibold border transition-all ${
                          format === fmt.id
                            ? "bg-white text-black border-white"
                            : "bg-[#1C1C1C] text-[#A3A3A3] border-transparent hover:border-[#333333]"
                        }`}
                      >
                        {fmt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Visual Brief */}
                <div>
                  <label className="block text-[11px] font-bold text-[#777777] uppercase mb-1.5">
                    Visual Art Direction Brief
                  </label>
                  <textarea
                    rows={2}
                    value={visualBrief}
                    onChange={(e) => setVisualBrief(e.target.value)}
                    placeholder="Describe scene mood, lighting, textures..."
                    className="w-full bg-[#1C1C1C] text-white text-xs rounded-[16px] p-3 border border-[#262626]"
                  />
                </div>

                {/* Brand Colors */}
                <div>
                  <label className="block text-[11px] font-bold text-[#777777] uppercase mb-1.5">
                    Brand Color Guidance
                  </label>
                  <input
                    type="text"
                    value={brandColors}
                    onChange={(e) => setBrandColors(e.target.value)}
                    placeholder="e.g. Deep Forest Green and Warm Gold"
                    className="w-full bg-[#1C1C1C] text-white text-xs rounded-full px-4 py-2 border border-[#262626]"
                  />
                </div>

                <div className="pt-2">
                  <PillButton
                    variant="white"
                    size="md"
                    className="w-full"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    icon={<Sparkles className="w-4 h-4 text-black" />}
                  >
                    {isGenerating ? "Directing Artwork with Gemini..." : "Generate Ad Poster"}
                  </PillButton>
                </div>
              </div>
            </Card>

            {/* Reviewer Compliance Checklist (Section 7) */}
            {generatedPoster && (
              <Card title="Reviewer Sign-off Checklist" icon={<ShieldCheck className="w-3.5 h-3.5 text-[#2BD64F]" />}>
                <div className="flex flex-col gap-3 text-xs">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={verifiedNoPersons}
                      onChange={(e) => setVerifiedNoPersons(e.target.checked)}
                      className="mt-0.5 rounded bg-[#1C1C1C] text-[#2BD64F] focus:ring-0"
                    />
                    <span className="text-[#D4D4D4]">
                      Confirmed: Background contains strictly no third-party logos or identifiable human faces.
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={verifiedContrast}
                      onChange={(e) => setVerifiedContrast(e.target.checked)}
                      className="mt-0.5 rounded bg-[#1C1C1C] text-[#2BD64F] focus:ring-0"
                    />
                    <span className="text-[#D4D4D4]">
                      Confirmed: Text contrast meets WCAG 4.5:1 ratio and legal disclosures are clearly readable.
                    </span>
                  </label>

                  <div className="pt-3 border-t border-[#222222]">
                    <PillButton
                      variant={isApproved ? "white" : "primary"}
                      size="sm"
                      className="w-full"
                      onClick={handleApprove}
                      disabled={isApproving || isApproved || (!verifiedNoPersons || !verifiedContrast)}
                      icon={<CheckCircle2 className="w-3.5 h-3.5 text-black" />}
                    >
                      {isApproved ? "Poster Approved (Clean Export Unlocked)" : "Approve Poster Version"}
                    </PillButton>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Right Column: Live Poster Canvas */}
          <div className="lg:col-span-7 flex flex-col items-center">
            {generatedPoster ? (
              <PosterCanvas
                layoutTemplateId={generatedPoster.layoutTemplateId}
                format={format}
                palette={generatedPoster.palette}
                backgroundImagePath={generatedPoster.backgroundImagePath}
                isAiImage={generatedPoster.isAiImage}
                isApproved={isApproved}
                content={{
                  brandName: brandName,
                  headline: generatedPoster.textContent.headline,
                  subline: generatedPoster.textContent.subline,
                  cta: generatedPoster.textContent.cta,
                  disclosure: generatedPoster.textContent.disclosure,
                  targetLanguage: generatedPoster.textContent.targetLanguage,
                }}
              />
            ) : (
              <div className="w-full max-w-md aspect-square rounded-[26px] bg-[#141414] border border-dashed border-[#2A2A2A] flex flex-col items-center justify-center p-8 text-center">
                <Palette className="w-10 h-10 text-[#444444] mb-3" />
                <h3 className="text-sm font-bold text-white mb-1">
                  Ready to Generate Poster
                </h3>
                <p className="text-xs text-[#777777]">
                  Select your approved copy version and click &quot;Generate Ad Poster&quot; to render the background art and composite typography.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <EmptyState
          icon={<Palette className="w-6 h-6" />}
          title="No creative copy versions available"
          description="Create a regional adaptation variant in the studio first before generating posters."
          actionLabel="Go to Adaptation Studio"
          actionHref={`/campaigns/${campaignId}/studio`}
        />
      )}
    </div>
  );
}
