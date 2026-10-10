"use client";

import { useEffect, useState, use } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  ArrowLeft, ShieldCheck, AlertTriangle, ShieldAlert, CheckCircle2,
  XCircle, FileText, ExternalLink, RefreshCw, ChevronRight, Lock,
  Sparkles, Check, Info
} from "lucide-react";
import Link from "next/link";
import {
  getCampaign, getAssetVersionsForCampaign,
  runVerification, getVerificationRuns
} from "@/app/actions";
import { LANGUAGE_REGISTRY } from "@/lib/languages/registry";

export default function BrandGuardianPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const campaignId = params.id as string;
  const initialVersionId = searchParams.get("versionId");

  const [campaign, setCampaign] = useState<any>(null);
  const [variants, setVariants] = useState<any[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState<string>(initialVersionId || "");
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [c, v] = await Promise.all([
          getCampaign(campaignId),
          getAssetVersionsForCampaign(campaignId),
        ]);
        setCampaign(c);
        setVariants(v as any[]);

        const targetId = initialVersionId || (v[0]?.id as string) || "";
        setSelectedVariantId(targetId);

        if (targetId) {
          const runList = await getVerificationRuns(targetId);
          setRuns(runList as any[]);
        }
      } catch (err) {
        console.error("Failed to load guardian:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [campaignId, initialVersionId]);

  const selectedVariant = variants.find(v => v.id === selectedVariantId) || variants[0];

  const handleSelectVariant = async (id: string) => {
    setSelectedVariantId(id);
    const runList = await getVerificationRuns(id);
    setRuns(runList as any[]);
  };

  const handleRunGuardian = async () => {
    if (!selectedVariant) return;
    setIsRunning(true);
    setError("");

    try {
      await runVerification(selectedVariant.id, campaignId);
      const runList = await getVerificationRuns(selectedVariant.id);
      setRuns(runList as any[]);
    } catch (err: any) {
      console.error("Verification run failed:", err);
      setError(err.message || "Failed to execute Brand Guardian verification");
    } finally {
      setIsRunning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-sage-200 border-t-forest rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-neutral-500">Loading Brand Guardian & Claim Ledger...</p>
        </div>
      </div>
    );
  }

  const latestRun = runs[0];
  const findings: any[] = latestRun?.findings || [];
  const blockers = findings.filter(f => f.severity === 'critical' || f.severity === 'high');
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
              <h1 className="font-serif text-lg font-semibold text-forest">Brand Guardian & Claim Ledger</h1>
              <Badge variant="default" className="text-2xs">3-PASS VERIFIER</Badge>
            </div>
            <p className="text-xs text-neutral-500">{campaign?.name} • Evidence-linked safety checks</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRunGuardian}
            disabled={isRunning || !selectedVariant}
            icon={isRunning ? undefined : <RefreshCw size={13}/>}
          >
            {isRunning ? "Running 3-Pass Checks..." : latestRun ? "Re-Run Guardian" : "Run Brand Guardian"}
          </Button>

          {selectedVariant && (
            <Link href={`/approvals/${selectedVariant.id}`}>
              <Button variant="primary" size="sm" iconRight={<ChevronRight size={14}/>}>
                Send to Review Center
              </Button>
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto mt-8 px-6 space-y-6">

        {/* Variant Selector Dropdown if multiple variants exist */}
        {variants.length > 1 && (
          <div className="bg-white rounded-xl border border-forest/10 p-4 shadow-sm flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Select Variant to Inspect:
            </span>
            <select
              value={selectedVariantId}
              onChange={e => handleSelectVariant(e.target.value)}
              className="h-9 px-3 rounded-lg border border-forest/20 text-xs font-semibold text-forest bg-ivory/40 outline-none"
            >
              {variants.map(v => (
                <option key={v.id} value={v.id}>
                  {v.target_language} (v{v.version_number}) — {v.status.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Asset Under Review Card */}
        {selectedVariant ? (
          <div className="bg-white rounded-xl border border-forest/10 p-6 shadow-sm">
            <div className="flex justify-between items-start mb-3 pb-3 border-b border-forest/5">
              <div>
                <h3 className="text-sm font-semibold text-graphite flex items-center gap-2">
                  <FileText size={16} className="text-forest" />
                  Asset Text Under Review ({selectedVariant.target_language})
                </h3>
                <p className="text-2xs text-neutral-400 mt-0.5">
                  Tone: {selectedVariant.tone} • Dialect: {selectedVariant.dialect || "Standard"}
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xs font-mono text-neutral-400 block">ID: {selectedVariant.id.slice(0, 18)}...</span>
                <span className="text-2xs font-mono text-neutral-400 block">SHA-256: {selectedVariant.content_hash?.slice(0, 16)}...</span>
              </div>
            </div>

            <div className="bg-ivory/40 p-4 rounded-lg border border-forest/10 mb-4">
              <p
                className="text-lg text-graphite leading-relaxed font-medium"
                style={{ fontFamily: langConfig?.fontFamily || "inherit" }}
              >
                {selectedVariant.regional_adaptation}
              </p>
            </div>

            {selectedVariant.literal_translation && (
              <div className="text-xs text-neutral-600 bg-sage/10 p-3 rounded-lg border border-forest/5">
                <strong className="text-forest">Literal Back-Translation:</strong> &quot;{selectedVariant.literal_translation}&quot;
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-forest/10 p-8 text-center shadow-sm">
            <p className="text-sm text-neutral-500 mb-4">No variant found to inspect.</p>
            <Link href={`/campaigns/${campaignId}/studio`}>
              <Button variant="primary" size="sm">Go to Studio to Generate Copy</Button>
            </Link>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg text-xs">
            {error}
          </div>
        )}

        {/* 3-Pass Verification Status Bar */}
        {latestRun && (
          <div className="bg-white rounded-xl border border-forest/10 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-base text-forest flex items-center gap-2">
                <ShieldCheck size={18} className="text-forest" />
                3-Pass Verification Results
              </h2>
              <Badge variant={latestRun.overall_status === 'blocked' ? 'critical' : latestRun.overall_status === 'pass' ? 'success' : 'warning'}>
                OVERALL: {latestRun.overall_status.toUpperCase()}
              </Badge>
            </div>

            {/* Passes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Pass A */}
              <div className={`p-4 rounded-lg border ${
                latestRun.pass_a_status === 'fail' ? 'bg-red-50 border-red-200' : 'bg-sage/15 border-sage-300'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-2xs font-semibold uppercase tracking-wider text-neutral-500">Pass A: Deterministic Rules</span>
                  {latestRun.pass_a_status === 'fail' ? <XCircle size={15} className="text-red-600"/> : <CheckCircle2 size={15} className="text-green-600"/>}
                </div>
                <p className="text-xs font-bold capitalize text-graphite">{latestRun.pass_a_status}</p>
                <p className="text-2xs text-neutral-500 mt-1">Regex patterns, prohibited phrases, statutory disclaimers</p>
              </div>

              {/* Pass B */}
              <div className={`p-4 rounded-lg border ${
                latestRun.pass_b_status === 'fail' ? 'bg-red-50 border-red-200' : 'bg-sage/15 border-sage-300'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-2xs font-semibold uppercase tracking-wider text-neutral-500">Pass B: Claim Atom Drift</span>
                  {latestRun.pass_b_status === 'fail' ? <XCircle size={15} className="text-red-600"/> : <CheckCircle2 size={15} className="text-green-600"/>}
                </div>
                <p className="text-xs font-bold capitalize text-graphite">{latestRun.pass_b_status}</p>
                <p className="text-2xs text-neutral-500 mt-1">Verified numbers, units, qualifications, unapproved superlatives</p>
              </div>

              {/* Pass C */}
              <div className={`p-4 rounded-lg border ${
                latestRun.pass_c_status === 'warn' ? 'bg-brass/10 border-brass/30' : 'bg-sage/15 border-sage-300'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-2xs font-semibold uppercase tracking-wider text-neutral-500">Pass C: Cultural Appropriateness</span>
                  {latestRun.pass_c_status === 'warn' ? <AlertTriangle size={15} className="text-brass"/> : <CheckCircle2 size={15} className="text-green-600"/>}
                </div>
                <p className="text-xs font-bold capitalize text-graphite">{latestRun.pass_c_status}</p>
                <p className="text-2xs text-neutral-500 mt-1">Cultural context, regional taboos, tone fit</p>
              </div>
            </div>

            {latestRun.summary && (
              <p className="text-xs text-graphite bg-ivory/50 p-3 rounded-lg border border-forest/5">
                <strong>Summary:</strong> {latestRun.summary}
              </p>
            )}
          </div>
        )}

        {/* Detailed Findings List */}
        {latestRun && (
          <div className="bg-white rounded-xl border border-forest/10 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-forest/5">
              <h3 className="font-serif text-base text-forest">
                Audited Findings ({findings.length})
              </h3>
              <span className="text-2xs text-neutral-500">
                {blockers.length} approval blockers detected
              </span>
            </div>

            {findings.length === 0 ? (
              <div className="p-8 text-center bg-sage/10 rounded-lg border border-sage-300">
                <CheckCircle2 size={28} className="text-green-600 mx-auto mb-2" />
                <h4 className="font-serif text-sm font-semibold text-forest">All Checks Passed</h4>
                <p className="text-xs text-neutral-500 mt-1">
                  No prohibited phrases, claim atom drifts, or cultural taboos were detected.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {findings.map((f: any) => (
                  <div
                    key={f.id}
                    className={`p-4 rounded-xl border ${
                      f.severity === 'critical' ? 'bg-red-50/70 border-red-200' :
                      f.severity === 'high' ? 'bg-red-50/40 border-red-200' :
                      'bg-brass/10 border-brass/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-2xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          f.severity === 'critical' || f.severity === 'high'
                            ? 'bg-red-600 text-white'
                            : 'bg-brass-700 text-white'
                        }`}>
                          {f.severity}
                        </span>
                        <span className="text-xs font-semibold text-graphite capitalize">
                          {f.category?.replace(/_/g, " ")}
                        </span>
                        <span className="text-2xs text-neutral-400 font-mono">
                          • {f.pass_type}
                        </span>
                      </div>

                      <span className={`text-2xs font-semibold px-2 py-0.5 rounded ${
                        f.evidence_status === 'contradicted' ? 'bg-red-100 text-red-800' :
                        f.evidence_status === 'unsupported' ? 'bg-red-100 text-red-700' :
                        'bg-brass/20 text-brass-800'
                      }`}>
                        Evidence: {f.evidence_status}
                      </span>
                    </div>

                    <div className="mb-2">
                      <span className="text-2xs text-neutral-500 uppercase tracking-widest font-semibold block mb-0.5">Flagged Text Span</span>
                      <p className="text-xs font-mono bg-white p-2 rounded border border-forest/10 text-red-700">
                        &quot;{f.flagged_text}&quot;
                      </p>
                    </div>

                    <p className="text-xs text-graphite mb-2">
                      <strong>Explanation:</strong> {f.explanation}
                    </p>

                    {f.suggested_correction && (
                      <div className="bg-white/80 p-2.5 rounded border border-forest/10 text-xs">
                        <strong className="text-forest">Suggested Correction:</strong> {f.suggested_correction}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
