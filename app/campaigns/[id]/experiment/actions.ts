"use server";

import { experimentService } from "@/src/server/services/experimentService";
import { getCurrentUser } from "@/src/server/auth/session";

export async function createExperimentAction(params: {
  campaignId: string;
  hypothesis: string;
  primaryMetricId: string;
  variantAId: string;
  variantBId: string;
  decisionRule: string;
  attributionWindow?: string;
  duration?: string;
}) {
  const session = await getCurrentUser();
  if (!session) {
    return { error: "Unauthorized. Please sign in." };
  }

  try {
    const res = await experimentService.createExperiment(
      params,
      session.user.id,
      session.workspace.id
    );
    return { success: true, experimentId: res.experimentId };
  } catch (err: any) {
    console.error("[Create Experiment Error]", err);
    return { error: err.message || "Failed to create experiment." };
  }
}

export async function lockExperimentAction(experimentId: string) {
  const session = await getCurrentUser();
  if (!session) {
    return { error: "Unauthorized." };
  }

  try {
    const res = await experimentService.lockExperiment(
      experimentId,
      session.user.id,
      session.workspace.id
    );
    return { success: true, lockedAt: res.lockedAt };
  } catch (err: any) {
    return { error: err.message || "Failed to lock experiment." };
  }
}
