import React from "react";
import { getCurrentUser } from "@/src/server/auth/session";
import { redirect, notFound } from "next/navigation";
import { campaignService } from "@/src/server/services/campaignService";
import { AppShell } from "@/components/shell/AppShell";
import { CampaignNav } from "@/components/campaigns/CampaignNav";
import { ExperimentPlannerClient } from "./ExperimentPlannerClient";
import { db } from "@/src/server/db/client";

export default async function ExperimentPlannerPage(props: {
  params: Promise<{ id: string }>;
}) {
  const session = await getCurrentUser();
  if (!session) {
    redirect("/sign-in");
  }

  const { id } = await props.params;
  const data = await campaignService.getCampaign(id, session.workspace.id);
  if (!data) {
    notFound();
  }

  // Ensure default metric definitions exist in workspace
  const metricsRes = await db.execute({
    sql: `SELECT * FROM metric_definitions WHERE workspace_id = ?`,
    args: [session.workspace.id],
  });

  let metrics = metricsRes.rows;
  if (metrics.length === 0) {
    // Insert reference metrics (allowed reference config)
    const defaultMetrics = [
      { name: "Click-Through Rate (CTR)", formula: "clicks / impressions", unit: "%", denominator: "impressions" },
      { name: "Conversion Rate (CVR)", formula: "conversions / clicks", unit: "%", denominator: "clicks" },
      { name: "Engagement Rate", formula: "engagements / impressions", unit: "%", denominator: "impressions" },
    ];

    for (const m of defaultMetrics) {
      await db.execute({
        sql: `INSERT INTO metric_definitions (id, workspace_id, name, formula, unit, denominator)
              VALUES (?, ?, ?, ?, ?, ?)`,
        args: [`metric-${m.name.slice(0, 3).toLowerCase()}`, session.workspace.id, m.name, m.formula, m.unit, m.denominator],
      });
    }

    const recheck = await db.execute({
      sql: `SELECT * FROM metric_definitions WHERE workspace_id = ?`,
      args: [session.workspace.id],
    });
    metrics = recheck.rows;
  }

  // Fetch approved asset versions for this campaign
  const versionsRes = await db.execute({
    sql: `SELECT av.*, ca.target_language, ca.channel, ca.region
          FROM asset_versions av
          JOIN creative_assets ca ON ca.id = av.creative_asset_id
          WHERE ca.campaign_id = ? AND av.status = 'Approved'
          ORDER BY av.created_at DESC`,
    args: [id],
  });

  // Fetch existing experiments
  const expRes = await db.execute({
    sql: `SELECT e.*, md.name as primary_metric_name
          FROM experiments e
          JOIN metric_definitions md ON md.id = e.primary_metric_id
          WHERE e.campaign_id = ?
          ORDER BY e.created_at DESC`,
    args: [id],
  });

  return (
    <AppShell
      userName={session.user.name}
      userRole={session.role}
      workspaceName={session.workspace.name}
      primaryActionLabel="Analytics & Imports"
      primaryActionHref={`/campaigns/${id}/analytics`}
    >
      <CampaignNav
        campaignId={id}
        campaignName={String(data.campaign.name || "")}
        brandName={String(data.campaign.brand_name || "")}
      />
      <ExperimentPlannerClient
        campaignId={id}
        campaignName={String(data.campaign.name || "")}
        brandName={String(data.campaign.brand_name || "")}
        productName={String(data.campaign.product_name || "")}
        approvedVersions={versionsRes.rows.map((v) => ({
          id: String(v.id),
          version_no: Number(v.version_no),
          headline: String(v.headline),
          target_language: String(v.target_language),
          status: String(v.status),
          content_hash: String(v.content_hash),
        }))}
        metrics={metrics.map((m) => ({
          id: String(m.id),
          name: String(m.name),
          formula: String(m.formula),
          unit: String(m.unit),
        }))}
        experiments={expRes.rows.map((e) => ({
          id: String(e.id),
          hypothesis: String(e.hypothesis),
          primary_metric_name: String(e.primary_metric_name),
          decision_rule: String(e.decision_rule),
          is_locked: Boolean(e.is_locked),
          locked_at: String(e.locked_at || ""),
          created_at: String(e.created_at),
        }))}
      />
    </AppShell>
  );
}
