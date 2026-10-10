"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  ArrowLeft, Lock, BarChart3, AlertCircle, Upload, CheckCircle2,
  FlaskConical, Link2, Sparkles, ChevronRight
} from "lucide-react";
import Link from "next/link";
import {
  getCampaign, getAssetVersionsForCampaign,
  createExperiment, lockExperiment, getExperiments
} from "@/app/actions";

export default function ExperimentPlannerPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<any>(null);
  const [variants, setVariants] = useState<any[]>([]);
  const [experiments, setExperiments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [hypothesis, setHypothesis] = useState("");
  const [variantAId, setVariantAId] = useState("");
  const [variantBId, setVariantBId] = useState("");
  const [primaryMetric, setPrimaryMetric] = useState("CTR");
  const [targetRegion, setTargetRegion] = useState("South India");
  const [attributionWindow, setAttributionWindow] = useState("7-day click");
  const [testDuration, setTestDuration] = useState("14 days");
  const [successCriteria, setSuccessCriteria] = useState(">= 25% relative lift with p < 0.05 statistical significance");

  const [isLocking, setIsLocking] = useState(false);
  const [activeExperiment, setActiveExperiment] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const [c, v, expList] = await Promise.all([
          getCampaign(campaignId),
          getAssetVersionsForCampaign(campaignId),
          getExperiments(campaignId),
        ]);
        setCampaign(c);
        setVariants(v as any[]);
        setExperiments(expList as any[]);

        if (expList.length > 0) {
          const latest = expList[0];
          setActiveExperiment(latest);
          setHypothesis(latest.hypothesis ? String(latest.hypothesis) : "");
          setVariantAId(latest.variant_a_id ? String(latest.variant_a_id) : "");
          setVariantBId(latest.variant_b_id ? String(latest.variant_b_id) : "");
          setPrimaryMetric(latest.primary_metric ? String(latest.primary_metric) : "CTR");
          setTargetRegion(latest.target_region ? String(latest.target_region) : "South India");
        } else if (v.length >= 2) {
          setVariantAId(String(v[0].id));
          setVariantBId(String(v[1].id));
          setHypothesis(`Regional adaptation with explicit verified fact framing will outperform generic greeting variant by >= 25% in ${v[0].target_language}.`);
        } else if (v.length === 1) {
          setVariantAId(String(v[0].id));
          setHypothesis(`Variant v${v[0].version_number} in ${v[0].target_language} will drive higher engagement than baseline.`);
        }
      } catch (err) {
        console.error("Failed to load experiment planner:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [campaignId]);

  const handlePreRegisterAndLock = async () => {
    if (!hypothesis.trim() || !variantAId) {
      alert("Please enter a hypothesis and select Variant A.");
      return;
    }
    setIsLocking(true);

    try {
      const expId = await createExperiment(campaignId, {
        hypothesis,
        variantAId,
        variantBId: variantBId || variantAId,
        primaryMetric,
        secondaryMetrics: ["Conversion Rate", "VTR", "ROAS"],
        targetRegion,
        attributionWindow,
        testDuration,
        successCriteria,
      });

      await lockExperiment(expId);

      const updated = await getExperiments(campaignId);
      setExperiments(updated as any[]);
      setActiveExperiment(updated[0]);
    } catch (err: any) {
      alert("Failed to lock experiment: " + err.message);
    } finally {
      setIsLocking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-sage-200 border-t-forest rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-neutral-500">Loading Experiment Planner...</p>
        </div>
      </div>
    );
  }

  const isLocked = activeExperiment?.is_locked === 1;

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
              <h1 className="font-serif text-lg font-semibold text-forest">Experiment Planner (A/B Test)</h1>
              {isLocked ? (
                <Badge variant="success" className="text-2xs flex items-center gap-1">
                  <Lock size={11} /> PRE-REGISTERED & LOCKED
                </Badge>
              ) : (
                <Badge variant="demo" className="text-2xs">DRAFT PLAN</Badge>
              )}
            </div>
            <p className="text-xs text-neutral-500">{campaign?.name} • Honest measurement without post-hoc cherry-picking</p>
          </div>
        </div>

        <div className="flex gap-3">
          {!isLocked ? (
            <Button
              variant="primary"
              size="sm"
              onClick={handlePreRegisterAndLock}
              disabled={isLocking || variants.length === 0}
              iconRight={<Lock size={14}/>}
            >
              {isLocking ? "Freezing Plan in DB..." : "Pre-Register & Lock"}
            </Button>
          ) : (
            <Link href={`/campaigns/${campaignId}/analytics`}>
              <Button variant="primary" size="sm" iconRight={<ChevronRight size={14}/>}>
                Import Data & Analyze
              </Button>
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto mt-8 px-6 space-y-6 animate-fade-in">

        {/* Locked State Banner */}
        {isLocked && (
          <div className="bg-sage/20 border border-sage-300 rounded-xl p-5 flex items-start gap-3 shadow-sm">
            <Lock size={22} className="text-forest shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-forest">Experiment Pre-Registration Locked</h3>
              <p className="text-xs text-neutral-700 mt-1">
                Hypothesis, metric definitions, and variants are permanently frozen in the Turso database. Per PRD Section 10.1, this prevents HARKing (Hypothesizing After Results are Known) and post-hoc metric cherry-picking. You can now import campaign data for honest evaluation.
              </p>
            </div>
          </div>
        )}

        {/* Form Container */}
        <div className={`space-y-6 ${isLocked ? "opacity-85 pointer-events-none" : ""}`}>

          {/* Section 1: Hypothesis & Variants */}
          <div className="bg-white rounded-xl border border-forest/10 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-graphite flex items-center gap-2">
              <FlaskConical size={18} className="text-forest" />
              1. Hypothesis & Creative Variants
            </h2>

            <div>
              <label className="block text-xs font-semibold text-graphite mb-1.5">
                Pre-Registered Testable Hypothesis *
              </label>
              <textarea
                rows={3}
                value={hypothesis}
                onChange={e => setHypothesis(e.target.value)}
                placeholder="e.g., Regional adaptation with authentic Telugu festive idiom will drive >= 20% higher CTR than generic greeting."
                className="w-full p-3 rounded-lg border border-forest/15 bg-white text-sm focus:ring-2 focus:ring-forest/20 outline-none resize-none font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                  Variant A (Control / Standard) *
                </label>
                <select
                  value={variantAId}
                  onChange={e => setVariantAId(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-forest/15 bg-white text-xs font-medium text-graphite outline-none"
                >
                  <option value="">Select Variant A</option>
                  {variants.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.target_language} (v{v.version_number}) — {v.regional_adaptation?.slice(0, 45)}...
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                  Variant B (Challenger / Localized)
                </label>
                <select
                  value={variantBId}
                  onChange={e => setVariantBId(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-forest/15 bg-white text-xs font-medium text-graphite outline-none"
                >
                  <option value="">Select Variant B (or same if single test)</option>
                  {variants.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.target_language} (v{v.version_number}) — {v.regional_adaptation?.slice(0, 45)}...
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Primary & Guardrail Metrics */}
          <div className="bg-white rounded-xl border border-forest/10 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-graphite flex items-center gap-2">
              <BarChart3 size={18} className="text-forest" />
              2. Pre-Determined Metrics & Attribution Contract
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-2xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                  Primary Decision Metric *
                </label>
                <select
                  value={primaryMetric}
                  onChange={e => setPrimaryMetric(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-forest/15 bg-white text-xs font-medium text-graphite outline-none"
                >
                  <option value="CTR">Click-Through Rate (CTR %)</option>
                  <option value="Conversion Rate">Conversion Rate (CVR %)</option>
                  <option value="VTR">Video Through Rate (VTR %)</option>
                  <option value="ROAS">Return on Ad Spend (ROAS)</option>
                  <option value="Engagement Rate">Engagement Rate (%)</option>
                </select>
              </div>

              <div>
                <label className="block text-2xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                  Attribution Window
                </label>
                <select
                  value={attributionWindow}
                  onChange={e => setAttributionWindow(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-forest/15 bg-white text-xs font-medium text-graphite outline-none"
                >
                  <option value="7-day click">7-Day Click / 1-Day View</option>
                  <option value="1-day click">1-Day Click Strict</option>
                  <option value="28-day click">28-Day Extended Window</option>
                </select>
              </div>

              <div>
                <label className="block text-2xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                  Planned Duration
                </label>
                <input
                  type="text"
                  value={testDuration}
                  onChange={e => setTestDuration(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-forest/15 bg-white text-xs font-medium text-graphite outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-2xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                Success Decision Rule
              </label>
              <input
                type="text"
                value={successCriteria}
                onChange={e => setSuccessCriteria(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-forest/15 bg-white text-xs font-medium text-graphite outline-none"
              />
            </div>
          </div>

        </div>

        {/* Guidance Box */}
        <div className="bg-ivory/80 rounded-xl border border-forest/10 p-5 text-xs text-neutral-600 space-y-1">
          <p className="font-semibold text-forest">Measurement Integrity Rule (PRD Section 10):</p>
          <p>
            &quot;At minimum define impressions/reach, clicks, engagement, conversions, spend, and CTR. Do not compare platform values until the denominator, attribution window, reporting period and source definition are aligned.&quot;
          </p>
        </div>

      </main>
    </div>
  );
}
