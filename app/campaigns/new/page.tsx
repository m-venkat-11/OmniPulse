"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createCampaign } from "@/app/actions";
import { getEnabledLanguages, TONE_OPTIONS } from "@/lib/languages/registry";

const LANGUAGES = getEnabledLanguages();

const CHANNEL_OPTIONS = [
  "Social Media", "YouTube", "Instagram Reels", "Short Video", "Display Ads",
  "Print", "Radio", "OTT / Streaming", "WhatsApp", "Email", "SMS",
];

export default function BriefBuilderPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [form, setForm] = useState({
    name: "",
    brandName: "",
    productName: "",
    objective: "",
    targetAudience: "",
    sourceLanguage: "en",
    targetLanguages: [] as string[],
    channels: [] as string[],
    keyMessage: "",
    callToAction: "",
    tone: "professional",
    schedule: "",
    approvedFacts: "",
    prohibitedClaims: "",
    requiredDisclaimers: "",
  });

  const updateForm = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: string, item: string) => {
    setForm(prev => {
      const arr = (prev as any)[field] as string[];
      return {
        ...prev,
        [field]: arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item],
      };
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");
    try {
      const result = await createCampaign(form);
      router.push(`/campaigns/${result.campaignId}`);
    } catch (err: any) {
      setError(err.message || "Failed to create campaign");
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return form.name.trim() && form.brandName.trim() && form.productName.trim() && form.objective.trim();
    if (step === 2) return form.targetLanguages.length > 0 && form.keyMessage.trim();
    return true;
  };

  return (
    <div className="min-h-screen bg-[#0E1217] p-3 sm:p-5 lg:p-7 flex flex-col items-center">
      <div className="w-full max-w-5xl space-y-4">

        {/* Top Header inside dark frame */}
        <header className="flex items-center justify-between text-white px-2 py-1">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition">
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="font-serif text-lg font-bold text-white">Create Campaign Brief</h1>
              <p className="text-3xs font-mono text-white/50 uppercase tracking-wider">Step {step} of 3 • User-Input Driven</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-4 py-1.5 rounded-full text-xs font-bold bg-white/10 text-white hover:bg-white/20 transition"
              >
                Back
              </button>
            )}
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="px-5 py-1.5 rounded-full text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-[#0E1217] transition flex items-center gap-1.5 disabled:opacity-50"
              >
                Next Step
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !canProceed()}
                className="px-5 py-1.5 rounded-full text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-[#0E1217] transition flex items-center gap-1.5 disabled:opacity-50 shadow-md shadow-emerald-500/20"
              >
                {isSubmitting ? "Extracting Claims..." : "Create Campaign"}
                {!isSubmitting && <Sparkles size={14} />}
              </button>
            )}
          </div>
        </header>

        {/* Inner Canvas Card */}
        <div className="bg-[#FFFDF9] rounded-[28px] shadow-2xl p-6 sm:p-8 lg:p-10 border border-white/20 min-h-[500px]">

          {/* Progress bar */}
          <div className="w-full bg-neutral-100 rounded-full h-2 mb-8 overflow-hidden">
            <div
              className="h-2 bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 rounded-full"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 text-xs text-red-800">
              {error}
            </div>
          )}

      <main className="max-w-3xl mx-auto mt-10 px-6">
        {/* Step 1: Campaign Details */}
        {step === 1 && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <h2 className="text-xl font-serif text-forest font-semibold mb-1">Campaign Details</h2>
              <p className="text-sm text-neutral-500 mb-6">Define the brand, product, and campaign objective.</p>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-graphite mb-1.5">Campaign Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => updateForm("name", e.target.value)}
                    placeholder="e.g., Diwali Family Pack Launch"
                    className="w-full h-11 px-4 rounded-lg border border-forest/15 bg-white text-sm focus:ring-2 focus:ring-forest/30 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-graphite mb-1.5">Brand Name *</label>
                    <input
                      type="text"
                      value={form.brandName}
                      onChange={e => updateForm("brandName", e.target.value)}
                      placeholder="e.g., ManaFresh"
                      className="w-full h-11 px-4 rounded-lg border border-forest/15 bg-white text-sm focus:ring-2 focus:ring-forest/30 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-graphite mb-1.5">Product Name *</label>
                    <input
                      type="text"
                      value={form.productName}
                      onChange={e => updateForm("productName", e.target.value)}
                      placeholder="e.g., ManaFresh Fruit Drink"
                      className="w-full h-11 px-4 rounded-lg border border-forest/15 bg-white text-sm focus:ring-2 focus:ring-forest/30 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-graphite mb-1.5">Campaign Objective & Target Audience *</label>
                  <textarea
                    rows={4}
                    value={form.objective}
                    onChange={e => updateForm("objective", e.target.value)}
                    placeholder="Describe what you want to achieve and who you're targeting..."
                    className="w-full p-4 rounded-lg border border-forest/15 bg-white text-sm focus:ring-2 focus:ring-forest/30 outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-graphite mb-1.5">Target Audience Description</label>
                  <input
                    type="text"
                    value={form.targetAudience}
                    onChange={e => updateForm("targetAudience", e.target.value)}
                    placeholder="e.g., Young adults 18-35 in urban Telangana"
                    className="w-full h-11 px-4 rounded-lg border border-forest/15 bg-white text-sm focus:ring-2 focus:ring-forest/30 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-graphite mb-1.5">Schedule</label>
                  <input
                    type="text"
                    value={form.schedule}
                    onChange={e => updateForm("schedule", e.target.value)}
                    placeholder="e.g., Oct 15 – Nov 15, 2026"
                    className="w-full h-11 px-4 rounded-lg border border-forest/15 bg-white text-sm focus:ring-2 focus:ring-forest/30 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Languages, Channels & Messaging */}
        {step === 2 && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <h2 className="text-xl font-serif text-forest font-semibold mb-1">Languages & Messaging</h2>
              <p className="text-sm text-neutral-500 mb-6">Choose your source and target languages, key message, and channels.</p>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-graphite mb-1.5">Source Language</label>
                    <select
                      value={form.sourceLanguage}
                      onChange={e => updateForm("sourceLanguage", e.target.value)}
                      className="w-full h-11 px-4 rounded-lg border border-forest/15 bg-white text-sm focus:ring-2 focus:ring-forest/30 outline-none"
                    >
                      {LANGUAGES.map(l => (
                        <option key={l.id} value={l.id}>{l.name} ({l.nativeName})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-graphite mb-1.5">Tone</label>
                    <select
                      value={form.tone}
                      onChange={e => updateForm("tone", e.target.value)}
                      className="w-full h-11 px-4 rounded-lg border border-forest/15 bg-white text-sm focus:ring-2 focus:ring-forest/30 outline-none"
                    >
                      {TONE_OPTIONS.map(t => (
                        <option key={t.id} value={t.id}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-graphite mb-2">Target Languages * (select one or more)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {LANGUAGES.filter(l => l.id !== form.sourceLanguage).map(l => (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => toggleArrayItem("targetLanguages", l.id)}
                        className={`px-3 py-2.5 rounded-lg border text-sm text-left transition-colors ${
                          form.targetLanguages.includes(l.id)
                            ? "bg-forest text-ivory border-forest"
                            : "bg-white text-graphite border-forest/15 hover:border-forest/30"
                        }`}
                      >
                        <span className="font-medium">{l.name}</span>
                        <span className="block text-xs opacity-70">{l.nativeName}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-graphite mb-2">Channels</label>
                  <div className="flex flex-wrap gap-2">
                    {CHANNEL_OPTIONS.map(ch => (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => toggleArrayItem("channels", ch)}
                        className={`px-3 py-1.5 rounded-full border text-xs transition-colors ${
                          form.channels.includes(ch)
                            ? "bg-forest text-ivory border-forest"
                            : "bg-white text-graphite border-forest/15 hover:border-forest/30"
                        }`}
                      >
                        {ch}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-graphite mb-1.5">Key Campaign Message *</label>
                  <textarea
                    rows={3}
                    value={form.keyMessage}
                    onChange={e => updateForm("keyMessage", e.target.value)}
                    placeholder="The core message of your campaign that must be preserved across all languages..."
                    className="w-full p-4 rounded-lg border border-forest/15 bg-white text-sm focus:ring-2 focus:ring-forest/30 outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-graphite mb-1.5">Call to Action</label>
                  <input
                    type="text"
                    value={form.callToAction}
                    onChange={e => updateForm("callToAction", e.target.value)}
                    placeholder="e.g., Try the new family pack today!"
                    className="w-full h-11 px-4 rounded-lg border border-forest/15 bg-white text-sm focus:ring-2 focus:ring-forest/30 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Brand Facts & Compliance */}
        {step === 3 && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <h2 className="text-xl font-serif text-forest font-semibold mb-1">Brand Facts & Compliance</h2>
              <p className="text-sm text-neutral-500 mb-6">
                Define the approved product facts, prohibited claims, and required disclaimers. The AI will extract structured Claim Atoms from your approved facts.
              </p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-graphite mb-1.5">
                    Approved Product Facts & Evidence
                  </label>
                  <p className="text-xs text-neutral-400 mb-2">
                    List all verified product facts. One per line. The AI will extract factual claims and lock their critical tokens.
                  </p>
                  <textarea
                    rows={6}
                    value={form.approvedFacts}
                    onChange={e => updateForm("approvedFacts", e.target.value)}
                    placeholder={`e.g.,\nProvides 100% of daily iron needs when consumed with milk\nMade from 100% natural fruit extracts\nAvailable in 3 pack sizes: 200ml, 500ml, 1L\nPrice: ₹45 for 200ml pack`}
                    className="w-full p-4 rounded-lg border border-forest/15 bg-white text-sm focus:ring-2 focus:ring-forest/30 outline-none resize-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-graphite mb-1.5">Prohibited Claims</label>
                  <textarea
                    rows={3}
                    value={form.prohibitedClaims}
                    onChange={e => updateForm("prohibitedClaims", e.target.value)}
                    placeholder={`e.g.,\nDo not claim weight loss benefits\nDo not claim medical/curative properties\nDo not use "best in India" without substantiation`}
                    className="w-full p-4 rounded-lg border border-forest/15 bg-white text-sm focus:ring-2 focus:ring-forest/30 outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-graphite mb-1.5">Required Disclaimers</label>
                  <textarea
                    rows={2}
                    value={form.requiredDisclaimers}
                    onChange={e => updateForm("requiredDisclaimers", e.target.value)}
                    placeholder="e.g., Must include #Ad disclosure for sponsored content"
                    className="w-full p-4 rounded-lg border border-forest/15 bg-white text-sm focus:ring-2 focus:ring-forest/30 outline-none resize-none"
                  />
                </div>

                <div className="bg-sage/20 border border-sage-300 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-forest mb-1 flex items-center gap-2">
                    <Sparkles size={16} /> What happens next?
                  </h4>
                  <p className="text-xs text-neutral-700">
                    When you create this campaign, Gemini AI will automatically extract Claim Atoms from your approved facts. You&apos;ll be able to review, edit, and approve each claim before generating regional adaptations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
        </div>
      </div>
    </div>
  );
}
