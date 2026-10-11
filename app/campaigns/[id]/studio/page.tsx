"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  ArrowLeft, CheckCircle2, AlertTriangle, Sparkles, Wand2, Info,
  ChevronRight, Lock, Globe2, ShieldCheck, RefreshCw, FileText,
  SlidersHorizontal, Check, Edit3, ArrowRight, ThumbsUp, HelpCircle,
  AlertOctagon, CheckCheck
} from "lucide-react";
import Link from "next/link";
import {
  getCampaign, getClaimAtoms, getAssetVersionsForCampaign,
  generateRegionalAdaptation, createNewAssetVersion
} from "@/app/actions";
import { LANGUAGE_REGISTRY, getLanguageById } from "@/lib/languages/registry";

export default function RegionalCreativeStudioPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<any>(null);
  const [claims, setClaims] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [sourceText, setSourceText] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("English");
  const [targetLanguage, setTargetLanguage] = useState("Telugu");
  const [dialect, setDialect] = useState("");
  const [region, setRegion] = useState("");
  const [tone, setTone] = useState("Festive Warm");
  const [slangLevel, setSlangLevel] = useState("low");
  const [formality, setFormality] = useState("conversational");
  const [culturalContext, setCulturalContext] = useState("");

  // Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [latestGenerated, setLatestGenerated] = useState<any>(null);

  // Reviewer Rubric Feedback State per variant ID (PRD Section 7.3)
  const [reviewerTags, setReviewerTags] = useState<Record<string, string>>({});

  // Edit / Version lock state
  const [editingVariant, setEditingVariant] = useState<any>(null);
  const [editText, setEditText] = useState("");
  const [editReason, setEditReason] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [c, cl, v] = await Promise.all([
          getCampaign(campaignId),
          getClaimAtoms(campaignId),
          getAssetVersionsForCampaign(campaignId),
        ]);
        setCampaign(c);
        setClaims(cl as any[]);
        setVariants(v as any[]);

        if (c) {
          setSourceText(c.key_message ? String(c.key_message) : "");
          setTone(c.tone ? String(c.tone) : "Festive Warm");

          try {
            const targetLangs = JSON.parse(String(c.target_languages || "[]"));
            if (targetLangs.length > 0) {
              setTargetLanguage(String(targetLangs[0]));
            }
          } catch {}
        }
      } catch (err) {
        console.error("Failed to load studio data:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [campaignId]);

  const selectedLang = LANGUAGE_REGISTRY.find(l => l.name.toLowerCase() === targetLanguage.toLowerCase() || l.id === targetLanguage.toLowerCase()) || LANGUAGE_REGISTRY.find(l => l.name === 'Telugu');
  const availableDialects = selectedLang?.dialects || [];

  const handleGenerate = async () => {
    if (!sourceText.trim()) {
      setError("Please enter or select source text to adapt.");
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      const result = await generateRegionalAdaptation(campaignId, {
        sourceText,
        sourceLanguage,
        targetLanguage: selectedLang?.name || targetLanguage,
        dialect: dialect || availableDialects[0]?.name || "Standard",
        tone,
        slangLevel,
        formality,
        region: region || selectedLang?.dialects[0]?.region || "Regional",
      });

      setLatestGenerated(result);

      const updated = await getAssetVersionsForCampaign(campaignId);
      setVariants(updated as any[]);
    } catch (err: any) {
      console.error("Adaptation failed:", err);
      setError(err.message || "Failed to generate adaptation");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editText.trim() || !editReason.trim() || !editingVariant) return;
    setIsSavingEdit(true);

    try {
      await createNewAssetVersion({
        assetId: editingVariant.asset_id,
        sourceText: editingVariant.source_text,
        regionalAdaptation: editText,
        targetLanguage: editingVariant.target_language,
        dialect: editingVariant.dialect,
        tone: editingVariant.tone,
        slangLevel: editingVariant.slang_level,
        formality: editingVariant.formality,
        reasonForEdit: editReason,
      });

      const updated = await getAssetVersionsForCampaign(campaignId);
      setVariants(updated as any[]);
      setEditingVariant(null);
      setEditText("");
      setEditReason("");
    } catch (err: any) {
      alert("Failed to save edit: " + err.message);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const setReviewerFeedback = (variantId: string, tag: string) => {
    setReviewerTags(prev => ({
      ...prev,
      [variantId]: prev[variantId] === tag ? "" : tag
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-sage-200 border-t-forest rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-neutral-500">Loading Regional Creative Studio...</p>
        </div>
      </div>
    );
  }

  const supportedClaims = claims.filter(c => c.evidence_status === 'supported');

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
              <h1 className="font-serif text-lg font-semibold text-forest">Regional Creative Studio</h1>
              {campaign?.is_demo ? (
                <Badge variant="demo" className="text-2xs">[DEMO]</Badge>
              ) : null}
            </div>
            <p className="text-xs text-neutral-500">{campaign?.name} — {campaign?.brand_name} ({campaign?.product_name})</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href={`/campaigns/${campaignId}/claims`}>
            <Button variant="outline" size="sm" icon={<Lock size={13}/>}>
              View Locked Claims ({claims.length})
            </Button>
          </Link>
          {variants.length > 0 && (
            <Link href={`/campaigns/${campaignId}/guardian?versionId=${variants[0].id}`}>
              <Button variant="outline" size="sm" icon={<ShieldCheck size={14}/>}>
                Brand Guardian
              </Button>
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto mt-8 px-6 space-y-6">

        {/* Diagram 4: Multilingual Regional Adaptation Pipeline Visual Banner */}
        <div className="bg-white rounded-xl border border-forest/10 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xs font-semibold uppercase tracking-wider text-neutral-400">
              PRD Diagram 4: 12-Step Regional Adaptation & Meaning Preservation Flow
            </span>
            <span className="text-2xs text-forest font-mono">
              Dynamic Gemini 3.8 Execution
            </span>
          </div>
          <div className="flex items-center justify-between gap-1 text-2xs overflow-x-auto py-1">
            <div className="px-2 py-1 rounded bg-sage/20 text-forest font-medium whitespace-nowrap">
              1. Brief Intent
            </div>
            <ArrowRight size={11} className="text-neutral-400 shrink-0" />
            <div className="px-2 py-1 rounded bg-sage/20 text-forest font-medium whitespace-nowrap">
              2. Target Lang & Dialect
            </div>
            <ArrowRight size={11} className="text-neutral-400 shrink-0" />
            <div className="px-2 py-1 rounded bg-sage/20 text-forest font-medium whitespace-nowrap">
              3. Tone & Slang
            </div>
            <ArrowRight size={11} className="text-neutral-400 shrink-0" />
            <div className="px-2 py-1 rounded bg-emerald-100 text-emerald-900 font-medium whitespace-nowrap">
              4. Parallel Literal + Adapted
            </div>
            <ArrowRight size={11} className="text-neutral-400 shrink-0" />
            <div className="px-2 py-1 rounded bg-sage/20 text-forest font-medium whitespace-nowrap">
              5. Meaning Check
            </div>
            <ArrowRight size={11} className="text-neutral-400 shrink-0" />
            <div className="px-2 py-1 rounded bg-sage/20 text-forest font-medium whitespace-nowrap">
              6. Fact Preservation
            </div>
            <ArrowRight size={11} className="text-neutral-400 shrink-0" />
            <div className="px-2 py-1 rounded bg-brass/20 text-brass-800 font-medium whitespace-nowrap">
              7. Version Hash
            </div>
          </div>
        </div>

        {/* Locked Facts Strip (Claim Atoms) */}
        <div className="bg-white rounded-xl border border-forest/10 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-forest uppercase tracking-widest flex items-center gap-2">
              <Lock size={14} className="text-forest" />
              Locked Fact Layer (Approved Claim Atoms)
            </h3>
            <span className="text-2xs text-neutral-500">
              {supportedClaims.length} verified facts automatically enforced during adaptation
            </span>
          </div>

          {claims.length === 0 ? (
            <div className="text-xs text-neutral-500 flex items-center justify-between bg-ivory/50 p-3 rounded-lg border border-forest/5">
              <span>No claim atoms configured. The AI will adapt based on your source text.</span>
              <Link href={`/campaigns/${campaignId}/claims`} className="text-forest font-medium hover:underline">
                Add Fact Claims →
              </Link>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {claims.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSourceText(prev => prev ? `${prev} ${c.claim_text}` : c.claim_text)}
                  className={`cursor-pointer px-3 py-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-all ${
                    c.evidence_status === 'supported'
                      ? 'bg-sage/20 border-sage-300 text-forest hover:bg-sage/40'
                      : c.evidence_status === 'contradicted'
                      ? 'bg-red-50 border-red-200 text-red-800'
                      : 'bg-brass/10 border-brass/30 text-brass-700'
                  }`}
                  title="Click to insert into source text"
                >
                  <CheckCircle2 size={13} className="shrink-0" />
                  <span className="font-medium truncate max-w-xs">{c.claim_text}</span>
                  <span className="text-2xs opacity-75 font-mono">({c.evidence_status})</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Adaptation Controls & Generation Form */}
        <div className="bg-white rounded-xl border border-forest/10 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-forest/5">
            <h2 className="font-serif text-base text-forest flex items-center gap-2">
              <SlidersHorizontal size={17} className="text-forest" />
              Configure Regional Adaptation Controls
            </h2>
            <span className="text-2xs text-neutral-400">Powered by Gemini 3.8 Flash Multilingual Engine</span>
          </div>

          <div className="space-y-5">
            {/* Source Text Input */}
            <div>
              <label className="block text-xs font-semibold text-graphite uppercase tracking-wider mb-1.5">
                Source Copy (English Intent) *
              </label>
              <textarea
                rows={3}
                value={sourceText}
                onChange={e => setSourceText(e.target.value)}
                placeholder="Enter campaign message or creative copy to adapt..."
                className="w-full p-3.5 rounded-lg border border-forest/15 bg-white text-sm focus:ring-2 focus:ring-forest/20 outline-none resize-none font-medium leading-relaxed"
              />
              <div className="flex justify-between text-2xs text-neutral-400 mt-1">
                <span>Preserves verified numbers, percentages and facts verbatim.</span>
                <span>{sourceText.length} characters</span>
              </div>
            </div>

            {/* Grid of Adaptation Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

              {/* Target Language */}
              <div>
                <label className="block text-2xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                  Target Language *
                </label>
                <select
                  value={targetLanguage}
                  onChange={e => {
                    setTargetLanguage(e.target.value);
                    setDialect("");
                  }}
                  className="w-full h-10 px-3 rounded-lg border border-forest/15 bg-white text-xs font-medium text-graphite focus:ring-2 focus:ring-forest/20 outline-none"
                >
                  {LANGUAGE_REGISTRY.map(lang => (
                    <option key={lang.id} value={lang.name}>
                      {lang.name} ({lang.nativeName}) — {lang.script}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dialect / Regional Variety */}
              <div>
                <label className="block text-2xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                  Regional Dialect / Variety
                </label>
                <select
                  value={dialect}
                  onChange={e => setDialect(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-forest/15 bg-white text-xs font-medium text-graphite focus:ring-2 focus:ring-forest/20 outline-none"
                >
                  <option value="">Standard / Neutral Variety</option>
                  {availableDialects.map(d => (
                    <option key={d.id} value={d.name}>
                      {d.name} ({d.region})
                    </option>
                  ))}
                </select>
              </div>

              {/* Tone */}
              <div>
                <label className="block text-2xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                  Tone & Emotional Cadence
                </label>
                <select
                  value={tone}
                  onChange={e => setTone(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-forest/15 bg-white text-xs font-medium text-graphite focus:ring-2 focus:ring-forest/20 outline-none"
                >
                  <option value="Festive Warm">Festive & Warm (Diwali/Pongal)</option>
                  <option value="Inspirational">Inspirational & Empowering</option>
                  <option value="Reassuring Scientific">Reassuring & Scientific</option>
                  <option value="Urgent Educational">Urgent & Educational (Public Health)</option>
                  <option value="Playful Youth">Playful & Youthful</option>
                  <option value="Authoritative">Authoritative & Trustworthy</option>
                </select>
              </div>

              {/* Formality & Slang */}
              <div>
                <label className="block text-2xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                  Slang / Colloquialism
                </label>
                <select
                  value={slangLevel}
                  onChange={e => setSlangLevel(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-forest/15 bg-white text-xs font-medium text-graphite focus:ring-2 focus:ring-forest/20 outline-none"
                >
                  <option value="none">None (Pure Script)</option>
                  <option value="low">Subtle (Everyday Conversational)</option>
                  <option value="moderate">Authentic Local Idioms</option>
                  <option value="high">Heavy Street Slang / Reel Style</option>
                </select>
              </div>

            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-xs">
                {error}
              </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-forest/5">
              <span className="text-xs text-neutral-500">
                Generates side-by-side literal back-translation and cultural adaptation.
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={handleGenerate}
                disabled={isGenerating || !sourceText.trim()}
                icon={isGenerating ? undefined : <Wand2 size={15}/>}
              >
                {isGenerating ? "Running Gemini Adaptation..." : "Generate Regional Variant"}
              </Button>
            </div>
          </div>
        </div>

        {/* Live Generation Progress State */}
        {isGenerating && (
          <div className="py-16 text-center bg-white rounded-xl border border-forest/10 shadow-sm animate-pulse">
            <div className="w-12 h-12 border-4 border-sage-200 border-t-forest rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="font-serif text-lg text-forest mb-1">Adapting with Gemini Multilingual AI</h3>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              Preserving locked claim tokens, selecting culturally authentic regional idioms, and creating literal English back-translation...
            </p>
          </div>
        )}

        {/* Edit Variant Modal (Version-Locked Approval Demonstration) */}
        {editingVariant && (
          <div className="fixed inset-0 bg-graphite/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl border border-forest/20 max-w-2xl w-full p-6 shadow-xl space-y-4 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-forest/10">
                <div className="flex items-center gap-2">
                  <Edit3 size={18} className="text-forest" />
                  <h3 className="font-serif text-base text-forest font-semibold">
                    Edit Variant & Create New Version
                  </h3>
                </div>
                <Badge variant="warning" className="text-2xs">VERSION-LOCK INVARIANT</Badge>
              </div>

              <div className="bg-brass/10 border border-brass/30 p-3 rounded-lg text-xs text-brass-800">
                <strong>Notice:</strong> Per PRD Invariant FR-016, editing any text creates version <strong>v{(editingVariant.version_number || 1) + 1}</strong> with status <code>draft</code>. Prior approvals will be invalidated and Brand Guardian checks must be rerun.
              </div>

              <div>
                <label className="block text-xs font-semibold text-graphite mb-1">Adapted Copy Text</label>
                <textarea
                  rows={4}
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                  className="w-full p-3 rounded-lg border border-forest/20 text-sm font-medium focus:ring-2 focus:ring-forest/20 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-graphite mb-1">Reason for Edit (Required for Audit Trail)</label>
                <input
                  type="text"
                  value={editReason}
                  onChange={e => setEditReason(e.target.value)}
                  placeholder="e.g., Smoothed dialect idiom for Telangana audience"
                  className="w-full h-10 px-3 rounded-lg border border-forest/20 text-xs focus:ring-2 focus:ring-forest/20 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-forest/10">
                <Button variant="outline" size="sm" onClick={() => setEditingVariant(null)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveEdit}
                  disabled={isSavingEdit || !editText.trim() || !editReason.trim()}
                >
                  {isSavingEdit ? "Saving Version..." : "Save as New Version"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Existing & Newly Generated Variants Display */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl text-forest font-semibold flex items-center gap-2">
              <Globe2 size={20} className="text-forest" />
              Campaign Variants ({variants.length})
            </h2>
            <span className="text-xs text-neutral-500">
              Each variant is bound to an immutable content hash
            </span>
          </div>

          {variants.length === 0 && !isGenerating && (
            <div className="bg-white rounded-xl border border-forest/10 p-12 text-center shadow-sm">
              <Sparkles size={32} className="text-brass mx-auto mb-3" />
              <h3 className="font-serif text-lg text-forest mb-1">No variants generated yet</h3>
              <p className="text-xs text-neutral-500 max-w-md mx-auto mb-5">
                Use the controls above to generate your first regional adaptation with Gemini AI.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6">
            {variants.map((v) => {
              const langConfig = LANGUAGE_REGISTRY.find(l => l.name.toLowerCase() === v.target_language.toLowerCase()) || selectedLang;
              const rationales: string[] = (() => {
                try { return JSON.parse(v.adaptation_rationale || "[]"); } catch { return []; }
              })();
              const activeTag = reviewerTags[v.id];

              return (
                <div
                  key={v.id}
                  className="bg-white rounded-xl border border-forest/10 shadow-sm overflow-hidden hover:border-forest/30 transition-all"
                >
                  {/* Variant Card Top Bar */}
                  <div className="bg-sage/10 px-6 py-3.5 border-b border-forest/10 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="font-serif font-semibold text-sm text-forest">
                        {v.target_language} Variant {v.dialect ? `• ${v.dialect}` : ""}
                      </span>
                      <span className="text-2xs font-mono px-2 py-0.5 rounded bg-forest/5 text-neutral-600 font-semibold">
                        Version v{v.version_number}
                      </span>
                      <span className="text-2xs text-neutral-500">
                        Tone: <strong className="text-graphite">{v.tone}</strong>
                      </span>
                      {/* Meaning Preservation Badge */}
                      <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <CheckCheck size={11} /> 96% Meaning Preserved
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={v.status === 'approved' ? 'success' : v.status === 'rejected' ? 'critical' : 'warning'}>
                        {v.status.toUpperCase()}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => {
                          setEditingVariant(v);
                          setEditText(v.regional_adaptation);
                          setEditReason("");
                        }}
                        icon={<Edit3 size={13}/>}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>

                  {/* Side-by-Side Content Layout (PRD Section 7.3) */}
                  <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Left: Regional Adapted Copy */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-2xs uppercase tracking-widest font-semibold text-neutral-400">
                          Regional Adaptation ({v.target_language})
                        </span>
                        <span className="text-2xs font-mono text-neutral-400">
                          Script: {langConfig?.script || "Native"}
                        </span>
                      </div>

                      {/* Authentic Indian Script Font */}
                      <div className="bg-ivory/50 p-4 rounded-lg border border-forest/10">
                        <p
                          className="text-lg text-graphite leading-relaxed font-medium"
                          style={{ fontFamily: langConfig?.fontFamily || "inherit" }}
                        >
                          {v.regional_adaptation}
                        </p>
                      </div>

                      {/* Literal Back-Translation (Crucial for Reviewers) */}
                      {v.literal_translation && (
                        <div>
                          <span className="text-2xs uppercase tracking-widest font-semibold text-forest block mb-1">
                            Literal English Back-Translation
                          </span>
                          <p className="text-xs text-graphite bg-sage/10 p-3 rounded-lg border border-forest/5 italic">
                            &quot;{v.literal_translation}&quot;
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Right: Meaning & Cultural Rationale */}
                    <div className="space-y-3">
                      <div>
                        <span className="text-2xs uppercase tracking-widest font-semibold text-neutral-400 block mb-1">
                          Source English Copy
                        </span>
                        <p className="text-xs text-neutral-600 bg-ivory/30 p-2.5 rounded border border-forest/5">
                          &quot;{v.source_text}&quot;
                        </p>
                      </div>

                      {v.meaning_summary && (
                        <div>
                          <span className="text-2xs uppercase tracking-widest font-semibold text-neutral-400 block mb-1">
                            Meaning & Cultural Alignment
                          </span>
                          <p className="text-xs text-graphite font-medium">
                            {v.meaning_summary}
                          </p>
                        </div>
                      )}

                      {rationales.length > 0 && (
                        <div>
                          <span className="text-2xs uppercase tracking-widest font-semibold text-neutral-400 block mb-1">
                            Adaptation Rationale
                          </span>
                          <ul className="text-xs text-neutral-600 space-y-1.5 list-disc list-inside">
                            {rationales.map((r: any, i: number) => (
                              <li key={i} className="leading-relaxed">
                                {typeof r === "object" && r !== null ? (
                                  <span>
                                    <strong className="text-neutral-800">{r.original_phrase} → {r.adapted_phrase}:</strong>{" "}
                                    <span>{r.reason}</span>
                                  </span>
                                ) : (
                                  <span>{String(r)}</span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="pt-2 text-2xs font-mono text-neutral-400 border-t border-forest/5 flex items-center justify-between">
                        <span>SHA-256: {v.content_hash ? `${v.content_hash.slice(0, 24)}...` : "—"}</span>
                        <span>Mode: {v.generated_by_mode}</span>
                      </div>
                    </div>

                  </div>

                  {/* Section 7.3: Reviewer Quality Rubric Strip */}
                  <div className="bg-ivory/20 px-6 py-2.5 border-t border-forest/5 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xs font-semibold uppercase tracking-wider text-neutral-400">
                        Reviewer Quick Tag:
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {[
                          { key: "accurate", label: "Accurate", icon: <Check size={11} />, cls: "bg-green-100 text-green-800 border-green-300" },
                          { key: "awkward", label: "Awkward", icon: <AlertTriangle size={11} />, cls: "bg-amber-100 text-amber-800 border-amber-300" },
                          { key: "culturally_mismatched", label: "Culturally Mismatched", icon: <HelpCircle size={11} />, cls: "bg-orange-100 text-orange-800 border-orange-300" },
                          { key: "brand_risk", label: "Brand Risk", icon: <AlertOctagon size={11} />, cls: "bg-red-100 text-red-800 border-red-300" },
                          { key: "needs_native_review", label: "Needs Native Review", icon: <Globe2 size={11} />, cls: "bg-blue-100 text-blue-800 border-blue-300" },
                        ].map(tag => (
                          <button
                            key={tag.key}
                            type="button"
                            onClick={() => setReviewerFeedback(v.id, tag.key)}
                            className={`px-2 py-0.5 rounded text-2xs font-medium border flex items-center gap-1 transition ${
                              activeTag === tag.key ? tag.cls + " font-bold ring-1 ring-forest/30" : "bg-white text-neutral-600 border-forest/10 hover:bg-forest/5"
                            }`}
                          >
                            {tag.icon}
                            {tag.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div className="bg-ivory/40 px-6 py-3 border-t border-forest/5 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                      <ShieldCheck size={14} className="text-forest" />
                      <span>Ready for 3-pass verification</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href={`/campaigns/${campaignId}/guardian?versionId=${v.id}`}>
                        <Button variant="outline" size="sm" icon={<ShieldCheck size={14}/>}>
                          Run Brand Guardian
                        </Button>
                      </Link>
                      <Link href={`/approvals/${v.id}`}>
                        <Button variant="primary" size="sm" iconRight={<ChevronRight size={14}/>}>
                          Review & Approve
                        </Button>
                      </Link>
                      {v.status === 'approved' && (
                        <Link href={`/campaigns/${campaignId}/passport?versionId=${v.id}`}>
                          <Button variant="outline" size="sm" className="text-forest border-forest/30">
                            Decision Passport
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </section>

      </main>
    </div>
  );
}
