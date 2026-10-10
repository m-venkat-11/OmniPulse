-- Initial Schema for Braco OmniPulse (Samartha Stage 1)

-- 1. Auth & Orgs
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE workspace_members (
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- references auth.users in Supabase
  role TEXT NOT NULL CHECK (role IN ('Admin', 'Editor', 'Reviewer', 'Viewer')),
  language_tags TEXT[] DEFAULT '{}',
  PRIMARY KEY (workspace_id, user_id)
);

-- 2. Campaigns
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  objective TEXT,
  region TEXT,
  language TEXT,
  channel TEXT,
  derived_status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Briefs (Immutable Versions)
CREATE TABLE brief_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  content_hash TEXT NOT NULL,
  content JSONB NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Brand Knowledge
CREATE TABLE brand_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE brand_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  normalized_pattern TEXT,
  script TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE claim_atoms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brief_version_id UUID REFERENCES brief_versions(id) ON DELETE CASCADE,
  canonical_text TEXT NOT NULL,
  locked_tokens TEXT[] DEFAULT '{}',
  source_id UUID REFERENCES brand_sources(id) ON DELETE SET NULL,
  evidence_status TEXT NOT NULL
);

-- 5. Creative Assets (Two-layer generation output)
CREATE TABLE creative_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE asset_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID REFERENCES creative_assets(id) ON DELETE CASCADE,
  content_hash TEXT NOT NULL,
  content JSONB NOT NULL,
  angle TEXT,
  prompt_template_version TEXT,
  generation_metadata JSONB,
  generated_by_mode TEXT NOT NULL, -- 'live' or 'demo_fixture'
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Guardian Findings
CREATE TABLE findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_version_id UUID REFERENCES asset_versions(id) ON DELETE CASCADE,
  detection_layer TEXT NOT NULL,
  rule_id UUID REFERENCES brand_rules(id) ON DELETE SET NULL,
  severity TEXT NOT NULL,
  explanation TEXT NOT NULL,
  text_span TEXT,
  span_hash TEXT,
  evidence_status TEXT,
  resolution TEXT,
  reviewer_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Review & Approval
CREATE TABLE approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_version_id UUID REFERENCES asset_versions(id) ON DELETE CASCADE,
  content_hash TEXT NOT NULL,
  gate_results JSONB NOT NULL,
  override_reason TEXT,
  reviewer_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Decision Trace (Tamper-evident audit)
CREATE TABLE audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  prev_hash TEXT,
  hash TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) policies will be added in subsequent migrations.
