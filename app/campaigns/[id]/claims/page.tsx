"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ArrowLeft, CheckCircle2, AlertTriangle, Plus, Lock, ChevronRight } from "lucide-react";
import Link from "next/link";
import { getCampaign, getClaimAtoms, addClaimAtom, updateClaimAtomStatus } from "@/app/actions";

export default function ClaimAtomsPage() {
  const params = useParams();
  const campaignId = params.id as string;
  const [campaign, setCampaign] = useState<any>(null);
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newClaim, setNewClaim] = useState({ claimText: "", claimType: "product_fact", lockedTokens: "", evidenceStatus: "needs_human_review", qualifications: "" });

  useEffect(() => {
    async function load() {
      const [c, cl] = await Promise.all([getCampaign(campaignId), getClaimAtoms(campaignId)]);
      setCampaign(c);
      setClaims(cl as any[]);
      setLoading(false);
    }
    load();
  }, [campaignId]);

  const handleAddClaim = async () => {
    await addClaimAtom(campaignId, {
      ...newClaim,
      lockedTokens: newClaim.lockedTokens.split(",").map(t => t.trim()).filter(Boolean),
    });
    const updated = await getClaimAtoms(campaignId);
    setClaims(updated as any[]);
    setShowAdd(false);
    setNewClaim({ claimText: "", claimType: "product_fact", lockedTokens: "", evidenceStatus: "needs_human_review", qualifications: "" });
  };

  const handleStatusChange = async (id: string, status: string) => {
    await updateClaimAtomStatus(id, status);
    const updated = await getClaimAtoms(campaignId);
    setClaims(updated as any[]);
  };

  const statusColors: Record<string, string> = {
    supported: "text-green-700 bg-green-50 border-green-200",
    unsupported: "text-red-700 bg-red-50 border-red-200",
    contradicted: "text-red-800 bg-red-100 border-red-300",
    needs_human_review: "text-brass-700 bg-brass/10 border-brass/30",
  };

  if (loading) return <div className="min-h-screen bg-ivory flex items-center justify-center"><div className="w-8 h-8 border-3 border-sage-200 border-t-forest rounded-full animate-spin"></div></div>;

  return (
    <div className="min-h-screen bg-ivory pb-20">
      <header className="bg-white border-b border-forest/10 px-8 py-4 sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="w-8 h-8 rounded-full bg-forest/5 flex items-center justify-center text-forest hover:bg-forest/10 transition">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="font-serif text-lg font-semibold text-forest">Claim Atom Registry</h1>
            <p className="text-xs text-neutral-500">{campaign?.name}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => setShowAdd(true)} icon={<Plus size={14}/>}>Add Claim</Button>
          <Link href={`/campaigns/${campaignId}/studio`}>
            <Button variant="primary" size="sm" iconRight={<ChevronRight size={14}/>}>Open Regional Studio</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto mt-8 px-6 space-y-6">
        {/* Info banner */}
        <div className="bg-sage/20 border border-sage-300 rounded-xl p-4 flex items-start gap-3">
          <Lock size={18} className="text-forest shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-forest">Fact-Locked Claims</h3>
            <p className="text-xs text-neutral-700 mt-1">
              These claims were extracted from your campaign brief. Review each one and set its evidence status. The locked tokens (numbers, percentages, product names) will be preserved exactly during regional adaptation. Only &quot;Supported&quot; claims will be used as verified facts.
            </p>
          </div>
        </div>

        {/* Add claim form */}
        {showAdd && (
          <div className="bg-white rounded-xl border border-forest/10 p-6 shadow-sm animate-fade-in">
            <h3 className="text-sm font-semibold text-graphite mb-4">Add New Claim Atom</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-graphite mb-1">Claim Text</label>
                <textarea rows={2} value={newClaim.claimText} onChange={e => setNewClaim(p => ({ ...p, claimText: e.target.value }))}
                  className="w-full p-3 rounded-lg border border-forest/15 text-sm focus:ring-1 focus:ring-forest outline-none resize-none"
                  placeholder="e.g., Provides 100% of daily iron needs when consumed with milk" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-graphite mb-1">Claim Type</label>
                  <select value={newClaim.claimType} onChange={e => setNewClaim(p => ({ ...p, claimType: e.target.value }))}
                    className="w-full h-10 px-3 rounded-lg border border-forest/15 text-sm">
                    <option value="product_spec">Product Specification</option>
                    <option value="product_fact">Product Fact</option>
                    <option value="price">Price</option>
                    <option value="health_benefit">Health Benefit</option>
                    <option value="guarantee">Guarantee</option>
                    <option value="certification">Certification</option>
                    <option value="comparative">Comparative Claim</option>
                    <option value="statistic">Statistic</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-graphite mb-1">Evidence Status</label>
                  <select value={newClaim.evidenceStatus} onChange={e => setNewClaim(p => ({ ...p, evidenceStatus: e.target.value }))}
                    className="w-full h-10 px-3 rounded-lg border border-forest/15 text-sm">
                    <option value="supported">Supported (verified)</option>
                    <option value="needs_human_review">Needs Human Review</option>
                    <option value="unsupported">Unsupported</option>
                    <option value="contradicted">Contradicted</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-graphite mb-1">Locked Tokens (comma-separated)</label>
                <input type="text" value={newClaim.lockedTokens} onChange={e => setNewClaim(p => ({ ...p, lockedTokens: e.target.value }))}
                  className="w-full h-10 px-3 rounded-lg border border-forest/15 text-sm"
                  placeholder="e.g., 100%, daily iron, with milk" />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" size="sm" onClick={() => setShowAdd(false)}>Cancel</Button>
                <Button variant="primary" size="sm" onClick={handleAddClaim} disabled={!newClaim.claimText.trim()}>Add Claim</Button>
              </div>
            </div>
          </div>
        )}

        {/* Claims list */}
        {claims.length === 0 ? (
          <div className="bg-white rounded-xl border border-forest/10 p-12 text-center">
            <p className="text-sm text-neutral-500 mb-4">No claims extracted yet. Add approved facts in your campaign brief or add claims manually.</p>
            <Button variant="outline" size="sm" onClick={() => setShowAdd(true)} icon={<Plus size={14}/>}>Add First Claim</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {claims.map((claim: any) => {
              let tokens: string[] = [];
              try { tokens = JSON.parse(claim.locked_tokens || "[]"); } catch {}

              return (
                <div key={claim.id} className="bg-white rounded-xl border border-forest/10 p-5 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${statusColors[claim.evidence_status] || statusColors.needs_human_review}`}>
                      {claim.evidence_status === "supported" ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                      {claim.evidence_status?.replace(/_/g, " ")}
                    </div>
                    <span className="text-2xs text-neutral-400 font-mono">ID: {claim.id.substring(0, 8)}</span>
                  </div>
                  <p className="text-sm text-graphite font-medium mb-3">{claim.claim_text}</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className="text-xs text-neutral-500 mr-1">Locked tokens:</span>
                    {tokens.length > 0 ? tokens.map((t: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 bg-forest/5 border border-forest/10 text-forest-700 text-xs rounded-md">{t}</span>
                    )) : <span className="text-xs text-neutral-400">None extracted</span>}
                  </div>
                  <div className="flex items-center gap-2 pt-3 border-t border-forest/5">
                    <span className="text-xs text-neutral-500">Type: {claim.claim_type?.replace(/_/g, " ")}</span>
                    <div className="ml-auto flex gap-2">
                      {claim.evidence_status !== "supported" && (
                        <button onClick={() => handleStatusChange(claim.id, "supported")}
                          className="text-xs text-green-700 hover:underline">Mark Supported</button>
                      )}
                      {claim.evidence_status !== "unsupported" && (
                        <button onClick={() => handleStatusChange(claim.id, "unsupported")}
                          className="text-xs text-red-600 hover:underline">Mark Unsupported</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
