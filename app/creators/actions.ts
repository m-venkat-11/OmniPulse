"use server";

import { creatorService, CreatorProfileInput } from "@/src/server/services/creatorService";
import { getCurrentUser } from "@/src/server/auth/session";

export async function createCreatorAction(data: CreatorProfileInput) {
  const session = await getCurrentUser();
  if (!session) {
    return { error: "Unauthorized. Please sign in." };
  }

  try {
    const res = await creatorService.createCreator(data, session.workspace.id);
    return { success: true, creatorId: res.creatorId };
  } catch (err: any) {
    console.error("[Create Creator Error]", err);
    return { error: err.message || "Failed to create creator profile." };
  }
}
