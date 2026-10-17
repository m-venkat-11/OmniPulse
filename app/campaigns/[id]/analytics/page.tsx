import React from "react";
import { getCurrentUser } from "@/src/server/auth/session";
import { redirect, notFound } from "next/navigation";
import { campaignService } from "@/src/server/services/campaignService";
import { AppShell } from "@/components/shell/AppShell";
import { CampaignNav } from "@/components/campaigns/CampaignNav";
import { AnalyticsClient } from "./AnalyticsClient";
import { db } from "@/src/server/db/client";

export default async function AnalyticsPage(props: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ experimentId?: string }>;
}) {
  const session = await getCurrentUser();
  if (!session) {
    redirect("/sign-in");
  }

  const { id } = await props.params;
  const searchParams = await props.searchParams;

  const data = await campaignService.getCampaign(id, session.workspace.id);
  if (!data) {
    notFound();
  }

  // Fetch experiments for this campaign
  const expRes = await db.execute({
    sql: `SELECT e.*, md.name as primary_metric_name
          FROM experiments e
          JOIN metric_definitions md ON md.id = e.primary_metric_id
          WHERE e.campaign_id = ?
          ORDER BY e.created_at DESC`,
    args: [id],
  });

  const allExperiments = expRes.rows;
  const activeExpId = searchParams?.experimentId || (allExperiments[0]?.id ? String(allExperiments[0].id) : null);
  const activeExperiment = allExperiments.find((e) => String(e.id) === activeExpId) || allExperiments[0] || null;

  // Fetch observations for active experiment
  let observations: any[] = [];
  let importBatches: any[] = [];

  if (activeExperiment) {
    const obsRes = await db.execute({
      sql: `SELECT mo.*, md.name as metric_name, md.unit as metric_unit, ev.variant_label
            FROM metric_observations mo
            JOIN metric_definitions md ON md.id = mo.metric_definition_id
            JOIN experiment_variants ev ON ev.id = mo.experiment_variant_id
            WHERE ev.experiment_id = ?
            ORDER BY mo.created_at DESC`,
      args: [String(activeExperiment.id)],
    });
    observations = obsRes.rows;

    const batchesRes = await db.execute({
      sql: `SELECT ib.*, u.name as importer_name
            FROM import_batches ib
            LEFT JOIN users u ON u.id = ib.imported_by
            WHERE ib.experiment_id = ?
            ORDER BY ib.created_at DESC`,
      args: [String(activeExperiment.id)],
    });
    importBatches = batchesRes.rows;
  }

  return (
    <AppShell
      userName={session.user.name}
      userRole={session.role}
      workspaceName={session.workspace.name}
      primaryActionLabel="Campaign Passport"
      primaryActionHref={`/campaigns/${id}/passport`}
    >
      <CampaignNav
        campaignId={id}
        campaignName={String(data.campaign.name || "")}
        brandName={String(data.campaign.brand_name || "")}
      />
      <AnalyticsClient
        campaignId={id}
        campaignName={String(data.campaign.name || "")}
        brandName={String(data.campaign.brand_name || "")}
        productName={String(data.campaign.product_name || "")}
        allExperiments={allExperiments.map((e) => ({
          id: String(e.id),
          hypothesis: String(e.hypothesis),
          primary_metric_name: String(e.primary_metric_name),
          is_locked: Boolean(e.is_locked),
          created_at: String(e.created_at),
        }))}
        activeExperiment={activeExperiment ? {
          id: String(activeExperiment.id),
          hypothesis: String(activeExperiment.hypothesis),
          primary_metric_name: String(activeExperiment.primary_metric_name),
          is_locked: Boolean(activeExperiment.is_locked),
          decision_rule: String(activeExperiment.decision_rule),
        } : null}
        observations={observations.map((o) => ({
          id: String(o.id),
          variant_label: String(o.variant_label),
          metric_name: String(o.metric_name),
          metric_unit: String(o.metric_unit || "%"),
          value: Number(o.value),
          provenance: String(o.provenance),
          source_type: String(o.source_type),
          uncertainty: Number(o.uncertainty || 0),
          created_at: String(o.created_at),
        }))}
        importBatches={importBatches.map((b) => ({
          id: String(b.id),
          filename: String(b.filename),
          row_count: Number(b.row_count),
          row_errors: JSON.parse(String(b.row_errors_json || "[]")),
          importer_name: String(b.importer_name || "Analyst"),
          created_at: String(b.created_at),
        }))}
      />
    </AppShell>
  );
}
