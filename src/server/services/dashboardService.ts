import { db } from "@/src/server/db/client";
import { runMigrations } from "@/src/server/db/migrations";

export interface DashboardData {
  campaignsCount: number;
  activeCampaigns: any[];
  activityEvents: any[];
  stateDonut: {
    segments: { label: string; value: number; color: string; isHatched?: boolean }[];
    centerLabel: string;
    centerSublabel: string;
  };
  variantPerformance: {
    primaryFigure: string;
    deltaBadge: string;
    bars: { label: string; value: number }[];
  };
  metricsSummary: {
    pendingReviews: number;
    openBlockers: number;
    approvedVersions: number;
    runningExperiments: number;
  };
}

export async function getDashboardData(workspaceId: string): Promise<DashboardData> {
  await runMigrations();

  // 1. Campaigns
  const campaignsRes = await db.execute({
    sql: `SELECT id, name, brand_name, product_name, status, created_at
          FROM campaigns
          WHERE workspace_id = ?
          ORDER BY updated_at DESC
          LIMIT 5`,
    args: [workspaceId],
  });

  const countRes = await db.execute({
    sql: `SELECT COUNT(*) as cnt FROM campaigns WHERE workspace_id = ?`,
    args: [workspaceId],
  });
  const campaignsCount = Number(countRes.rows[0]?.cnt ?? 0);

  // 2. Real Audit Events for Activity list
  const activityRes = await db.execute({
    sql: `SELECT a.id, a.event_type, a.entity_type, a.created_at, u.name as actor_name
          FROM audit_events a
          LEFT JOIN users u ON u.id = a.actor_id
          WHERE a.workspace_id = ?
          ORDER BY a.created_at DESC
          LIMIT 4`,
    args: [workspaceId],
  });

  // 3. Asset version workflow states for the Hatched Donut
  const statesRes = await db.execute({
    sql: `SELECT av.status, COUNT(*) as cnt
          FROM asset_versions av
          JOIN creative_assets ca ON ca.id = av.creative_asset_id
          JOIN campaigns c ON c.id = ca.campaign_id
          WHERE c.workspace_id = ?
          GROUP BY av.status`,
    args: [workspaceId],
  });

  const stateCounts: Record<string, number> = {
    Approved: 0,
    InReview: 0,
    Draft: 0,
    NeedsChanges: 0,
  };

  for (const row of statesRes.rows) {
    const st = String(row.status);
    const cnt = Number(row.cnt);
    if (st in stateCounts) {
      stateCounts[st] = cnt;
    } else {
      stateCounts[st] = (stateCounts[st] || 0) + cnt;
    }
  }

  const totalVersions = Object.values(stateCounts).reduce((a, b) => a + b, 0);
  const approvedPct = totalVersions > 0 ? Math.round((stateCounts.Approved / totalVersions) * 100) : 0;

  const donutSegments = [
    { label: "Approved", value: stateCounts.Approved, color: "#2BD64F" },
    { label: "In Review", value: stateCounts.InReview, color: "#FFE234", isHatched: true },
    { label: "Needs Changes", value: stateCounts.NeedsChanges, color: "#FF5C5C" },
    { label: "Drafts", value: stateCounts.Draft, color: "#888888" },
  ];

  // 4. Metric observations for Variant Performance
  const obsRes = await db.execute({
    sql: `SELECT mo.value, md.name as metric_name, ev.variant_label
          FROM metric_observations mo
          JOIN metric_definitions md ON md.id = mo.metric_definition_id
          JOIN experiment_variants ev ON ev.id = mo.experiment_variant_id
          JOIN experiments e ON e.id = ev.experiment_id
          JOIN campaigns c ON c.id = e.campaign_id
          WHERE c.workspace_id = ?
          ORDER BY mo.created_at DESC
          LIMIT 8`,
    args: [workspaceId],
  });

  const bars = obsRes.rows.map((row) => ({
    label: String(row.variant_label || "Variant"),
    value: Number(row.value || 0),
  }));

  const avgPerf = bars.length > 0 ? (bars.reduce((s, b) => s + b.value, 0) / bars.length).toFixed(1) : "0.0";

  // 5. Blocker and Review Counters
  const blockersRes = await db.execute({
    sql: `SELECT COUNT(*) as cnt
          FROM verification_findings vf
          JOIN verification_runs vr ON vr.id = vf.verification_run_id
          JOIN asset_versions av ON av.id = vr.asset_version_id
          JOIN creative_assets ca ON ca.id = av.creative_asset_id
          JOIN campaigns c ON c.id = ca.campaign_id
          WHERE c.workspace_id = ? AND vf.severity IN ('Critical', 'High') AND vf.recheck_status = 'open'`,
    args: [workspaceId],
  });

  const pendingReviewsRes = await db.execute({
    sql: `SELECT COUNT(*) as cnt
          FROM asset_versions av
          JOIN creative_assets ca ON ca.id = av.creative_asset_id
          JOIN campaigns c ON c.id = ca.campaign_id
          WHERE c.workspace_id = ? AND av.status IN ('ReadyForReview', 'InReview')`,
    args: [workspaceId],
  });

  const expRes = await db.execute({
    sql: `SELECT COUNT(*) as cnt
          FROM experiments e
          JOIN campaigns c ON c.id = e.campaign_id
          WHERE c.workspace_id = ? AND e.is_locked = 1`,
    args: [workspaceId],
  });

  return {
    campaignsCount,
    activeCampaigns: campaignsRes.rows.map((r) => ({
      id: String(r.id),
      name: String(r.name),
      brand_name: String(r.brand_name),
      product_name: String(r.product_name),
      status: String(r.status),
      created_at: String(r.created_at),
    })),
    activityEvents: activityRes.rows.map((r) => ({
      id: String(r.id),
      event_type: String(r.event_type),
      actor_name: String(r.actor_name || "System"),
      created_at: String(r.created_at),
    })),
    stateDonut: {
      segments: donutSegments,
      centerLabel: `${approvedPct}%`,
      centerSublabel: "approved share",
    },
    variantPerformance: {
      primaryFigure: bars.length > 0 ? `${avgPerf}%` : "0.0%",
      deltaBadge: bars.length > 0 ? "+Live" : "",
      bars,
    },
    metricsSummary: {
      pendingReviews: Number(pendingReviewsRes.rows[0]?.cnt ?? 0),
      openBlockers: Number(blockersRes.rows[0]?.cnt ?? 0),
      approvedVersions: stateCounts.Approved,
      runningExperiments: Number(expRes.rows[0]?.cnt ?? 0),
    },
  };
}
