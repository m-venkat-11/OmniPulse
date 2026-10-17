import React from "react";
import { getCurrentUser } from "@/src/server/auth/session";
import { redirect, notFound } from "next/navigation";
import { campaignService } from "@/src/server/services/campaignService";
import { guardianService } from "@/src/server/services/guardianService";
import { AppShell } from "@/components/shell/AppShell";
import { CampaignNav } from "@/components/campaigns/CampaignNav";
import { ReviewQueueClient } from "./ReviewQueueClient";
import { db } from "@/src/server/db/client";

export default async function ReviewQueuePage(props: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ versionId?: string }>;
}) {
  const session = await getCurrentUser();
  if (!session) {
    redirect("/sign-in");
  }

  const { id } = await props.params;
  const searchParams = await props.searchParams;

  const data = await campaignService.getCampaign(id, session.workspace.id);
  if (!data) {
    notFound();
  }

  // Fetch all asset versions
  const versionsRes = await db.execute({
    sql: `SELECT av.*, ca.target_language, ca.channel, ca.region, u.name as author_name
          FROM asset_versions av
          JOIN creative_assets ca ON ca.id = av.creative_asset_id
          LEFT JOIN users u ON u.id = av.created_by
          WHERE ca.campaign_id = ?
          ORDER BY av.created_at DESC`,
    args: [id],
  });

  const allVersions = versionsRes.rows;
  const activeVersionId = searchParams?.versionId || (allVersions[0]?.id ? String(allVersions[0].id) : null);
  const activeVersion = allVersions.find((v) => String(v.id) === activeVersionId) || allVersions[0] || null;

  let findings: any = null;
  let approvalHistory: any[] = [];

  if (activeVersion) {
    findings = await guardianService.getFindingsForVersion(String(activeVersion.id));

    const historyRes = await db.execute({
      sql: `SELECT ad.*, u.name as reviewer_name
            FROM approval_decisions ad
            LEFT JOIN users u ON u.id = ad.reviewer_id
            WHERE ad.asset_version_id = ?
            ORDER BY ad.decided_at DESC`,
      args: [String(activeVersion.id)],
    });
    approvalHistory = historyRes.rows;
  }

  return (
    <AppShell
      userName={session.user.name}
      userRole={session.role}
      workspaceName={session.workspace.name}
      primaryActionLabel="Experiment Planner"
      primaryActionHref={`/campaigns/${id}/experiment`}
    >
      <CampaignNav
        campaignId={id}
        campaignName={String(data.campaign.name || "")}
        brandName={String(data.campaign.brand_name || "")}
      />
      <ReviewQueueClient
        campaignId={id}
        campaignName={String(data.campaign.name || "")}
        brandName={String(data.campaign.brand_name || "")}
        productName={String(data.campaign.product_name || "")}
        currentUserId={session.user.id}
        currentUserRole={session.role}
        allVersions={allVersions.map((v) => ({
          id: String(v.id),
          version_no: Number(v.version_no),
          headline: String(v.headline),
          target_language: String(v.target_language),
          status: String(v.status),
          content_hash: String(v.content_hash),
          author_name: String(v.author_name || "Author"),
          created_by: String(v.created_by),
          created_at: String(v.created_at),
        }))}
        activeVersion={activeVersion ? {
          id: String(activeVersion.id),
          creative_asset_id: String(activeVersion.creative_asset_id),
          version_no: Number(activeVersion.version_no),
          headline: String(activeVersion.headline),
          subline: String(activeVersion.subline || ""),
          body: String(activeVersion.body || ""),
          cta: String(activeVersion.cta || ""),
          disclosure: String(activeVersion.disclosure || ""),
          literal_translation: String(activeVersion.literal_translation || ""),
          target_language: String(activeVersion.target_language || "Telugu"),
          status: String(activeVersion.status),
          content_hash: String(activeVersion.content_hash),
          created_by: String(activeVersion.created_by),
          author_name: String(activeVersion.author_name || "Author"),
        } : null}
        findings={findings?.findings || []}
        approvalHistory={approvalHistory.map((h) => ({
          id: String(h.id),
          decision: String(h.decision),
          reviewer_name: String(h.reviewer_name || "Reviewer"),
          override_reason: String(h.override_reason || ""),
          rationale: String(h.rationale || ""),
          decided_at: String(h.decided_at),
        }))}
      />
    </AppShell>
  );
}
