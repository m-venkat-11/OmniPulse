import React from "react";
import { getCurrentUser } from "@/src/server/auth/session";
import { redirect, notFound } from "next/navigation";
import { campaignService } from "@/src/server/services/campaignService";
import { AppShell } from "@/components/shell/AppShell";
import { CampaignNav } from "@/components/campaigns/CampaignNav";
import { PosterStudioClient } from "./PosterStudioClient";
import { db } from "@/src/server/db/client";

export default async function AdPosterStudioPage(props: {
  params: Promise<{ id: string }>;
}) {
  const session = await getCurrentUser();
  if (!session) {
    redirect("/sign-in");
  }

  const { id } = await props.params;
  const data = await campaignService.getCampaign(id, session.workspace.id);
  if (!data) {
    notFound();
  }

  // Fetch asset versions
  const versionsRes = await db.execute({
    sql: `SELECT av.*, ca.target_language, ca.channel
          FROM asset_versions av
          JOIN creative_assets ca ON ca.id = av.creative_asset_id
          WHERE ca.campaign_id = ?
          ORDER BY av.created_at DESC`,
    args: [id],
  });

  return (
    <AppShell
      userName={session.user.name}
      userRole={session.role}
      workspaceName={session.workspace.name}
      primaryActionLabel="Campaign Overview"
      primaryActionHref={`/campaigns/${id}`}
    >
      <CampaignNav
        campaignId={id}
        campaignName={String(data.campaign.name || "")}
        brandName={String(data.campaign.brand_name || "")}
      />
      <PosterStudioClient
        campaignId={id}
        campaignName={String(data.campaign.name || "")}
        brandName={String(data.campaign.brand_name || "")}
        productName={String(data.campaign.product_name || "")}
        versions={versionsRes.rows.map((v) => ({
          id: String(v.id),
          version_no: Number(v.version_no),
          headline: String(v.headline),
          subline: String(v.subline || ""),
          body: String(v.body || ""),
          cta: String(v.cta || ""),
          disclosure: String(v.disclosure || ""),
          target_language: String(v.target_language),
          status: String(v.status),
          content_hash: String(v.content_hash),
        }))}
      />
    </AppShell>
  );
}
