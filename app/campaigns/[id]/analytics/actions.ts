"use server";

import { experimentService } from "@/src/server/services/experimentService";
import { getCurrentUser } from "@/src/server/auth/session";

export async function importCsvAction(params: {
  experimentId: string;
  csvText: string;
  columnMapping: {
    variantColumn: string;
    impressionsColumn: string;
    clicksColumn: string;
    conversionsColumn?: string;
  };
}) {
  const session = await getCurrentUser();
  if (!session) {
    return { error: "Unauthorized. Please sign in." };
  }

  try {
    const res = await experimentService.importCsvData(params, session.user.id, session.workspace.id);
    return { success: true, data: res };
  } catch (err: any) {
    console.error("[CSV Import Error]", err);
    return { error: err.message || "CSV import failed." };
  }
}
