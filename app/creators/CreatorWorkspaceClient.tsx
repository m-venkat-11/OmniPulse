"use client";

import React, { useState } from "react";
import { Card } from "@/components/design-system/Card";
import { PillButton } from "@/components/design-system/PillButton";
import { EmptyState } from "@/components/design-system/EmptyState";
import { createCreatorAction } from "./actions";
import { useRouter } from "next/navigation";
import {
  Users,
  Plus,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Globe2,
  FileText,
  Lock,
} from "lucide-react";

interface CreatorWorkspaceClientProps {
  initialCreators: any[];
}

export function CreatorWorkspaceClient({ initialCreators }: CreatorWorkspaceClientProps) {
  const router = useRouter();
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    displayName: "",
    handle: "",
    primaryLanguage: "Telugu",
    region: "Andhra Pradesh & Telangana",
    contentThemes: "Nutrition, Regional Cooking, Family Wellness",
    formats: "Reels, Shorts, Carousel",
    brandSafetyNotes: "ASCI Compliant. No unverified superlatives.",
    consentStatus: "consented" as const,
    followerCount: 0,
    engagementRate: 0,
  });

  const handleAddCreator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.displayName || !formData.handle) {
      setErrorMsg("Please provide display name and handle.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await createCreatorAction({
        displayName: formData.displayName,
        handle: formData.handle.startsWith("@") ? formData.handle : `@${formData.handle}`,
        primaryLanguage: formData.primaryLanguage,
        region: formData.region,
        contentThemes: formData.contentThemes.split(",").map((s) => s.trim()),
        formats: formData.formats.split(",").map((s) => s.trim()),
        brandSafetyNotes: formData.brandSafetyNotes,
        consentStatus: formData.consentStatus,
        followerCount: Number(formData.followerCount),
        engagementRate: Number(formData.engagementRate),
      });

      if (res.success) {
        setShowAddForm(false);
        setFormData({
          displayName: "",
          handle: "",
          primaryLanguage: "Telugu",
          region: "Andhra Pradesh & Telangana",
          contentThemes: "Nutrition, Regional Cooking, Family Wellness",
          formats: "Reels, Shorts, Carousel",
          brandSafetyNotes: "ASCI Compliant. No unverified superlatives.",
          consentStatus: "consented",
          followerCount: 0,
          engagementRate: 0,
        });
        router.refresh();
      } else {
        setErrorMsg(res.error || "Failed to create creator profile.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#2BD64F] uppercase tracking-wider">
              Governance & Consented Matching
            </span>
            <span className="text-xs text-[#777777]">•</span>
            <span className="text-[11px] text-[#A3A3A3]">Section 5 F8 Creator Workspace</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Creator Intelligence & Briefing
          </h1>
          <p className="text-xs text-[#A3A3A3]">
            Permitted and consented creator profiles only. Zero scraping, zero synthetic statistics.
          </p>
        </div>

        <PillButton
          variant="white"
          size="md"
          onClick={() => setShowAddForm(!showAddForm)}
          icon={<Plus className="w-4 h-4 text-black" />}
        >
          {showAddForm ? "Close Form" : "Register Creator"}
        </PillButton>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-[18px] bg-[#2A1414] border border-[#FF5C5C]/30 text-xs text-[#FF8585] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Add Creator Form */}
      {showAddForm && (
        <Card title="Register Consented Creator Profile" icon={<Users className="w-3.5 h-3.5 text-[#2BD64F]" />}>
          <form onSubmit={handleAddCreator} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-[#777777] uppercase mb-1.5">
                  Display Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="e.g. Ananya Rao"
                  className="w-full bg-[#1C1C1C] text-white text-xs rounded-full px-4 py-2.5 border border-[#262626]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#777777] uppercase mb-1.5">
                  Handle / Channel *
                </label>
                <input
                  type="text"
                  required
                  value={formData.handle}
                  onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
                  placeholder="e.g. @ananya_nutrition"
                  className="w-full bg-[#1C1C1C] text-white text-xs rounded-full px-4 py-2.5 border border-[#262626]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-[#777777] uppercase mb-1.5">
                  Primary Language
                </label>
                <select
                  value={formData.primaryLanguage}
                  onChange={(e) => setFormData({ ...formData, primaryLanguage: e.target.value })}
                  className="w-full bg-[#1C1C1C] text-white text-xs rounded-full px-4 py-2.5 border border-[#262626] cursor-pointer"
                >
                  <option value="Telugu">Telugu</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Tamil">Tamil</option>
                  <option value="Bengali">Bengali</option>
                  <option value="Marathi">Marathi</option>
                  <option value="Kannada">Kannada</option>
                  <option value="English">English</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#777777] uppercase mb-1.5">
                  Region / Audience Market
                </label>
                <input
                  type="text"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  placeholder="e.g. Telangana & Andhra Pradesh"
                  className="w-full bg-[#1C1C1C] text-white text-xs rounded-full px-4 py-2.5 border border-[#262626]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#777777] uppercase mb-1.5">
                Content Themes (Comma-separated)
              </label>
              <input
                type="text"
                value={formData.contentThemes}
                onChange={(e) => setFormData({ ...formData, contentThemes: e.target.value })}
                placeholder="e.g. Health, Cooking, Family Lifestyle"
                className="w-full bg-[#1C1C1C] text-white text-xs rounded-full px-4 py-2.5 border border-[#262626]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#777777] uppercase mb-1.5">
                Brand Safety & Licence Terms
              </label>
              <input
                type="text"
                value={formData.brandSafetyNotes}
                onChange={(e) => setFormData({ ...formData, brandSafetyNotes: e.target.value })}
                placeholder="e.g. Verified license status for 90 days digital usage"
                className="w-full bg-[#1C1C1C] text-white text-xs rounded-full px-4 py-2.5 border border-[#262626]"
              />
            </div>

            <div className="flex justify-end pt-2">
              <PillButton
                type="submit"
                variant="white"
                size="md"
                disabled={isSubmitting}
                icon={<CheckCircle2 className="w-4 h-4 text-black" />}
              >
                {isSubmitting ? "Registering..." : "Save Creator Profile"}
              </PillButton>
            </div>
          </form>
        </Card>
      )}

      {/* Creators Directory Grid */}
      {initialCreators.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialCreators.map((c) => (
            <div
              key={c.id}
              className="p-6 rounded-[24px] bg-[#161616] border border-[#222222] hover:border-[#333333] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#1C1C1C] border border-[#2A2A2A] text-white font-bold flex items-center justify-center text-xs">
                    {c.displayName.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#142618] text-[#2BD64F] border border-[#2BD64F]/30">
                    {c.consentStatus}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-white">{c.displayName}</h3>
                <span className="text-xs text-[#777777] font-mono">{c.handle}</span>

                <div className="flex flex-col gap-1.5 mt-4 text-xs text-[#A3A3A3]">
                  <span className="flex items-center gap-1.5 text-white font-medium">
                    <Globe2 className="w-3.5 h-3.5 text-[#2BD64F]" /> {c.primaryLanguage}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#777777]" /> {c.region}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-4">
                  {c.contentThemes.map((th: string, i: number) => (
                    <span
                      key={i}
                      className="px-2.5 py-0.5 rounded-full text-[10px] bg-[#1F1F1F] text-[#D4D4D4] border border-[#2A2A2A]"
                    >
                      {th}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#202020] text-[11px] text-[#777777] flex items-center justify-between">
                <span>Source: {c.sourceType}</span>
                <span>Verified: {new Date(c.lastVerifiedDate).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Users className="w-6 h-6" />}
          title="No creator profiles registered"
          description="Register creator profiles with consented ad-usage licenses to generate version-locked creator briefs."
          actionLabel="Register First Creator"
          onActionClick={() => setShowAddForm(true)}
        />
      )}
    </div>
  );
}
