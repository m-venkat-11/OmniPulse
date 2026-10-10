'use server';

import { turso } from '@/lib/turso';
import { generateId, initializeDatabase } from '@/lib/db';
import { computeHash } from '@/lib/utils/hash';
import { extractClaims, generateAdaptation, type AdaptationRequest } from '@/lib/ai/adapter';
import { runFullVerification } from '@/lib/guardian/verifier';
import { getLanguageById } from '@/lib/languages/registry';

// ═══════════════════════════════════════════════════════
// CAMPAIGN ACTIONS
// ═══════════════════════════════════════════════════════

export async function createCampaign(formData: {
  name: string;
  brandName: string;
  productName: string;
  objective: string;
  targetAudience: string;
  sourceLanguage: string;
  targetLanguages: string[];
  channels: string[];
  keyMessage: string;
  callToAction: string;
  tone: string;
  schedule: string;
  approvedFacts: string;
  prohibitedClaims: string;
  requiredDisclaimers: string;
}) {
  await initializeDatabase();

  const campaignId = generateId();
  const userId = 'user-demo';
  const wsId = 'ws-default';

  // Create campaign
  await turso.execute({
    sql: `INSERT INTO campaigns (id, workspace_id, name, brand_name, product_name, objective, target_audience, source_language, target_languages, channels, key_message, call_to_action, tone, schedule, status, created_by)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?)`,
    args: [
      campaignId, wsId, formData.name, formData.brandName, formData.productName,
      formData.objective, formData.targetAudience, formData.sourceLanguage,
      JSON.stringify(formData.targetLanguages), JSON.stringify(formData.channels),
      formData.keyMessage, formData.callToAction, formData.tone, formData.schedule,
      userId,
    ],
  });

  // Create initial brief version
  const briefContent = JSON.stringify(formData);
  const briefHash = await computeHash(briefContent);
  const briefId = generateId();

  await turso.execute({
    sql: `INSERT INTO brief_versions (id, campaign_id, version_number, content_hash, brief_json, created_by)
          VALUES (?, ?, 1, ?, ?, ?)`,
    args: [briefId, campaignId, briefHash, briefContent, userId],
  });

  // Extract claim atoms from approved facts using AI
  if (formData.approvedFacts?.trim()) {
    const fullBriefText = `${formData.objective}\n${formData.keyMessage}\n${formData.approvedFacts}`;
    const claimResult = await extractClaims(fullBriefText, formData.brandName, formData.productName);

    for (const claim of claimResult.data.claims) {
      const claimId = generateId();
      await turso.execute({
        sql: `INSERT INTO claim_atoms (id, campaign_id, brief_version_id, claim_text, claim_type, locked_tokens, evidence_status, qualifications)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          claimId, campaignId, briefId, claim.claim_text, claim.claim_type,
          JSON.stringify(claim.locked_tokens), claim.evidence_status, claim.qualifications,
        ],
      });
    }
  }

  // Record audit event
  const eventHash = await computeHash(`campaign_created:${campaignId}:${briefHash}`);
  await turso.execute({
    sql: `INSERT INTO audit_events (id, workspace_id, campaign_id, actor_id, event_type, entity_type, entity_id, hash, metadata_json)
          VALUES (?, ?, ?, ?, 'campaign_created', 'campaign', ?, ?, ?)`,
    args: [generateId(), wsId, campaignId, userId, campaignId, eventHash, JSON.stringify({ brief_version: briefId })],
  });

  return { campaignId, briefId };
}

function toPlain<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

export async function getCampaigns() {
  await initializeDatabase();
  const rows = await turso.execute({
    sql: 'SELECT * FROM campaigns ORDER BY created_at DESC',
    args: [],
  });
  return toPlain(rows.rows);
}

export async function getCampaign(id: string) {
  await initializeDatabase();
  const result = await turso.execute({
    sql: 'SELECT * FROM campaigns WHERE id = ?',
    args: [id],
  });
  return toPlain(result.rows[0] || null);
}

export async function getBriefVersions(campaignId: string) {
  await initializeDatabase();
  const result = await turso.execute({
    sql: 'SELECT * FROM brief_versions WHERE campaign_id = ? ORDER BY version_number DESC',
    args: [campaignId],
  });
  return toPlain(result.rows);
}

// ═══════════════════════════════════════════════════════
// CLAIM ATOM ACTIONS
// ═══════════════════════════════════════════════════════

export async function getClaimAtoms(campaignId: string) {
  await initializeDatabase();
  const result = await turso.execute({
    sql: 'SELECT * FROM claim_atoms WHERE campaign_id = ? ORDER BY created_at ASC',
    args: [campaignId],
  });
  return toPlain(result.rows);
}

export async function addClaimAtom(campaignId: string, data: {
  claimText: string;
  claimType: string;
  lockedTokens: string[];
  evidenceStatus: string;
  qualifications: string;
}) {
  await initializeDatabase();
  const id = generateId();
  await turso.execute({
    sql: `INSERT INTO claim_atoms (id, campaign_id, claim_text, claim_type, locked_tokens, evidence_status, qualifications)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [id, campaignId, data.claimText, data.claimType, JSON.stringify(data.lockedTokens), data.evidenceStatus, data.qualifications],
  });
  return id;
}

export async function updateClaimAtomStatus(id: string, status: string) {
  await turso.execute({
    sql: 'UPDATE claim_atoms SET evidence_status = ? WHERE id = ?',
    args: [status, id],
  });
}

// ═══════════════════════════════════════════════════════
// REGIONAL ADAPTATION ACTIONS
// ═══════════════════════════════════════════════════════

export async function generateRegionalAdaptation(campaignId: string, data: {
  sourceText: string;
  sourceLanguage: string;
  targetLanguage: string;
  dialect: string;
  tone: string;
  slangLevel: string;
  formality: string;
  region: string;
}) {
  await initializeDatabase();

  const campaign = await getCampaign(campaignId);
  if (!campaign) throw new Error('Campaign not found');

  // Get approved claims for context
  const claims = await getClaimAtoms(campaignId);
  const approvedClaims = claims
    .filter(c => c.evidence_status === 'supported' || c.evidence_status === 'needs_human_review')
    .map(c => c.claim_text as string);

  const req: AdaptationRequest = {
    sourceText: data.sourceText,
    sourceLanguage: data.sourceLanguage,
    targetLanguage: data.targetLanguage,
    dialect: data.dialect,
    tone: data.tone,
    slangLevel: data.slangLevel,
    formality: data.formality,
    region: data.region,
    brandName: campaign.brand_name as string,
    productName: campaign.product_name as string,
    approvedClaims,
    keyMessage: campaign.key_message as string,
    callToAction: campaign.call_to_action as string,
  };

  const result = await generateAdaptation(req);

  // Create creative asset & version
  const assetId = generateId();
  const versionId = generateId();
  const langEntry = getLanguageById(data.targetLanguage);

  await turso.execute({
    sql: `INSERT INTO creative_assets (id, campaign_id, title, channel)
          VALUES (?, ?, ?, 'social_media')`,
    args: [assetId, campaignId, `${data.targetLanguage} adaptation — ${campaign.name}`],
  });

  const contentHash = await computeHash(result.data.regional_adaptation);

  // Get latest brief version
  const briefs = await getBriefVersions(campaignId);
  const latestBrief = briefs[0];

  await turso.execute({
    sql: `INSERT INTO asset_versions (id, asset_id, version_number, source_brief_version_id, source_text, literal_translation, regional_adaptation, meaning_summary, adaptation_rationale, source_language, target_language, region, dialect, tone, slang_level, formality, content_hash, status, generated_by_mode, created_by)
          VALUES (?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_review', ?, 'user-demo')`,
    args: [
      versionId, assetId, latestBrief?.id || null,
      data.sourceText,
      result.data.literal_translation,
      result.data.regional_adaptation,
      result.data.meaning_summary,
      JSON.stringify(result.data.adaptation_rationale),
      data.sourceLanguage, data.targetLanguage, data.region, data.dialect,
      data.tone, data.slangLevel, data.formality, contentHash,
      result.generated_by_mode,
    ],
  });

  // Record audit event
  const eventHash = await computeHash(`adaptation_generated:${versionId}:${contentHash}`);
  await turso.execute({
    sql: `INSERT INTO audit_events (id, workspace_id, campaign_id, actor_id, event_type, entity_type, entity_id, hash, metadata_json)
          VALUES (?, 'ws-default', ?, 'user-demo', 'adaptation_generated', 'asset_version', ?, ?, ?)`,
    args: [generateId(), campaignId, versionId, eventHash, JSON.stringify({
      source_language: data.sourceLanguage,
      target_language: data.targetLanguage,
      dialect: data.dialect,
      generated_by: result.generated_by_mode,
    })],
  });

  return {
    assetId,
    versionId,
    ...result.data,
    generated_by_mode: result.generated_by_mode,
    content_hash: contentHash,
    claim_preservation: result.data.claim_preservation,
    cultural_warnings: result.data.cultural_warnings,
  };
}

export async function getAssetVersionsForCampaign(campaignId: string) {
  await initializeDatabase();
  const result = await turso.execute({
    sql: `SELECT av.*, ca.title as asset_title, ca.channel
          FROM asset_versions av
          JOIN creative_assets ca ON ca.id = av.asset_id
          WHERE ca.campaign_id = ?
          ORDER BY av.created_at DESC`,
    args: [campaignId],
  });
  return toPlain(result.rows);
}

export async function getAssetVersion(versionId: string) {
  await initializeDatabase();
  const joined = await turso.execute({
    sql: `SELECT av.*, ca.campaign_id, ca.title as asset_title, ca.channel,
                 c.name as campaign_name, c.brand_name, c.product_name
          FROM asset_versions av
          LEFT JOIN creative_assets ca ON ca.id = av.asset_id
          LEFT JOIN campaigns c ON c.id = ca.campaign_id
          WHERE av.id = ?`,
    args: [versionId],
  });
  if (joined.rows.length > 0) return toPlain(joined.rows[0]);

  const simple = await turso.execute({
    sql: 'SELECT * FROM asset_versions WHERE id = ?',
    args: [versionId],
  });
  return toPlain(simple.rows[0] || null);
}

// ═══════════════════════════════════════════════════════
// VERIFICATION ACTIONS
// ═══════════════════════════════════════════════════════

export async function runVerification(assetVersionId: string, campaignId: string) {
  await initializeDatabase();

  const version = await getAssetVersion(assetVersionId);
  if (!version) throw new Error('Asset version not found');

  const lang = getLanguageById(version.target_language as string);

  const result = await runFullVerification(
    assetVersionId,
    version.source_text as string,
    version.regional_adaptation as string,
    version.target_language as string,
    campaignId,
    'ws-default',
    lang?.script
  );

  // Record audit event
  const eventHash = await computeHash(`verification_run:${result.runId}:${result.overall_status}`);
  await turso.execute({
    sql: `INSERT INTO audit_events (id, workspace_id, campaign_id, actor_id, event_type, entity_type, entity_id, hash, metadata_json)
          VALUES (?, 'ws-default', ?, 'user-demo', 'verification_completed', 'verification_run', ?, ?, ?)`,
    args: [generateId(), campaignId, result.runId, eventHash, JSON.stringify({
      asset_version_id: assetVersionId,
      overall_status: result.overall_status,
      findings_count: result.findings.length,
    })],
  });

  return result;
}

export async function getVerificationRuns(assetVersionId: string) {
  await initializeDatabase();
  const runs = await turso.execute({
    sql: 'SELECT * FROM verification_runs WHERE asset_version_id = ? ORDER BY created_at DESC',
    args: [assetVersionId],
  });

  const enriched = [];
  for (const run of runs.rows) {
    const findings = await turso.execute({
      sql: 'SELECT * FROM verification_findings WHERE run_id = ? ORDER BY severity ASC',
      args: [run.id as string],
    });
    enriched.push({ ...run, findings: findings.rows });
  }
  return enriched;
}

// ═══════════════════════════════════════════════════════
// APPROVAL ACTIONS
// ═══════════════════════════════════════════════════════

export async function approveAssetVersion(assetVersionId: string, campaignId: string, comments: string) {
  await initializeDatabase();

  const version = await getAssetVersion(assetVersionId);
  if (!version) throw new Error('Asset version not found');

  const approvalId = generateId();

  await turso.execute({
    sql: `INSERT INTO approvals (id, asset_version_id, content_hash, reviewer_id, decision, review_comments)
          VALUES (?, ?, ?, 'user-demo', 'approved', ?)`,
    args: [approvalId, assetVersionId, version.content_hash as string, comments],
  });

  await turso.execute({
    sql: 'UPDATE asset_versions SET status = ? WHERE id = ?',
    args: ['approved', assetVersionId],
  });

  // Record audit event
  const eventHash = await computeHash(`approval:${approvalId}:${version.content_hash}:approved`);
  await turso.execute({
    sql: `INSERT INTO audit_events (id, workspace_id, campaign_id, actor_id, event_type, entity_type, entity_id, hash, metadata_json)
          VALUES (?, 'ws-default', ?, 'user-demo', 'version_approved', 'approval', ?, ?, ?)`,
    args: [generateId(), campaignId, approvalId, eventHash, JSON.stringify({
      asset_version_id: assetVersionId,
      content_hash: version.content_hash,
    })],
  });

  return approvalId;
}

export async function rejectAssetVersion(assetVersionId: string, campaignId: string, reason: string) {
  await initializeDatabase();

  const approvalId = generateId();
  const version = await getAssetVersion(assetVersionId);
  if (!version) throw new Error('Asset version not found');

  await turso.execute({
    sql: `INSERT INTO approvals (id, asset_version_id, content_hash, reviewer_id, decision, review_comments)
          VALUES (?, ?, ?, 'user-demo', 'rejected', ?)`,
    args: [approvalId, assetVersionId, version.content_hash as string, reason],
  });

  await turso.execute({
    sql: 'UPDATE asset_versions SET status = ? WHERE id = ?',
    args: ['rejected', assetVersionId],
  });

  return approvalId;
}

export async function getApprovals(assetVersionId: string) {
  await initializeDatabase();
  const result = await turso.execute({
    sql: 'SELECT * FROM approvals WHERE asset_version_id = ? ORDER BY reviewed_at DESC',
    args: [assetVersionId],
  });
  return result.rows;
}

// ═══════════════════════════════════════════════════════
// EXPERIMENT ACTIONS
// ═══════════════════════════════════════════════════════

export async function createExperiment(campaignId: string, data: {
  hypothesis: string;
  variantAId: string;
  variantBId: string;
  primaryMetric: string;
  secondaryMetrics: string[];
  targetRegion: string;
  attributionWindow: string;
  testDuration: string;
  successCriteria: string;
}) {
  await initializeDatabase();

  const expId = generateId();
  await turso.execute({
    sql: `INSERT INTO experiments (id, campaign_id, hypothesis, variant_a_id, variant_b_id, primary_metric, secondary_metrics, target_region, attribution_window, test_duration, success_criteria)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [expId, campaignId, data.hypothesis, data.variantAId, data.variantBId, data.primaryMetric, JSON.stringify(data.secondaryMetrics), data.targetRegion, data.attributionWindow, data.testDuration, data.successCriteria],
  });

  return expId;
}

export async function lockExperiment(expId: string) {
  await turso.execute({
    sql: "UPDATE experiments SET is_locked = 1, locked_at = datetime('now') WHERE id = ?",
    args: [expId],
  });
}

export async function getExperiments(campaignId: string) {
  await initializeDatabase();
  const result = await turso.execute({
    sql: 'SELECT * FROM experiments WHERE campaign_id = ? ORDER BY created_at DESC',
    args: [campaignId],
  });
  return result.rows;
}

export async function addMetricObservation(experimentId: string, data: {
  variantKey: string;
  metricName: string;
  metricValue: number;
  metricUnit: string;
  sampleSize?: number;
  timeWindow: string;
  attributionWindow: string;
  source: string;
  provenanceType: string;
  dataQualityWarning?: string;
}) {
  await initializeDatabase();
  const id = generateId();
  await turso.execute({
    sql: `INSERT INTO metric_observations (id, experiment_id, variant_key, metric_name, metric_value, metric_unit, sample_size, time_window, attribution_window, source, provenance_type, data_quality_warning)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [id, experimentId, data.variantKey, data.metricName, data.metricValue, data.metricUnit, data.sampleSize || null, data.timeWindow, data.attributionWindow, data.source, data.provenanceType, data.dataQualityWarning || ''],
  });
  return id;
}

export async function getMetricObservations(experimentId: string) {
  await initializeDatabase();
  const result = await turso.execute({
    sql: 'SELECT * FROM metric_observations WHERE experiment_id = ? ORDER BY created_at ASC',
    args: [experimentId],
  });
  return result.rows;
}

// ═══════════════════════════════════════════════════════
// AUDIT / DECISION TRACE ACTIONS
// ═══════════════════════════════════════════════════════

export async function getAuditTrail(campaignId: string) {
  await initializeDatabase();
  const result = await turso.execute({
    sql: 'SELECT * FROM audit_events WHERE campaign_id = ? ORDER BY created_at ASC',
    args: [campaignId],
  });
  return result.rows;
}

// ═══════════════════════════════════════════════════════
// DASHBOARD STATS
// ═══════════════════════════════════════════════════════

export async function getDashboardStats() {
  await initializeDatabase();

  const campaigns = await turso.execute({
    sql: "SELECT COUNT(*) as count FROM campaigns WHERE workspace_id = 'ws-default'",
    args: [],
  });

  const pendingReviews = await turso.execute({
    sql: `SELECT COUNT(*) as count FROM asset_versions av
          JOIN creative_assets ca ON ca.id = av.asset_id
          JOIN campaigns c ON c.id = ca.campaign_id
          WHERE c.workspace_id = 'ws-default' AND av.status = 'pending_review'`,
    args: [],
  });

  const verificationBlockers = await turso.execute({
    sql: `SELECT COUNT(*) as count FROM verification_findings vf
          JOIN verification_runs vr ON vr.id = vf.run_id
          WHERE vf.severity IN ('critical', 'high')`,
    args: [],
  });

  const approvedVersions = await turso.execute({
    sql: "SELECT COUNT(*) as count FROM asset_versions WHERE status = 'approved'",
    args: [],
  });

  return {
    totalCampaigns: (campaigns.rows[0]?.count as number) || 0,
    pendingReviews: (pendingReviews.rows[0]?.count as number) || 0,
    verificationBlockers: (verificationBlockers.rows[0]?.count as number) || 0,
    approvedVersions: (approvedVersions.rows[0]?.count as number) || 0,
  };
}

// ═══════════════════════════════════════════════════════
// VERSION LOCKING INVARIANT
// ═══════════════════════════════════════════════════════

export async function createNewAssetVersion(data: {
  assetId: string;
  sourceText: string;
  regionalAdaptation: string;
  targetLanguage: string;
  dialect?: string;
  tone?: string;
  slangLevel?: string;
  formality?: string;
  reasonForEdit: string;
}) {
  await initializeDatabase();

  // Find latest version number
  const existing = await turso.execute({
    sql: 'SELECT MAX(version_number) as max_v FROM asset_versions WHERE asset_id = ?',
    args: [data.assetId],
  });
  const nextVersionNo = ((existing.rows[0]?.max_v as number) || 1) + 1;
  const newVersionId = generateId();
  const contentHash = await computeHash(data.regionalAdaptation);

  await turso.execute({
    sql: `INSERT INTO asset_versions (id, asset_id, version_number, source_text, regional_adaptation, literal_translation, meaning_summary, target_language, dialect, tone, slang_level, formality, content_hash, status, generated_by_mode, created_by)
          VALUES (?, ?, ?, ?, ?, '', ?, ?, ?, ?, ?, ?, ?, 'draft', 'human_editor', 'user-demo')`,
    args: [
      newVersionId, data.assetId, nextVersionNo,
      data.sourceText, data.regionalAdaptation,
      `Edited version: ${data.reasonForEdit}`,
      data.targetLanguage, data.dialect || '', data.tone || 'professional',
      data.slangLevel || 'low', data.formality || 'neutral',
      contentHash,
    ],
  });

  // Audit event: prior approval is NOT carried over!
  await turso.execute({
    sql: `INSERT INTO audit_events (id, workspace_id, actor_id, event_type, entity_type, entity_id, hash, metadata_json)
          VALUES (?, 'ws-default', 'user-demo', 'asset_version_edited', 'asset_version', ?, ?, ?)`,
    args: [
      generateId(), newVersionId, contentHash,
      JSON.stringify({ asset_id: data.assetId, new_version: nextVersionNo, reason: data.reasonForEdit, notice: "Prior approvals invalidated per Version-Lock invariant" })
    ],
  });

  return { newVersionId, versionNumber: nextVersionNo, contentHash };
}

// ═══════════════════════════════════════════════════════
// CREATOR MATCH & BRIEF ACTIONS
// ═══════════════════════════════════════════════════════

export async function getCreatorProfiles(language?: string) {
  await initializeDatabase();
  const sql = language
    ? 'SELECT * FROM creator_profiles WHERE primary_language = ? ORDER BY avg_engagement_rate DESC'
    : 'SELECT * FROM creator_profiles ORDER BY avg_engagement_rate DESC';
  const args = language ? [language] : [];
  const res = await turso.execute({ sql, args });

  if (res.rows.length === 0) {
    // Return standard permitted synthetic creator profiles
    return [
      {
        id: 'creator-01',
        name: 'Priya Sharma (Food & Wellness)',
        handle: '@priyacooks_hyd',
        primary_language: 'Telugu',
        region: 'Telangana & Andhra Pradesh',
        category: 'Food, Nutrition & Healthy Living',
        follower_range: '250K - 500K',
        avg_engagement_rate: 4.8,
        disclosure_readiness: 'certified',
        is_synthetic: 1,
        provenance_note: 'Permitted demo creator profile for South India food testing',
      },
      {
        id: 'creator-02',
        name: 'Rohan Deshmukh',
        handle: '@rohan_wellness_pune',
        primary_language: 'Marathi',
        region: 'Maharashtra (Pune & Mumbai)',
        category: 'Fitness & Everyday Health',
        follower_range: '100K - 250K',
        avg_engagement_rate: 5.2,
        disclosure_readiness: 'certified',
        is_synthetic: 1,
        provenance_note: 'Permitted demo creator profile for West India wellness',
      },
      {
        id: 'creator-03',
        name: 'Kavitha Ramachandran',
        handle: '@kavitha_healthtalks',
        primary_language: 'Tamil',
        region: 'Tamil Nadu (Chennai)',
        category: 'Motherhood & Family Nutrition',
        follower_range: '300K - 600K',
        avg_engagement_rate: 4.2,
        disclosure_readiness: 'certified',
        is_synthetic: 1,
        provenance_note: 'Permitted demo creator profile for South India Tamil audience',
      },
      {
        id: 'creator-04',
        name: 'Ananya Mukherjee',
        handle: '@ananya_kolkata_living',
        primary_language: 'Bengali',
        region: 'West Bengal (Kolkata)',
        category: 'Lifestyle & Everyday Care',
        follower_range: '150K - 300K',
        avg_engagement_rate: 3.9,
        disclosure_readiness: 'certified',
        is_synthetic: 1,
        provenance_note: 'Permitted demo creator profile for East India personal care',
      },
      {
        id: 'creator-05',
        name: 'Amanpreet Singh',
        handle: '@aman_punjabi_eats',
        primary_language: 'Hindi',
        region: 'North India (Delhi & Punjab)',
        category: 'Breakfast Nutrition & Family Food',
        follower_range: '400K - 800K',
        avg_engagement_rate: 5.6,
        disclosure_readiness: 'certified',
        is_synthetic: 1,
        provenance_note: 'Permitted demo creator profile for North India Hindi audience',
      },
    ];
  }
  return res.rows;
}

export async function createCreatorBrief(data: {
  campaignId: string;
  assetVersionId?: string;
  creatorId?: string;
  deliverables: string;
  approvedMessage: string;
  prohibitedClaims: string[];
  mandatoryDisclosures: string;
}) {
  await initializeDatabase();
  const briefId = generateId();

  await turso.execute({
    sql: `INSERT INTO creator_briefs (id, campaign_id, asset_version_id, creator_id, deliverables, approved_message, prohibited_claims, mandatory_disclosures, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ready')`,
    args: [
      briefId, data.campaignId, data.assetVersionId || null, data.creatorId || null,
      data.deliverables, data.approvedMessage,
      JSON.stringify(data.prohibitedClaims),
      data.mandatoryDisclosures,
    ],
  });

  return briefId;
}

export async function getCreatorBriefs(campaignId: string) {
  await initializeDatabase();
  const res = await turso.execute({
    sql: 'SELECT * FROM creator_briefs WHERE campaign_id = ? ORDER BY created_at DESC',
    args: [campaignId],
  });
  return res.rows;
}

// ═══════════════════════════════════════════════════════
// OFFICIAL DEMO SEEDING ACTIONS (PRD SECTION 18)
// ═══════════════════════════════════════════════════════

export async function seedDemoCampaignAction(demoType: 'festive_snack' | 'personal_care' | 'public_awareness') {
  const { seedDemoCampaign } = await import('@/lib/db/seedDemo');
  return await seedDemoCampaign(demoType);
}

// ═══════════════════════════════════════════════════════
// DELETE / ARCHIVE CAMPAIGN
// ═══════════════════════════════════════════════════════

export async function deleteCampaign(campaignId: string) {
  await initializeDatabase();
  await turso.execute({
    sql: 'DELETE FROM campaigns WHERE id = ?',
    args: [campaignId],
  });
  return true;
}

