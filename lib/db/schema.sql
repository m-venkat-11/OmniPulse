-- Braco OmniPulse — Turso libSQL Schema
-- All tables use TEXT PRIMARY KEY with application-generated UUIDs
-- All timestamps use ISO 8601 TEXT format for SQLite compatibility

-- ═══════════════════════════════════════════════════════
-- 1. IDENTITY & WORKSPACE
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'CampaignManager',
  company TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS otps (
  email TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS workspaces (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS workspace_members (
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'CampaignManager',
  PRIMARY KEY (workspace_id, user_id)
);

-- ═══════════════════════════════════════════════════════
-- 2. CAMPAIGNS & BRIEF VERSIONS
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  brand_name TEXT NOT NULL DEFAULT '',
  product_name TEXT NOT NULL DEFAULT '',
  objective TEXT NOT NULL DEFAULT '',
  target_audience TEXT DEFAULT '',
  source_language TEXT DEFAULT 'English',
  target_languages TEXT DEFAULT '[]',
  channels TEXT DEFAULT '[]',
  key_message TEXT DEFAULT '',
  call_to_action TEXT DEFAULT '',
  tone TEXT DEFAULT 'professional',
  schedule TEXT DEFAULT '',
  status TEXT DEFAULT 'draft',
  is_demo INTEGER DEFAULT 0,
  created_by TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS brief_versions (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  content_hash TEXT NOT NULL,
  brief_json TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ═══════════════════════════════════════════════════════
-- 3. BRAND KNOWLEDGE, RULES & CLAIM ATOMS
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS brand_sources (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source_type TEXT DEFAULT 'document',
  validity_date TEXT,
  approved_by TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS brand_rules (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  rule_type TEXT NOT NULL DEFAULT 'prohibited_phrase',
  pattern TEXT NOT NULL,
  explanation TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'warning',
  target_language TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS claim_atoms (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  brief_version_id TEXT REFERENCES brief_versions(id) ON DELETE SET NULL,
  claim_text TEXT NOT NULL,
  claim_type TEXT NOT NULL DEFAULT 'product_fact',
  locked_tokens TEXT DEFAULT '[]',
  source_id TEXT REFERENCES brand_sources(id) ON DELETE SET NULL,
  evidence_status TEXT NOT NULL DEFAULT 'needs_human_review',
  may_rephrase INTEGER DEFAULT 1,
  is_mandatory INTEGER DEFAULT 1,
  qualifications TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);

-- ═══════════════════════════════════════════════════════
-- 4. CREATIVE ASSETS & IMMUTABLE VERSIONS
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS creative_assets (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  channel TEXT DEFAULT 'social_media',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS asset_versions (
  id TEXT PRIMARY KEY,
  asset_id TEXT NOT NULL REFERENCES creative_assets(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  source_brief_version_id TEXT REFERENCES brief_versions(id) ON DELETE SET NULL,
  source_text TEXT NOT NULL,
  literal_translation TEXT NOT NULL DEFAULT '',
  regional_adaptation TEXT NOT NULL DEFAULT '',
  meaning_summary TEXT NOT NULL DEFAULT '',
  adaptation_rationale TEXT DEFAULT '[]',
  source_language TEXT NOT NULL DEFAULT 'English',
  target_language TEXT NOT NULL,
  region TEXT DEFAULT '',
  dialect TEXT DEFAULT '',
  tone TEXT DEFAULT 'professional',
  slang_level TEXT DEFAULT 'low',
  formality TEXT DEFAULT 'neutral',
  cultural_context TEXT DEFAULT '',
  content_hash TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  generated_by_mode TEXT NOT NULL DEFAULT 'demo_fixture',
  generation_metadata TEXT DEFAULT '{}',
  created_by TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ═══════════════════════════════════════════════════════
-- 5. BRAND GUARDIAN VERIFICATION
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS verification_runs (
  id TEXT PRIMARY KEY,
  asset_version_id TEXT NOT NULL REFERENCES asset_versions(id) ON DELETE CASCADE,
  pass_a_status TEXT DEFAULT 'pending',
  pass_b_status TEXT DEFAULT 'pending',
  pass_c_status TEXT DEFAULT 'pending',
  overall_status TEXT DEFAULT 'pending',
  summary TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS verification_findings (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL REFERENCES verification_runs(id) ON DELETE CASCADE,
  pass_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info',
  category TEXT DEFAULT '',
  flagged_text TEXT NOT NULL,
  explanation TEXT NOT NULL,
  rule_id TEXT REFERENCES brand_rules(id) ON DELETE SET NULL,
  claim_atom_id TEXT REFERENCES claim_atoms(id) ON DELETE SET NULL,
  evidence_status TEXT DEFAULT 'unknown',
  suggested_correction TEXT DEFAULT '',
  requires_human_review INTEGER DEFAULT 1,
  resolution TEXT DEFAULT '',
  resolved_by TEXT,
  resolved_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ═══════════════════════════════════════════════════════
-- 6. HUMAN REVIEW & VERSION-LOCKED APPROVALS
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS review_comments (
  id TEXT PRIMARY KEY,
  asset_version_id TEXT NOT NULL REFERENCES asset_versions(id) ON DELETE CASCADE,
  reviewer_id TEXT NOT NULL REFERENCES users(id),
  comment_text TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS approvals (
  id TEXT PRIMARY KEY,
  asset_version_id TEXT NOT NULL REFERENCES asset_versions(id) ON DELETE CASCADE,
  content_hash TEXT NOT NULL,
  reviewer_id TEXT NOT NULL REFERENCES users(id),
  decision TEXT NOT NULL DEFAULT 'pending',
  review_comments TEXT DEFAULT '',
  verification_run_id TEXT REFERENCES verification_runs(id) ON DELETE SET NULL,
  reviewed_at TEXT DEFAULT (datetime('now'))
);

-- ═══════════════════════════════════════════════════════
-- 7. CREATOR INTELLIGENCE
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS creator_profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  handle TEXT NOT NULL,
  primary_language TEXT NOT NULL,
  region TEXT NOT NULL,
  category TEXT NOT NULL,
  follower_range TEXT DEFAULT '',
  avg_engagement_rate REAL DEFAULT 0,
  disclosure_readiness TEXT DEFAULT 'standard',
  is_synthetic INTEGER DEFAULT 1,
  provenance_note TEXT DEFAULT 'Synthetic profile for demonstration',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS creator_briefs (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  asset_version_id TEXT REFERENCES asset_versions(id) ON DELETE SET NULL,
  creator_id TEXT REFERENCES creator_profiles(id) ON DELETE SET NULL,
  deliverables TEXT DEFAULT '',
  approved_message TEXT DEFAULT '',
  prohibited_claims TEXT DEFAULT '[]',
  mandatory_disclosures TEXT DEFAULT '',
  status TEXT DEFAULT 'draft',
  created_at TEXT DEFAULT (datetime('now'))
);

-- ═══════════════════════════════════════════════════════
-- 8. EXPERIMENTS & MEASUREMENT INTEGRITY
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS experiments (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  hypothesis TEXT NOT NULL,
  variant_a_id TEXT REFERENCES asset_versions(id) ON DELETE SET NULL,
  variant_b_id TEXT REFERENCES asset_versions(id) ON DELETE SET NULL,
  primary_metric TEXT NOT NULL DEFAULT 'CTR',
  secondary_metrics TEXT DEFAULT '[]',
  target_region TEXT DEFAULT '',
  target_audience TEXT DEFAULT '',
  attribution_window TEXT DEFAULT '7 days',
  test_duration TEXT DEFAULT '14 days',
  success_criteria TEXT DEFAULT '',
  confounders TEXT DEFAULT '',
  is_locked INTEGER DEFAULT 0,
  locked_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS metric_observations (
  id TEXT PRIMARY KEY,
  experiment_id TEXT NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
  variant_key TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value REAL NOT NULL,
  metric_unit TEXT DEFAULT '',
  sample_size INTEGER,
  time_window TEXT DEFAULT '',
  attribution_window TEXT DEFAULT '',
  source TEXT DEFAULT '',
  provenance_type TEXT NOT NULL DEFAULT 'SYNTHETIC',
  data_quality_warning TEXT DEFAULT '',
  import_timestamp TEXT DEFAULT (datetime('now')),
  created_at TEXT DEFAULT (datetime('now'))
);

-- ═══════════════════════════════════════════════════════
-- 9. DECISION TRACE & AUDIT TRAIL
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS audit_events (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  campaign_id TEXT,
  actor_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  prev_hash TEXT,
  hash TEXT NOT NULL,
  metadata_json TEXT DEFAULT '{}',
  created_at TEXT DEFAULT (datetime('now'))
);

-- ═══════════════════════════════════════════════════════
-- INDEXES FOR PERFORMANCE
-- ═══════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_campaigns_workspace ON campaigns(workspace_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_brief_versions_campaign ON brief_versions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_claim_atoms_campaign ON claim_atoms(campaign_id);
CREATE INDEX IF NOT EXISTS idx_creative_assets_campaign ON creative_assets(campaign_id);
CREATE INDEX IF NOT EXISTS idx_asset_versions_asset ON asset_versions(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_versions_status ON asset_versions(status);
CREATE INDEX IF NOT EXISTS idx_verification_runs_version ON verification_runs(asset_version_id);
CREATE INDEX IF NOT EXISTS idx_findings_run ON verification_findings(run_id);
CREATE INDEX IF NOT EXISTS idx_approvals_version ON approvals(asset_version_id);
CREATE INDEX IF NOT EXISTS idx_experiments_campaign ON experiments(campaign_id);
CREATE INDEX IF NOT EXISTS idx_metric_obs_experiment ON metric_observations(experiment_id);
CREATE INDEX IF NOT EXISTS idx_audit_campaign ON audit_events(campaign_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_events(entity_type, entity_id);
