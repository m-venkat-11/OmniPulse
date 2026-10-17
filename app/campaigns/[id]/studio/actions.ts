"use server";

import { adaptationService, GenerateAdaptationParams } from "@/src/server/services/adaptationService";
import { getCurrentUser } from "@/src/server/auth/session";

export async function generateAdaptationAction(params: GenerateAdaptationParams) {
  const session = await getCurrentUser();
  if (!session) {
    return { error: "Unauthorized. Please sign in." };
  }

  try {
    const res = await adaptationService.generateAssetAdaptation(params, session.user.id, session.workspace.id);
    return { success: true, data: res };
  } catch (err: any) {
    console.error("[Adaptation Action Error]", err);
    return { error: err.message || "Regional transcreation failed." };
  }
}

export async function createEditedVersionAction(params: {
  creativeAssetId: string;
  headline: string;
  subline?: string;
  body?: string;
  cta?: string;
  disclosure?: string;
  literalTranslation?: string;
}) {
  const session = await getCurrentUser();
  if (!session) {
    return { error: "Unauthorized." };
  }

  try {
    const res = await adaptationService.createEditedVersion(params, session.user.id, session.workspace.id);
    return { success: true, data: res };
  } catch (err: any) {
    return { error: err.message || "Failed to create edited version." };
  }
}

export async function submitReviewerFeedbackAction(params: {
  languagePair: string;
  region?: string;
  assetVersionId?: string;
  phraseOriginal: string;
  phraseAdapted: string;
  tag: "accurate" | "awkward" | "culturally_mismatched" | "brand_risk" | "needs_native_review";
  comment?: string;
}) {
  const session = await getCurrentUser();
  if (!session) {
    return { error: "Unauthorized." };
  }

  try {
    const res = await adaptationService.recordReviewerFeedback(params, session.user.id, session.workspace.id);
    return { success: true, feedbackId: res.feedbackId };
  } catch (err: any) {
    return { error: err.message || "Failed to submit feedback." };
  }
}
