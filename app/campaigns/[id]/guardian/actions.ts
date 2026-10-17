"use server";

import { guardianService } from "@/src/server/services/guardianService";
import { getCurrentUser } from "@/src/server/auth/session";

export async function runVerificationAction(assetVersionId: string) {
  const session = await getCurrentUser();
  if (!session) {
    return { error: "Unauthorized. Please sign in." };
  }

  try {
    const res = await guardianService.runVerification(assetVersionId, session.user.id, session.workspace.id);
    return { success: true, data: res };
  } catch (err: any) {
    console.error("[Verification Error]", err);
    return { error: err.message || "Brand Guardian verification failed." };
  }
}
