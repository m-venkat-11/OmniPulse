import { db, generateId } from "@/src/server/db/client";
import { runMigrations } from "@/src/server/db/migrations";
import { geminiService } from "@/src/server/ai/gemini";
import { z } from "zod";
import crypto from "crypto";

export interface FindingInput {
  detectionLayer: "deterministic_layer1" | "ai_layer2";
  spanStart: number;
  spanEnd: number;
  quotedText: string;
  category: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  resultClass: "Supported" | "Unsupported" | "Contradicted" | "Evidence missing" | "Rule violation";
  ruleId?: string;
  claimAtomId?: string;
  explanation: string;
  suggestedCorrection?: string;
  evidenceStatus?: string;
}

/**
 * Normalizes text to Unicode NFC and strips zero-width spaces/joiners
 */
export function normalizeCleanText(text: string): string {
  if (!text) return "";
  // Unicode NFC normalization
  const nfc = text.normalize("NFC");
  // Strip zero-width characters: \u200B (ZWSP), \u200C (ZWNJ), \u200D (ZWJ), \uFEFF (BOM)
  return nfc.replace(/[\u200B\u200C\u200D\uFEFF]/g, "");
}

/**
 * Counts grapheme clusters using Intl.Segmenter
 */
export function countGraphemes(text: string, locale = "en"): number {
  if (!text) return 0;
  const segmenter = new Intl.Segmenter(locale, { granularity: "grapheme" });
  let count = 0;
  for (const _ of segmenter.segment(text)) {
    count++;
  }
  return count;
}

/**
 * Deterministic Prohibited Phrase Patterns (native Indic & English transliterations)
 */
const UNIVERSAL_PROHIBITED_PATTERNS = [
  { pattern: /\b100%\s*(cure[sd]?|safe|guaranteed?)\b/i, label: "100% cure / absolute guarantee", severity: "Critical" as const },
  { pattern: /\b(permanently\s+cure[sd]?|miracle\s+cure)\b/i, label: "Permanent / miracle cure", severity: "Critical" as const },
  { pattern: /\b(cures?\s+(acidity|diabetes|cancer|hypertension))\b/i, label: "Unsubstantiated disease cure", severity: "Critical" as const },
  { pattern: /\b(#1|number\s*one|best\s+in\s+india)\b/i, label: "Unverified superlative claim", severity: "High" as const },
  { pattern: /\b(risk[\s-]?free|instant\s+weight\s+loss)\b/i, label: "Misleading marketing superlative", severity: "High" as const },
];

export class GuardianService {
  /**
   * Layer 1: Deterministic verification (Unicode NFC, zero-width spaces, locked tokens, prohibited words)
   */
  runDeterministicLayer1(text: string, rules: {
    prohibitedPhrases: string[];
    mandatoryDisclosures: string[];
    lockedTokens: string[];
  }): FindingInput[] {
    const findings: FindingInput[] = [];
    const cleaned = normalizeCleanText(text);

    // 1. Check universal prohibited phrases
    for (const rule of UNIVERSAL_PROHIBITED_PATTERNS) {
      const match = rule.pattern.exec(cleaned);
      if (match) {
        findings.push({
          detectionLayer: "deterministic_layer1",
          spanStart: match.index,
          spanEnd: match.index + match[0].length,
          quotedText: match[0],
          category: "Prohibited Claim",
          severity: rule.severity,
          resultClass: "Rule violation",
          explanation: `Matches prohibited advertising pattern: "${rule.label}". Absolute health or guarantee claims violate ASCI guidelines.`,
          suggestedCorrection: "Rephrase with substantiated benefit language (e.g. 'Supports digestive balance').",
        });
      }
    }

    // 2. Check campaign-specific prohibited phrases
    for (const phrase of rules.prohibitedPhrases) {
      if (!phrase.trim()) continue;
      const cleanPhrase = normalizeCleanText(phrase);
      const idx = cleaned.toLowerCase().indexOf(cleanPhrase.toLowerCase());
      if (idx !== -1) {
        findings.push({
          detectionLayer: "deterministic_layer1",
          spanStart: idx,
          spanEnd: idx + cleanPhrase.length,
          quotedText: cleaned.substring(idx, idx + cleanPhrase.length),
          category: "Brand Prohibited Phrase",
          severity: "Critical",
          resultClass: "Rule violation",
          explanation: `Explicitly forbidden brand phrase detected: "${phrase}".`,
          suggestedCorrection: "Remove or replace with approved terminology.",
        });
      }
    }

    // 3. Check locked token integrity (numbers, units, qualifiers like 'up to')
    for (const token of rules.lockedTokens) {
      if (!token.trim()) continue;
      const cleanToken = normalizeCleanText(token);
      if (!cleaned.includes(cleanToken)) {
        findings.push({
          detectionLayer: "deterministic_layer1",
          spanStart: 0,
          spanEnd: 0,
          quotedText: token,
          category: "Locked Token Integrity",
          severity: "High",
          resultClass: "Rule violation",
          explanation: `Required locked token "${token}" was modified or omitted in the adapted content.`,
          suggestedCorrection: `Ensure the exact approved term or numeric specification "${token}" is preserved.`,
        });
      }
    }

    // 4. Check mandatory disclosures
    for (const disclosure of rules.mandatoryDisclosures) {
      if (!disclosure.trim()) continue;
      const cleanDisc = normalizeCleanText(disclosure);
      if (!cleaned.toLowerCase().includes(cleanDisc.toLowerCase())) {
        findings.push({
          detectionLayer: "deterministic_layer1",
          spanStart: 0,
          spanEnd: 0,
          quotedText: disclosure,
          category: "Mandatory Disclosure Missing",
          severity: "Critical",
          resultClass: "Rule violation",
          explanation: `Mandatory legal disclosure was not found in the creative: "${disclosure}".`,
          suggestedCorrection: `Append disclosure: "${disclosure}"`,
        });
      }
    }

    return findings;
  }

  /**
   * Layer 2: AI Claim Verification via Gemini comparing against Claim Atoms
   */
  async runAiLayer2(text: string, claimAtoms: Array<{ id: string; claim_text: string; type: string }>): Promise<FindingInput[]> {
    if (!claimAtoms || claimAtoms.length === 0) {
      return [];
    }

    const prompt = `You are a compliance Brand Guardian checking advertising copy against approved Claim Atoms.

Copy to analyze:
"""
${text}
"""

Approved Claim Atoms:
${claimAtoms.map((a) => `- ID: [${a.id}] | Type: ${a.type} | Text: "${a.claim_text}"`).join("\n")}

Instructions:
1. Identify any factual or comparative assertions in the copy.
2. For each assertion:
   - If supported by an approved atom, classify as 'Supported'.
   - If not mentioned in any atom, classify as 'Unsupported' (evidence missing).
   - If directly contradicting an approved atom (e.g. claiming an unapproved ingredient, higher percentage, or instant cure), classify as 'Contradicted'.
3. Quote the exact text span and provide a clear explanation citing the Atom ID if applicable, or stating 'Evidence missing, human verification required.'
4. Suggest a safe correction.

Return JSON conforming to schema.`;

    const schema = z.object({
      findings: z.array(
        z.object({
          quoted_text: z.string(),
          category: z.string(),
          severity: z.enum(["Low", "Medium", "High", "Critical"]),
          result_class: z.enum(["Supported", "Unsupported", "Contradicted", "Evidence missing", "Rule violation"]),
          claim_atom_id: z.string().optional(),
          explanation: z.string(),
          suggested_correction: z.string().default(""),
        })
      ),
    });

    try {
      const res = await geminiService.generateStructured(prompt, schema);
      return res.findings.map((f) => ({
        detectionLayer: "ai_layer2",
        spanStart: text.indexOf(f.quoted_text) >= 0 ? text.indexOf(f.quoted_text) : 0,
        spanEnd: text.indexOf(f.quoted_text) >= 0 ? text.indexOf(f.quoted_text) + f.quoted_text.length : 0,
        quotedText: f.quoted_text,
        category: f.category || "Factual Assertion",
        severity: f.severity,
        resultClass: f.result_class,
        claimAtomId: f.claim_atom_id,
        explanation: f.explanation,
        suggestedCorrection: f.suggested_correction,
        evidenceStatus: f.result_class === "Supported" ? "Supported by Claim Atom" : "Evidence missing, human verification required",
      }));
    } catch (err: any) {
      console.warn("[Brand Guardian AI Layer 2 Error]", err.message);
      return [];
    }
  }

  /**
   * Runs Full Brand Guardian Verification on an exact Asset Version
   */
  async runVerification(assetVersionId: string, userId: string, workspaceId: string) {
    await runMigrations();

    // 1. Fetch Asset Version and Parent Campaign
    const verRes = await db.execute({
      sql: `SELECT av.*, ca.campaign_id, c.workspace_id, c.brand_name, c.product_name
            FROM asset_versions av
            JOIN creative_assets ca ON ca.id = av.creative_asset_id
            JOIN campaigns c ON c.id = ca.campaign_id
            WHERE av.id = ? AND c.workspace_id = ?`,
      args: [assetVersionId, workspaceId],
    });

    if (verRes.rows.length === 0) {
      throw new Error("Asset version not found or access denied.");
    }
    const versionRow = verRes.rows[0];
    const campaignId = String(versionRow.campaign_id);

    // 2. Fetch Brief Rules & Claim Atoms
    const briefRes = await db.execute({
      sql: `SELECT brief_json FROM brief_versions WHERE campaign_id = ? ORDER BY version_no DESC LIMIT 1`,
      args: [campaignId],
    });
    let prohibitedPhrases: string[] = [];
    let mandatoryDisclosures: string[] = [];
    let lockedTokens: string[] = [];

    if (briefRes.rows[0]) {
      try {
        const briefData = JSON.parse(String(briefRes.rows[0].brief_json));
        prohibitedPhrases = briefData.prohibited_claims || [];
        mandatoryDisclosures = briefData.mandatory_disclosures || [];
      } catch {}
    }

    const claimsRes = await db.execute({
      sql: `SELECT id, claim_text, type, locked_tokens_json FROM claim_atoms WHERE campaign_id = ?`,
      args: [campaignId],
    });
    const claimAtoms = claimsRes.rows.map((r) => {
      try {
        const tokens = JSON.parse(String(r.locked_tokens_json || "[]"));
        lockedTokens.push(...tokens);
      } catch {}
      return {
        id: String(r.id),
        claim_text: String(r.claim_text),
        type: String(r.type),
      };
    });

    // 3. Run Layer 1 Deterministic Checks
    const combinedContent = `${versionRow.headline}\n${versionRow.subline || ""}\n${versionRow.body || ""}\n${versionRow.cta || ""}\n${versionRow.disclosure || ""}`;
    const findingsLayer1 = this.runDeterministicLayer1(combinedContent, {
      prohibitedPhrases,
      mandatoryDisclosures,
      lockedTokens,
    });

    // 4. Run Layer 2 AI Checks
    const findingsLayer2 = await this.runAiLayer2(combinedContent, claimAtoms);
    const allFindings = [...findingsLayer1, ...findingsLayer2];

    // 5. Store Verification Run in DB
    const runId = generateId();
    const now = new Date().toISOString();

    await db.execute({
      sql: `INSERT INTO verification_runs (
        id, asset_version_id, ruleset_version, evidence_snapshot_json,
        provider_metadata_json, status, completed_at, created_at
      ) VALUES (?, ?, 'v3.0_deterministic_ai', ?, '{}', 'completed', ?, ?)`,
      args: [
        runId,
        assetVersionId,
        JSON.stringify({ claim_atom_count: claimAtoms.length, prohibited_count: prohibitedPhrases.length }),
        now,
        now,
      ],
    });

    // 6. Store Findings in DB
    for (const f of allFindings) {
      const findingId = generateId();
      const spanHash = crypto.createHash("sha256").update(`${f.spanStart}:${f.spanEnd}:${f.quotedText}`).digest("hex");

      await db.execute({
        sql: `INSERT INTO verification_findings (
          id, verification_run_id, detection_layer, span_start, span_end, span_hash,
          quoted_text, category, severity, result_class, claim_atom_id, explanation,
          suggested_correction, evidence_status, recheck_status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', ?)`,
        args: [
          findingId,
          runId,
          f.detectionLayer,
          f.spanStart,
          f.spanEnd,
          spanHash,
          f.quotedText,
          f.category,
          f.severity,
          f.resultClass,
          f.claimAtomId || null,
          f.explanation,
          f.suggestedCorrection || "",
          f.evidenceStatus || "",
          now,
        ],
      });
    }

    // 7. Update Asset Version Status based on State Machine (Diagram 4.4)
    const hasBlockers = allFindings.some((f) => f.severity === "Critical" || f.resultClass === "Contradicted");
    const nextStatus = hasBlockers ? "NeedsChanges" : "ReadyForReview";

    await db.execute({
      sql: `UPDATE asset_versions SET status = ? WHERE id = ?`,
      args: [nextStatus, assetVersionId],
    });

    return {
      runId,
      status: nextStatus,
      totalFindings: allFindings.length,
      blockerCount: allFindings.filter((f) => f.severity === "Critical" || f.severity === "High").length,
      findings: allFindings,
    };
  }

  /**
   * Retrieves latest verification findings for an asset version
   */
  async getFindingsForVersion(assetVersionId: string) {
    await runMigrations();

    const runsRes = await db.execute({
      sql: `SELECT * FROM verification_runs WHERE asset_version_id = ? ORDER BY created_at DESC LIMIT 1`,
      args: [assetVersionId],
    });

    if (runsRes.rows.length === 0) return null;
    const run = runsRes.rows[0];

    const findingsRes = await db.execute({
      sql: `SELECT * FROM verification_findings WHERE verification_run_id = ? ORDER BY
            CASE severity
              WHEN 'Critical' THEN 1
              WHEN 'High' THEN 2
              WHEN 'Medium' THEN 3
              ELSE 4
            END`,
      args: [run.id],
    });

    return {
      run,
      findings: findingsRes.rows,
    };
  }
}

export const guardianService = new GuardianService();
