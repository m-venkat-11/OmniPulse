"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  ArrowLeft, Hash, ShieldCheck, Printer, CheckCircle2,
  User, FileText, Share2, Sparkles, ChevronRight, Lock,
  Globe2, QrCode
} from "lucide-react";
import Link from "next/link";
import {
  getCampaign, getAssetVersionsForCampaign,
  getClaimAtoms, getApprovals
} from "@/app/actions";
import { LANGUAGE_REGISTRY } from "@/lib/languages/registry";

export default function DecisionPassportPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const campaignId = params.id as string;
  const initialVersionId = searchParams.get("versionId");

  const [campaign, setCampaign] = useState<any>(null);
  const [variants, setVariants] = useState<any[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [claims, setClaims] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

        if (target) {
          const app = await getApprovals(String(target.id));
          setApprovals(app as any[]);
        }
      } catch (err) {
        console.error("Failed to load passport:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [campaignId, initialVersionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-sage-200 border-t-forest rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-neutral-500">Loading Decision Passport Certificate...</p>
        </div>
      </div>
    );
  }

  const supportedClaims = claims.filter(c => c.evidence_status === 'supported');
  const langConfig = LANGUAGE_REGISTRY.find(l => l.name.toLowerCase() === selectedVariant?.target_language?.toLowerCase());
  const latestApproval = approvals[0];

  return (
    <div className="min-h-screen bg-ivory pb-20">
      {/* Header — Hidden on print */}
      <header className="bg-white border-b border-forest/10 px-8 py-4 sticky top-0 z-20 flex items-center justify-between shadow-sm print:hidden">
        <div className="flex items-center gap-4">
          <Link href={`/campaigns/${campaignId}`} className="w-8 h-8 rounded-full bg-forest/5 flex items-center justify-center text-forest hover:bg-forest/10 transition">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="font-serif text-lg font-semibold text-forest">Decision Passport</h1>
            <p className="text-xs text-neutral-500">{campaign?.name} • Immutable Record of Verification</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Link href={`/campaigns/${campaignId}/creators${selectedVariant ? `?versionId=${selectedVariant.id}` : ''}`}>
            <Button variant="outline" size="sm" iconRight={<ChevronRight size={14}/>}>
              Creator Match & Brief
            </Button>
          </Link>
          <Button variant="primary" size="sm" onClick={() => window.print()} iconRight={<Printer size={14}/>}>
            Print / Save Certificate
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto mt-8 px-6 print:mt-0 print:px-0 animate-fade-in">

        {/* Printable Official Passport Certificate Paper */}
        <div className="bg-white border border-forest/20 shadow-editorial p-10 print:shadow-none print:border-none print:p-0 rounded-xl relative overflow-hidden">

          {/* Watermark / Seal */}
          <div className="absolute top-4 right-6 opacity-10 pointer-events-none select-none">
            <ShieldCheck size={180} className="text-forest" />
          </div>

          {/* Certificate Header */}
          <div className="flex items-start justify-between mb-8 pb-6 border-b-2 border-forest/20">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck size={26} className="text-forest" />
                <h2 className="font-serif text-3xl font-semibold text-forest tracking-tight">Decision Passport</h2>
              </div>
              <p className="text-xs text-graphite uppercase tracking-widest font-semibold">
                Braco OmniPulse • Campaign Verification Certificate
              </p>
            </div>
            <div className="text-right">
              <Badge variant={selectedVariant?.status === 'approved' ? 'success' : 'warning'} className="mb-2 uppercase tracking-widest text-xs px-3 py-1">
                {selectedVariant?.status === 'approved' ? 'APPROVED & VERIFIED' : 'PENDING APPROVAL'}
              </Badge>
              <p className="text-2xs font-mono text-neutral-500">
                Asset Version: v{selectedVariant?.version_number || 1}
              </p>
              <p className="text-2xs font-mono text-neutral-500">
                Issued: {new Date().toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Campaign & Context Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 mb-8 pb-6 border-b border-forest/10 text-xs">
            <div>
              <span className="block text-2xs font-semibold text-neutral-400 uppercase tracking-widest mb-1">Campaign Context</span>
              <p className="text-sm font-semibold text-graphite">{campaign?.name}</p>
              <p className="text-xs text-neutral-600 mt-0.5">{campaign?.brand_name} • {campaign?.product_name}</p>
            </div>

            <div>
              <span className="block text-2xs font-semibold text-neutral-400 uppercase tracking-widest mb-1">Linguistic Specification</span>
              <p className="text-sm font-semibold text-graphite">
                {selectedVariant?.target_language} {selectedVariant?.dialect ? `(${selectedVariant?.dialect})` : ""}
              </p>
              <p className="text-xs text-neutral-600 mt-0.5">
                Tone: {selectedVariant?.tone} • Script: {langConfig?.script || "Native"}
              </p>
            </div>
          </div>

          {/* Exact Regional Text & Back Translation */}
          <div className="space-y-6 mb-8 pb-6 border-b border-forest/10">
            <div>
              <span className="block text-2xs font-semibold text-forest uppercase tracking-widest mb-2">
                Certified Regional Copy ({selectedVariant?.target_language})
              </span>
              <div className="bg-ivory/50 p-5 rounded-lg border-l-4 border-forest">
                <p
                  className="text-lg text-graphite leading-relaxed font-medium"
                  style={{ fontFamily: langConfig?.fontFamily || "inherit" }}
                >
                  {selectedVariant?.regional_adaptation || "No text generated."}
                </p>
              </div>
            </div>

            {selectedVariant?.literal_translation && (
              <div>
                <span className="block text-2xs font-semibold text-neutral-400 uppercase tracking-widest mb-1.5">
                  Literal English Back-Translation
                </span>
                <p className="text-xs text-neutral-700 italic bg-sage/15 p-3 rounded-lg border border-forest/5">
                  &quot;{selectedVariant?.literal_translation}&quot;
                </p>
              </div>
            )}
          </div>

          {/* Locked Facts & Evidence Certified */}
          <div className="mb-8 pb-6 border-b border-forest/10">
            <span className="block text-2xs font-semibold text-forest uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Lock size={13} className="text-forest" />
              Certified Claim Atoms Preserved
            </span>

            {supportedClaims.length === 0 ? (
              <p className="text-xs text-neutral-500">No specific Claim Atoms required for this variant.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {supportedClaims.map((cl) => (
                  <div key={cl.id} className="p-3 rounded-lg bg-ivory/40 border border-forest/10 text-xs">
                    <div className="flex items-center gap-1.5 text-green-700 font-semibold mb-1">
                      <CheckCircle2 size={13} />
                      <span className="text-2xs uppercase">Verified Fact</span>
                    </div>
                    <p className="font-medium text-graphite">&quot;{cl.claim_text}&quot;</p>
                    {cl.qualifications && (
                      <p className="text-2xs text-neutral-500 mt-1 font-mono">Ref: {cl.qualifications}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cryptographic Proof & Signature Block */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs pt-2">
            <div>
              <span className="block text-2xs font-semibold text-neutral-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                <Hash size={13} className="text-forest" />
                Cryptographic Integrity Stamp
              </span>
              <div className="space-y-1.5 font-mono text-2xs text-neutral-600 bg-ivory/60 p-3 rounded-lg border border-forest/10">
                <div>
                  <span className="text-neutral-400 block">CONTENT SHA-256 HASH:</span>
                  <span className="break-all font-semibold text-forest">{selectedVariant?.content_hash || "—"}</span>
                </div>
                <div className="pt-1">
                  <span className="text-neutral-400 block">ASSET VERSION ID:</span>
                  <span className="break-all">{selectedVariant?.id}</span>
                </div>
              </div>
            </div>

            <div>
              <span className="block text-2xs font-semibold text-neutral-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                <User size={13} className="text-forest" />
                Human Reviewer Verification
              </span>
              <div className="bg-ivory/60 p-3 rounded-lg border border-forest/10 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Reviewer:</span>
                  <span className="font-semibold text-graphite">Demo Admin (Compliance Lead)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Status:</span>
                  <span className="font-semibold text-green-700 capitalize">{selectedVariant?.status}</span>
                </div>
                {latestApproval?.review_comments && (
                  <div className="pt-1 border-t border-forest/5 text-2xs text-neutral-600 italic">
                    &quot;{latestApproval.review_comments}&quot;
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Certificate Footer */}
          <div className="mt-10 pt-4 border-t border-forest/10 flex items-center justify-between text-2xs text-neutral-400">
            <span>Braco OmniPulse • Samartha Hackathon • Regional Campaign Intelligence</span>
            <span>Immutable Hash-Verified Document</span>
          </div>

        </div>

      </main>
    </div>
  );
}
