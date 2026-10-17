import React from "react";
import { getCurrentUser } from "@/src/server/auth/session";
import { redirect, notFound } from "next/navigation";
import { campaignService } from "@/src/server/services/campaignService";
import { guardianService } from "@/src/server/services/guardianService";
import { AppShell } from "@/components/shell/AppShell";
import { CampaignNav } from "@/components/campaigns/CampaignNav";
import { GuardianClient } from "./GuardianClient";
import { db } from "@/src/server/db/client";

export default async function BrandGuardianPage(props: {
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

  // Fetch all asset versions for this campaign
  const versionsRes = await db.execute({
    sql: `SELECT av.*, ca.target_language, ca.channel, ca.region
          FROM asset_versions av
          JOIN creative_assets ca ON ca.id = av.creative_asset_id
          WHERE ca.campaign_id = ?
          ORDER BY av.created_at DESC`,
    args: [id],
  });

  const allVersions = versionsRes.rows;
  const activeVersionId = searchParams?.versionId || (allVersions[0]?.id ? String(allVersions[0].id) : null);
  const activeVersion = allVersions.find((v) => String(v.id) === activeVersionId) || allVersions[0] || null;

  let existingFindings: any = null;
  if (activeVersion) {
    existingFindings = await guardianService.getFindingsForVersion(String(activeVersion.id));
  }

  return (
    <AppShell
      userName={session.user.name}
      userRole={session.role}
      workspaceName={session.workspace.name}
      primaryActionLabel="Review Queue"
      primaryActionHref={`/campaigns/${id}/review${activeVersion ? `?versionId=${activeVersion.id}` : ""}`}
    >
      <CampaignNav
        campaignId={id}
        campaignName={String(data.campaign.name || "")}
        brandName={String(data.campaign.brand_name || "")}
      />
      <GuardianClient
        campaignId={id}
        campaignName={String(data.campaign.name || "")}
        brandName={String(data.campaign.brand_name || "")}
        productName={String(data.campaign.product_name || "")}
        allVersions={allVersions.map((v) => ({
          id: String(v.id),
          version_no: Number(v.version_no),
          headline: String(v.headline),
          target_language: String(v.target_language),
          status: String(v.status),
          content_hash: String(v.content_hash),
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
          regional_adaptation: String(activeVersion.regional_adaptation || ""),
          target_language: String(activeVersion.target_language || "Telugu"),
          status: String(activeVersion.status),
          content_hash: String(activeVersion.content_hash),
        } : null}
        initialFindings={existingFindings}
      />
    </AppShell>
  );
}
