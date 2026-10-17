import { db } from "@/src/server/db/client";
import { runMigrations } from "@/src/server/db/migrations";
import { verifyAuditChain } from "./auditService";

export interface CampaignPassportData {
  campaign: any;
  briefVersions: any[];
  claimAtoms: any[];
  assetVersions: any[];
  findings: any[];
  approvals: any[];
  posters: any[];
  creatorBriefs: any[];
  experiments: any[];
  observations: any[];
  auditEvents: any[];
  chainIntegrity: {
    isValid: boolean;
    totalEvents: number;
    tamperedEventId?: string;
    error?: string;
  };
}

export class PassportService {
  async getCampaignPassport(campaignId: string, workspaceId: string): Promise<CampaignPassportData | null> {
    await runMigrations();

    // 1. Campaign Core
    const campRes = await db.execute({
      sql: `SELECT c.*, u.name as owner_name 
            FROM campaigns c 
            LEFT JOIN users u ON u.id = c.owner_id 
            WHERE c.id = ? AND c.workspace_id = ?`,
      args: [campaignId, workspaceId],
    });
    if (campRes.rows.length === 0) return null;
    const campaign = campRes.rows[0];

    // 2. Brief Versions
    const briefRes = await db.execute({
      sql: `SELECT bv.*, u.name as author_name 
            FROM brief_versions bv 
            LEFT JOIN users u ON u.id = bv.created_by 
            WHERE bv.campaign_id = ? 
            ORDER BY bv.version_no ASC`,
      args: [campaignId],
    });

    // 3. Claim Atoms with Evidence
    const claimsRes = await db.execute({
      sql: `SELECT ca.*, er.source_uri, er.title as evidence_title, er.excerpt as evidence_excerpt 
            FROM claim_atoms ca 
            LEFT JOIN evidence_references er ON er.claim_atom_id = ca.id 
            WHERE ca.campaign_id = ? 
            ORDER BY ca.created_at ASC`,
      args: [campaignId],
    });

    // 4. Asset Versions
    const assetsRes = await db.execute({
      sql: `SELECT av.*, ca.target_language, ca.channel, ca.region, ca.dialect, u.name as author_name 
            FROM asset_versions av 
            JOIN creative_assets ca ON ca.id = av.creative_asset_id 
            LEFT JOIN users u ON u.id = av.created_by 
            WHERE ca.campaign_id = ? 
            ORDER BY av.version_no ASC, av.created_at ASC`,
      args: [campaignId],
    });

    // 5. Guardian Findings
    const findingsRes = await db.execute({
      sql: `SELECT vf.*, vr.asset_version_id, vr.ruleset_version, vr.completed_at 
            FROM verification_findings vf 
            JOIN verification_runs vr ON vr.id = vf.verification_run_id 
            WHERE vr.asset_version_id IN (
              SELECT av.id FROM asset_versions av 
              JOIN creative_assets ca ON ca.id = av.creative_asset_id 
              WHERE ca.campaign_id = ?
            ) 
            ORDER BY vf.created_at ASC`,
      args: [campaignId],
    });

    // 6. Approval Decisions
    const approvalsRes = await db.execute({
      sql: `SELECT ad.*, u.name as reviewer_name 
            FROM approval_decisions ad 
            LEFT JOIN users u ON u.id = ad.reviewer_id 
            WHERE ad.asset_version_id IN (
              SELECT av.id FROM asset_versions av 
              JOIN creative_assets ca ON ca.id = av.creative_asset_id 
              WHERE ca.campaign_id = ?
            ) 
            ORDER BY ad.decided_at DESC`,
      args: [campaignId],
    });

    // 7. Poster Versions
    const postersRes = await db.execute({
      sql: `SELECT pv.*, av.version_no as asset_version_no, ca.target_language 
            FROM poster_versions pv 
            JOIN asset_versions av ON av.id = pv.asset_version_id 
            JOIN creative_assets ca ON ca.id = av.creative_asset_id 
            WHERE ca.campaign_id = ? 
            ORDER BY pv.created_at DESC`,
      args: [campaignId],
    });

    // 8. Creator Briefs
    const creatorBriefsRes = await db.execute({
      sql: `SELECT cb.*, cp.display_name, cp.handle, cp.primary_language 
            FROM creator_briefs cb 
            LEFT JOIN creator_profiles cp ON cp.id = cb.creator_profile_id 
            WHERE cb.campaign_id = ? 
            ORDER BY cb.created_at DESC`,
      args: [campaignId],
    });

    // 9. Experiments
    const expRes = await db.execute({
      sql: `SELECT e.*, md.name as metric_name, md.formula as metric_formula 
            FROM experiments e 
            LEFT JOIN metric_definitions md ON md.id = e.primary_metric_id 
            WHERE e.campaign_id = ? 
            ORDER BY e.created_at DESC`,
      args: [campaignId],
    });

    // 10. Metric Observations
    const obsRes = await db.execute({
      sql: `SELECT ev.id as variant_id, ev.variant_label, ev.is_control, ev.asset_version_id, 
                   mo.value, mo.source_type, mo.provenance, mo.period, mo.uncertainty, 
                   mo.data_quality_warning, mo.created_at as observed_at, 
                   ib.filename as import_filename 
            FROM experiment_variants ev 
            JOIN experiments e ON e.id = ev.experiment_id 
            LEFT JOIN metric_observations mo ON mo.experiment_variant_id = ev.id 
            LEFT JOIN import_batches ib ON ib.id = mo.import_batch_id 
            WHERE e.campaign_id = ?`,
      args: [campaignId],
    });

    // 11. Hash-Chained Audit Trail for this campaign
    const auditRes = await db.execute({
      sql: `SELECT ae.*, u.name as actor_name 
            FROM audit_events ae 
            LEFT JOIN users u ON u.id = ae.actor_id 
            WHERE ae.workspace_id = ? AND (ae.campaign_id = ? OR ae.campaign_id IS NULL) 
            ORDER BY ae.created_at ASC`,
      args: [workspaceId, campaignId],
    });

    // 12. Run mathematical hash chain validation
    const chainIntegrity = await verifyAuditChain(workspaceId);

    return {
      campaign,
      briefVersions: briefRes.rows,
      claimAtoms: claimsRes.rows,
      assetVersions: assetsRes.rows,
      findings: findingsRes.rows,
      approvals: approvalsRes.rows,
      posters: postersRes.rows,
      creatorBriefs: creatorBriefsRes.rows,
      experiments: expRes.rows,
      observations: obsRes.rows.filter((r) => r.value !== null),
      auditEvents: auditRes.rows,
      chainIntegrity,
    };
  }
}

export const passportService = new PassportService();
