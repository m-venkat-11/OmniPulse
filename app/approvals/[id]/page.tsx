"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  ArrowLeft, Check, CheckCircle2, XCircle, AlertCircle,
  FileText, User, Hash, Lock, ChevronRight, ShieldCheck,
  AlertTriangle, MessageSquare, Send
} from "lucide-react";
import Link from "next/link";
import {
  getAssetVersion, getVerificationRuns, getApprovals,
  approveAssetVersion, rejectAssetVersion
} from "@/app/actions";
import { LANGUAGE_REGISTRY } from "@/lib/languages/registry";

export default function ReviewCenterPage() {
  const params = useParams();
  const router = useRouter();
  const versionId = params.id as string;

  const [version, setVersion] = useState<any>(null);
  const [runs, setRuns] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionDone, setActionDone] = useState<"approved" | "rejected" | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [v, r, a] = await Promise.all([
          getAssetVersion(versionId),
          getVerificationRuns(versionId),
          getApprovals(versionId),
        ]);
        setVersion(v);
        setRuns(r as any[]);
        setApprovals(a as any[]);

        if (v?.status === 'approved') {
          setActionDone("approved");
        } else if (v?.status === 'rejected') {
          setActionDone("rejected");
        }
      } catch (err) {
        console.error("Failed to load review data:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [versionId]);

  const handleApprove = async () => {
    if (!version) return;
    setIsSubmitting(true);
    try {
      await approveAssetVersion(versionId, version.campaign_id, comments || "Approved by regional reviewer. Content hash verified.");
      setActionDone("approved");
      setVersion((prev: any) => ({ ...prev, status: 'approved' }));
      const updatedApprovals = await getApprovals(versionId);
      setApprovals(updatedApprovals as any[]);
    } catch (err: any) {
      alert("Approval failed: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!version) return;
    if (!comments.trim()) {
      alert("Please provide reviewer feedback or reasons for requesting changes.");
      return;
    }
    setIsSubmitting(true);
    try {
      await rejectAssetVersion(versionId, version.campaign_id, comments);
      setActionDone("rejected");
      setVersion((prev: any) => ({ ...prev, status: 'rejected' }));
      const updatedApprovals = await getApprovals(versionId);
      setApprovals(updatedApprovals as any[]);
    } catch (err: any) {
      alert("Action failed: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-sage-200 border-t-forest rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-neutral-500">Loading Review Center...</p>
        </div>
      </div>
    );
  }

  if (!version) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center p-6">
        <div className="bg-white rounded-xl border border-forest/10 p-8 max-w-md text-center shadow-sm">
          <AlertTriangle size={36} className="text-brass mx-auto mb-3" />
          <h2 className="font-serif text-xl text-forest mb-2">Variant Not Found</h2>
          <p className="text-sm text-neutral-500 mb-6">The requested creative version could not be found.</p>
          <Link href="/dashboard">
            <Button variant="primary" size="sm">Back to Command Center</Button>
          </Link>
        </div>
      </div>
    );
  }

  const campaignId = version.campaign_id || "default";
  const latestRun = runs[0];
  const findings: any[] = latestRun?.findings || [];
  const blockers = findings.filter(f => f.severity === 'critical' || f.severity === 'high');
  const langConfig = LANGUAGE_REGISTRY.find(l => l.name.toLowerCase() === version.target_language?.toLowerCase());

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
              <h1 className="font-serif text-lg font-semibold text-forest">Review Center</h1>
              <Badge variant={version.status === 'approved' ? 'success' : version.status === 'rejected' ? 'critical' : 'warning'}>
                {version.status.toUpperCase()}
              </Badge>
            </div>
            <p className="text-xs text-neutral-500">
              {version.campaign_name || "Campaign"} • {version.target_language} v{version.version_number}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          {actionDone !== "approved" ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReject}
                disabled={isSubmitting}
                className="text-red-700 hover:bg-red-50 border-red-200"
              >
                Request Revision
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleApprove}
                disabled={isSubmitting || blockers.length > 0}
                iconRight={<Check size={14}/>}
              >
                {isSubmitting ? "Recording Decision..." : "Approve Version"}
              </Button>
            </>
          ) : (
            <Link href={`/campaigns/${campaignId}/passport?versionId=${versionId}`}>
              <Button variant="primary" size="sm" iconRight={<ChevronRight size={14}/>}>
                View Decision Passport
              </Button>
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto mt-8 px-6 grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">

        {/* Left Column (2 Cols): Asset, Diff & Findings */}
        <div className="lg:col-span-2 space-y-6">

          {/* Approved Banner */}
          {actionDone === "approved" && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3 animate-fade-in">
              <CheckCircle2 size={20} className="text-green-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-green-900">Version Approved & Immutable</h3>
                <p className="text-xs text-green-700 mt-1">
                  This exact content hash has been cryptographically locked in the Turso audit trail. It is authorized for Creator Briefing and A/B Testing.
                </p>
              </div>
            </div>
          )}

          {/* Blocker Alert */}
          {blockers.length > 0 && actionDone !== "approved" && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle size={20} className="text-red-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-red-900">Brand Guardian Blockers Detected ({blockers.length})</h3>
                <p className="text-xs text-red-700 mt-1">
                  This version contains critical rule violations or unapproved medical claims. You must resolve or request revisions before approving.
                </p>
              </div>
            </div>
          )}

          {/* Main Version Card */}
          <div className="bg-white rounded-xl border border-forest/10 shadow-sm overflow-hidden">
            <div className="bg-sage/10 p-4 border-b border-forest/5 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-graphite flex items-center gap-2">
                <FileText size={16} className="text-forest" />
                Current Asset Copy (v{version.version_number})
              </h2>
              <span className="text-2xs font-mono text-neutral-400">
                SHA-256: {version.content_hash?.slice(0, 18)}...
              </span>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <span className="text-2xs uppercase tracking-widest font-semibold text-neutral-400 block mb-1">
                  Adapted Text ({version.target_language} {version.dialect ? `• ${version.dialect}` : ""})
                </span>
                <div className="bg-ivory/50 p-4 rounded-lg border border-forest/10">
                  <p
                    className="text-lg text-graphite leading-relaxed font-medium"
                    style={{ fontFamily: langConfig?.fontFamily || "inherit" }}
                  >
                    {version.regional_adaptation}
                  </p>
                </div>
              </div>

              {version.literal_translation && (
                <div>
                  <span className="text-2xs uppercase tracking-widest font-semibold text-forest block mb-1">
                    Literal English Back-Translation
                  </span>
                  <p className="text-xs text-graphite bg-sage/10 p-3 rounded-lg border border-forest/5 italic">
                    &quot;{version.literal_translation}&quot;
                  </p>
                </div>
              )}

              <div>
                <span className="text-2xs uppercase tracking-widest font-semibold text-neutral-400 block mb-1">
                  Original Source Intent (English)
                </span>
                <p className="text-xs text-neutral-600 bg-ivory/30 p-2.5 rounded border border-forest/5">
                  &quot;{version.source_text}&quot;
                </p>
              </div>
            </div>
          </div>

          {/* Brand Guardian Verification Audit Report */}
          <div className="bg-white rounded-xl border border-forest/10 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-forest/5">
              <h3 className="font-serif text-base text-forest flex items-center gap-2">
                <ShieldCheck size={18} className="text-forest" />
                Brand Guardian Audit Ledger
              </h3>
              {latestRun ? (
                <Badge variant={latestRun.overall_status === 'blocked' ? 'critical' : 'success'}>
                  {latestRun.overall_status.toUpperCase()}
                </Badge>
              ) : (
                <Badge variant="demo">NOT RUN YET</Badge>
              )}
            </div>

            {findings.length === 0 ? (
              <p className="text-xs text-neutral-500 py-3">No compliance findings recorded for this version.</p>
            ) : (
              <div className="space-y-3">
                {findings.map((f: any) => (
                  <div key={f.id} className="p-3 rounded-lg border border-forest/10 bg-ivory/30 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-graphite capitalize">
                        {f.category?.replace(/_/g, " ")}
                      </span>
                      <span className={`text-2xs font-semibold px-2 py-0.5 rounded ${
                        f.severity === 'critical' ? 'bg-red-100 text-red-800' : 'bg-brass/20 text-brass-800'
                      }`}>
                        {f.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-2xs text-red-700 font-mono bg-white p-1.5 rounded border border-forest/5 mb-1">
                      &quot;{f.flagged_text}&quot;
                    </p>
                    <p className="text-neutral-600">{f.explanation}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column (1 Col): Reviewer Sign-Off & Metadata */}
        <div className="space-y-6">

          {/* Reviewer Action Box */}
          <div className="bg-white rounded-xl border border-forest/10 p-5 shadow-sm space-y-4">
            <h3 className="font-serif text-sm font-semibold text-forest flex items-center gap-1.5">
              <MessageSquare size={16} className="text-forest" />
              Reviewer Decision & Notes
            </h3>

            <div>
              <label className="block text-2xs uppercase tracking-wider font-semibold text-neutral-400 mb-1">
                Comments / Feedback
              </label>
              <textarea
                rows={4}
                value={comments}
                onChange={e => setComments(e.target.value)}
                placeholder="Enter review comments or reasoning for approval/rejection..."
                className="w-full p-3 rounded-lg border border-forest/15 bg-white text-xs focus:ring-2 focus:ring-forest/20 outline-none resize-none"
              />
            </div>

            <div className="space-y-2">
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                onClick={handleApprove}
                disabled={isSubmitting || blockers.length > 0}
                iconRight={<Check size={14}/>}
              >
                Approve Exact Version
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-red-700 hover:bg-red-50 border-red-200"
                onClick={handleReject}
                disabled={isSubmitting}
              >
                Request Revisions
              </Button>
            </div>
          </div>

          {/* Approval Invariants & Metadata */}
          <div className="bg-white rounded-xl border border-forest/10 p-5 shadow-sm space-y-3 text-xs">
            <h4 className="font-semibold text-graphite uppercase tracking-wider text-2xs">
              System Invariants (PRD FR-016)
            </h4>

            <div className="space-y-2 text-neutral-600">
              <div className="flex items-start gap-2">
                <Lock size={14} className="text-forest shrink-0 mt-0.5" />
                <span>Approval is bound strictly to the SHA-256 hash of this copy.</span>
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck size={14} className="text-forest shrink-0 mt-0.5" />
                <span>Any text edit automatically creates a new unapproved version.</span>
              </div>
              <div className="flex items-start gap-2">
                <User size={14} className="text-forest shrink-0 mt-0.5" />
                <span>Human sign-off required; no AI-only publishing allowed.</span>
              </div>
            </div>

            {approvals.length > 0 && (
              <div className="pt-3 border-t border-forest/5">
                <span className="text-2xs uppercase tracking-wider font-semibold text-neutral-400 block mb-2">
                  Past Decision Log
                </span>
                {approvals.map((ap: any) => (
                  <div key={ap.id} className="p-2 rounded bg-ivory/50 border border-forest/5 mb-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold capitalize text-graphite">{ap.decision}</span>
                      <span className="text-2xs text-neutral-400">
                        {ap.reviewed_at ? new Date(ap.reviewed_at).toLocaleDateString() : "—"}
                      </span>
                    </div>
                    {ap.review_comments && (
                      <p className="text-2xs text-neutral-500 mt-1 italic">&quot;{ap.review_comments}&quot;</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </main>
    </div>
  );
}
