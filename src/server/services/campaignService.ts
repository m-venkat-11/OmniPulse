import { db, generateId } from "@/src/server/db/client";
import { runMigrations } from "@/src/server/db/migrations";
import { z } from "zod";
import crypto from "crypto";
import { recordAuditEvent } from "./auditService";

// ── Brief Validation Schema (Zod) ──
export const CampaignBriefSchema = z.object({
  name: z.string().min(3, "Campaign name must be at least 3 characters"),
  brand_name: z.string().min(2, "Brand name is required"),
  product_name: z.string().min(2, "Product name is required"),
  objective: z.string().min(10, "Objective must be at least 10 characters"),
  target_audience: z.string().optional().default(""),
  region: z.string().min(2, "Target region/market is required"),
  source_language: z.string().default("English"),
  target_languages: z.array(z.string()).min(1, "Select at least one target language"),
  channels: z.array(z.string()).min(1, "Select at least one target channel"),
  content_format: z.string().optional().default("copy"),
  key_message: z.string().optional().default(""),
  call_to_action: z.string().optional().default(""),
  tone: z.string().default("Professional & Trustworthy"),
  mandatory_disclosures: z.array(z.string()).optional().default([]),
  prohibited_claims: z.array(z.string()).optional().default([]),
  budget_assumptions: z.string().optional().default(""),
  approved_claims: z.array(
    z.object({
      claim_text: z.string(),
      type: z.enum([
        "product_fact",
        "approved_term",
        "prohibited_claim",
        "disclosure",
        "offer_price",
        "legal_high_risk",
      ]),
      locked_tokens: z.array(z.string()).optional().default([]),
      qualifications: z.string().optional().default(""),
    })
  ).optional().default([]),
});

export type CampaignBriefInput = z.input<typeof CampaignBriefSchema>;

function computeHash(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex");
}

export class CampaignService {
  /**
   * Creates a new Campaign and stores immutable Brief Version 1
   */
  async createCampaign(input: CampaignBriefInput, userId: string, workspaceId: string) {
    await runMigrations();
    const validated = CampaignBriefSchema.parse(input);

    const campaignId = generateId();
    const briefVersionId = generateId();
    const now = new Date().toISOString();

    const briefJson = JSON.stringify(validated);
    const contentHash = computeHash(briefJson);

    // 1. Insert Campaign
    await db.execute({
      sql: `INSERT INTO campaigns (
        id, workspace_id, name, brand_name, product_name, objective,
        target_audience, region, source_language, target_languages_json,
        channels_json, budget_assumptions, status, owner_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?, ?)`,
      args: [
        campaignId,
        workspaceId,
        validated.name,
        validated.brand_name,
        validated.product_name,
        validated.objective,
        validated.target_audience || "",
        validated.region,
        validated.source_language,
        JSON.stringify(validated.target_languages),
        JSON.stringify(validated.channels),
        validated.budget_assumptions || "",
        userId,
        now,
        now,
      ],
    });

    // 2. Insert Immutable Brief Version 1
    await db.execute({
      sql: `INSERT INTO brief_versions (
        id, campaign_id, version_no, content_hash, brief_json, created_by, created_at
      ) VALUES (?, ?, 1, ?, ?, ?, ?)`,
      args: [briefVersionId, campaignId, contentHash, briefJson, userId, now],
    });

    // 3. Create Claim Atoms from approved claims
    if (validated.approved_claims && validated.approved_claims.length > 0) {
      for (const claim of validated.approved_claims) {
        const claimId = generateId();
        await db.execute({
          sql: `INSERT INTO claim_atoms (
            id, campaign_id, claim_text, type, status, version, locked_tokens_json, qualifications, created_at
          ) VALUES (?, ?, ?, ?, 'approved', 1, ?, ?, ?)`,
          args: [
            claimId,
            campaignId,
            claim.claim_text,
            claim.type,
            JSON.stringify(claim.locked_tokens || []),
            claim.qualifications || "",
            now,
          ],
        });
      }
    }

    // 4. Audit Log
    await recordAuditEvent({
      workspaceId,
      campaignId,
      actorId: userId,
      eventType: "campaign_created",
      entityType: "campaign",
      entityId: campaignId,
      metadata: { briefVersionId, contentHash },
    });

    return { campaignId, briefVersionId };
  }

  /**
   * Updates an existing campaign by creating a new immutable brief version (v2, v3...)
   */
  async updateBrief(campaignId: string, input: CampaignBriefInput, userId: string, workspaceId: string) {
    await runMigrations();
    const validated = CampaignBriefSchema.parse(input);

    // Verify workspace access
    const campRes = await db.execute({
      sql: `SELECT id FROM campaigns WHERE id = ? AND workspace_id = ?`,
      args: [campaignId, workspaceId],
    });
    if (campRes.rows.length === 0) {
      throw new Error("Campaign not found or access denied.");
    }

    // Get current version count
    const verRes = await db.execute({
      sql: `SELECT MAX(version_no) as max_v FROM brief_versions WHERE campaign_id = ?`,
      args: [campaignId],
    });
    const currentMax = Number(verRes.rows[0]?.max_v ?? 1);
    const nextVersion = currentMax + 1;

    const briefVersionId = generateId();
    const briefJson = JSON.stringify(validated);
    const contentHash = computeHash(briefJson);
    const now = new Date().toISOString();

    // Insert new immutable brief version
    await db.execute({
      sql: `INSERT INTO brief_versions (
        id, campaign_id, version_no, content_hash, brief_json, created_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [briefVersionId, campaignId, nextVersion, contentHash, briefJson, userId, now],
    });

    // Update campaign summary fields
    await db.execute({
      sql: `UPDATE campaigns SET
        name = ?, brand_name = ?, product_name = ?, objective = ?,
        target_audience = ?, region = ?, target_languages_json = ?,
        channels_json = ?, updated_at = ?
        WHERE id = ? AND workspace_id = ?`,
      args: [
        validated.name,
        validated.brand_name,
        validated.product_name,
        validated.objective,
        validated.target_audience || "",
        validated.region,
        JSON.stringify(validated.target_languages),
        JSON.stringify(validated.channels),
        now,
        campaignId,
        workspaceId,
      ],
    });

    // Audit Log
    await recordAuditEvent({
      workspaceId,
      campaignId,
      actorId: userId,
      eventType: "brief_version_created",
      entityType: "brief_version",
      entityId: briefVersionId,
      metadata: { version_no: nextVersion, contentHash },
    });

    return { campaignId, briefVersionId, versionNo: nextVersion };
  }

  /**
   * Retrieves campaign with its latest brief version and claim atoms
   */
  async getCampaign(campaignId: string, workspaceId: string) {
    await runMigrations();

    const campRes = await db.execute({
      sql: `SELECT * FROM campaigns WHERE id = ? AND workspace_id = ?`,
      args: [campaignId, workspaceId],
    });
    if (campRes.rows.length === 0) return null;

    const campaign = campRes.rows[0];

    const briefRes = await db.execute({
      sql: `SELECT * FROM brief_versions WHERE campaign_id = ? ORDER BY version_no DESC LIMIT 1`,
      args: [campaignId],
    });

    const claimsRes = await db.execute({
      sql: `SELECT * FROM claim_atoms WHERE campaign_id = ? ORDER BY created_at DESC`,
      args: [campaignId],
    });

    const assetsRes = await db.execute({
      sql: `SELECT ca.id as asset_id, ca.channel, ca.target_language, ca.region,
                   av.id as version_id, av.version_no, av.headline, av.status, av.created_at
            FROM creative_assets ca
            LEFT JOIN asset_versions av ON av.creative_asset_id = ca.id
            WHERE ca.campaign_id = ?
            ORDER BY av.created_at DESC`,
      args: [campaignId],
    });

    return {
      campaign,
      latestBrief: briefRes.rows[0] ? JSON.parse(String(briefRes.rows[0].brief_json)) : null,
      briefVersion: briefRes.rows[0],
      claims: claimsRes.rows,
      assets: assetsRes.rows,
    };
  }

  /**
   * Lists campaigns in workspace with search and filtering
   */
  async listCampaigns(workspaceId: string, search = "", statusFilter = "") {
    await runMigrations();

    let sql = `SELECT c.*, u.name as owner_name,
                      (SELECT COUNT(*) FROM creative_assets WHERE campaign_id = c.id) as asset_count
               FROM campaigns c
               LEFT JOIN users u ON u.id = c.owner_id
               WHERE c.workspace_id = ?`;
    const args: any[] = [workspaceId];

    if (search.trim()) {
      sql += ` AND (c.name LIKE ? OR c.brand_name LIKE ? OR c.product_name LIKE ?)`;
      const term = `%${search.trim()}%`;
      args.push(term, term, term);
    }

    if (statusFilter && statusFilter !== "all") {
      sql += ` AND c.status = ?`;
      args.push(statusFilter);
    }

    sql += ` ORDER BY c.updated_at DESC`;

    const res = await db.execute({ sql, args });
    return res.rows;
  }
}

export const campaignService = new CampaignService();
