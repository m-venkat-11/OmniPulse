-- Braco OmniPulse — Turso libSQL Enterprise Schema
-- All tables use TEXT PRIMARY KEY with UUIDs
-- All timestamps use ISO 8601 strings

PRAGMA foreign_keys = ON;

-- ═══════════════════════════════════════════════════════
-- 1. IDENTITY, WORKSPACE & SESSIONS
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS workspaces (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  retention_policy TEXT DEFAULT 'standard_365d',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'CampaignManager', -- 'Admin', 'CampaignManager', 'CreativeEditor', 'Reviewer', 'CreatorManager', 'Analyst'
  company TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS workspace_members (
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'CampaignManager',
  joined_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (workspace_id, user_id)
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ═══════════════════════════════════════════════════════
-- 2. BRAND PROFILE, RULES & CLAIM ATOMS
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS brand_profiles (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  brand_voice TEXT DEFAULT '',
  approved_terms_json TEXT DEFAULT '[]',
  prohibited_terms_json TEXT DEFAULT '[]',
  version INTEGER DEFAULT 1,
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS claim_atoms (
  id TEXT PRIMARY KEY,
  campaign_id TEXT REFERENCES campaigns(id) ON DELETE CASCADE,
  brand_profile_id TEXT REFERENCES brand_profiles(id) ON DELETE CASCADE,
  claim_text TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'product_fact', -- 'product_fact', 'approved_term', 'prohibited_claim', 'disclosure', 'offer_price', 'legal_high_risk'
  status TEXT NOT NULL DEFAULT 'approved', -- 'approved', 'pending', 'expired', 'revoked', 'evidence_missing'
  version INTEGER DEFAULT 1,
  effective_from TEXT DEFAULT (datetime('now')),
  effective_to TEXT,
  locked_tokens_json TEXT DEFAULT '[]',
  qualifications TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS evidence_references (
  id TEXT PRIMARY KEY,
  claim_atom_id TEXT NOT NULL REFERENCES claim_atoms(id) ON DELETE CASCADE,
  source_uri TEXT NOT NULL,
  source_owner TEXT DEFAULT '',
  title TEXT NOT NULL,
  excerpt TEXT DEFAULT '',
  captured_at TEXT DEFAULT (datetime('now')),
  validity TEXT DEFAULT 'active',
  access_class TEXT DEFAULT 'internal'
);

-- ═══════════════════════════════════════════════════════
-- 3. CAMPAIGNS & IMMUTABLE BRIEF VERSIONS
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  brand_name TEXT NOT NULL,
  product_name TEXT NOT NULL,
  objective TEXT NOT NULL,
  target_audience TEXT DEFAULT '',
  region TEXT DEFAULT '',
  source_language TEXT DEFAULT 'English',
  target_languages_json TEXT DEFAULT '[]',
  channels_json TEXT DEFAULT '[]',
  budget_assumptions TEXT DEFAULT '',
  status TEXT DEFAULT 'draft', -- 'draft', 'in_progress', 'review_pending', 'approved', 'completed', 'archived'
  owner_id TEXT NOT NULL REFERENCES users(id),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS brief_versions (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  version_no INTEGER NOT NULL DEFAULT 1,
  content_hash TEXT NOT NULL,
  brief_json TEXT NOT NULL,
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TEXT DEFAULT (datetime('now'))
);

-- ═══════════════════════════════════════════════════════
-- 4. CREATIVE ASSETS & IMMUTABLE ASSET VERSIONS
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS creative_assets (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  asset_type TEXT DEFAULT 'copy', -- 'copy', 'poster', 'storyboard'
  channel TEXT DEFAULT 'social_media',
  target_language TEXT NOT NULL,
  region TEXT DEFAULT '',
  dialect TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS asset_versions (
  id TEXT PRIMARY KEY,
  creative_asset_id TEXT NOT NULL REFERENCES creative_assets(id) ON DELETE CASCADE,
  version_no INTEGER NOT NULL DEFAULT 1,
  source_brief_version_id TEXT REFERENCES brief_versions(id) ON DELETE SET NULL,
  headline TEXT NOT NULL,
  subline TEXT DEFAULT '',
  body TEXT DEFAULT '',
  cta TEXT DEFAULT '',
  disclosure TEXT DEFAULT '',
  literal_translation TEXT DEFAULT '',
  regional_adaptation TEXT NOT NULL,
  adaptation_rationale_json TEXT DEFAULT '[]',
  content_hash TEXT NOT NULL,
  angle TEXT DEFAULT 'general',
  prompt_template_version TEXT DEFAULT 'v3.0',
  provider_metadata_json TEXT DEFAULT '{}',
  status TEXT DEFAULT 'Draft', -- 'Draft', 'Generated', 'Verification', 'ReadyForReview', 'InReview', 'NeedsChanges', 'Rejected', 'Approved'
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TEXT DEFAULT (datetime('now'))
);

-- ═══════════════════════════════════════════════════════
-- 5. BRAND GUARDIAN VERIFICATION & APPROVAL DECISIONS
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS verification_runs (
  id TEXT PRIMARY KEY,
  asset_version_id TEXT NOT NULL REFERENCES asset_versions(id) ON DELETE CASCADE,
  ruleset_version TEXT DEFAULT 'v3.0_deterministic_ai',
  evidence_snapshot_json TEXT DEFAULT '{}',
  provider_metadata_json TEXT DEFAULT '{}',
  status TEXT DEFAULT 'completed', -- 'running', 'completed', 'failed'
  completed_at TEXT DEFAULT (datetime('now')),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS verification_findings (
  id TEXT PRIMARY KEY,
  verification_run_id TEXT NOT NULL REFERENCES verification_runs(id) ON DELETE CASCADE,
  detection_layer TEXT NOT NULL, -- 'deterministic_layer1', 'ai_layer2'
  span_start INTEGER DEFAULT 0,
  span_end INTEGER DEFAULT 0,
  span_hash TEXT DEFAULT '',
  quoted_text TEXT NOT NULL,
  category TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'Low', -- 'Low', 'Medium', 'High', 'Critical'
  result_class TEXT NOT NULL, -- 'Supported', 'Unsupported', 'Contradicted', 'Evidence missing', 'Rule violation'
  rule_id TEXT,
  claim_atom_id TEXT REFERENCES claim_atoms(id) ON DELETE SET NULL,
  explanation TEXT NOT NULL,
  suggested_correction TEXT DEFAULT '',
  evidence_status TEXT DEFAULT '',
  recheck_status TEXT DEFAULT 'open', -- 'open', 'resolved', 'overridden'
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS approval_decisions (
  id TEXT PRIMARY KEY,
  asset_version_id TEXT NOT NULL REFERENCES asset_versions(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL DEFAULT 'asset', -- 'asset', 'poster'
  content_hash TEXT NOT NULL,
  reviewer_id TEXT NOT NULL REFERENCES users(id),
  decision TEXT NOT NULL, -- 'Approve', 'RequestChanges', 'Reject'
  override_reason TEXT DEFAULT '',
  rationale TEXT DEFAULT '',
  decided_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS reviewer_feedbacks (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  language_pair TEXT NOT NULL,
  region TEXT DEFAULT '',
  asset_version_id TEXT REFERENCES asset_versions(id) ON DELETE SET NULL,
  author_id TEXT NOT NULL REFERENCES users(id),
  phrase_original TEXT NOT NULL,
  phrase_adapted TEXT NOT NULL,
  tag TEXT NOT NULL, -- 'accurate', 'awkward', 'culturally_mismatched', 'brand_risk', 'needs_native_review'
  comment TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);

-- ═══════════════════════════════════════════════════════
-- 6. AD POSTER STUDIO & FILE ASSETS
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS poster_versions (
  id TEXT PRIMARY KEY,
  asset_version_id TEXT NOT NULL REFERENCES asset_versions(id) ON DELETE CASCADE,
  layout_template_id TEXT NOT NULL, -- 'centered_hero', 'split_modern', 'bottom_band', 'card_focus'
  format TEXT NOT NULL DEFAULT '1:1', -- '1:1', '4:5', '9:16', '16:9'
  background_prompt TEXT NOT NULL,
  background_image_path TEXT DEFAULT '',
  text_hash TEXT NOT NULL,
  palette_json TEXT DEFAULT '{}',
  status TEXT DEFAULT 'draft', -- 'draft', 'ready_for_review', 'approved', 'stale'
  is_approved INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS file_assets (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  storage_type TEXT DEFAULT 'local', -- 'local', 's3'
  created_at TEXT DEFAULT (datetime('now'))
);

-- ═══════════════════════════════════════════════════════
-- 7. CREATOR WORKSPACE
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS creator_profiles (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  handle TEXT NOT NULL,
  primary_language TEXT NOT NULL,
  region TEXT NOT NULL,
  content_themes_json TEXT DEFAULT '[]',
  formats_json TEXT DEFAULT '[]',
  brand_safety_notes TEXT DEFAULT '',
  consent_status TEXT NOT NULL DEFAULT 'consented', -- 'consented', 'pending_licence', 'licenced'
  licence_status TEXT DEFAULT 'standard_ad_usage',
  last_verified_date TEXT DEFAULT (datetime('now')),
  follower_count INTEGER DEFAULT 0,
  engagement_rate REAL DEFAULT 0,
  source_type TEXT DEFAULT 'user_entered', -- 'user_entered', 'imported_csv'
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS creator_briefs (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  asset_version_id TEXT NOT NULL REFERENCES asset_versions(id) ON DELETE CASCADE,
  creator_profile_id TEXT NOT NULL REFERENCES creator_profiles(id) ON DELETE CASCADE,
  objective TEXT NOT NULL,
  deliverables_json TEXT DEFAULT '[]',
  talking_points_json TEXT DEFAULT '[]',
  approved_claims_json TEXT DEFAULT '[]',
  prohibited_claims_json TEXT DEFAULT '[]',
  required_disclosure TEXT NOT NULL,
  rights_usage_period TEXT DEFAULT '90 days',
  schedule TEXT DEFAULT '',
  review_route TEXT DEFAULT 'brand_guardian_then_human',
  success_metric TEXT DEFAULT 'CTR',
  version INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ═══════════════════════════════════════════════════════
-- 8. EXPERIMENTS, METRICS & MEASUREMENT INTEGRITY
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS insight_notes (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  campaign_id TEXT REFERENCES campaigns(id) ON DELETE SET NULL,
  source TEXT NOT NULL,
  observation TEXT NOT NULL,
  hypothesis TEXT NOT NULL,
  variant_difference TEXT NOT NULL,
  metric_plan TEXT NOT NULL,
  is_approved_guidance INTEGER DEFAULT 0,
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS metric_definitions (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  formula TEXT NOT NULL,
  unit TEXT DEFAULT '%',
  denominator TEXT DEFAULT '',
  source_semantics TEXT DEFAULT '',
  attribution_rules TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS experiments (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  hypothesis TEXT NOT NULL,
  primary_metric_id TEXT NOT NULL REFERENCES metric_definitions(id),
  audience TEXT DEFAULT '',
  allocation TEXT DEFAULT '50/50',
  budget TEXT DEFAULT '',
  duration TEXT DEFAULT '14 days',
  attribution_window TEXT DEFAULT '7 days',
  decision_rule TEXT NOT NULL,
  assignment_method TEXT DEFAULT 'randomized_split',
  limitations TEXT DEFAULT '',
  is_locked INTEGER DEFAULT 0,
  locked_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS experiment_variants (
  id TEXT PRIMARY KEY,
  experiment_id TEXT NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
  asset_version_id TEXT NOT NULL REFERENCES asset_versions(id) ON DELETE CASCADE,
  variant_label TEXT NOT NULL, -- 'Variant A', 'Variant B'
  is_control INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS import_batches (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  experiment_id TEXT REFERENCES experiments(id) ON DELETE SET NULL,
  filename TEXT NOT NULL,
  column_mapping_json TEXT NOT NULL,
  row_errors_json TEXT DEFAULT '[]',
  row_count INTEGER DEFAULT 0,
  imported_by TEXT NOT NULL REFERENCES users(id),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS metric_observations (
  id TEXT PRIMARY KEY,
  experiment_variant_id TEXT NOT NULL REFERENCES experiment_variants(id) ON DELETE CASCADE,
  metric_definition_id TEXT NOT NULL REFERENCES metric_definitions(id) ON DELETE CASCADE,
  import_batch_id TEXT REFERENCES import_batches(id) ON DELETE SET NULL,
  value REAL NOT NULL,
  period TEXT DEFAULT 'all_time',
  source_type TEXT NOT NULL, -- 'Observed', 'Imported', 'Manually entered', 'Estimate'
  provenance TEXT NOT NULL DEFAULT 'Imported',
  uncertainty REAL DEFAULT 0,
  data_quality_warning TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);

-- ═══════════════════════════════════════════════════════
-- 9. HASH-CHAINED AUDIT TRAIL
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS audit_events (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  campaign_id TEXT REFERENCES campaigns(id) ON DELETE SET NULL,
  actor_id TEXT NOT NULL REFERENCES users(id),
  event_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  prev_hash TEXT,
  hash TEXT NOT NULL,
  metadata_json TEXT DEFAULT '{}',
  created_at TEXT DEFAULT (datetime('now'))
);

-- ═══════════════════════════════════════════════════════
-- 10. INDEXES FOR PERFORMANCE
-- ═══════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_campaigns_workspace ON campaigns(workspace_id, status, updated_at);
CREATE INDEX IF NOT EXISTS idx_brief_versions_campaign ON brief_versions(campaign_id, version_no);
CREATE INDEX IF NOT EXISTS idx_claim_atoms_campaign ON claim_atoms(campaign_id, status);
CREATE INDEX IF NOT EXISTS idx_creative_assets_campaign ON creative_assets(campaign_id);
CREATE INDEX IF NOT EXISTS idx_asset_versions_asset ON asset_versions(creative_asset_id, version_no);
CREATE INDEX IF NOT EXISTS idx_asset_versions_status ON asset_versions(status);
CREATE INDEX IF NOT EXISTS idx_verification_runs_version ON verification_runs(asset_version_id);
CREATE INDEX IF NOT EXISTS idx_findings_run_severity ON verification_findings(verification_run_id, severity);
CREATE INDEX IF NOT EXISTS idx_approvals_version ON approval_decisions(asset_version_id, decided_at);
CREATE INDEX IF NOT EXISTS idx_experiments_campaign ON experiments(campaign_id, is_locked);
CREATE INDEX IF NOT EXISTS idx_metric_obs_variant ON metric_observations(experiment_variant_id, metric_definition_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_chain ON audit_events(workspace_id, created_at);

-- ═══════════════════════════════════════════════════════
-- 11. IMMUTABILITY TRIGGERS (ABORT ON UPDATE & DELETE)
-- ═══════════════════════════════════════════════════════

CREATE TRIGGER IF NOT EXISTS abort_update_brief_versions
BEFORE UPDATE ON brief_versions
BEGIN
  SELECT RAISE(ABORT, 'ILLEGAL OPERATION: brief_versions is strictly immutable');
END;

CREATE TRIGGER IF NOT EXISTS abort_delete_brief_versions
BEFORE DELETE ON brief_versions
BEGIN
  SELECT RAISE(ABORT, 'ILLEGAL OPERATION: brief_versions is strictly immutable');
END;

CREATE TRIGGER IF NOT EXISTS abort_update_asset_versions
BEFORE UPDATE ON asset_versions
WHEN OLD.content_hash != NEW.content_hash
  OR OLD.headline != NEW.headline
  OR OLD.subline != NEW.subline
  OR OLD.body != NEW.body
  OR OLD.regional_adaptation != NEW.regional_adaptation
  OR OLD.version_no != NEW.version_no
  OR OLD.creative_asset_id != NEW.creative_asset_id
BEGIN
  SELECT RAISE(ABORT, 'ILLEGAL OPERATION: asset_versions content is strictly immutable');
END;

CREATE TRIGGER IF NOT EXISTS abort_delete_asset_versions
BEFORE DELETE ON asset_versions
BEGIN
  SELECT RAISE(ABORT, 'ILLEGAL OPERATION: asset_versions is strictly immutable');
END;

CREATE TRIGGER IF NOT EXISTS abort_update_poster_versions
BEFORE UPDATE ON poster_versions
BEGIN
  SELECT RAISE(ABORT, 'ILLEGAL OPERATION: poster_versions is strictly immutable');
END;

CREATE TRIGGER IF NOT EXISTS abort_delete_poster_versions
BEFORE DELETE ON poster_versions
BEGIN
  SELECT RAISE(ABORT, 'ILLEGAL OPERATION: poster_versions is strictly immutable');
END;

CREATE TRIGGER IF NOT EXISTS abort_update_approval_decisions
BEFORE UPDATE ON approval_decisions
BEGIN
  SELECT RAISE(ABORT, 'ILLEGAL OPERATION: approval_decisions is strictly immutable');
END;

CREATE TRIGGER IF NOT EXISTS abort_delete_approval_decisions
BEFORE DELETE ON approval_decisions
BEGIN
  SELECT RAISE(ABORT, 'ILLEGAL OPERATION: approval_decisions is strictly immutable');
END;

CREATE TRIGGER IF NOT EXISTS abort_update_audit_events
BEFORE UPDATE ON audit_events
BEGIN
  SELECT RAISE(ABORT, 'ILLEGAL OPERATION: audit_events is strictly immutable');
END;

CREATE TRIGGER IF NOT EXISTS abort_delete_audit_events
BEFORE DELETE ON audit_events
BEGIN
  SELECT RAISE(ABORT, 'ILLEGAL OPERATION: audit_events is strictly immutable');
END;
