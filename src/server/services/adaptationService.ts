import { db, generateId } from "@/src/server/db/client";
import { runMigrations } from "@/src/server/db/migrations";
import { aiOrchestrator } from "@/src/server/ai/orchestrator";
import { recordAuditEvent } from "./auditService";
import crypto from "crypto";

export interface GenerateAdaptationParams {
  campaignId: string;
  sourceText: string;
  sourceLanguage: string;
  targetLanguage: string;
  region?: string;
  dialect?: string;
  tone: string;
  formality: string;
  slangIntensity: string;
  culturalContext?: string;
  channel?: string;
}

function computeContentHash(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex");
}

export class AdaptationService {
  /**
   * Generates dual-output adaptation (Literal translation via Sarvam,
   * Natural transcreation via Gemini) and saves immutable asset_version 1
   */
  async generateAssetAdaptation(params: GenerateAdaptationParams, userId: string, workspaceId: string) {
    await runMigrations();

    // 1. Fetch Campaign and Claim Atoms
    const campRes = await db.execute({
      sql: `SELECT * FROM campaigns WHERE id = ? AND workspace_id = ?`,
      args: [params.campaignId, workspaceId],
    });
    if (campRes.rows.length === 0) {
      throw new Error("Campaign not found or access denied.");
    }
    const campaign = campRes.rows[0];

    const claimsRes = await db.execute({
      sql: `SELECT id, claim_text, type FROM claim_atoms WHERE campaign_id = ?`,
      args: [params.campaignId],
    });
    const approvedClaims = claimsRes.rows.map((r) => ({
      id: String(r.id),
      text: String(r.claim_text),
      type: String(r.type),
    }));

    // 2. Fetch Latest Brief Version ID
    const briefRes = await db.execute({
      sql: `SELECT id, brief_json FROM brief_versions WHERE campaign_id = ? ORDER BY version_no DESC LIMIT 1`,
      args: [params.campaignId],
    });
    const briefVersionId = briefRes.rows[0] ? String(briefRes.rows[0].id) : null;
    let prohibitedClaims: string[] = [];
    let mandatoryDisclosures: string[] = [];
    if (briefRes.rows[0]) {
      try {
        const briefData = JSON.parse(String(briefRes.rows[0].brief_json));
        prohibitedClaims = briefData.prohibited_claims || [];
        mandatoryDisclosures = briefData.mandatory_disclosures || [];
      } catch {}
    }

    // 3. Call Dual AI Orchestrator
    const aiOutput = await aiOrchestrator.adapt({
      sourceText: params.sourceText,
      sourceLanguage: params.sourceLanguage,
      targetLanguage: params.targetLanguage,
      region: params.region,
      dialect: params.dialect,
      tone: params.tone,
      formality: params.formality,
      slangIntensity: params.slangIntensity,
      culturalContext: params.culturalContext,
      brandName: String(campaign.brand_name),
      productName: String(campaign.product_name),
      approvedClaims,
      prohibitedClaims,
      mandatoryDisclosures,
      channel: params.channel,
    });

    const creativeAssetId = generateId();
    const assetVersionId = generateId();
    const now = new Date().toISOString();

    const fullCombinedText = `${aiOutput.asset_text.headline}\n${aiOutput.asset_text.subline}\n${aiOutput.asset_text.body}\n${aiOutput.asset_text.cta}\n${aiOutput.asset_text.disclosure}`;
    const contentHash = computeContentHash(fullCombinedText);

    // 4. Create Creative Asset
    await db.execute({
      sql: `INSERT INTO creative_assets (
        id, campaign_id, asset_type, channel, target_language, region, dialect, created_at
      ) VALUES (?, ?, 'copy', ?, ?, ?, ?, ?)`,
      args: [
        creativeAssetId,
        params.campaignId,
        params.channel || "social_media",
        params.targetLanguage,
        params.region || "",
        params.dialect || "standard",
        now,
      ],
    });

    // 5. Create Immutable Asset Version 1
    await db.execute({
      sql: `INSERT INTO asset_versions (
        id, creative_asset_id, version_no, source_brief_version_id,
        headline, subline, body, cta, disclosure,
        literal_translation, regional_adaptation, adaptation_rationale_json,
        content_hash, angle, prompt_template_version, provider_metadata_json,
        status, created_by, created_at
      ) VALUES (?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'v3.0', ?, 'Draft', ?, ?)`,
      args: [
        assetVersionId,
        creativeAssetId,
        briefVersionId,
        aiOutput.asset_text.headline,
        aiOutput.asset_text.subline || "",
        aiOutput.asset_text.body || "",
        aiOutput.asset_text.cta || "",
        aiOutput.asset_text.disclosure || "",
        aiOutput.literal_translation,
        fullCombinedText,
        JSON.stringify(aiOutput.adaptation_rationale),
        contentHash,
        aiOutput.angle || "regional_authenticity",
        JSON.stringify({
          locked_tokens_used: aiOutput.locked_tokens_used,
          review_flags: aiOutput.review_flags,
          uncertain_local_context: aiOutput.uncertain_local_context,
        }),
        userId,
        now,
      ],
    });

    // 6. Record Audit Event
    await recordAuditEvent({
      workspaceId,
      campaignId: params.campaignId,
      actorId: userId,
      eventType: "asset_version_generated",
      entityType: "asset_version",
      entityId: assetVersionId,
      metadata: { creativeAssetId, version_no: 1, contentHash, targetLanguage: params.targetLanguage },
    });

    return {
      creativeAssetId,
      assetVersionId,
      versionNo: 1,
      literalTranslation: aiOutput.literal_translation,
      regionalAdaptation: aiOutput.asset_text,
      rationale: aiOutput.adaptation_rationale,
      reviewFlags: aiOutput.review_flags,
      contentHash,
    };
  }

  /**
   * Human Edits Content: creates next version (v2, v3) and resets approval to Draft (Diagram 4.4)
   */
  async createEditedVersion(params: {
    creativeAssetId: string;
    headline: string;
    subline?: string;
    body?: string;
    cta?: string;
    disclosure?: string;
    literalTranslation?: string;
  }, userId: string, workspaceId: string) {
    await runMigrations();

    // Verify Asset
    const assetRes = await db.execute({
      sql: `SELECT ca.id, ca.campaign_id, c.workspace_id
            FROM creative_assets ca
            JOIN campaigns c ON c.id = ca.campaign_id
            WHERE ca.id = ? AND c.workspace_id = ?`,
      args: [params.creativeAssetId, workspaceId],
    });
    if (assetRes.rows.length === 0) {
      throw new Error("Asset not found or access denied.");
    }
    const campaignId = String(assetRes.rows[0].campaign_id);

    // Get current version count
    const verRes = await db.execute({
      sql: `SELECT MAX(version_no) as max_v, source_brief_version_id
            FROM asset_versions WHERE creative_asset_id = ?`,
      args: [params.creativeAssetId],
    });
    const currentMax = Number(verRes.rows[0]?.max_v ?? 1);
    const nextVersion = currentMax + 1;
    const briefVersionId = verRes.rows[0]?.source_brief_version_id ? String(verRes.rows[0].source_brief_version_id) : null;

    const fullText = `${params.headline}\n${params.subline || ""}\n${params.body || ""}\n${params.cta || ""}\n${params.disclosure || ""}`;
    const contentHash = computeContentHash(fullText);
    const newVersionId = generateId();
    const now = new Date().toISOString();

    // Insert new immutable asset version with status 'Draft' (approval does not carry over!)
    await db.execute({
      sql: `INSERT INTO asset_versions (
        id, creative_asset_id, version_no, source_brief_version_id,
        headline, subline, body, cta, disclosure,
        literal_translation, regional_adaptation, adaptation_rationale_json,
        content_hash, angle, prompt_template_version, provider_metadata_json,
        status, created_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '[]', ?, 'human_edited', 'v3.0', '{}', 'Draft', ?, ?)`,
      args: [
        newVersionId,
        params.creativeAssetId,
        nextVersion,
        briefVersionId,
        params.headline,
        params.subline || "",
        params.body || "",
        params.cta || "",
        params.disclosure || "",
        params.literalTranslation || "",
        fullText,
        contentHash,
        userId,
        now,
      ],
    });

    // Audit Log
    await recordAuditEvent({
      workspaceId,
      campaignId,
      actorId: userId,
      eventType: "asset_version_edited",
      entityType: "asset_version",
      entityId: newVersionId,
      metadata: { version_no: nextVersion, contentHash, parentAssetId: params.creativeAssetId },
    });

    return { assetVersionId: newVersionId, versionNo: nextVersion, contentHash };
  }

  /**
   * Regional Review Loop: Store reviewer phrase feedback tag
   */
  async recordReviewerFeedback(params: {
    languagePair: string;
    region?: string;
    assetVersionId?: string;
    phraseOriginal: string;
    phraseAdapted: string;
    tag: "accurate" | "awkward" | "culturally_mismatched" | "brand_risk" | "needs_native_review";
    comment?: string;
  }, userId: string, workspaceId: string) {
    await runMigrations();

    const feedbackId = generateId();
    await db.execute({
      sql: `INSERT INTO reviewer_feedbacks (
        id, workspace_id, language_pair, region, asset_version_id,
        author_id, phrase_original, phrase_adapted, tag, comment, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        feedbackId,
        workspaceId,
        params.languagePair,
        params.region || "",
        params.assetVersionId || null,
        userId,
        params.phraseOriginal,
        params.phraseAdapted,
        params.tag,
        params.comment || "",
        new Date().toISOString(),
      ],
    });

    return { feedbackId };
  }
}

export const adaptationService = new AdaptationService();
