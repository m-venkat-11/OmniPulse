import React from "react";
import { getCurrentUser } from "@/src/server/auth/session";
import { redirect } from "next/navigation";
import { campaignService } from "@/src/server/services/campaignService";
import { AppShell } from "@/components/shell/AppShell";
import { Card } from "@/components/design-system/Card";
import { StatusChip } from "@/components/design-system/StatusChip";
import { EmptyState } from "@/components/design-system/EmptyState";
import { PillButton } from "@/components/design-system/PillButton";
import Link from "next/link";
import { FileText, Plus, ArrowUpRight, Search, Globe, MapPin } from "lucide-react";

export default async function CampaignsDirectoryPage(props: {
  searchParams?: Promise<{ q?: string; status?: string }>;
}) {
  const session = await getCurrentUser();
  if (!session) {
    redirect("/sign-in");
  }

  const searchParams = await props.searchParams;
  const q = searchParams?.q || "";
  const statusFilter = searchParams?.status || "all";

  const campaigns = await campaignService.listCampaigns(session.workspace.id, q, statusFilter);

  return (
    <AppShell
      userName={session.user.name}
      userRole={session.role}
      workspaceName={session.workspace.name}
      primaryActionLabel="New Campaign"
      primaryActionHref="/campaigns/new"
    >
      <div className="flex flex-col gap-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Campaign Briefs & Intelligence
            </h1>
            <p className="text-xs text-[#A3A3A3] mt-1">
              Active marketing flights, immutable brief versions, and verified regional creative.
            </p>
          </div>

          <PillButton
            variant="white"
            size="md"
            href="/campaigns/new"
            icon={<Plus className="w-4 h-4 text-black" />}
          >
            Create Brief
          </PillButton>
        </div>

        {/* Directory Card */}
        <Card title="Workspace Campaigns" icon={<FileText className="w-3.5 h-3.5" />}>
          {campaigns.length > 0 ? (
            <div className="flex flex-col divide-y divide-[#202020]">
              {campaigns.map((camp: any) => {
                let targetLangs: string[] = [];
                try {
                  targetLangs = JSON.parse(camp.target_languages_json || "[]");
                } catch {}

                return (
                  <div
                    key={camp.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] -mx-6 px-6 transition-colors"
                  >
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/campaigns/${camp.id}`}
                          className="font-bold text-sm text-white hover:text-[#2BD64F] transition-colors truncate"
                        >
                          {camp.name}
                        </Link>
                        <StatusChip status={camp.status} size="sm" />
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#A3A3A3] mt-1">
                        <span className="font-semibold text-white">
                          {camp.brand_name} • {camp.product_name}
                        </span>
                        {camp.region && (
                          <span className="flex items-center gap-1 text-[#888888]">
                            <MapPin className="w-3 h-3" /> {camp.region}
                          </span>
                        )}
                        {targetLangs.length > 0 && (
                          <span className="flex items-center gap-1 text-[#888888]">
                            <Globe className="w-3 h-3" /> {targetLangs.join(", ")}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <Link
                        href={`/campaigns/${camp.id}`}
                        className="px-4 py-2 rounded-full bg-[#202020] hover:bg-[#2A2A2A] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        Open Studio <ArrowUpRight className="w-3.5 h-3.5 text-[#A3A3A3]" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={<FileText className="w-6 h-6" />}
              title="No campaigns yet"
              description="Create your first campaign brief to begin generating AI regional transcreations, claim verification findings, and ad posters."
              actionLabel="Create Your First Brief"
              actionHref="/campaigns/new"
            />
          )}
        </Card>
      </div>
    </AppShell>
  );
}
