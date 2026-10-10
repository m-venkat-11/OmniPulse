import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Plus, Search, ShieldCheck, FileText, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Brand Library — Braco OmniPulse",
};

export default function BrandLibraryPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-forest mb-1">Brand Knowledge Library</h1>
          <p className="text-sm text-neutral-500">Manage approved claims, facts, rules, and terminology.</p>
        </div>
        <Button variant="primary" size="sm" iconRight={<Plus size={16} />}>
          Add source
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 mb-8">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Search approved facts, claims, or guidelines..." 
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-forest/15 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-forest/30"
          />
        </div>
        <select className="h-10 px-4 rounded-lg border border-forest/15 bg-white text-sm text-graphite focus:outline-none">
          <option>All types</option>
          <option>Product Facts</option>
          <option>Approved Claims</option>
          <option>Brand Rules</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Approved Claims */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-semibold text-graphite mb-2 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-forest-400" />
            Approved Claims & Facts
          </h2>
          
          {[
            { 
              id: "atom-101", 
              text: "Rasa Oats provides 100% of your daily iron needs when consumed with milk.", 
              tokens: ["100%", "daily iron needs", "with milk"],
              source: "Nutritional Panel 2025 v2",
              date: "Oct 12, 2025"
            },
            { 
              id: "atom-102", 
              text: "Our packaging uses 50% recycled materials.", 
              tokens: ["50%", "recycled"],
              source: "Sustainability Report 2024",
              date: "Jan 15, 2025"
            }
          ].map((claim) => (
            <div key={claim.id} className="bg-white rounded-xl border border-forest/10 p-5 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <Badge variant="success" className="mb-2">Approved</Badge>
                <span className="text-2xs text-neutral-400 font-mono">ID: {claim.id}</span>
              </div>
              <p className="text-sm text-graphite font-medium mb-4">{claim.text}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs text-neutral-500 mr-1">Locked tokens:</span>
                {claim.tokens.map(t => (
                  <span key={t} className="px-2 py-0.5 bg-forest/5 border border-forest/10 text-forest-700 text-xs rounded-md">
                    {t}
                  </span>
                ))}
              </div>
              
              <div className="pt-3 border-t border-forest/5 flex items-center justify-between text-xs text-neutral-500">
                <div className="flex items-center gap-1.5">
                  <FileText size={14} />
                  <span>Source: {claim.source}</span>
                </div>
                <span>Effective: {claim.date}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Brand Rules */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-graphite mb-2 flex items-center gap-2">
            <ShieldCheck size={16} className="text-forest-400" />
            Active Rules
          </h2>
          
          {[
            { title: "No health guarantees", desc: "Never use 'guaranteed results' or 'cure' in regional translation." },
            { title: "Honorifics required", desc: "Always use respectful plural honorifics (గారు/అండి) in Telugu when addressing elders." },
            { title: "Mandatory disclosure", desc: "All influencer posts must contain #Ad or #Sponsored in the native script." }
          ].map((rule, i) => (
            <div key={i} className="bg-sage/10 rounded-xl border border-sage-300/50 p-4">
              <h3 className="text-sm font-medium text-forest mb-1">{rule.title}</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">{rule.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
