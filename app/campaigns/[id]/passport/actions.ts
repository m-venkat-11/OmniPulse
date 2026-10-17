"use server";

import { getCurrentUser } from "@/src/server/auth/session";
import { verifyAuditChain } from "@/src/server/services/auditService";

export async function verifyAuditChainAction() {
  const session = await getCurrentUser();
  if (!session) {
    throw new Error("Unauthorized");
  }

  return await verifyAuditChain(session.workspace.id);
}
