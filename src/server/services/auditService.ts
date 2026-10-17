import { db, generateId } from "@/src/server/db/client";
import { runMigrations } from "@/src/server/db/migrations";
import crypto from "crypto";

export interface RecordAuditParams {
  workspaceId: string;
  campaignId?: string;
  actorId: string;
  eventType: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, any>;
}

export function computeEventHash(params: {
  prevHash: string | null;
  workspaceId: string;
  actorId: string;
  eventType: string;
  entityType: string;
  entityId: string;
  timestamp: string;
  metadataJson: string;
}): string {
  const content = `${params.prevHash || "GENESIS"}:${params.workspaceId}:${params.actorId}:${params.eventType}:${params.entityType}:${params.entityId}:${params.timestamp}:${params.metadataJson}`;
  return crypto.createHash("sha256").update(content).digest("hex");
}

export async function recordAuditEvent(params: RecordAuditParams): Promise<string> {
  await runMigrations();
  const eventId = generateId();
  const timestamp = new Date().toISOString();
  const metadataJson = JSON.stringify(params.metadata || {});

  // Fetch previous event's hash in this workspace
  const lastRes = await db.execute({
    sql: `SELECT hash FROM audit_events WHERE workspace_id = ? ORDER BY created_at DESC LIMIT 1`,
    args: [params.workspaceId],
  });

  const prevHash = lastRes.rows.length > 0 ? String(lastRes.rows[0].hash) : null;

  const currentHash = computeEventHash({
    prevHash,
    workspaceId: params.workspaceId,
    actorId: params.actorId,
    eventType: params.eventType,
    entityType: params.entityType,
    entityId: params.entityId,
    timestamp,
    metadataJson,
  });

  await db.execute({
    sql: `INSERT INTO audit_events (
      id, workspace_id, campaign_id, actor_id, event_type, entity_type,
      entity_id, prev_hash, hash, metadata_json, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      eventId,
      params.workspaceId,
      params.campaignId || null,
      params.actorId,
      params.eventType,
      params.entityType,
      params.entityId,
      prevHash,
      currentHash,
      metadataJson,
      timestamp,
    ],
  });

  return eventId;
}

/**
 * Verifies the mathematical integrity of the SHA-256 hash chain for a workspace.
 * Returns isValid: true/false and reports tampered event index if detected.
 */
export async function verifyAuditChain(workspaceId: string): Promise<{
  isValid: boolean;
  totalEvents: number;
  tamperedEventId?: string;
  error?: string;
}> {
  await runMigrations();

  const res = await db.execute({
    sql: `SELECT * FROM audit_events WHERE workspace_id = ? ORDER BY created_at ASC`,
    args: [workspaceId],
  });

  const events = res.rows;
  if (events.length === 0) {
    return { isValid: true, totalEvents: 0 };
  }

  let expectedPrevHash: string | null = null;

  for (let i = 0; i < events.length; i++) {
    const ev = events[i];
    const prevHash = ev.prev_hash ? String(ev.prev_hash) : null;
    const storedHash = String(ev.hash);

    // Verify linkage to previous event
    if (prevHash !== expectedPrevHash) {
      return {
        isValid: false,
        totalEvents: events.length,
        tamperedEventId: String(ev.id),
        error: `Broken chain link at index ${i}: prev_hash does not match preceding event hash.`,
      };
    }

    // Verify event hash recomputation
    const recomputed = computeEventHash({
      prevHash,
      workspaceId: String(ev.workspace_id),
      actorId: String(ev.actor_id),
      eventType: String(ev.event_type),
      entityType: String(ev.entity_type),
      entityId: String(ev.entity_id),
      timestamp: String(ev.created_at),
      metadataJson: String(ev.metadata_json || "{}"),
    });

    if (recomputed !== storedHash) {
      return {
        isValid: false,
        totalEvents: events.length,
        tamperedEventId: String(ev.id),
        error: `Content tampering detected at index ${i}: stored hash does not match payload.`,
      };
    }

    expectedPrevHash = storedHash;
  }

  return { isValid: true, totalEvents: events.length };
}
