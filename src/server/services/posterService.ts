import { db, generateId } from "@/src/server/db/client";
import { runMigrations } from "@/src/server/db/migrations";
import { aiOrchestrator } from "@/src/server/ai/orchestrator";
import { geminiService } from "@/src/server/ai/gemini";
import { PosterSpec } from "@/src/server/ai/types";
import { recordAuditEvent } from "./auditService";
import crypto from "crypto";
import fs from "fs";
import path from "path";

export interface GeneratePosterParams {
  assetVersionId: string;
  format: "1:1" | "4:5" | "9:16" | "16:9";
  visualBrief?: string;
  brandColors?: string;
}

function computeTextHash(text: string): string {
  return crypto.createHash("sha256").update(text).digest("hex");
}

export class PosterService {
  /**
   * Generates Ad Poster Spec & Background Artwork (Section 7)
   */
  async generatePoster(params: GeneratePosterParams, userId: string, workspaceId: string) {
    await runMigrations();

    // 1. Fetch Asset Version and Parent Campaign
    const verRes = await db.execute({
      sql: `SELECT av.*, ca.campaign_id, ca.target_language, c.brand_name, c.product_name, c.workspace_id
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
    const fullText = `${versionRow.headline}\n${versionRow.subline || ""}\n${versionRow.body || ""}\n${versionRow.cta || ""}\n${versionRow.disclosure || ""}`;
    const textHash = computeTextHash(fullText);

    // 2. Gemini Art Direction (PosterSpec)
    const spec = await aiOrchestrator.generatePosterSpec({
      headline: String(versionRow.headline),
      subline: String(versionRow.subline || ""),
      brandName: String(versionRow.brand_name),
      productName: String(versionRow.product_name),
      targetLanguage: String(versionRow.target_language),
      format: params.format,
      visualBrief: params.visualBrief,
      brandColors: params.brandColors,
    });

    // 3. Generate Text-Free Background Image via Gemini Imagen
    let bgImagePath = "";
    let isAiImage = false;

    try {
      const imgBuffer = await geminiService.generateImage(spec.background_prompt, params.format);
      if (imgBuffer) {
        const uploadsDir = path.join(process.cwd(), "public", "uploads", "posters");
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const fileName = `bg-${generateId()}.png`;
        const filePath = path.join(uploadsDir, fileName);
        fs.writeFileSync(filePath, imgBuffer);
        bgImagePath = `/uploads/posters/${fileName}`;
        isAiImage = true;

        // Record in file_assets table
        await db.execute({
          sql: `INSERT INTO file_assets (id, workspace_id, file_path, file_name, mime_type, file_size, storage_type)
                VALUES (?, ?, ?, ?, 'image/png', ?, 'local')`,
          args: [generateId(), workspaceId, bgImagePath, fileName, imgBuffer.length],
        });
      }
    } catch (err: any) {
      console.warn("[PosterService] Image generation fallback to brand canvas:", err.message);
    }

    // 4. Create Immutable poster_version row bound to asset_version_id and textHash
    const posterVersionId = generateId();
    const now = new Date().toISOString();

    await db.execute({
      sql: `INSERT INTO poster_versions (
        id, asset_version_id, layout_template_id, format, background_prompt,
        background_image_path, text_hash, palette_json, status, is_approved, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'draft', 0, ?)`,
      args: [
        posterVersionId,
        params.assetVersionId,
        spec.layout_template_id,
        params.format,
        spec.background_prompt,
        bgImagePath,
        textHash,
        JSON.stringify(spec.palette),
        now,
      ],
    });

    // 5. Audit Log
    await recordAuditEvent({
      workspaceId,
      campaignId: String(versionRow.campaign_id),
      actorId: userId,
      eventType: "poster_generated",
      entityType: "poster_version",
      entityId: posterVersionId,
      metadata: { format: params.format, textHash, isAiImage },
    });

    return {
      posterVersionId,
      layoutTemplateId: spec.layout_template_id,
      format: params.format,
      palette: spec.palette,
      backgroundPrompt: spec.background_prompt,
      backgroundImagePath: bgImagePath,
      isAiImage,
      textHash,
      textZones: spec.text_zones,
      textContent: {
        headline: String(versionRow.headline),
        subline: String(versionRow.subline || ""),
        body: String(versionRow.body || ""),
        cta: String(versionRow.cta || ""),
        disclosure: String(versionRow.disclosure || ""),
        targetLanguage: String(versionRow.target_language),
      },
    };
  }

  /**
   * Approves a Poster Version
   */
  async approvePoster(posterId: string, userId: string, workspaceId: string) {
    await runMigrations();

    const posterRes = await db.execute({
      sql: `SELECT pv.*, av.creative_asset_id, ca.campaign_id
            FROM poster_versions pv
            JOIN asset_versions av ON av.id = pv.asset_version_id
            JOIN creative_assets ca ON ca.id = av.creative_asset_id
            JOIN campaigns c ON c.id = ca.campaign_id
            WHERE pv.id = ? AND c.workspace_id = ?`,
      args: [posterId, workspaceId],
    });

    if (posterRes.rows.length === 0) {
      throw new Error("Poster not found or access denied.");
    }

    const row = posterRes.rows[0];

    // Record approval in approval_decisions
    const decisionId = generateId();
    const now = new Date().toISOString();

    await db.execute({
      sql: `INSERT INTO approval_decisions (
        id, asset_version_id, target_type, content_hash, reviewer_id,
        decision, override_reason, rationale, decided_at
      ) VALUES (?, ?, 'poster', ?, ?, 'Approve', '', 'Poster approved for export', ?)`,
      args: [decisionId, String(row.asset_version_id), String(row.text_hash), userId, now],
    });

    // Audit Log
    await recordAuditEvent({
      workspaceId,
      campaignId: String(row.campaign_id),
      actorId: userId,
      eventType: "poster_approved",
      entityType: "poster_version",
      entityId: posterId,
      metadata: { textHash: String(row.text_hash) },
    });

    return { success: true, decisionId };
  }
}

export const posterService = new PosterService();
