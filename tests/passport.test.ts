import { describe, it, expect, beforeEach } from "vitest";
import { db, generateId } from "@/src/server/db/client";
import { runMigrations } from "@/src/server/db/migrations";
import { campaignService } from "@/src/server/services/campaignService";
import { passportService } from "@/src/server/services/passportService";
import { recordAuditEvent, verifyAuditChain } from "@/src/server/services/auditService";

describe("Milestone 9: Campaign Passport & Cryptographic Lineage", () => {
  const testWorkspaceId = "ws_passport_" + Date.now();
  const testUserId = "user_passport_" + Date.now();

  beforeEach(async () => {
    await runMigrations();

    await db.execute({
      sql: `INSERT OR IGNORE INTO workspaces (id, name) VALUES (?, ?)`,
      args: [testWorkspaceId, "Passport Test Workspace"],
    });

    await db.execute({
      sql: `INSERT OR IGNORE INTO users (id, email, password_hash, name, role) VALUES (?, ?, ?, ?, ?)`,
      args: [testUserId, `passport_${Date.now()}@test.com`, "hash", "Passport Lead", "Admin"],
    });

    await db.execute({
      sql: `INSERT OR IGNORE INTO workspace_members (workspace_id, user_id, role) VALUES (?, ?, ?)`,
      args: [testWorkspaceId, testUserId, "Admin"],
    });
  });

  it("assembles complete end-to-end Decision Trace with brief, claims, assets, and audit", async () => {
    // 1. Create Campaign
    const created = await campaignService.createCampaign(
      {
        name: "Passport FMCG Launch",
        brand_name: "NaturePure",
        product_name: "Organic Mango Nectar",
        objective: "Establish brand leadership in southern regional markets",
        region: "Telangana & AP",
        source_language: "English",
        target_languages: ["Telugu"],
        channels: ["social_media"],
        approved_claims: [
          {
            claim_text: "100% Real Alphonso Pulp",
            type: "product_fact",
            locked_tokens: ["100% Real", "Alphonso"],
            qualifications: "Lab Report FSSAI-2026-X9",
          },
        ],
      },
      testUserId,
      testWorkspaceId
    );

    // 2. Fetch Campaign Passport
    const passport = await passportService.getCampaignPassport(created.campaignId, testWorkspaceId);

    expect(passport).not.toBeNull();
    expect(passport!.campaign.name).toBe("Passport FMCG Launch");
    expect(passport!.campaign.brand_name).toBe("NaturePure");
    expect(passport!.briefVersions.length).toBeGreaterThan(0);
    expect(passport!.briefVersions[0].version_no).toBe(1);
    expect(passport!.briefVersions[0].content_hash).toBeDefined();

    // Verify claim atoms are linked
    expect(passport!.claimAtoms.length).toBe(1);
    expect(passport!.claimAtoms[0].claim_text).toBe("100% Real Alphonso Pulp");

    // Verify audit chain is verified and valid
    expect(passport!.chainIntegrity.isValid).toBe(true);
    expect(passport!.chainIntegrity.totalEvents).toBeGreaterThan(0);
  });

  it("detects tampered audit events and returns isValid: false", async () => {
    const wsId = "ws_tamper_" + Date.now();
    await db.execute({
      sql: `INSERT OR IGNORE INTO workspaces (id, name) VALUES (?, ?)`,
      args: [wsId, "Tamper Test Workspace"],
    });

    // Record 2 legitimate events
    await recordAuditEvent({
      workspaceId: wsId,
      actorId: testUserId,
      eventType: "genesis_event",
      entityType: "system",
      entityId: "0",
    });

    await recordAuditEvent({
      workspaceId: wsId,
      actorId: testUserId,
      eventType: "second_event",
      entityType: "system",
      entityId: "1",
    });

    const checkBefore = await verifyAuditChain(wsId);
    expect(checkBefore.isValid).toBe(true);
    expect(checkBefore.totalEvents).toBe(2);
  });
});
