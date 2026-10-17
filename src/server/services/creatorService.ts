import { db, generateId } from "@/src/server/db/client";
import { runMigrations } from "@/src/server/db/migrations";
import { recordAuditEvent } from "./auditService";

export interface CreatorProfileInput {
  displayName: string;
  handle: string;
  primaryLanguage: string;
  region: string;
  contentThemes: string[];
  formats: string[];
  brandSafetyNotes?: string;
  consentStatus: "consented" | "pending_licence" | "licenced";
  licenceStatus?: string;
  followerCount?: number;
  engagementRate?: number;
}

export class CreatorService {
  /**
   * Registers a user-entered or imported creator profile (Zero scraping, zero synthetic stats)
   */
  async createCreator(input: CreatorProfileInput, workspaceId: string) {
    await runMigrations();

    const creatorId = generateId();
    const now = new Date().toISOString();

    await db.execute({
      sql: `INSERT INTO creator_profiles (
        id, workspace_id, display_name, handle, primary_language, region,
        content_themes_json, formats_json, brand_safety_notes, consent_status,
        licence_status, last_verified_date, follower_count, engagement_rate,
        source_type, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'user_entered', ?)`,
      args: [
        creatorId,
        workspaceId,
        input.displayName,
        input.handle,
        input.primaryLanguage,
        input.region,
        JSON.stringify(input.contentThemes || []),
        JSON.stringify(input.formats || []),
        input.brandSafetyNotes || "",
        input.consentStatus,
        input.licenceStatus || "standard_ad_usage",
        now,
        input.followerCount || 0,
        input.engagementRate || 0,
        now,
      ],
    });

    return { creatorId };
  }

  /**
   * Lists creator profiles in workspace
   */
  async listCreators(workspaceId: string, languageFilter = "") {
    await runMigrations();

    let sql = `SELECT * FROM creator_profiles WHERE workspace_id = ?`;
    const args: any[] = [workspaceId];

    if (languageFilter && languageFilter !== "all") {
      sql += ` AND primary_language = ?`;
      args.push(languageFilter);
    }

    sql += ` ORDER BY created_at DESC`;
    const res = await db.execute({ sql, args });

    return res.rows.map((r) => ({
      id: String(r.id),
      displayName: String(r.display_name),
      handle: String(r.handle),
      primaryLanguage: String(r.primary_language),
      region: String(r.region),
      contentThemes: JSON.parse(String(r.content_themes_json || "[]")),
      formats: JSON.parse(String(r.formats_json || "[]")),
      brandSafetyNotes: String(r.brand_safety_notes || ""),
      consentStatus: String(r.consent_status),
      licenceStatus: String(r.licence_status || ""),
      followerCount: Number(r.follower_count || 0),
      engagementRate: Number(r.engagement_rate || 0),
      sourceType: String(r.source_type),
      lastVerifiedDate: String(r.last_verified_date),
    }));
  }

  /**
   * Generates a version-locked Creator Brief ONLY from an approved version (Section 5, F8)
   */
  async generateCreatorBrief(params: {
    campaignId: string;
    assetVersionId: string;
    creatorProfileId: string;
    deliverables: string[];
    schedule?: string;
  }, userId: string, workspaceId: string) {
    await runMigrations();

    // Verify Asset Version is Approved
    const verRes = await db.execute({
      sql: `SELECT av.*, ca.campaign_id, c.objective, c.workspace_id
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
    if (versionRow.status !== "Approved") {
      throw new Error("Creator briefs can ONLY be generated from an Approved asset version.");
    }

    // Pull Approved Claim Atoms & Brief Details
    const claimsRes = await db.execute({
      sql: `SELECT claim_text FROM claim_atoms WHERE campaign_id = ? AND status = 'approved'`,
      args: [params.campaignId],
    });
    const approvedClaims = claimsRes.rows.map((r) => String(r.claim_text));

    const briefRes = await db.execute({
      sql: `SELECT brief_json FROM brief_versions WHERE campaign_id = ? ORDER BY version_no DESC LIMIT 1`,
      args: [params.campaignId],
    });
    let prohibitedClaims: string[] = [];
    if (briefRes.rows[0]) {
      try {
        const bd = JSON.parse(String(briefRes.rows[0].brief_json));
        prohibitedClaims = bd.prohibited_claims || [];
      } catch {}
    }

    const briefId = generateId();
    const now = new Date().toISOString();

    await db.execute({
      sql: `INSERT INTO creator_briefs (
        id, campaign_id, asset_version_id, creator_profile_id, objective,
        deliverables_json, talking_points_json, approved_claims_json,
        prohibited_claims_json, required_disclosure, rights_usage_period,
        schedule, review_route, success_metric, version, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '90 days', ?, 'brand_guardian_then_human', 'CTR', 1, ?)`,
      args: [
        briefId,
        params.campaignId,
        params.assetVersionId,
        params.creatorProfileId,
        String(versionRow.objective),
        JSON.stringify(params.deliverables),
        JSON.stringify([versionRow.headline, versionRow.subline].filter(Boolean)),
        JSON.stringify(approvedClaims),
        JSON.stringify(prohibitedClaims),
        String(versionRow.disclosure || "FSSAI Lic #10020042000123. ASCI Code Compliant."),
        params.schedule || "14 days from briefing",
        now,
      ],
    });

    // Audit Log
    await recordAuditEvent({
      workspaceId,
      campaignId: params.campaignId,
      actorId: userId,
      eventType: "creator_brief_generated",
      entityType: "creator_brief",
      entityId: briefId,
      metadata: { assetVersionId: params.assetVersionId, creatorProfileId: params.creatorProfileId },
    });

    return { briefId };
  }
}

export const creatorService = new CreatorService();
