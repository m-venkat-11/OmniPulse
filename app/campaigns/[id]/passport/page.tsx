import React from "react";
import { getCurrentUser } from "@/src/server/auth/session";
import { redirect, notFound } from "next/navigation";
import { passportService } from "@/src/server/services/passportService";
import { AppShell } from "@/components/shell/AppShell";
import { CampaignNav } from "@/components/campaigns/CampaignNav";
import { PassportClient } from "./PassportClient";

export default async function DecisionPassportPage(props: {
  params: Promise<{ id: string }>;
}) {
  const session = await getCurrentUser();
  if (!session) {
    redirect("/sign-in");
  }

  const { id } = await props.params;
  const data = await passportService.getCampaignPassport(id, session.workspace.id);

  if (!data) {
    notFound();
  }

  return (
    <AppShell
      userName={session.user.name}
      userRole={session.user.role}
      workspaceName={session.workspace.name}
    >
      <CampaignNav
        campaignId={id}
        campaignName={String(data.campaign.name || "")}
        brandName={String(data.campaign.brand_name || "")}
      />
      <PassportClient campaignId={id} data={data} />
    </AppShell>
  );
}
