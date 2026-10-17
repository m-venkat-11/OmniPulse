"use server";

import { approvalService } from "@/src/server/services/approvalService";
import { getCurrentUser } from "@/src/server/auth/session";

export async function submitReviewDecisionAction(params: {
  assetVersionId: string;
  expectedContentHash: string;
  decision: "Approve" | "RequestChanges" | "Reject";
  rationale?: string;
  overrideReason?: string;
}) {
  const session = await getCurrentUser();
  if (!session) {
    return { error: "Unauthorized. Please sign in." };
  }

  try {
    const res = await approvalService.submitReviewDecision(
      params,
      session.user.id,
      session.workspace.id
    );
    return { success: true, data: res };
  } catch (err: any) {
    console.error("[Approval Decision Error]", err);
    return { error: err.message || "Failed to record approval decision." };
  }
}
