import { describe, it, expect, beforeAll } from "vitest";
import { approvalService } from "../src/server/services/approvalService";
import { db, generateId } from "../src/server/db/client";
import { runMigrations } from "../src/server/db/migrations";

describe("Version State Machine & Approval Gates (Acceptance Tests 15 & 16)", () => {
  beforeAll(async () => {
    await runMigrations();
  });

  async function setupVersionFixture() {
    const wsId = `ws-${generateId()}`;
    const authorId = `user-author-${generateId()}`;
    const reviewerId = `user-rev-${generateId()}`;
    const campId = `camp-${generateId()}`;
    const assetId = `asset-${generateId()}`;
    const versionId = `ver-${generateId()}`;
    const hash = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

    await db.execute({
      sql: `INSERT INTO workspaces (id, name) VALUES (?, ?)`,
      args: [wsId, "Test Workspace"],
    });

    await db.execute({
      sql: `INSERT INTO users (id, email, password_hash, name, role) VALUES (?, ?, 'h', 'Author', 'CreativeEditor')`,
      args: [authorId, `${authorId}@test.com`],
    });

    await db.execute({
      sql: `INSERT INTO users (id, email, password_hash, name, role) VALUES (?, ?, 'h', 'Reviewer', 'Reviewer')`,
      args: [reviewerId, `${reviewerId}@test.com`],
    });

    await db.execute({
      sql: `INSERT INTO campaigns (id, workspace_id, name, brand_name, product_name, objective, owner_id)
            VALUES (?, ?, 'Camp', 'Brand', 'Prod', 'Obj', ?)`,
      args: [campId, wsId, authorId],
    });

    await db.execute({
      sql: `INSERT INTO creative_assets (id, campaign_id, target_language) VALUES (?, ?, 'Telugu')`,
      args: [assetId, campId],
    });

    await db.execute({
      sql: `INSERT INTO asset_versions (
        id, creative_asset_id, version_no, headline, regional_adaptation, content_hash, status, created_by
      ) VALUES (?, ?, 1, 'Headline', 'Headline', ?, 'ReadyForReview', ?)`,
      args: [versionId, assetId, hash, authorId],
    });

    return { wsId, authorId, reviewerId, versionId, hash };
  }

  it("Rejects approval if Brand Guardian checks have not run on this version", async () => {
    const { wsId, reviewerId, versionId, hash } = await setupVersionFixture();

    // No verification_runs inserted yet
    await expect(
      approvalService.submitReviewDecision({
        assetVersionId: versionId,
        expectedContentHash: hash,
        decision: "Approve",
      }, reviewerId, wsId)
    ).rejects.toThrow(/Brand Guardian checks have not run/i);
  });

  it("Rejects approval if expected content hash is stale / modified", async () => {
    const { wsId, reviewerId, versionId } = await setupVersionFixture();

    // Insert verification run
    await db.execute({
      sql: `INSERT INTO verification_runs (id, asset_version_id, status) VALUES (?, ?, 'completed')`,
      args: [`run-${generateId()}`, versionId],
    });

    await expect(
      approvalService.submitReviewDecision({
        assetVersionId: versionId,
        expectedContentHash: "wrong_or_stale_hash",
        decision: "Approve",
      }, reviewerId, wsId)
    ).rejects.toThrow(/Stale version conflict/i);
  });

  it("Rejects approval if author attempts to self-approve without override", async () => {
    const { wsId, authorId, versionId, hash } = await setupVersionFixture();

    await db.execute({
      sql: `INSERT INTO verification_runs (id, asset_version_id, status) VALUES (?, ?, 'completed')`,
      args: [`run-${generateId()}`, versionId],
    });

    // Author attempts to approve own version
    await expect(
      approvalService.submitReviewDecision({
        assetVersionId: versionId,
        expectedContentHash: hash,
        decision: "Approve",
      }, authorId, wsId)
    ).rejects.toThrow(/Separation of duties/i);
  });

  it("Successfully approves when valid reviewer, hash, and checks are aligned", async () => {
    const { wsId, reviewerId, versionId, hash } = await setupVersionFixture();

    await db.execute({
      sql: `INSERT INTO verification_runs (id, asset_version_id, status) VALUES (?, ?, 'completed')`,
      args: [`run-${generateId()}`, versionId],
    });

    const result = await approvalService.submitReviewDecision({
      assetVersionId: versionId,
      expectedContentHash: hash,
      decision: "Approve",
      rationale: "Cultural and compliance criteria fulfilled.",
    }, reviewerId, wsId);

    expect(result.status).toBe("Approved");

    // Verify DB status
    const row = await db.execute({
      sql: `SELECT status FROM asset_versions WHERE id = ?`,
      args: [versionId],
    });
    expect(row.rows[0].status).toBe("Approved");
  });
});
