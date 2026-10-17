"use server";

import { posterService, GeneratePosterParams } from "@/src/server/services/posterService";
import { getCurrentUser } from "@/src/server/auth/session";

export async function generatePosterAction(params: GeneratePosterParams) {
  const session = await getCurrentUser();
  if (!session) {
    return { error: "Unauthorized. Please sign in." };
  }

  try {
    const res = await posterService.generatePoster(params, session.user.id, session.workspace.id);
    return { success: true, data: res };
  } catch (err: any) {
    console.error("[Generate Poster Error]", err);
    return { error: err.message || "Failed to generate poster." };
  }
}

export async function approvePosterAction(posterId: string) {
  const session = await getCurrentUser();
  if (!session) {
    return { error: "Unauthorized." };
  }

  try {
    const res = await posterService.approvePoster(posterId, session.user.id, session.workspace.id);
    return { success: true, data: res };
  } catch (err: any) {
    return { error: err.message || "Failed to approve poster." };
  }
}
