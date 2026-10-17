import React from "react";
import { getCurrentUser } from "@/src/server/auth/session";
import { redirect, notFound } from "next/navigation";
import { campaignService } from "@/src/server/services/campaignService";
import { AppShell } from "@/components/shell/AppShell";
import { CampaignNav } from "@/components/campaigns/CampaignNav";
import { StudioClient } from "./StudioClient";

export default async function RegionalAdaptationStudioPage(props: {
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

  const { campaign, latestBrief, briefVersion, claims } = data;

  let targetLanguages: string[] = ["Telugu"];
  try {
    targetLanguages = JSON.parse(String(campaign.target_languages_json || "[\"Telugu\"]"));
  } catch {}

  return (
    <AppShell
      userName={session.user.name}
      userRole={session.role}
      workspaceName={session.workspace.name}
      primaryActionLabel="Brand Guardian"
      primaryActionHref={`/campaigns/${id}/guardian`}
    >
      <CampaignNav
        campaignId={id}
        campaignName={String(campaign.name || "")}
        brandName={String(campaign.brand_name || "")}
      />
      <StudioClient
        campaignId={id}
        campaignName={String(campaign.name || "")}
        brandName={String(campaign.brand_name || "")}
        productName={String(campaign.product_name || "")}
        sourceText={String(campaign.objective || "") + "\n" + (latestBrief?.key_message || "")}
        sourceLanguage={String(campaign.source_language || "English")}
        initialTargetLanguage={targetLanguages[0] || "Telugu"}
        availableTargetLanguages={targetLanguages}
        region={String(campaign.region || "")}
        briefVersionNo={Number(briefVersion?.version_no || 1)}
      />
    </AppShell>
  );
}
