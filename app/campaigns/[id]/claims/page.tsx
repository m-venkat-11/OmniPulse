import React from "react";
import { getCurrentUser } from "@/src/server/auth/session";
import { redirect, notFound } from "next/navigation";
import { campaignService } from "@/src/server/services/campaignService";
import { AppShell } from "@/components/shell/AppShell";
import { CampaignNav } from "@/components/campaigns/CampaignNav";
import { ClaimsClient } from "./ClaimsClient";
import { getClaimAtoms } from "@/app/actions";

export default async function ClaimAtomsPage(props: {
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

  // Fetch claim atoms from database
  let claims: any[] = [];
  try {
    claims = (await getClaimAtoms(id)) || [];
  } catch (err) {
    console.error("Failed to fetch claim atoms:", err);
    claims = data.claims || [];
  }

  // Fallback to data.claims if getClaimAtoms returned empty
  if (claims.length === 0 && data.claims && data.claims.length > 0) {
    claims = data.claims;
  }

  return (
    <AppShell
      userName={session.user.name}
      userRole={session.role}
      workspaceName={session.workspace.name}
      primaryActionLabel="Regional Studio"
      primaryActionHref={`/campaigns/${id}/studio`}
    >
      <CampaignNav
        campaignId={id}
        campaignName={String(data.campaign.name || "")}
        brandName={String(data.campaign.brand_name || "")}
      />
      <ClaimsClient
        campaignId={id}
        campaign={data.campaign}
        initialClaims={claims}
      />
    </AppShell>
  );
}
