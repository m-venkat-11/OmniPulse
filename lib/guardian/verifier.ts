// ═══════════════════════════════════════════════════════
// Braco OmniPulse — Brand Guardian Rules Engine
// Deterministic Pass A checks + AI-assisted Pass B & C
// ═══════════════════════════════════════════════════════

import { turso } from '@/lib/turso';
import { generateId } from '@/lib/db';
import { runAiVerification } from '@/lib/ai/adapter';

export interface Finding {
  id: string;
  pass_type: 'pass_a_deterministic' | 'pass_b_evidence' | 'pass_c_cultural';
  severity: 'critical' | 'high' | 'warning' | 'info';
  category: string;
  flagged_text: string;
  explanation: string;
  rule_id?: string;
  claim_atom_id?: string;
  evidence_status: string;
  suggested_correction: string;
  requires_human_review: boolean;
}

export interface VerificationRunResult {
  runId: string;
  pass_a_status: string;
  pass_b_status: string;
  pass_c_status: string;
  overall_status: string;
  findings: Finding[];
  summary: string;
}

// ── Built-in universal prohibited phrases ──
const UNIVERSAL_PROHIBITED = [
  { pattern: /\bguaranteed?\b/i, explanation: 'Unqualified guarantee claims are prohibited', severity: 'critical' as const },
  { pattern: /\b100%\s*(safe|cure|effective|guaranteed)\b/i, explanation: 'Absolute safety/efficacy claims require verified evidence', severity: 'critical' as const },
  { pattern: /\bmiracle\b/i, explanation: '"Miracle" claims are prohibited in advertising', severity: 'critical' as const },
  { pattern: /\bcure[sd]?\b/i, explanation: 'Cure claims require medical evidence and regulatory approval', severity: 'critical' as const },
  { pattern: /\bbest\s+in\s+(india|the\s+world|market)\b/i, explanation: 'Superlative comparative claims require substantiation', severity: 'high' as const },
  { pattern: /\b#1\b|\bnumber\s*one\b/i, explanation: '"Number 1" claims require verified market data', severity: 'high' as const },
  { pattern: /\brisk.?free\b/i, explanation: '"Risk-free" claims may be misleading', severity: 'warning' as const },
];

// ── Indic script mixing detection ──
const INDIC_SCRIPTS: Record<string, RegExp> = {
  Devanagari: /[\u0900-\u097F]/,
  Bengali: /[\u0980-\u09FF]/,
  Telugu: /[\u0C00-\u0C7F]/,
  Tamil: /[\u0B80-\u0BFF]/,
  Gujarati: /[\u0A80-\u0AFF]/,
  Kannada: /[\u0C80-\u0CFF]/,
  Malayalam: /[\u0D00-\u0D7F]/,
  Odia: /[\u0B00-\u0B7F]/,
  Gurmukhi: /[\u0A00-\u0A7F]/,
};

function detectScriptMixing(text: string, expectedScript: string): Finding[] {
  const findings: Finding[] = [];
  const detectedScripts: string[] = [];

  for (const [scriptName, regex] of Object.entries(INDIC_SCRIPTS)) {
    if (regex.test(text)) {
      detectedScripts.push(scriptName);
    }
  }

  // Latin characters in Indic text (excluding common English words in code-switching)
  const hasLatin = /[a-zA-Z]{4,}/.test(text);
  const indicScriptsFound = detectedScripts.filter(s => s !== 'Latin');

  if (indicScriptsFound.length > 1) {
    findings.push({
      id: generateId(),
      pass_type: 'pass_a_deterministic',
      severity: 'warning',
      category: 'Script Mixing',
      flagged_text: text.substring(0, 100),
      explanation: `Multiple Indic scripts detected: ${indicScriptsFound.join(', ')}. Expected ${expectedScript}. Check for accidental script mixing.`,
      evidence_status: 'detected',
      suggested_correction: `Ensure all text uses ${expectedScript} script consistently`,
      requires_human_review: true,
    });
  }

  return findings;
}

// ── Pass A: Deterministic Rule Checks ──

export async function runPassA(
  text: string,
  workspaceId: string,
  targetLanguage: string,
  expectedScript?: string
): Promise<{ status: string; findings: Finding[] }> {
  const findings: Finding[] = [];

  // 1. Check universal prohibited phrases
  for (const rule of UNIVERSAL_PROHIBITED) {
    const match = text.match(rule.pattern);
    if (match) {
      findings.push({
        id: generateId(),
        pass_type: 'pass_a_deterministic',
        severity: rule.severity,
        category: 'Prohibited Phrase',
        flagged_text: match[0],
        explanation: rule.explanation,
        evidence_status: 'rule_violation',
        suggested_correction: 'Remove or rephrase with appropriate qualifications',
        requires_human_review: rule.severity === 'critical',
      });
    }
  }

  // 2. Check workspace-specific brand rules
  const rulesResult = await turso.execute({
    sql: 'SELECT * FROM brand_rules WHERE workspace_id = ? AND is_active = 1',
    args: [workspaceId],
  });

  for (const rule of rulesResult.rows) {
    try {
      const pattern = new RegExp(rule.pattern as string, 'gi');
      const match = text.match(pattern);
      if (match) {
        findings.push({
          id: generateId(),
          pass_type: 'pass_a_deterministic',
          severity: rule.severity as Finding['severity'],
          category: rule.rule_type as string,
          flagged_text: match[0],
          explanation: rule.explanation as string,
          rule_id: rule.id as string,
          evidence_status: 'rule_violation',
          suggested_correction: `Comply with brand rule: ${rule.explanation}`,
          requires_human_review: (rule.severity as string) === 'critical',
        });
      }
    } catch {
      // Invalid regex in stored rule — skip but log
      console.warn(`[Guardian] Invalid regex in rule ${rule.id}: ${rule.pattern}`);
    }
  }

  // 3. Check for missing ad disclosures
  const hasAdDisclosure = /\b#(ad|sponsored|paid|promotion)\b/i.test(text) ||
    /\b#(प्रकटन|जाहिरात|ప్రకటన|விளம்பரம்|જાહેરાત)\b/i.test(text);

  if (!hasAdDisclosure && text.length > 50) {
    findings.push({
      id: generateId(),
      pass_type: 'pass_a_deterministic',
      severity: 'info',
      category: 'Missing Disclosure',
      flagged_text: '[No ad disclosure tag found]',
      explanation: 'Consider adding #Ad or equivalent native-script disclosure tag if this is sponsored content',
      evidence_status: 'check_applicable',
      suggested_correction: 'Add #Ad or regional equivalent (e.g., #ప్రకటన for Telugu)',
      requires_human_review: false,
    });
  }

  // 4. Script mixing check
  if (expectedScript) {
    findings.push(...detectScriptMixing(text, expectedScript));
  }

  const hasCritical = findings.some(f => f.severity === 'critical');
  const hasHigh = findings.some(f => f.severity === 'high');

  return {
    status: hasCritical ? 'failed' : hasHigh ? 'warnings' : findings.length > 0 ? 'passed_with_info' : 'passed',
    findings,
  };
}

// ── Pass B & C: AI-Assisted Verification ──

export async function runPassBC(
  sourceText: string,
  adaptedText: string,
  targetLanguage: string,
  campaignId: string
): Promise<{ pass_b_status: string; pass_c_status: string; findings: Finding[] }> {
  // Fetch approved claims for this campaign
  const claimsResult = await turso.execute({
    sql: 'SELECT claim_text FROM claim_atoms WHERE campaign_id = ? AND evidence_status IN (?, ?)',
    args: [campaignId, 'supported', 'needs_human_review'],
  });
  const approvedClaims = claimsResult.rows.map(r => r.claim_text as string);

  // Fetch brand rules
  const campaign = await turso.execute({
    sql: 'SELECT workspace_id FROM campaigns WHERE id = ?',
    args: [campaignId],
  });
  const wsId = campaign.rows[0]?.workspace_id as string || 'ws-default';

  const rulesResult = await turso.execute({
    sql: 'SELECT explanation FROM brand_rules WHERE workspace_id = ? AND is_active = 1',
    args: [wsId],
  });
  const brandRules = rulesResult.rows.map(r => r.explanation as string);

  const result = await runAiVerification(sourceText, adaptedText, targetLanguage, approvedClaims, brandRules);

  const findings: Finding[] = result.data.findings.map(f => ({
    id: generateId(),
    pass_type: f.pass_type as Finding['pass_type'],
    severity: f.severity as Finding['severity'],
    category: f.category,
    flagged_text: f.flagged_text,
    explanation: f.explanation,
    evidence_status: f.evidence_status,
    suggested_correction: f.suggested_correction,
    requires_human_review: f.requires_human_review,
  }));

  const passBFindings = findings.filter(f => f.pass_type === 'pass_b_evidence');
  const passCFindings = findings.filter(f => f.pass_type === 'pass_c_cultural');

  const hasCriticalB = passBFindings.some(f => f.severity === 'critical');
  const hasCriticalC = passCFindings.some(f => f.severity === 'critical');

  return {
    pass_b_status: hasCriticalB ? 'failed' : passBFindings.length > 0 ? 'warnings' : 'passed',
    pass_c_status: hasCriticalC ? 'failed' : passCFindings.length > 0 ? 'warnings' : 'passed',
    findings,
  };
}

// ── Full 3-Pass Verification Orchestrator ──

export async function runFullVerification(
  assetVersionId: string,
  sourceText: string,
  adaptedText: string,
  targetLanguage: string,
  campaignId: string,
  workspaceId: string,
  expectedScript?: string
): Promise<VerificationRunResult> {
  const runId = generateId();

  // Run Pass A
  const passA = await runPassA(adaptedText, workspaceId, targetLanguage, expectedScript);

  // Run Pass B & C
  const passBC = await runPassBC(sourceText, adaptedText, targetLanguage, campaignId);

  const allFindings = [...passA.findings, ...passBC.findings];
  const hasCritical = allFindings.some(f => f.severity === 'critical');
  const hasHigh = allFindings.some(f => f.severity === 'high');

  const overall_status = hasCritical ? 'failed_with_blockers' :
    hasHigh ? 'warnings' :
    allFindings.length > 0 ? 'passed_with_info' : 'passed';

  const summary = hasCritical
    ? `${allFindings.filter(f => f.severity === 'critical').length} critical blocker(s) found — human review required before approval`
    : hasHigh
    ? `${allFindings.filter(f => f.severity === 'high').length} high-priority issue(s) detected — review recommended`
    : allFindings.length > 0
    ? `${allFindings.length} informational finding(s) — no blockers detected`
    : 'All verification passes completed — no issues detected';

  // Persist verification run
  await turso.execute({
    sql: `INSERT INTO verification_runs (id, asset_version_id, pass_a_status, pass_b_status, pass_c_status, overall_status, summary)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [runId, assetVersionId, passA.status, passBC.pass_b_status, passBC.pass_c_status, overall_status, summary],
  });

  // Persist findings
  for (const f of allFindings) {
    await turso.execute({
      sql: `INSERT INTO verification_findings (id, run_id, pass_type, severity, category, flagged_text, explanation, rule_id, claim_atom_id, evidence_status, suggested_correction, requires_human_review)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [f.id, runId, f.pass_type, f.severity, f.category, f.flagged_text, f.explanation, f.rule_id || null, f.claim_atom_id || null, f.evidence_status, f.suggested_correction, f.requires_human_review ? 1 : 0],
    });
  }

  return {
    runId,
    pass_a_status: passA.status,
    pass_b_status: passBC.pass_b_status,
    pass_c_status: passBC.pass_c_status,
    overall_status,
    findings: allFindings,
    summary,
  };
}
