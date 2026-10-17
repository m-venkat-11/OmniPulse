import { db, generateId } from "@/src/server/db/client";
import { runMigrations } from "@/src/server/db/migrations";
import { recordAuditEvent } from "./auditService";

// ── Deterministic Metric Formulas (Section 5, F10) ──
export function calculateCTR(clicks: number, impressions: number): { value: number | null; warning?: string } {
  if (!impressions || impressions <= 0) {
    return { value: null, warning: "Zero or missing impressions denominator" };
  }
  if (clicks > impressions) {
    return { value: null, warning: "Invalid metric: clicks cannot exceed impressions" };
  }
  return { value: (clicks / impressions) * 100 };
}

export function calculateCVR(conversions: number, clicks: number): { value: number | null; warning?: string } {
  if (!clicks || clicks <= 0) {
    return { value: null, warning: "Zero or missing clicks denominator" };
  }
  return { value: (conversions / clicks) * 100 };
}

export function calculateCostPerConversion(spend: number, conversions: number): { value: number | null; warning?: string } {
  if (!conversions || conversions <= 0) {
    return { value: null, warning: "Zero conversions denominator" };
  }
  return { value: spend / conversions };
}

/**
 * Wilson 95% Score Confidence Interval for a proportion
 * Returns [lower, upper] as percentages (0 to 100)
 */
export function calculateWilsonScore95(events: number, total: number): { lower: number; upper: number } {
  if (total <= 0) return { lower: 0, upper: 0 };
  const z = 1.96; // 95% confidence
  const p = events / total;
  const denominator = 1 + (z * z) / total;
  const center = p + (z * z) / (2 * total);
  const spread = z * Math.sqrt((p * (1 - p)) / total + (z * z) / (4 * total * total));

  const lower = Math.max(0, (center - spread) / denominator) * 100;
  const upper = Math.min(1, (center + spread) / denominator) * 100;
  return { lower, upper };
}

/**
 * Two-proportion z-test sufficiency gate (Section 5, F10)
 * Requires at least 30 events and 30 non-events per variant
 */
export function evaluateTwoProportionGate(
  variantA: { events: number; total: number },
  variantB: { events: number; total: number }
): { isSufficient: boolean; message: string; pValue?: number } {
  const nonEventsA = variantA.total - variantA.events;
  const nonEventsB = variantB.total - variantB.events;

  if (
    variantA.events < 30 ||
    nonEventsA < 30 ||
    variantB.events < 30 ||
    nonEventsB < 30
  ) {
    return {
      isSufficient: false,
      message: "Insufficient data, no conclusion (Requires >= 30 events and >= 30 non-events per variant)",
    };
  }

  // Pooled proportion
  const pPooled = (variantA.events + variantB.events) / (variantA.total + variantB.total);
  const se = Math.sqrt(pPooled * (1 - pPooled) * (1 / variantA.total + 1 / variantB.total));
  const z = (variantA.events / variantA.total - variantB.events / variantB.total) / se;

  // Approximate two-tailed p-value
  const pVal = Math.min(1, Math.max(0, 2 * (1 - normalCdf(Math.abs(z)))));

  return {
    isSufficient: true,
    message: pVal < 0.05 ? "Statistically significant difference detected (p < 0.05)" : "No statistically significant difference (p >= 0.05)",
    pValue: pVal,
  };
}

function normalCdf(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp((-x * x) / 2);
  const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - prob : prob;
}

export class ExperimentService {
  /**
   * Creates an A/B test plan
   */
  async createExperiment(params: {
    campaignId: string;
    hypothesis: string;
    primaryMetricId: string;
    variantAId: string;
    variantBId: string;
    decisionRule: string;
    attributionWindow?: string;
    duration?: string;
  }, userId: string, workspaceId: string) {
    await runMigrations();

    // 1. Fetch Variants
    const vA = await db.execute({
      sql: `SELECT av.*, ca.target_language, ca.region, ca.channel
            FROM asset_versions av
            JOIN creative_assets ca ON ca.id = av.creative_asset_id
            WHERE av.id = ?`,
      args: [params.variantAId],
    });

    const vB = await db.execute({
      sql: `SELECT av.*, ca.target_language, ca.region, ca.channel
            FROM asset_versions av
            JOIN creative_assets ca ON ca.id = av.creative_asset_id
            WHERE av.id = ?`,
      args: [params.variantBId],
    });

    if (vA.rows.length === 0 || vB.rows.length === 0) {
      throw new Error("One or both selected variants were not found.");
    }

    const rowA = vA.rows[0];
    const rowB = vB.rows[0];

    // Rule: Cross-language experiments are strictly blocked! (Acceptance Test 18)
    if (rowA.target_language !== rowB.target_language) {
      throw new Error(`Cross-language experiments are blocked. Variant A (${rowA.target_language}) and Variant B (${rowB.target_language}) must have the same language and region for causal A/B testing.`);
    }

    // Rule: Both variants must be approved versions!
    if (rowA.status !== "Approved" || rowB.status !== "Approved") {
      throw new Error("Experiment requires both variants to be approved versions before planning.");
    }

    const experimentId = generateId();
    const now = new Date().toISOString();

    await db.execute({
      sql: `INSERT INTO experiments (
        id, campaign_id, hypothesis, primary_metric_id, decision_rule,
        attribution_window, duration, is_locked, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)`,
      args: [
        experimentId,
        params.campaignId,
        params.hypothesis,
        params.primaryMetricId,
        params.decisionRule,
        params.attributionWindow || "7 days",
        params.duration || "14 days",
        now,
      ],
    });

    // Add Variants
    await db.execute({
      sql: `INSERT INTO experiment_variants (id, experiment_id, asset_version_id, variant_label, is_control)
            VALUES (?, ?, ?, 'Variant A (Control)', 1)`,
      args: [generateId(), experimentId, params.variantAId],
    });

    await db.execute({
      sql: `INSERT INTO experiment_variants (id, experiment_id, asset_version_id, variant_label, is_control)
            VALUES (?, ?, ?, 'Variant B (Challenger)', 0)`,
      args: [generateId(), experimentId, params.variantBId],
    });

    return { experimentId };
  }

  /**
   * Locks the experiment (freezes hypothesis and metrics before accepting CSV data)
   */
  async lockExperiment(experimentId: string, userId: string, workspaceId: string) {
    await runMigrations();

    const expRes = await db.execute({
      sql: `SELECT e.* FROM experiments e
            JOIN campaigns c ON c.id = e.campaign_id
            WHERE e.id = ? AND c.workspace_id = ?`,
      args: [experimentId, workspaceId],
    });

    if (expRes.rows.length === 0) {
      throw new Error("Experiment not found or access denied.");
    }

    const exp = expRes.rows[0];
    if (!exp.hypothesis || !exp.decision_rule || !exp.primary_metric_id) {
      throw new Error("A plan lacking hypothesis, metric or decision rule cannot be locked.");
    }

    const now = new Date().toISOString();
    await db.execute({
      sql: `UPDATE experiments SET is_locked = 1, locked_at = ? WHERE id = ?`,
      args: [now, experimentId],
    });

    // Audit Log
    await recordAuditEvent({
      workspaceId,
      campaignId: String(exp.campaign_id),
      actorId: userId,
      eventType: "experiment_locked",
      entityType: "experiment",
      entityId: experimentId,
    });

    return { success: true, lockedAt: now };
  }

  /**
   * Imports and validates CSV data with dynamic column mapping
   */
  async importCsvData(params: {
    experimentId: string;
    csvText: string;
    columnMapping: {
      variantColumn: string;
      impressionsColumn: string;
      clicksColumn: string;
      conversionsColumn?: string;
    };
  }, userId: string, workspaceId: string) {
    await runMigrations();

    // Check if experiment is locked
    const expRes = await db.execute({
      sql: `SELECT is_locked, primary_metric_id FROM experiments WHERE id = ?`,
      args: [params.experimentId],
    });

    if (expRes.rows.length === 0) {
      throw new Error("Experiment not found.");
    }

    if (!Boolean(expRes.rows[0].is_locked)) {
      throw new Error("Import rejected: Experiment must be locked before any data import is accepted.");
    }

    const metricId = String(expRes.rows[0].primary_metric_id);

    // Fetch experiment variants
    const variantsRes = await db.execute({
      sql: `SELECT id, variant_label FROM experiment_variants WHERE experiment_id = ?`,
      args: [params.experimentId],
    });
    const variants = variantsRes.rows;

    // Parse CSV lines
    const lines = params.csvText.trim().split("\n");
    if (lines.length < 2) {
      throw new Error("CSV file contains no data rows.");
    }

    const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
    const varIdx = headers.indexOf(params.columnMapping.variantColumn);
    const impIdx = headers.indexOf(params.columnMapping.impressionsColumn);
    const clkIdx = headers.indexOf(params.columnMapping.clicksColumn);

    if (varIdx === -1 || impIdx === -1 || clkIdx === -1) {
      throw new Error("Mapped columns were not found in CSV header row.");
    }

    const rowErrors: Array<{ rowNumber: number; reason: string }> = [];
    const validObservations: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const cells = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));

      const variantVal = cells[varIdx];
      const impressions = Number(cells[impIdx]);
      const clicks = Number(cells[clkIdx]);

      // Validation gates (Section 5, F10)
      if (isNaN(impressions) || isNaN(clicks)) {
        rowErrors.push({ rowNumber: i + 1, reason: "Non-numeric values in numeric columns." });
        continue;
      }

      if (impressions < 0 || clicks < 0) {
        rowErrors.push({ rowNumber: i + 1, reason: "Negative values in impressions or clicks." });
        continue;
      }

      if (clicks > impressions) {
        rowErrors.push({ rowNumber: i + 1, reason: "Clicks exceed impressions (click-through impossibility)." });
        continue;
      }

      // Match to variant
      const matchedVariant = variants.find(
        (v) => String(v.variant_label).toLowerCase().includes(variantVal.toLowerCase())
      ) || variants[0];

      const ctr = calculateCTR(clicks, impressions);
      const wilson = calculateWilsonScore95(clicks, impressions);

      validObservations.push({
        variantId: matchedVariant.id,
        impressions,
        clicks,
        ctr: ctr.value,
        uncertainty: (wilson.upper - wilson.lower) / 2,
      });
    }

    // Insert observations
    const batchId = generateId();
    await db.execute({
      sql: `INSERT INTO import_batches (
        id, workspace_id, experiment_id, filename, column_mapping_json,
        row_errors_json, row_count, imported_by
      ) VALUES (?, ?, ?, 'imported_metrics.csv', ?, ?, ?, ?)`,
      args: [
        batchId,
        workspaceId,
        params.experimentId,
        JSON.stringify(params.columnMapping),
        JSON.stringify(rowErrors),
        validObservations.length,
        userId,
      ],
    });

    for (const obs of validObservations) {
      if (obs.ctr !== null) {
        await db.execute({
          sql: `INSERT INTO metric_observations (
            id, experiment_variant_id, metric_definition_id, import_batch_id,
            value, period, source_type, provenance, uncertainty
          ) VALUES (?, ?, ?, ?, ?, '7d_import', 'Imported', 'Imported', ?)`,
          args: [
            generateId(),
            obs.variantId,
            metricId,
            batchId,
            obs.ctr,
            obs.uncertainty,
          ],
        });
      }
    }

    return {
      batchId,
      importedCount: validObservations.length,
      rejectedCount: rowErrors.length,
      rowErrors,
    };
  }
}

export const experimentService = new ExperimentService();
