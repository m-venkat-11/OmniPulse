import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Globe2, Sparkles, ShieldCheck, Users, BarChart3, ArrowRight,
  CheckCircle2, Play, Upload, UserCheck, TrendingUp, Layers,
  Eye, Lock, AlertCircle, Zap
} from "lucide-react";

/* ── Stat card ───────────────────────────────────── */
function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center p-5 rounded-lg bg-white/60 border border-forest/8">
      <div className="font-serif text-3xl font-semibold text-forest mb-1">{value}</div>
      <div className="text-xs text-neutral-500 uppercase tracking-wide">{label}</div>
    </div>
  );
}

/* ── Feature card ────────────────────────────────── */
function FeatureCard({
  icon,
  title,
  description,
  tag,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  tag?: string;
}) {
  return (
    <div className="group p-6 rounded-xl border border-forest/8 bg-white hover:shadow-editorial-lg transition-all duration-300 hover:-translate-y-1">
      <div className="w-10 h-10 rounded-lg bg-forest/5 flex items-center justify-center mb-4 group-hover:bg-forest/10 transition-colors">
        <span className="text-forest">{icon}</span>
      </div>
      {tag && <span className="tag-editorial mb-3">{tag}</span>}
      <h3 className="font-serif text-lg font-semibold text-forest mb-2">{title}</h3>
      <p className="text-sm text-neutral-500 leading-relaxed">{description}</p>
    </div>
  );
}

/* ── Path card ───────────────────────────────────── */
function PathCard({
  number,
  icon,
  title,
  description,
  bullets,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  bullets: string[];
}) {
  return (
    <div className="relative p-7 rounded-2xl border border-forest/10 bg-white shadow-editorial hover:shadow-editorial-lg transition-all duration-300 group">
      <div className="absolute top-5 right-5 font-serif text-5xl font-bold text-forest/5 leading-none select-none">
        {number}
      </div>
      <div className="w-11 h-11 rounded-xl bg-forest flex items-center justify-center mb-5 group-hover:bg-forest-700 transition-colors">
        <span className="text-ivory">{icon}</span>
      </div>
      <h3 className="font-serif text-xl font-semibold text-forest mb-2">{title}</h3>
      <p className="text-sm text-neutral-500 mb-5 leading-relaxed">{description}</p>
      <ul className="space-y-2">
        {bullets.map((b, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-graphite/70">
            <CheckCircle2 size={14} className="text-brass mt-0.5 shrink-0" />
            {b}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Step ────────────────────────────────────────── */
function WorkflowStep({
  step,
  title,
  description,
  isLast,
}: {
  step: number;
  title: string;
  description: string;
  isLast?: boolean;
}) {
  return (
    <div className="flex gap-5">
      <div className="flex flex-col items-center">
        <div className="w-9 h-9 rounded-full border-2 border-brass bg-ivory flex items-center justify-center shrink-0">
          <span className="font-serif text-sm font-bold text-brass">{step}</span>
        </div>
        {!isLast && <div className="w-px flex-1 bg-gradient-to-b from-brass/30 to-transparent mt-2" />}
      </div>
      <div className="pb-10">
        <h4 className="font-sans font-semibold text-forest mb-1">{title}</h4>
        <p className="text-sm text-neutral-500 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

import React from "react";
import { LazySphere } from "@/components/three/LazySphere";

/* ── LANDING PAGE ────────────────────────────────── */
export default function LandingPage() {
  return (
    <main>
      {/* ── HERO ────────────────────────────────────── */}
      <section
        id="hero"
        className="relative min-h-screen flex items-center overflow-hidden bg-ivory"
        aria-labelledby="hero-headline"
      >
        {/* Subtle background texture */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-2/3 h-2/3 bg-gradient-to-bl from-sage/30 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-brass/5 via-transparent to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-28 pb-20 grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: copy */}
          <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <div className="tag-editorial mb-6">
              <Globe2 size={11} />
              AI-Assisted Regional Intelligence
            </div>

            <h1
              id="hero-headline"
              className="font-serif text-5xl lg:text-display-md font-semibold text-forest leading-tight text-balance mb-6"
            >
              Every market has its{" "}
              <span className="italic text-gradient-brass">own language.</span>
            </h1>

            <p className="text-lg text-graphite/65 leading-relaxed mb-8 max-w-lg text-balance">
              Create, adapt and measure campaigns built for regional audiences—with
              AI-assisted creativity, brand safeguards and human judgement.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-12">
              <Link href="#platform">
                <Button
                  variant="primary"
                  size="lg"
                  iconRight={<ArrowRight size={16} />}
                >
                  Explore the platform
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button
                  variant="outline"
                  size="lg"
                  icon={<Play size={14} className="fill-forest/60" />}
                >
                  See how it works
                </Button>
              </Link>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              <StatCard value="22+" label="Indian languages" />
              <StatCard value="3" label="Campaign paths" />
              <StatCard value="100%" label="Human reviewed" />
            </div>
          </div>

          {/* Right: 3D Sphere */}
          <div
            className="relative flex items-center justify-center animate-fade-in"
            style={{ animationDelay: "0.3s" }}
            aria-hidden="true"
          >
            {/* Halo ring */}
            <div className="absolute w-[420px] h-[420px] rounded-full border border-brass/15 animate-spin-slow" />
            <div className="absolute w-[360px] h-[360px] rounded-full border border-forest/8" />
            <LazySphere size={440} interactive className="w-[440px] h-[440px] max-w-full" />

            {/* Floating label chips */}
            <div className="absolute top-8 left-4 bg-white rounded-lg px-3 py-2 shadow-editorial border border-forest/8 flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-forest font-medium">తెలుగు campaign live</span>
            </div>
            <div className="absolute bottom-8 right-4 bg-white rounded-lg px-3 py-2 shadow-editorial border border-forest/8 flex items-center gap-2 text-xs">
              <ShieldCheck size={12} className="text-brass" />
              <span className="text-forest font-medium">Brand safety: Passed</span>
            </div>
            <div className="absolute top-1/2 right-0 bg-forest text-ivory rounded-lg px-3 py-2 shadow-editorial text-xs font-medium">
              Tamil variant ready
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <span className="text-2xs uppercase tracking-widest text-graphite">Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-graphite/30 to-transparent" />
        </div>
      </section>

      {/* Divider */}
      <div className="divider-editorial mx-8 lg:mx-24" />

      {/* ── CHALLENGE SECTION ───────────────────────── */}
      <section
        id="challenge"
        className="section-padding bg-ivory"
        aria-labelledby="challenge-headline"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="tag-editorial mb-5">
                <AlertCircle size={11} />
                The challenge
              </div>
              <h2
                id="challenge-headline"
                className="font-serif text-display-sm font-semibold text-forest text-balance mb-6"
              >
                Regional marketing is harder than it looks.
              </h2>
              <p className="text-neutral-500 leading-relaxed mb-6">
                India has 22 scheduled languages and hundreds of regional dialects. A campaign
                that resonates in Mumbai may fall flat in Chennai or Hyderabad—not because of
                poor translation, but because effective regional marketing requires deep
                cultural context, trusted creators and rigorous brand safeguards.
              </p>
              <ul className="space-y-4">
                {[
                  "Literal translation loses cultural meaning",
                  "Regional creators are hard to discover and vet",
                  "Brand compliance becomes inconsistent across markets",
                  "Campaign performance is difficult to attribute by region",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-graphite/70">
                    <span className="w-5 h-5 rounded-full bg-brass/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-brass" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Visual: language grid */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { script: "తెలుగు", lang: "Telugu", state: "Andhra · Telangana" },
                { script: "தமிழ்", lang: "Tamil", state: "Tamil Nadu" },
                { script: "ಕನ್ನಡ", lang: "Kannada", state: "Karnataka" },
                { script: "मराठी", lang: "Marathi", state: "Maharashtra" },
                { script: "বাংলা", lang: "Bengali", state: "West Bengal" },
                { script: "ਪੰਜਾਬੀ", lang: "Punjabi", state: "Punjab" },
              ].map((l) => (
                <div
                  key={l.lang}
                  className="p-4 rounded-xl border border-forest/8 bg-white hover:border-brass/30 hover:shadow-editorial transition-all duration-200 text-center"
                >
                  <div className="font-serif text-2xl text-forest mb-1">{l.script}</div>
                  <div className="text-xs font-semibold text-graphite">{l.lang}</div>
                  <div className="text-2xs text-neutral-400 mt-0.5">{l.state}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PLATFORM SECTION ────────────────────────── */}
      <section id="platform" className="section-padding bg-sage/30" aria-labelledby="platform-headline">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="tag-editorial mb-5 mx-auto w-fit">
              <Layers size={11} />
              Platform overview
            </div>
            <h2
              id="platform-headline"
              className="font-serif text-display-sm font-semibold text-forest text-balance mb-4"
            >
              Three paths. One intelligent workflow.
            </h2>
            <p className="text-neutral-500 max-w-xl mx-auto leading-relaxed">
              Whether you&apos;re starting from a brief, adapting an existing ad or launching an
              influencer campaign—every path leads to the same rigorous review and approval process.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <PathCard
              number="A"
              icon={<Sparkles size={20} />}
              title="Create an advertisement"
              description="Start from a brief. Generate regional concepts, scripts and copy for any language and audience."
              bullets={[
                "AI-assisted concept generation",
                "Telugu & Tamil copy variants",
                "Storyboard and script output",
                "Brand-rule validated output",
              ]}
            />
            <PathCard
              number="B"
              icon={<Upload size={20} />}
              title="Adapt an existing ad"
              description="Upload your current creative. Analyse and adapt it for new regions, languages and platforms."
              bullets={[
                "Secure video upload",
                "Speech and text analysis",
                "Regional adaptation suggestions",
                "Side-by-side comparison",
              ]}
            />
            <PathCard
              number="C"
              icon={<Users size={20} />}
              title="Influencer campaign"
              description="Find and brief regional creators with transparent matching and rigorous collaboration tools."
              bullets={[
                "Creator directory with criteria",
                "Transparent match explanations",
                "Automated brief generator",
                "Draft-to-approval workflow",
              ]}
            />
          </div>
        </div>
      </section>

      {/* ── REGIONAL ADAPTATION ─────────────────────── */}
      <section id="solutions" className="section-padding bg-ivory" aria-labelledby="adaptation-headline">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Visual */}
            <div className="space-y-3">
              {[
                {
                  lang: "Original (English)",
                  text: "Discover the richness of authentic Indian spices.",
                  tag: "Source",
                  tagVariant: "neutral" as const,
                },
                {
                  lang: "Telugu adaptation",
                  text: "నిజమైన భారతీయ సుగంధ ద్రవ్యాల సమృద్ధిని అనుభవించండి.",
                  tag: "Regional",
                  tagVariant: "forest" as const,
                },
                {
                  lang: "Tamil adaptation",
                  text: "உண்மையான இந்திய மசாலாவின் செழுமையை அனுபவியுங்கள்.",
                  tag: "Regional",
                  tagVariant: "forest" as const,
                },
              ].map((v) => (
                <div
                  key={v.lang}
                  className="p-5 rounded-xl border border-forest/8 bg-white shadow-editorial"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
                      {v.lang}
                    </span>
                    <Badge variant={v.tagVariant}>{v.tag}</Badge>
                  </div>
                  <p className="text-sm text-graphite font-medium leading-relaxed">{v.text}</p>
                </div>
              ))}

              {/* Adaptation note */}
              <div className="p-4 rounded-xl bg-forest/5 border border-forest/10">
                <div className="flex items-start gap-2.5">
                  <Eye size={14} className="text-brass shrink-0 mt-0.5" />
                  <p className="text-xs text-graphite/60 leading-relaxed">
                    <strong className="text-forest">Adaptation note:</strong> Telugu and Tamil versions
                    use culturally relevant phrasing—&quot;experience the richness&quot; captures the
                    immersive register preferred in southern market food advertising.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="tag-editorial mb-5">
                <Globe2 size={11} />
                Regional adaptation
              </div>
              <h2
                id="adaptation-headline"
                className="font-serif text-display-sm font-semibold text-forest text-balance mb-6"
              >
                Beyond translation. True cultural adaptation.
              </h2>
              <p className="text-neutral-500 leading-relaxed mb-8">
                Our AI regional content engine adapts campaigns to local context, idiom and
                audience sensibilities—not just language. Every adaptation includes a traceable
                explanation of the creative decisions made.
              </p>
              <ul className="space-y-4">
                {[
                  "Culturally contextualised copy and hooks",
                  "Traceable inputs and model provenance",
                  "Explanation of every adaptation decision",
                  "Human review flag for sensitive or ambiguous content",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-graphite/70">
                    <CheckCircle2 size={15} className="text-brass shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── BRAND SAFETY ────────────────────────────── */}
      <section className="section-padding bg-forest text-ivory relative overflow-hidden" aria-labelledby="safety-headline">
        <div className="absolute inset-0 pointer-events-none opacity-5">
          <div className="absolute top-10 right-10 w-72 h-72 rounded-full border border-ivory/20" />
          <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full border border-ivory/15" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 text-2xs font-medium uppercase tracking-widest text-brass/80 border border-brass/25 rounded-full px-3 py-1 mb-6">
                <ShieldCheck size={10} />
                Brand safety &amp; human review
              </div>
              <h2
                id="safety-headline"
                className="font-serif text-display-sm font-semibold text-ivory text-balance mb-6"
              >
                AI drafts. Humans approve.
              </h2>
              <p className="text-ivory/60 leading-relaxed mb-8">
                Every generated creative goes through our brand-safety engine before reaching
                the human approval queue. Unsupported claims are flagged with specific rule
                references, severity levels and suggested corrections.
              </p>
              <p className="text-xs text-ivory/35 italic mb-8">
                Automated brand-safety checks are not legal certification. All assets require
                authorised human review before publication.
              </p>
              <Link href="/sign-up">
                <Button variant="brass" size="lg" iconRight={<ArrowRight size={16} />}>
                  Start reviewing
                </Button>
              </Link>
            </div>

            {/* Safety finding card */}
            <div className="space-y-3">
              <div className="p-5 rounded-xl bg-red-950/30 border border-red-500/25">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400 shrink-0" />
                  <span className="text-xs font-semibold text-red-300 uppercase tracking-wide">
                    Failed — Unsupported claim
                  </span>
                </div>
                <p className="text-sm text-ivory/80 font-medium mb-2">
                  &ldquo;Guaranteed 100% results in 7 days&rdquo;
                </p>
                <p className="text-xs text-ivory/45 leading-relaxed">
                  Rule: No unsubstantiated performance guarantees. This claim is not supported by
                  approved product facts. Suggested fix: Remove guarantee language or cite
                  a validated study.
                </p>
              </div>
              <div className="p-5 rounded-xl bg-amber-950/20 border border-amber-500/20">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                  <span className="text-xs font-semibold text-amber-300 uppercase tracking-wide">
                    Warning — Needs review
                  </span>
                </div>
                <p className="text-xs text-ivory/45">
                  Disclosure required: Post must include &ldquo;#Ad&rdquo; or equivalent per platform guidelines.
                </p>
              </div>
              <div className="p-5 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
                  <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wide">
                    Passed
                  </span>
                </div>
                <p className="text-xs text-ivory/45">
                  Brand voice: On-brand. Approved terminology used throughout. No prohibited phrases found.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CREATORS ────────────────────────────────── */}
      <section className="section-padding bg-ivory" aria-labelledby="creators-headline">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="tag-editorial mb-5 mx-auto w-fit">
              <UserCheck size={11} />
              Creator matching
            </div>
            <h2
              id="creators-headline"
              className="font-serif text-display-sm font-semibold text-forest text-balance mb-4"
            >
              Transparent creator matching.
            </h2>
            <p className="text-neutral-500 max-w-xl mx-auto">
              See exactly why a creator was matched to your campaign—region, language, category
              and audience relevance—all explained, not hidden.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                name: "Priya Anand",
                handle: "@priya.stories",
                lang: "Telugu",
                category: "Food & Lifestyle",
                region: "Hyderabad",
                match: "High match",
                matchColor: "success" as const,
                reason: "Language: Telugu ✓  Category: Food ✓  Region: Telangana ✓",
              },
              {
                name: "Karthik Rajan",
                handle: "@karthik.home",
                lang: "Tamil",
                category: "Home & Kitchen",
                region: "Chennai",
                match: "High match",
                matchColor: "success" as const,
                reason: "Language: Tamil ✓  Category: Kitchen ✓  Region: Tamil Nadu ✓",
              },
              {
                name: "Deepika Nair",
                handle: "@deepika.eats",
                lang: "Malayalam",
                category: "Food",
                region: "Kochi",
                match: "Partial match",
                matchColor: "warning" as const,
                reason: "Language: Malayalam ~  Category: Food ✓  Region: Kerala ✓",
              },
            ].map((c) => (
              <div
                key={c.name}
                className="p-6 rounded-xl border border-forest/8 bg-white shadow-editorial hover:shadow-editorial-lg transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="font-semibold text-forest text-sm">{c.name}</div>
                    <div className="text-xs text-neutral-400 mt-0.5">{c.handle}</div>
                  </div>
                  <Badge variant={c.matchColor} dot>{c.match}</Badge>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  <Badge variant="forest">{c.lang}</Badge>
                  <Badge variant="sage">{c.category}</Badge>
                  <Badge variant="neutral">{c.region}</Badge>
                </div>
                <div className="p-3 rounded-lg bg-sage/40 border border-sage-200">
                  <p className="text-2xs text-forest/70 font-medium uppercase tracking-wide mb-1">Match explanation</p>
                  <p className="text-xs text-graphite/60">{c.reason}</p>
                </div>
                <p className="text-2xs text-neutral-400 mt-3 italic">
                  Sample data — demo profile only
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ANALYTICS ───────────────────────────────── */}
      <section className="section-padding bg-sage/30" aria-labelledby="analytics-headline">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="tag-editorial mb-5">
                <BarChart3 size={11} />
                Campaign analytics
              </div>
              <h2
                id="analytics-headline"
                className="font-serif text-display-sm font-semibold text-forest text-balance mb-6"
              >
                Metrics you can trust. Predictions you can question.
              </h2>
              <p className="text-neutral-500 leading-relaxed mb-8">
                Our analytics dashboard keeps observed, simulated and predicted metrics clearly
                separated. No fabricated performance data. No false guarantees. Only honest
                measurement with uncertainty ranges shown.
              </p>
              <ul className="space-y-3">
                {[
                  { label: "Observed results", color: "bg-forest", desc: "Actual recorded data" },
                  { label: "Simulated demo", color: "bg-brass", desc: "Labelled sample for demonstration" },
                  { label: "Predicted (±range)", color: "bg-sage-300", desc: "AI forecast with uncertainty" },
                ].map((item) => (
                  <li key={item.label} className="flex items-center gap-3 text-sm">
                    <span className={`w-3 h-3 rounded-sm ${item.color} shrink-0`} />
                    <span className="font-medium text-forest">{item.label}</span>
                    <span className="text-neutral-400 text-xs">— {item.desc}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mock analytics widget */}
            <div className="bg-white rounded-2xl border border-forest/8 shadow-editorial p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-serif font-semibold text-forest text-sm">Campaign performance</h3>
                <Badge variant="demo">Sample data</Badge>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { metric: "Impressions", a: "48,200", b: "51,400" },
                  { metric: "CTR", a: "2.4%", b: "3.1%" },
                  { metric: "Conversions", a: "112", b: "148" },
                ].map((m) => (
                  <div key={m.metric} className="text-center p-3 rounded-lg bg-sage/30">
                    <div className="text-2xs text-neutral-400 uppercase tracking-wide mb-2">{m.metric}</div>
                    <div className="text-xs font-semibold text-forest mb-0.5">Variant A: {m.a}</div>
                    <div className="text-xs font-semibold text-brass">Variant B: {m.b}</div>
                  </div>
                ))}
              </div>
              {/* Bar chart visual */}
              <div className="space-y-2">
                {[
                  { label: "Telugu (A)", val: 60, color: "bg-forest" },
                  { label: "Tamil (B)", val: 80, color: "bg-brass" },
                  { label: "Predicted (±12%)", val: 70, color: "bg-sage-300" },
                ].map((b) => (
                  <div key={b.label} className="flex items-center gap-3">
                    <span className="text-xs text-neutral-500 w-32 text-right shrink-0">{b.label}</span>
                    <div className="flex-1 h-5 rounded bg-neutral-100 overflow-hidden">
                      <div
                        className={`h-full ${b.color} rounded transition-all duration-700`}
                        style={{ width: `${b.val}%` }}
                      />
                    </div>
                    <span className="text-xs text-neutral-400 w-8">{b.val}%</span>
                  </div>
                ))}
              </div>
              <p className="text-2xs text-neutral-400 mt-4 italic">
                Simulated demo data. Observed and predicted metrics are clearly separated in the full dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── RESPONSIBLE AI ──────────────────────────── */}
      <section className="section-padding bg-ivory" aria-labelledby="responsible-headline">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="tag-editorial mb-5 mx-auto w-fit">
              <Lock size={11} />
              Responsible AI &amp; privacy
            </div>
            <h2
              id="responsible-headline"
              className="font-serif text-display-sm font-semibold text-forest text-balance mb-4"
            >
              Trust built into every step.
            </h2>
            <p className="text-neutral-500 max-w-xl mx-auto">
              AI outputs are always drafts. Humans make the final call. Every sensitive decision
              has an audit trail.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: <ShieldCheck size={18} />,
                title: "Human approval gate",
                desc: "No asset is published without an authorised reviewer approving it.",
              },
              {
                icon: <Eye size={18} />,
                title: "Full audit trail",
                desc: "Every decision, edit and approval is timestamped and attributed.",
              },
              {
                icon: <Lock size={18} />,
                title: "Private by design",
                desc: "Identity documents and sensitive files stay out of public storage.",
              },
              {
                icon: <Zap size={18} />,
                title: "Honest uncertainty",
                desc: "Predictions show confidence ranges. We never fabricate performance data.",
              },
            ].map((f) => (
              <FeatureCard
                key={f.title}
                icon={f.icon}
                title={f.title}
                description={f.desc}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────── */}
      <section id="how-it-works" className="section-padding bg-sage/20" aria-labelledby="hiw-headline">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <div className="tag-editorial mb-5">
                <TrendingUp size={11} />
                How it works
              </div>
              <h2
                id="hiw-headline"
                className="font-serif text-display-sm font-semibold text-forest text-balance mb-8"
              >
                From brief to regional campaign in one workflow.
              </h2>
              <div className="space-y-0">
                {[
                  { title: "Create your brief", desc: "Define your campaign, audience, region and language objectives." },
                  { title: "Generate regional variants", desc: "AI adapts your creative for Telugu, Tamil and other markets with explained decisions." },
                  { title: "Brand-safety check", desc: "Unsupported claims are flagged automatically with rule references and suggested fixes." },
                  { title: "Human review", desc: "Authorised reviewers approve, request changes or reject each creative version." },
                  { title: "Publish and measure", desc: "Track performance with clearly separated observed, simulated and predicted metrics." },
                ].map((s, i, arr) => (
                  <WorkflowStep
                    key={s.title}
                    step={i + 1}
                    title={s.title}
                    description={s.desc}
                    isLast={i === arr.length - 1}
                  />
                ))}
              </div>
            </div>

            {/* Right side: feature grid */}
            <div className="grid grid-cols-2 gap-4 content-start">
              {[
                { icon: <Sparkles size={16} />, title: "AI content generation", tag: "Demo adapter included" },
                { icon: <ShieldCheck size={16} />, title: "Brand-safety engine", tag: "Rules configurable" },
                { icon: <Users size={16} />, title: "Creator directory", tag: "Sample profiles" },
                { icon: <Globe2 size={16} />, title: "Regional adaptation", tag: "Telugu · Tamil · more" },
                { icon: <BarChart3 size={16} />, title: "Analytics dashboard", tag: "Obs · Sim · Pred" },
                { icon: <Lock size={16} />, title: "Secure verification", tag: "Demo / pending state" },
              ].map((f) => (
                <div
                  key={f.title}
                  className="p-5 rounded-xl border border-forest/8 bg-white shadow-editorial hover:shadow-editorial-lg transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-lg bg-forest/5 flex items-center justify-center text-forest mb-3">
                    {f.icon}
                  </div>
                  <div className="font-semibold text-sm text-forest mb-1">{f.title}</div>
                  <span className="tag-editorial text-2xs">{f.tag}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────── */}
      <section className="section-padding bg-forest relative overflow-hidden" aria-labelledby="cta-headline">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-forest via-forest-800 to-forest-900" />
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full border border-brass/10" />
          <div className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full border border-ivory/5" />
        </div>
        <div className="relative max-w-3xl mx-auto px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-1.5 text-2xs font-medium uppercase tracking-widest text-brass/70 border border-brass/20 rounded-full px-3 py-1 mb-8">
            <Sparkles size={10} />
            Enterprise Platform
          </div>
          <h2
            id="cta-headline"
            className="font-serif text-display-sm font-semibold text-ivory text-balance mb-6"
          >
            Ready to see Braco OmniPulse in action?
          </h2>
          <p className="text-ivory/60 mb-10 max-w-lg mx-auto leading-relaxed">
            Sign in with the workspace to explore the full campaign workflow—from brief to
            regional adaptation, brand-safety review and human approval.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up">
              <Button variant="brass" size="xl" iconRight={<ArrowRight size={18} />}>
                Get started free
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button
                variant="ghost"
                size="xl"
                className="text-ivory/80 hover:text-ivory hover:bg-ivory/10 border border-ivory/15 hover:border-ivory/25"
              >
                Sign In
              </Button>
            </Link>
          </div>
          <p className="text-xs text-ivory/30 mt-8">
            No paid accounts required. All data is sample data.
          </p>
        </div>
      </section>
    </main>
  );
}
