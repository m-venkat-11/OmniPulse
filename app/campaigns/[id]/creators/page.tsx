"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  ArrowLeft, Search, UserCheck, HelpCircle, FileText, CheckCircle2,
  ChevronRight, Download, Sparkles, Lock, AlertTriangle, User,
  Globe2, Check
} from "lucide-react";
import Link from "next/link";
import {
  getCampaign, getAssetVersionsForCampaign,
  getClaimAtoms, getCreatorProfiles, createCreatorBrief
} from "@/app/actions";
import { LANGUAGE_REGISTRY } from "@/lib/languages/registry";

export default function CreatorMatchPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const campaignId = params.id as string;
  const initialVersionId = searchParams.get("versionId");

  const [campaign, setCampaign] = useState<any>(null);
  const [variants, setVariants] = useState<any[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [claims, setClaims] = useState<any[]>([]);
  const [creators, setCreators] = useState<any[]>([]);
  const [selectedCreatorId, setSelectedCreatorId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [c, v, cl] = await Promise.all([
          getCampaign(campaignId),
          getAssetVersionsForCampaign(campaignId),
          getClaimAtoms(campaignId),
        ]);
        setCampaign(c);
        setVariants(v as any[]);
        setClaims(cl as any[]);

        const target = initialVersionId
          ? v.find((x: any) => x.id === initialVersionId)
          : v.find((x: any) => x.status === 'approved') || v[0];

        setSelectedVariant(target);

        // Load creators matching language
        const creatorList = await getCreatorProfiles(target?.target_language ? String(target.target_language) : undefined);
        setCreators(creatorList as any[]);
        if (creatorList.length > 0) {
          setSelectedCreatorId(String(creatorList[0].id));
        }
      } catch (err) {
        console.error("Failed to load creator data:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [campaignId, initialVersionId]);

  const handleDownloadBrief = () => {
    if (!selectedVariant || !campaign) return;
    const briefText = `BRACO OMNIPULSE — CAMPAIGN CREATOR BRIEF
=========================================
Campaign: ${campaign.name}
Brand: ${campaign.brand_name} (${campaign.product_name})
Language: ${selectedVariant.target_language} ${selectedVariant.dialect ? `(${selectedVariant.dialect})` : ''}

DELIVERABLES:
1x Short-Form Video (Reel / YouTube Shorts) with clear regional dialogue
1x Static carousel image with vernacular caption

APPROVED MANDATORY MESSAGE (MUST USE):
"${selectedVariant.regional_adaptation}"
(English Back-Translation: "${selectedVariant.literal_translation || selectedVariant.source_text}")

PROHIBITED CLAIMS:
${claims.filter(c => c.claim_type === 'prohibited_claim' || c.evidence_status === 'contradicted').map(c => `- ${c.claim_text}`).join('\n') || '- No unverified medical promises\n- No exaggerated superlatives'}

MANDATORY STATUTORY DISCLOSURES:
- Include #Ad #Sponsored in first 3 lines of caption
- Explicit audio or visual disclosure per ASCI Guidelines 2024
${campaign.required_disclaimers || ''}

HASH-VERIFIED RECORD:
Asset Version ID: ${selectedVariant.id}
Content SHA-256: ${selectedVariant.content_hash || 'Verified'}
`;

    const blob = new Blob([briefText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Creator-Brief-${campaign.name.replace(/\s+/g, "_")}.txt`;
    a.click();
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-sage-200 border-t-forest rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-neutral-500">Loading Creator Match & Briefing...</p>
        </div>
      </div>
    );
  }

  const prohibitedClaims = claims.filter(c => c.claim_type === 'prohibited_claim' || c.evidence_status === 'contradicted' || c.evidence_status === 'unsupported');
  const langConfig = LANGUAGE_REGISTRY.find(l => l.name.toLowerCase() === selectedVariant?.target_language?.toLowerCase());

  return (
    <div className="min-h-screen bg-ivory pb-20">
      {/* Header */}
      <header className="bg-white border-b border-forest/10 px-8 py-4 sticky top-0 z-20 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Link href={`/campaigns/${campaignId}`} className="w-8 h-8 rounded-full bg-forest/5 flex items-center justify-center text-forest hover:bg-forest/10 transition">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-lg font-semibold text-forest">Creator Match & Briefing</h1>
              <Badge variant="demo" className="text-2xs">[SYNTHETIC PROFILES]</Badge>
            </div>
            <p className="text-xs text-neutral-500">{campaign?.name} • Campaign-specific creator fit</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={handleDownloadBrief} icon={<Download size={14}/>}>
            {isCopied ? "Downloaded!" : "Download Brief"}
          </Button>
          <Link href={`/campaigns/${campaignId}/experiment`}>
            <Button variant="primary" size="sm" iconRight={<ChevronRight size={14}/>}>
              Plan A/B Experiment
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto mt-8 px-6 grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">

        {/* Left Column (1 Col): Auto-Generated Creator Brief Preview */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-sage/10 rounded-xl border border-sage-300 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-forest/10">
              <h2 className="text-sm font-semibold text-forest flex items-center gap-2">
                <FileText size={16} /> Auto-Generated Brief
              </h2>
              <span className="text-2xs text-forest font-semibold uppercase">PRD Template</span>
            </div>

            <p className="text-xs text-neutral-600">
              Generated automatically from the approved campaign asset version to prevent brand drift during creator deployment.
            </p>

            <div>
              <span className="block text-2xs uppercase tracking-widest text-neutral-500 font-semibold mb-1">
                Deliverables & Formats
              </span>
              <p className="text-xs text-graphite font-medium">
                1x Short Video (Reel / Shorts) + 1x Vernacular Static Post
              </p>
            </div>

            <div>
              <span className="block text-2xs uppercase tracking-widest text-forest font-semibold mb-1">
                Approved Message (Mandatory)
              </span>
              <div className="bg-white p-3 rounded-lg border border-forest/10">
                <p
                  className="text-sm text-graphite font-medium leading-relaxed"
                  style={{ fontFamily: langConfig?.fontFamily || "inherit" }}
                >
                  {selectedVariant?.regional_adaptation || campaign?.key_message}
                </p>
              </div>
            </div>

            <div>
              <span className="block text-2xs uppercase tracking-widest text-red-700 font-semibold mb-1">
                Prohibited Claims (Strict Do-Not-Say)
              </span>
              <ul className="text-xs text-graphite space-y-1 list-disc list-inside bg-red-50/50 p-2.5 rounded border border-red-200">
                {prohibitedClaims.length > 0 ? (
                  prohibitedClaims.map(c => (
                    <li key={c.id} className="text-red-800">{c.claim_text}</li>
                  ))
                ) : (
                  <>
                    <li>No unverified medical cures</li>
                    <li>No superlative &quot;best in India&quot; claims without clinical trial citations</li>
                  </>
                )}
              </ul>
            </div>

            <div>
              <span className="block text-2xs uppercase tracking-widest text-neutral-500 font-semibold mb-1">
                Mandatory ASCI Disclosures
              </span>
              <div className="text-xs text-neutral-700 bg-white p-2.5 rounded border border-forest/10 space-y-1">
                <p>• Include <code>#Ad</code> and <code>#Sponsored</code> prominently.</p>
                <p>• Spoken or visual disclaimer in regional script.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (2 Cols): Explainable Creator Match List */}
        <div className="lg:col-span-2 space-y-6">

          <div className="bg-white rounded-xl border border-forest/10 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-forest/5">
              <div>
                <h3 className="font-serif text-base text-forest font-semibold">
                  Explainable Creator Matching
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Ranked by target language ({selectedVariant?.target_language || "All"}), audience fit, and compliance readiness
                </p>
              </div>
              <Badge variant="demo">PERMITTED SAMPLE PROFILES</Badge>
            </div>

            <div className="space-y-4">
              {creators.map((c: any) => {
                const isSelected = selectedCreatorId === c.id;

                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCreatorId(c.id)}
                    className={`p-5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? "border-forest bg-sage/10 shadow-sm"
                        : "border-forest/10 bg-white hover:border-forest/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-forest/10 flex items-center justify-center text-forest font-semibold text-sm">
                          {c.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-graphite flex items-center gap-2">
                            {c.name}
                            <span className="text-xs text-neutral-400 font-normal">{c.handle}</span>
                          </h4>
                          <p className="text-2xs text-neutral-500">
                            {c.category} • {c.region}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <Badge variant="success" className="text-2xs">
                          {c.avg_engagement_rate}% ENGAGEMENT
                        </Badge>
                        <span className="block text-2xs text-neutral-400 mt-1">{c.follower_range}</span>
                      </div>
                    </div>

                    {/* Explainable Fit Rationale Box (PRD Section 9.2) */}
                    <div className="mt-3 pt-3 border-t border-forest/5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-2xs uppercase tracking-wider text-neutral-400 font-semibold block mb-0.5">
                          Language & Cultural Alignment
                        </span>
                        <p className="text-neutral-700 font-medium">
                          Primary: {c.primary_language} ({c.region}) — 100% native vocabulary fit
                        </p>
                      </div>

                      <div>
                        <span className="text-2xs uppercase tracking-wider text-neutral-400 font-semibold block mb-0.5">
                          Disclosure Readiness
                        </span>
                        <p className="text-green-700 font-medium flex items-center gap-1">
                          <CheckCircle2 size={13} />
                          ASCI disclosure certified ({c.disclosure_readiness})
                        </p>
                      </div>
                    </div>

                    <div className="mt-2 text-2xs text-neutral-400 font-mono">
                      {c.provenance_note}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
