import React from "react";
import { getCurrentUser } from "@/src/server/auth/session";
import { redirect, notFound } from "next/navigation";
import { campaignService } from "@/src/server/services/campaignService";
import { AppShell } from "@/components/shell/AppShell";
import { Card } from "@/components/design-system/Card";
import { StatusChip } from "@/components/design-system/StatusChip";
import { PillButton } from "@/components/design-system/PillButton";
import { CampaignNav } from "@/components/campaigns/CampaignNav";
import Link from "next/link";
import {
  Sparkles,
  ShieldCheck,
  Palette,
  CheckCircle,
  FlaskConical,
  BarChart3,
  FileCheck2,
  ArrowRight,
  Globe,
  MapPin,
  Lock,
  Plus,
  Share2,
} from "lucide-react";

export default async function CampaignOverviewPage(props: {
  params: Promise<{ id: string }>;
}) {
  const session = await getCurrentUser();
  if (!session) {
    redirect("/sign-in");
  }

  const { id } = await props.params;
  const data = await campaignService.getCampaign(id, session.workspace.id);
  if (!data) {
    notFound();
  }

  const { campaign: rawCampaign, latestBrief, briefVersion: rawBriefVersion, claims, assets } = data;
  const campaign = rawCampaign as any;
  const briefVersion = rawBriefVersion as any;

  const targetLangs: string[] = (() => {
    try {
      return JSON.parse(String(campaign.target_languages_json || "[]"));
    } catch {
      return [];
    }
  })();

  const channels: string[] = (() => {
    try {
      return JSON.parse(String(campaign.channels_json || "[]"));
    } catch {
      return [];
    }
  })();

  return (
    <AppShell
      userName={session.user.name}
      userRole={session.role}
      workspaceName={session.workspace.name}
      primaryActionLabel="Regional Studio"
      primaryActionHref={`/campaigns/${id}/studio`}
    >
      <div className="flex flex-col gap-8 max-w-6xl mx-auto">
        {/* Campaign Sub Navigation Bar */}
        <CampaignNav
          campaignId={id}
          campaignName={String(campaign.name || "")}
          brandName={String(campaign.brand_name || "")}
        />

        {/* Campaign Header Card */}
        <div className="bg-[#161616] rounded-[28px] p-6 md:p-8 border border-[#222222] shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#222222]">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-white tracking-tight">
                  {campaign.name}
                </h1>
                <StatusChip status={campaign.status} size="sm" />
              </div>
              <p className="text-sm font-semibold text-[#2BD64F] mt-1">
                {campaign.brand_name} • {campaign.product_name}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <PillButton
                variant="white"
                size="sm"
                href={`/campaigns/${id}/claims`}
                icon={<Share2 className="w-3.5 h-3.5 text-black" />}
              >
                Claim Evidence Graph
              </PillButton>
              <PillButton
                variant="dark"
                size="sm"
                href={`/campaigns/${id}/studio`}
                icon={<Sparkles className="w-3.5 h-3.5 text-white" />}
              >
                Adaptation Studio
              </PillButton>
              <PillButton
                variant="dark"
                size="sm"
                href={`/campaigns/${id}/posters`}
                icon={<Palette className="w-3.5 h-3.5 text-white" />}
              >
                Poster Studio
              </PillButton>
            </div>
          </div>

          {/* Quick Stats & Lineage */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 text-xs">
            <div>
              <span className="text-[10px] text-[#777777] uppercase font-bold">Market / Region</span>
              <p className="text-white font-medium mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#A3A3A3]" /> {campaign.region || "National"}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-[#777777] uppercase font-bold">Brief Version</span>
              <p className="text-white font-mono font-medium mt-0.5 flex items-center gap-1">
                <Lock className="w-3 h-3 text-[#2BD64F]" /> v{briefVersion?.version_no || 1} ({briefVersion?.content_hash ? String(briefVersion.content_hash).slice(0, 8) : "sealed"})
              </p>
            </div>
            <div>
              <span className="text-[10px] text-[#777777] uppercase font-bold">Target Languages</span>
              <p className="text-[#2BD64F] font-medium mt-0.5">
                {targetLangs.join(", ") || "None"}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-[#777777] uppercase font-bold">Claim Atoms</span>
              <p className="text-white font-medium mt-0.5">
                {claims.length} registered
              </p>
            </div>
          </div>
        </div>

        {/* Feature Navigation Bento Grid - Primary Engines */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Claim Evidence Graph & Provenance */}
          <Link
            href={`/campaigns/${id}/claims`}
            className="group bg-[#161616] p-6 rounded-[24px] border border-[#222222] hover:border-[#2BD64F]/60 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-full bg-[#182C1E] text-[#2BD64F] flex items-center justify-center mb-4">
                <Share2 className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-bold text-white group-hover:text-[#2BD64F] transition-colors">
                  Claim Evidence Graph
                </h3>
                <span className="text-[9px] font-mono font-bold uppercase text-[#2BD64F] bg-[#16271B] border border-[#2BD64F]/30 px-2 py-0.2 rounded-full">
                  LIVE GRAPH
                </span>
              </div>
              <p className="text-xs text-[#A3A3A3] mt-1 leading-relaxed">
                Real-time SVG provenance graph connecting Brand Entity → Product Specs → Fact-Locked Claims → NABL Evidence → Indic Ads.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-semibold text-[#2BD64F] gap-1">
              Explore Evidence Graph <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Regional Adaptation Studio */}
          <Link
            href={`/campaigns/${id}/studio`}
            className="group bg-[#161616] p-6 rounded-[24px] border border-[#222222] hover:border-[#2BD64F]/50 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-full bg-[#1F2E23] text-[#2BD64F] flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-[#2BD64F] transition-colors">
                Regional Adaptation Studio
              </h3>
              <p className="text-xs text-[#A3A3A3] mt-1.5 leading-relaxed">
                Dual AI transcreation: literal translation (Sarvam) & natural cultural adaptation (Gemini) side-by-side.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-semibold text-[#2BD64F] gap-1">
              Transcreate Variants <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Brand Guardian */}
          <Link
            href={`/campaigns/${id}/guardian`}
            className="group bg-[#161616] p-6 rounded-[24px] border border-[#222222] hover:border-[#60A5FA]/50 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-full bg-[#1A2633] text-[#60A5FA] flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-[#60A5FA] transition-colors">
                Evidence-First Brand Guardian
              </h3>
              <p className="text-xs text-[#A3A3A3] mt-1.5 leading-relaxed">
                Deterministic NFC/zero-width rule checks, locked tokens, and AI claim verification with exact spans.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-semibold text-[#60A5FA] gap-1">
              Verify Claims <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Feature Navigation Bento Grid - Creative & Workflow Gates */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Poster Studio */}
          <Link
            href={`/campaigns/${id}/posters`}
            className="group bg-[#161616] p-6 rounded-[24px] border border-[#222222] hover:border-[#FFE234]/50 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-full bg-[#2A2416] text-[#FFE234] flex items-center justify-center mb-4">
                <Palette className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-[#FFE234] transition-colors">
                Ad Poster Studio
              </h3>
              <p className="text-xs text-[#A3A3A3] mt-1.5 leading-relaxed">
                Gemini text-free background art + verified Indic SVG typography composited client-side.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-semibold text-[#FFE234] gap-1">
              Generate Posters <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Review Queue */}
          <Link
            href={`/campaigns/${id}/review`}
            className="group bg-[#161616] p-6 rounded-[24px] border border-[#222222] hover:border-white/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-full bg-[#222222] text-white flex items-center justify-center mb-4">
                <CheckCircle className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-[#2BD64F] transition-colors">
                Review Queue
              </h3>
              <p className="text-xs text-[#A3A3A3] mt-1.5 leading-relaxed">
                Version-locked approval gate and cryptographic reviewer sign-off history with hash validation.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-semibold text-[#A3A3A3] group-hover:text-white transition-colors gap-1">
              Review Queue <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Decision Passport */}
          <Link
            href={`/campaigns/${id}/passport`}
            className="group bg-[#161616] p-6 rounded-[24px] border border-[#222222] hover:border-[#2BD64F]/50 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-full bg-[#1A2620] text-[#2BD64F] flex items-center justify-center mb-4">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-[#2BD64F] transition-colors">
                Campaign Decision Passport
              </h3>
              <p className="text-xs text-[#A3A3A3] mt-1.5 leading-relaxed">
                End-to-end cryptographic provenance audit chain from brief to verified observations.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-semibold text-[#2BD64F] gap-1">
              View Passport <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Experimentation & Analytics Bento Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Link
            href={`/campaigns/${id}/experiment`}
            className="group bg-[#161616] p-5 rounded-[22px] border border-[#222222] hover:border-[#333333] transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-full bg-[#201E2E] text-[#A78BFA] flex items-center justify-center">
                <FlaskConical className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Experiment Planner</h4>
                <p className="text-[11px] text-[#777777]">A/B variant hypothesis locking, attribution windows, and guardrails.</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#666666] group-hover:text-white group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            href={`/campaigns/${id}/analytics`}
            className="group bg-[#161616] p-5 rounded-[22px] border border-[#222222] hover:border-[#333333] transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-full bg-[#182C1E] text-[#2BD64F] flex items-center justify-center">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Campaign Analytics & Lift</h4>
                <p className="text-[11px] text-[#777777]">Indic dialect conversion rates, engagement lift, and batch imports.</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#666666] group-hover:text-white group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Registered Claim Atoms Table */}
        <Card
          title="Approved Claim Atoms"
          icon={<ShieldCheck className="w-3.5 h-3.5 text-[#2BD64F]" />}
          actionHref={`/campaigns/${id}/claims`}
          actionLabel="Open Evidence Graph"
        >
          {claims.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#222222] text-[#777777]">
                    <th className="pb-3 font-semibold">Claim Assertion</th>
                    <th className="pb-3 font-semibold">Type</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F1F1F]">
                  {claims.map((cl: any) => (
                    <tr key={cl.id} className="py-2.5">
                      <td className="py-3 font-medium text-white max-w-md">{cl.claim_text}</td>
                      <td className="py-3 font-mono text-[11px] text-[#A3A3A3] uppercase">
                        {cl.type.replace(/_/g, " ")}
                      </td>
                      <td className="py-3">
                        <StatusChip status={cl.status} size="sm" />
                      </td>
                      <td className="py-3 text-[#777777] text-[11px]">
                        {new Date(cl.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-[#777777] py-4 text-center">
              No claim atoms registered. You can add them in the brief editor.
            </p>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
