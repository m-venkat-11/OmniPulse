"use server";

import { campaignService, CampaignBriefInput, CampaignBriefSchema } from "@/src/server/services/campaignService";
import { getCurrentUser } from "@/src/server/auth/session";
import { aiOrchestrator } from "@/src/server/ai/orchestrator";
import { redirect } from "next/navigation";

export async function createCampaignAction(data: CampaignBriefInput) {
  const session = await getCurrentUser();
  if (!session) {
    return { error: "Unauthorized. Please sign in." };
  }

  try {
    const res = await campaignService.createCampaign(data, session.user.id, session.workspace.id);
    return { success: true, campaignId: res.campaignId };
  } catch (err: any) {
    console.error("[Create Campaign Error]", err);
    return { error: err.message || "Failed to create campaign." };
  }
}

/**
 * AI-assisted extraction of atomic claims from the brief
 */
export async function extractClaimsFromBrief(briefText: string, brandName: string, productName: string) {
  const session = await getCurrentUser();
  if (!session) {
    return { error: "Unauthorized." };
  }

  try {
    const claims = await aiOrchestrator.extractClaims(briefText, brandName, productName);
    return { success: true, claims };
  } catch (err: any) {
    return { error: err.message || "Claim extraction failed." };
  }
}
