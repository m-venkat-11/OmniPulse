"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  ArrowLeft, Sparkles, ShieldCheck, CheckCircle2, AlertTriangle,
  Lock, Globe2, FileText, ChevronRight, UserCheck, FlaskConical,
  BarChart3, Hash, Clock, Layers, ArrowUpRight, ArrowRight, Trash2
} from "lucide-react";
import Link from "next/link";
import {
  getCampaign, getBriefVersions, getClaimAtoms,
  getAssetVersionsForCampaign, getAuditTrail, deleteCampaign
} from "@/app/actions";

import { ClaimEvidenceGraph } from "@/components/graph/ClaimEvidenceGraph";

export default function CampaignOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<any>(null);
  const [briefs, setBriefs] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [auditEvents, setAuditEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showGraph, setShowGraph] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [c, b, cl, v, a] = await Promise.all([
          getCampaign(campaignId),
          getBriefVersions(campaignId),
          getClaimAtoms(campaignId),
          getAssetVersionsForCampaign(campaignId),
          getAuditTrail(campaignId),
        ]);
        setCampaign(c);
        setBriefs(b as any[]);
        setClaims(cl as any[]);
        setVariants(v as any[]);
        setAuditEvents(a as any[]);
      } catch (err) {
        console.error("Failed to load campaign overview:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [campaignId]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this campaign? This will remove all associated variants and audit logs.")) return;
    setIsDeleting(true);
    await deleteCampaign(campaignId);
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0E1217] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-emerald-400 border-t-white rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-white/50">Loading campaign overview...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-[#0E1217] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-neutral-200 p-8 max-w-md text-center shadow-sm">
          <AlertTriangle size={36} className="text-amber-500 mx-auto mb-3" />
          <h2 className="font-serif text-xl text-[#111419] mb-2 font-bold">Campaign Not Found</h2>
          <p className="text-sm text-neutral-500 mb-6">The requested campaign does not exist or was removed.</p>
          <Link href="/dashboard">
            <Button variant="primary" size="sm">Back to Command Center</Button>
          </Link>
        </div>
      </div>
    );
  }

  const targetLangs: string[] = (() => {
    try { return JSON.parse(campaign.target_languages || "[]"); } catch { return []; }
  })();

  const channels: string[] = (() => {
    try { return JSON.parse(campaign.channels || "[]"); } catch { return []; }
  })();

  const supportedClaims = claims.filter(c => c.evidence_status === 'supported');
  const reviewClaims = claims.filter(c => c.evidence_status === 'needs_human_review');
  const unsupportedClaims = claims.filter(c => c.evidence_status === 'unsupported' || c.evidence_status === 'contradicted');

  const approvedVariants = variants.filter(v => v.status === 'approved');

  const steps = [
    { number: 1, label: "Claim Atoms", path: `/campaigns/${campaignId}/claims`, count: claims.length, icon: <Lock size={15}/>, status: claims.length > 0 ? "ready" : "pending" },
    { number: 2, label: "Regional Studio", path: `/campaigns/${campaignId}/studio`, count: variants.length, icon: <Sparkles size={15}/>, status: variants.length > 0 ? "ready" : "pending" },
    { number: 3, label: "Brand Guardian", path: `/campaigns/${campaignId}/guardian`, count: variants.length, icon: <ShieldCheck size={15}/>, status: variants.length > 0 ? "ready" : "pending" },
    { number: 4, label: "Review Center", path: variants[0] ? `/approvals/${variants[0].id}` : `/campaigns/${campaignId}/studio`, count: approvedVariants.length, icon: <CheckCircle2 size={15}/>, status: approvedVariants.length > 0 ? "ready" : "pending" },
    { number: 5, label: "Decision Passport", path: `/campaigns/${campaignId}/passport`, count: approvedVariants.length, icon: <FileText size={15}/>, status: approvedVariants.length > 0 ? "ready" : "pending" },
    { number: 6, label: "Creator Match", path: `/campaigns/${campaignId}/creators`, count: null, icon: <UserCheck size={15}/>, status: approvedVariants.length > 0 ? "ready" : "pending" },
    { number: 7, label: "A/B Experiment", path: `/campaigns/${campaignId}/experiment`, count: null, icon: <FlaskConical size={15}/>, status: variants.length >= 2 ? "ready" : "pending" },
    { number: 8, label: "Honest Analytics", path: `/campaigns/${campaignId}/analytics`, count: null, icon: <BarChart3 size={15}/>, status: "ready" },
  ];

  return (
    <div className="min-h-screen bg-[#0E1217] p-3 sm:p-5 lg:p-7 flex flex-col items-center">
      <div className="w-full max-w-7xl space-y-4">

        {/* Top Header inside dark frame */}
        <header className="flex items-center justify-between text-white px-2 py-1">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition">
              <ArrowLeft size={16} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-lg font-bold text-white">{campaign.name}</h1>
                {campaign.is_demo ? (
                  <Badge variant="demo" className="text-3xs">[DEMO]</Badge>
                ) : (
                  <Badge variant="success" className="text-3xs">USER DATA</Badge>
                )}
              </div>
              <p className="text-3xs text-white/50 font-mono">
                {campaign.brand_name} • {campaign.product_name} • {campaign.source_language} → {targetLangs.join(", ") || "Multilingual"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowGraph(!showGraph)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                showGraph ? "bg-emerald-500 text-[#0E1217]" : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <Sparkles size={13} />
              {showGraph ? "Hide Claim Graph" : "Show Claim Graph"}
            </button>
            <Link href={`/campaigns/${campaignId}/studio`}>
              <button className="bg-white hover:bg-neutral-100 text-[#0E1217] text-xs font-bold px-4 py-1.5 rounded-full transition flex items-center gap-1.5">
                Open Studio
                <ArrowRight size={13} />
              </button>
            </Link>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-white/40 hover:text-red-400 p-1.5 rounded-full hover:bg-white/5 transition"
              title="Delete Campaign"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </header>

        {/* Inner Crisp Canvas */}
        <div className="bg-[#FFFDF9] rounded-[28px] shadow-2xl p-6 sm:p-8 lg:p-10 border border-white/20 space-y-8">

          {/* 7-Stage Workflow Pipeline */}
          <section className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-100">
              <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                <Layers size={14} className="text-emerald-600" />
                Connected Campaign Pipeline (PRD 5 Differentiators)
              </h2>
              <span className="text-3xs font-mono text-neutral-400">Click any stage to enter</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
              {steps.map((st) => (
                <Link
                  key={st.number}
                  href={st.path}
                  className="group flex flex-col p-3 rounded-xl border border-neutral-200/80 hover:border-emerald-500 hover:bg-emerald-50/20 transition-all text-left relative"
                >
                  <div className="flex items-center justify-between text-neutral-400 group-hover:text-emerald-700 mb-1.5">
                    <span className="text-2xs font-mono font-bold">0{st.number}</span>
                    {st.icon}
                  </div>
                  <span className="text-xs font-bold text-graphite group-hover:text-emerald-800 line-clamp-1">{st.label}</span>
                  <span className="text-3xs text-neutral-400 mt-0.5">
                    {st.count !== null ? `${st.count} items` : "Configure"}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* Embedded Interactive Claim Evidence Graph */}
          {showGraph && (
            <div className="animate-fade-in">
              <ClaimEvidenceGraph
                campaign={campaign}
                claims={claims}
                variants={variants}
              />
            </div>
          )}

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white rounded-xl border border-forest/10 p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
              <span>Claim Atoms Locked</span>
              <Lock size={15} className="text-forest" />
            </div>
            <p className="text-2xl font-serif text-forest">{claims.length}</p>
            <div className="mt-2 text-2xs text-neutral-500 flex gap-2">
              <span className="text-green-700 font-medium">{supportedClaims.length} supported</span>
              <span>•</span>
              <span className="text-brass-700 font-medium">{reviewClaims.length} review</span>
              {unsupportedClaims.length > 0 && (
                <>
                  <span>•</span>
                  <span className="text-red-700 font-medium">{unsupportedClaims.length} flagged</span>
                </>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-forest/10 p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
              <span>Regional Variants</span>
              <Sparkles size={15} className="text-forest" />
            </div>
            <p className="text-2xl font-serif text-forest">{variants.length}</p>
            <p className="mt-2 text-2xs text-neutral-500">
              {targetLangs.length} configured target languages
            </p>
          </div>

          <div className="bg-white rounded-xl border border-forest/10 p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
              <span>Approved Versions</span>
              <CheckCircle2 size={15} className="text-green-600" />
            </div>
            <p className="text-2xl font-serif text-forest">{approvedVariants.length}</p>
            <p className="mt-2 text-2xs text-neutral-500">
              {variants.length - approvedVariants.length} pending review / draft
            </p>
          </div>

          <div className="bg-white rounded-xl border border-forest/10 p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
              <span>Audit Lineage</span>
              <Hash size={15} className="text-brass" />
            </div>
            <p className="text-2xl font-serif text-forest">{auditEvents.length}</p>
            <p className="mt-2 text-2xs text-neutral-500">
              Cryptographic SHA-256 events recorded
            </p>
          </div>
        </div>

        {/* Two-Column Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column (2 Cols): Campaign Brief & Generated Variants */}
          <div className="lg:col-span-2 space-y-6">

            {/* Campaign Brief Summary */}
            <div className="bg-white rounded-xl border border-forest/10 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-forest/5">
                <h3 className="font-serif text-base text-forest flex items-center gap-2">
                  <FileText size={17} className="text-forest" />
                  Campaign Brief v{briefs[0]?.version_number || 1}
                </h3>
                <span className="text-2xs font-mono text-neutral-400">
                  Hash: {briefs[0]?.content_hash ? `${briefs[0].content_hash.slice(0, 16)}...` : "—"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-neutral-400 uppercase tracking-widest block font-medium mb-1">Objective</span>
                  <p className="text-graphite font-medium">{campaign.objective}</p>
                </div>
                <div>
                  <span className="text-neutral-400 uppercase tracking-widest block font-medium mb-1">Target Audience</span>
                  <p className="text-graphite font-medium">{campaign.target_audience || "General consumers"}</p>
                </div>
                <div>
                  <span className="text-neutral-400 uppercase tracking-widest block font-medium mb-1">Tone & Voice</span>
                  <p className="text-graphite font-medium capitalize">{campaign.tone}</p>
                </div>
                <div>
                  <span className="text-neutral-400 uppercase tracking-widest block font-medium mb-1">Channels</span>
                  <p className="text-graphite font-medium">{channels.join(", ") || "Social Media"}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-forest/5">
                <span className="text-neutral-400 uppercase tracking-widest block text-2xs font-medium mb-1">Key Message</span>
                <p className="text-sm text-graphite bg-ivory/60 p-3 rounded-lg border border-forest/5">
                  &quot;{campaign.key_message}&quot;
                </p>
              </div>

              {campaign.call_to_action && (
                <div className="mt-3">
                  <span className="text-neutral-400 uppercase tracking-widest block text-2xs font-medium mb-1">Call to Action</span>
                  <p className="text-xs text-graphite font-medium">{campaign.call_to_action}</p>
                </div>
              )}
            </div>

            {/* Generated Regional Variants */}
            <div className="bg-white rounded-xl border border-forest/10 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-base text-forest flex items-center gap-2">
                  <Globe2 size={17} className="text-forest" />
                  Regional Creative Variants ({variants.length})
                </h3>
                <Link href={`/campaigns/${campaignId}/studio`}>
                  <Button variant="outline" size="sm" icon={<Sparkles size={13}/>}>Generate New Variant</Button>
                </Link>
              </div>

              {variants.length === 0 ? (
                <div className="p-8 text-center bg-sage/10 rounded-lg border border-dashed border-forest/20">
                  <p className="text-sm text-neutral-600 mb-3">No regional variants have been generated for this campaign yet.</p>
                  <Link href={`/campaigns/${campaignId}/studio`}>
                    <Button variant="primary" size="sm" icon={<Sparkles size={14}/>}>
                      Generate Regional Copy in Studio
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {variants.map((v) => (
                    <div key={v.id} className="p-4 rounded-lg border border-forest/10 bg-ivory/30 hover:border-forest/30 transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-forest px-2 py-0.5 rounded bg-forest/10">
                            {v.target_language} {v.dialect ? `(${v.dialect})` : ""}
                          </span>
                          <span className="text-2xs text-neutral-400 font-mono">v{v.version_number}</span>
                          <span className="text-2xs text-neutral-400">• Mode: {v.generated_by_mode}</span>
                        </div>
                        <Badge variant={v.status === 'approved' ? 'success' : v.status === 'rejected' ? 'critical' : 'warning'}>
                          {v.status}
                        </Badge>
                      </div>

                      <p className="text-base text-graphite mb-2 leading-relaxed font-medium">
                        {v.regional_adaptation}
                      </p>

                      {v.literal_translation && (
                        <p className="text-xs text-neutral-500 italic mb-3 bg-white/70 p-2 rounded border border-forest/5">
                          <strong className="not-italic text-forest">Literal Back-Translation:</strong> &quot;{v.literal_translation}&quot;
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-forest/5 text-xs">
                        <span className="text-2xs font-mono text-neutral-400">
                          SHA-256: {v.content_hash ? `${v.content_hash.slice(0, 16)}...` : "—"}
                        </span>
                        <div className="flex gap-2">
                          <Link href={`/campaigns/${campaignId}/guardian?versionId=${v.id}`}>
                            <Button variant="outline" size="sm" className="h-7 text-xs">
                              Brand Guardian
                            </Button>
                          </Link>
                          <Link href={`/approvals/${v.id}`}>
                            <Button variant="primary" size="sm" className="h-7 text-xs">
                              Review
                            </Button>
                          </Link>
                          {v.status === 'approved' && (
                            <Link href={`/campaigns/${campaignId}/passport?versionId=${v.id}`}>
                              <Button variant="outline" size="sm" className="h-7 text-xs text-forest">
                                Passport
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Column (1 Col): Claim Atoms & Audit Trail */}
          <div className="space-y-6">

            {/* Claim Atom Registry Card */}
            <div className="bg-white rounded-xl border border-forest/10 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-forest/5">
                <h3 className="font-serif text-sm font-semibold text-forest flex items-center gap-1.5">
                  <Lock size={15} className="text-forest" />
                  Locked Claim Atoms ({claims.length})
                </h3>
                <Link href={`/campaigns/${campaignId}/claims`} className="text-xs text-forest hover:underline">
                  Manage
                </Link>
              </div>

              {claims.length === 0 ? (
                <p className="text-xs text-neutral-500 py-3">No claims registered.</p>
              ) : (
                <div className="space-y-2.5">
                  {claims.slice(0, 5).map((cl) => (
                    <div key={cl.id} className="p-2.5 rounded-lg bg-ivory/50 border border-forest/5 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-2xs uppercase tracking-wider text-neutral-400 font-medium">
                          {cl.claim_type.replace('_', ' ')}
                        </span>
                        <span className={`text-2xs font-medium px-1.5 py-0.5 rounded ${
                          cl.evidence_status === 'supported' ? 'text-green-700 bg-green-50' :
                          cl.evidence_status === 'contradicted' ? 'text-red-700 bg-red-50' :
                          'text-brass-700 bg-brass/10'
                        }`}>
                          {cl.evidence_status}
                        </span>
                      </div>
                      <p className="text-graphite font-medium line-clamp-2">&quot;{cl.claim_text}&quot;</p>
                    </div>
                  ))}
                  {claims.length > 5 && (
                    <Link href={`/campaigns/${campaignId}/claims`} className="block text-center text-xs text-forest hover:underline pt-1">
                      + View {claims.length - 5} more claims
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Cryptographic Audit Trail */}
            <div className="bg-white rounded-xl border border-forest/10 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-forest/5">
                <h3 className="font-serif text-sm font-semibold text-forest flex items-center gap-1.5">
                  <Clock size={15} className="text-forest" />
                  Audit Trail Lineage
                </h3>
                <span className="text-2xs text-neutral-400">Append-only</span>
              </div>

              {auditEvents.length === 0 ? (
                <p className="text-xs text-neutral-500 py-3">No audit events recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {auditEvents.slice(0, 6).map((evt) => (
                    <div key={evt.id} className="text-xs border-l-2 border-forest/20 pl-3 py-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-graphite capitalize">
                          {evt.event_type.replace(/_/g, " ")}
                        </span>
                        <span className="text-2xs text-neutral-400">
                          {evt.created_at ? new Date(evt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}
                        </span>
                      </div>
                      <p className="text-2xs font-mono text-neutral-400 truncate mt-0.5">
                        Hash: {evt.hash ? `${evt.hash.slice(0, 20)}...` : "—"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

        </div>
      </div>
    </div>
  );
}
