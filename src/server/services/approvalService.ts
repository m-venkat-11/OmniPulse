import { db, generateId } from "@/src/server/db/client";
import { runMigrations } from "@/src/server/db/migrations";
import { recordAuditEvent } from "./auditService";

export type AssetStatus =
  | "Draft"
  | "Generated"
  | "Verification"
  | "ReadyForReview"
  | "InReview"
  | "NeedsChanges"
  | "Rejected"
  | "Approved";

// ── State Transition Table (Diagram 4.4) ──
const ALLOWED_TRANSITIONS: Record<AssetStatus, AssetStatus[]> = {
  Draft: ["Generated", "Verification"],
  Generated: ["Verification"],
  Verification: ["ReadyForReview", "NeedsChanges"],
  ReadyForReview: ["InReview", "NeedsChanges"],
  InReview: ["Approved", "NeedsChanges", "Rejected"],
  NeedsChanges: ["Draft", "Verification"], // When new version is created
  Rejected: ["Draft", "Verification"], // When revised
  Approved: ["Draft", "Verification"], // When content is edited into new version
};

export class ApprovalService {
  /**
   * Validates if a state transition is permitted by the 4.4 state machine
   */
  isValidTransition(from: AssetStatus, to: AssetStatus): boolean {
    const allowed = ALLOWED_TRANSITIONS[from];
    return Boolean(allowed && allowed.includes(to));
  }

  /**
   * Processes a human reviewer decision (Approve, RequestChanges, Reject)
   * with strict version-locking gates
   */
  async submitReviewDecision(params: {
    assetVersionId: string;
    expectedContentHash: string;
    decision: "Approve" | "RequestChanges" | "Reject";
    rationale?: string;
    overrideReason?: string;
  }, reviewerId: string, workspaceId: string) {
    await runMigrations();

    // 1. Fetch Asset Version, Creative Asset & Parent Campaign
    const verRes = await db.execute({
      sql: `SELECT av.*, ca.campaign_id, c.workspace_id
            FROM asset_versions av
            JOIN creative_assets ca ON ca.id = av.creative_asset_id
            JOIN campaigns c ON c.id = ca.campaign_id
            WHERE av.id = ? AND c.workspace_id = ?`,
      args: [params.assetVersionId, workspaceId],
    });

    if (verRes.rows.length === 0) {
      throw new Error("Asset version not found or access denied.");
    }

    const versionRow = verRes.rows[0];
    const currentStatus = String(versionRow.status) as AssetStatus;
    const currentHash = String(versionRow.content_hash);
    const authorId = String(versionRow.created_by);

    // GATE 1: Hash Integrity Check (Reviewer must approve the exact hash they viewed)
    if (params.expectedContentHash !== currentHash) {
      throw new Error("Stale version conflict: Content was modified while review was open. Review the latest version.");
    }

    // GATE 2: Author != Approver separation
    if (params.decision === "Approve" && authorId === reviewerId) {
      if (!params.overrideReason || params.overrideReason.trim().length === 0) {
        throw new Error("Separation of duties violation: Authors cannot approve their own copy without written admin override.");
      }
    }

    // GATE 3: Brand Guardian Verification must have run on this version
    const runsRes = await db.execute({
      sql: `SELECT id, status FROM verification_runs WHERE asset_version_id = ? ORDER BY created_at DESC LIMIT 1`,
      args: [params.assetVersionId],
    });

    if (runsRes.rows.length === 0) {
      throw new Error("Illegal approval: Brand Guardian checks have not run on this exact version.");
    }
    const runId = String(runsRes.rows[0].id);

    // GATE 4: Check for open blocking findings
    const blockersRes = await db.execute({
      sql: `SELECT COUNT(*) as cnt FROM verification_findings
            WHERE verification_run_id = ? AND (severity = 'Critical' OR result_class = 'Contradicted') AND recheck_status = 'open'`,
      args: [runId],
    });
    const openBlockers = Number(blockersRes.rows[0]?.cnt ?? 0);

    if (params.decision === "Approve" && openBlockers > 0) {
      if (!params.overrideReason || params.overrideReason.trim().length === 0) {
        throw new Error(`Approval blocked: ${openBlockers} critical findings remain open. Supply an authorized written override rationale to proceed.`);
      }
    }

    // 2. Determine Next Status based on State Machine
    let targetStatus: AssetStatus;
    if (params.decision === "Approve") {
      targetStatus = "Approved";
    } else if (params.decision === "RequestChanges") {
      targetStatus = "NeedsChanges";
    } else {
      targetStatus = "Rejected";
    }

    // Enforce state transition rules
    // If currently ReadyForReview or InReview, allow transition
    if (currentStatus !== "ReadyForReview" && currentStatus !== "InReview" && currentStatus !== "Draft") {
      if (!this.isValidTransition(currentStatus, targetStatus)) {
        throw new Error(`Illegal state transition from ${currentStatus} to ${targetStatus}`);
      }
    }

    // 3. Record Immutable Approval Decision
    const decisionId = generateId();
    const now = new Date().toISOString();

    await db.execute({
      sql: `INSERT INTO approval_decisions (
        id, asset_version_id, target_type, content_hash, reviewer_id,
        decision, override_reason, rationale, decided_at
      ) VALUES (?, ?, 'asset', ?, ?, ?, ?, ?, ?)`,
      args: [
        decisionId,
        params.assetVersionId,
        currentHash,
        reviewerId,
        params.decision,
        params.overrideReason || "",
        params.rationale || "",
        now,
      ],
    });

    // 4. Update Asset Version Status
    await db.execute({
      sql: `UPDATE asset_versions SET status = ? WHERE id = ?`,
      args: [targetStatus, params.assetVersionId],
    });

    // 5. Hash-chained Audit Event
    await recordAuditEvent({
      workspaceId,
      campaignId: String(versionRow.campaign_id),
      actorId: reviewerId,
      eventType: `version_${params.decision.toLowerCase()}`,
      entityType: "asset_version",
      entityId: params.assetVersionId,
      metadata: {
        decisionId,
        decision: params.decision,
        contentHash: currentHash,
        overrideReason: params.overrideReason || null,
      },
    });

    return { decisionId, status: targetStatus, contentHash: currentHash };
  }
}

export const approvalService = new ApprovalService();
