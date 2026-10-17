import { describe, it, expect, beforeAll } from "vitest";
import { recordAuditEvent, verifyAuditChain } from "@/src/server/services/auditService";
import { db, generateId } from "@/src/server/db/client";
import { runMigrations } from "@/src/server/db/migrations";

describe("Cryptographic Hash-Chained Audit Trail (Acceptance Test 21)", () => {
  beforeAll(async () => {
    await runMigrations();
  });

  async function createTestFixtures() {
    const wsId = `ws-${generateId()}`;
    const userId = `user-${generateId()}`;

    await db.execute({
      sql: `INSERT INTO workspaces (id, name) VALUES (?, ?)`,
      args: [wsId, "Audit Test Workspace"],
    });

    await db.execute({
      sql: `INSERT INTO users (id, email, password_hash, name, role) VALUES (?, ?, ?, ?, ?)`,
      args: [userId, `${userId}@test.com`, "hash", "Test Actor", "Admin"],
    });

    return { wsId, userId };
  }

  it("Records successive audit events and verifies unbroken SHA-256 hash chain", async () => {
    const { wsId, userId } = await createTestFixtures();

    // Record 3 successive events
    await recordAuditEvent({
      workspaceId: wsId,
      actorId: userId,
      eventType: "campaign_created",
      entityType: "campaign",
      entityId: "camp-123",
      metadata: { name: "Test Campaign" },
    });

    await recordAuditEvent({
      workspaceId: wsId,
      actorId: userId,
      eventType: "asset_generated",
      entityType: "asset_version",
      entityId: "ver-456",
      metadata: { language: "Telugu" },
    });

    await recordAuditEvent({
      workspaceId: wsId,
      actorId: userId,
      eventType: "version_approved",
      entityType: "approval_decision",
      entityId: "appr-789",
      metadata: { decision: "Approved" },
    });

    const verification = await verifyAuditChain(wsId);
    expect(verification.isValid).toBe(true);
    expect(verification.totalEvents).toBe(3);
  });

  it("Enforces audit log immutability via SQLite trigger (aborts UPDATE/DELETE)", async () => {
    const { wsId, userId } = await createTestFixtures();

    const evId = await recordAuditEvent({
      workspaceId: wsId,
      actorId: userId,
      eventType: "brief_created",
      entityType: "brief_version",
      entityId: "brief-1",
      metadata: { initial: true },
    });

    // Attempting to mutate audit_events row must be aborted by trigger!
    await expect(
      db.execute({
        sql: `UPDATE audit_events SET metadata_json = ? WHERE id = ?`,
        args: [`{"tampered": true}`, evId],
      })
    ).rejects.toThrow(/immutable/i);

    // Attempting to delete must also be aborted by trigger!
    await expect(
      db.execute({
        sql: `DELETE FROM audit_events WHERE id = ?`,
        args: [evId],
      })
    ).rejects.toThrow(/immutable/i);
  });
});
