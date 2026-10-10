import { z } from "zod";

// ═══════════════════════════════════════════════════════
// Braco OmniPulse — AI Provider Adapter
// Provider-independent interface with Gemini integration
// and deterministic demo fixture fallback
// ═══════════════════════════════════════════════════════

// ── Schemas ──

export const AdaptationResultSchema = z.object({
  literal_translation: z.string(),
  regional_adaptation: z.string(),
  meaning_summary: z.string(),
  adaptation_rationale: z.array(z.object({
    original_phrase: z.string(),
    adapted_phrase: z.string(),
    reason: z.string(),
  })),
  claim_preservation: z.array(z.object({
    original_claim: z.string(),
    adapted_version: z.string(),
    preserved: z.boolean(),
    notes: z.string(),
  })),
  cultural_warnings: z.array(z.object({
    phrase: z.string(),
    issue: z.string(),
    severity: z.string(),
    suggestion: z.string(),
    requires_human_review: z.boolean(),
  })),
});

export type AdaptationResult = z.infer<typeof AdaptationResultSchema>;

export const ClaimExtractionSchema = z.object({
  claims: z.array(z.object({
    claim_text: z.string(),
    claim_type: z.string(),
    locked_tokens: z.array(z.string()),
    evidence_status: z.string(),
    qualifications: z.string(),
  })),
});

export type ClaimExtractionResult = z.infer<typeof ClaimExtractionSchema>;

export const VerificationResultSchema = z.object({
  findings: z.array(z.object({
    pass_type: z.string(),
    severity: z.string(),
    category: z.string(),
    flagged_text: z.string(),
    explanation: z.string(),
    evidence_status: z.string(),
    suggested_correction: z.string(),
    requires_human_review: z.boolean(),
  })),
  summary: z.string(),
});

export type VerificationResult = z.infer<typeof VerificationResultSchema>;

// ── Adaptation Request ──

export interface AdaptationRequest {
  sourceText: string;
  sourceLanguage: string;
  targetLanguage: string;
  dialect?: string;
  tone: string;
  slangLevel: string;
  formality: string;
  region?: string;
  brandName?: string;
  productName?: string;
  approvedClaims?: string[];
  prohibitedPhrases?: string[];
  keyMessage?: string;
  callToAction?: string;
}

// ── Gemini API Call ──

async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const candidateModels = [
    'gemini-3.8-flash',
    'gemini-3-flash-preview',
    'gemini-flash-latest'
  ];

  let lastError: any = null;
  for (const model of candidateModels) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 35000);

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 4096,
              responseMimeType: 'application/json',
            },
          }),
        }
      );
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      } else {
        const err = await response.text();
        console.warn(`[AI] Gemini ${model} failed (${response.status}):`, err.slice(0, 120));
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`[AI] Error calling ${model}:`, err.message);
    }
  }

  throw new Error(`All candidate Gemini models failed. Last error: ${lastError?.message || 'unknown'}`);
}

// ── Extract JSON from response (handles markdown fences) ──

function extractJson(text: string): string {
  // Remove markdown code fences if present
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return cleaned;
}

// ── Generate Multilingual Adaptation ──

export async function generateAdaptation(req: AdaptationRequest): Promise<{
  data: AdaptationResult;
  generated_by_mode: 'live' | 'demo_fixture';
}> {
  const hasApiKey = !!process.env.GEMINI_API_KEY;

  if (hasApiKey) {
    try {
      const prompt = buildAdaptationPrompt(req);
      const raw = await callGemini(prompt);
      const parsed = JSON.parse(extractJson(raw));
      const validated = AdaptationResultSchema.parse(parsed);
      return { data: validated, generated_by_mode: 'live' };
    } catch (err) {
      console.error('[AI] Live adaptation failed, using demo fixture:', err);
    }
  }

  // Fallback to demo fixture
  return {
    data: getDemoAdaptation(req),
    generated_by_mode: 'demo_fixture',
  };
}

// ── Extract Claim Atoms from Brief ──

export async function extractClaims(briefText: string, brandName: string, productName: string): Promise<{
  data: ClaimExtractionResult;
  generated_by_mode: 'live' | 'demo_fixture';
}> {
  const hasApiKey = !!process.env.GEMINI_API_KEY;

  if (hasApiKey) {
    try {
      const prompt = `You are a brand compliance analyst. Extract all factual product claims from this campaign brief.

Brand: ${brandName}
Product: ${productName}

Brief content:
"""
${briefText}
"""

For each factual claim, identify:
- claim_text: the exact factual statement
- claim_type: one of "product_spec", "price", "health_benefit", "guarantee", "certification", "comparative", "statistic", "eligibility"
- locked_tokens: array of specific numbers, percentages, product names that MUST NOT change during translation
- evidence_status: one of "supported", "unsupported", "needs_human_review"
- qualifications: any conditions or limitations on the claim

Return JSON: { "claims": [...] }
Only extract verifiable factual statements, not emotional/creative phrases.`;

      const raw = await callGemini(prompt);
      const parsed = JSON.parse(extractJson(raw));
      const validated = ClaimExtractionSchema.parse(parsed);
      return { data: validated, generated_by_mode: 'live' };
    } catch (err) {
      console.error('[AI] Claim extraction failed:', err);
    }
  }

  return {
    data: { claims: [] },
    generated_by_mode: 'demo_fixture',
  };
}

// ── Run AI-Assisted Verification (Pass B & C) ──

export async function runAiVerification(
  sourceText: string,
  adaptedText: string,
  targetLanguage: string,
  approvedClaims: string[],
  brandRules: string[]
): Promise<{
  data: VerificationResult;
  generated_by_mode: 'live' | 'demo_fixture';
}> {
  const hasApiKey = !!process.env.GEMINI_API_KEY;

  if (hasApiKey) {
    try {
      const prompt = `You are a brand compliance and cultural review engine for Indian marketing campaigns.

ORIGINAL SOURCE TEXT:
"""
${sourceText}
"""

ADAPTED TEXT (${targetLanguage}):
"""
${adaptedText}
"""

APPROVED CLAIMS that must be preserved:
${approvedClaims.map((c, i) => `${i + 1}. ${c}`).join('\n')}

BRAND RULES to check:
${brandRules.map((r, i) => `${i + 1}. ${r}`).join('\n')}

Perform two verification passes:

PASS B (Evidence & Semantic Check):
- Check if any approved claims were changed, removed, or exaggerated
- Check if new unsupported claims were introduced
- Check if numbers, prices, percentages were altered
- Check if required qualifications were dropped

PASS C (Regional Cultural Check):
- Check if idioms or expressions could be confusing or offensive in the target language
- Check if the tone matches the intended audience
- Check for script mixing issues
- Check if the meaning was preserved correctly

For each finding, specify:
- pass_type: "pass_b_evidence" or "pass_c_cultural"
- severity: "critical", "high", "warning", or "info"
- category: short category label
- flagged_text: the exact problematic text from the adaptation
- explanation: why this is an issue
- evidence_status: "contradicted", "evidence_missing", "unsupported", or "uncertain"
- suggested_correction: what the text should say instead
- requires_human_review: true/false

Return JSON: { "findings": [...], "summary": "..." }
If no issues found, return empty findings array with a positive summary.`;

      const raw = await callGemini(prompt);
      const parsed = JSON.parse(extractJson(raw));
      const validated = VerificationResultSchema.parse(parsed);
      return { data: validated, generated_by_mode: 'live' };
    } catch (err) {
      console.error('[AI] Verification failed:', err);
    }
  }

  return {
    data: { findings: [], summary: 'AI verification unavailable — manual review required.' },
    generated_by_mode: 'demo_fixture',
  };
}

// ── Prompt Builder ──

function buildAdaptationPrompt(req: AdaptationRequest): string {
  return `You are a multilingual Indian marketing campaign adaptation specialist.

TASK: Convert the following campaign text from ${req.sourceLanguage} to ${req.targetLanguage}${req.dialect ? ` (${req.dialect} dialect/variety)` : ''}.

SOURCE TEXT:
"""
${req.sourceText}
"""

ADAPTATION PARAMETERS:
- Brand: ${req.brandName || 'Not specified'}
- Product: ${req.productName || 'Not specified'}
- Tone: ${req.tone}
- Formality: ${req.formality}
- Slang Level: ${req.slangLevel}
- Region: ${req.region || 'General'}
${req.keyMessage ? `- Key Message: ${req.keyMessage}` : ''}
${req.callToAction ? `- Call to Action: ${req.callToAction}` : ''}
${req.approvedClaims?.length ? `- Approved Claims (MUST preserve exactly): ${req.approvedClaims.join('; ')}` : ''}
${req.prohibitedPhrases?.length ? `- Prohibited Phrases: ${req.prohibitedPhrases.join(', ')}` : ''}

INSTRUCTIONS:
1. Create a LITERAL TRANSLATION: Direct, word-for-word rendering in ${req.targetLanguage}. No style changes.
2. Create a REGIONAL ADAPTATION: Natural, culturally appropriate marketing copy for ${req.region || 'the target audience'}. Adjust idioms, expressions, and cultural references while preserving the core meaning and all factual claims.
3. Create a MEANING SUMMARY: A brief English explanation of what the adaptation communicates.
4. List ADAPTATION RATIONALE: For each significant change, explain original_phrase, adapted_phrase, and reason.
5. Check CLAIM PRESERVATION: For each approved claim, verify it's preserved in the adaptation.
6. Flag CULTURAL WARNINGS: Any phrases that might be confusing, inappropriate, or culturally mismatched.

The literal translation and regional adaptation MUST be meaningfully different — do NOT copy one to the other.

Return valid JSON matching this structure:
{
  "literal_translation": "...",
  "regional_adaptation": "...",
  "meaning_summary": "...",
  "adaptation_rationale": [{"original_phrase": "...", "adapted_phrase": "...", "reason": "..."}],
  "claim_preservation": [{"original_claim": "...", "adapted_version": "...", "preserved": true/false, "notes": "..."}],
  "cultural_warnings": [{"phrase": "...", "issue": "...", "severity": "info|warning|high|critical", "suggestion": "...", "requires_human_review": true/false}]
}`;
}

// ── Demo Fixture Fallback ──

function getDemoAdaptation(req: AdaptationRequest): AdaptationResult {
  return {
    literal_translation: `[Demo: Literal ${req.targetLanguage} translation of your source text would appear here. Connect Gemini API for real translations.]`,
    regional_adaptation: `[Demo: Culturally adapted ${req.targetLanguage} version for ${req.region || 'target region'} would appear here. Connect Gemini API for real adaptations.]`,
    meaning_summary: `[Demo: This adaptation would preserve the core message while adapting cultural references for ${req.targetLanguage} speakers in ${req.region || 'the target region'}.]`,
    adaptation_rationale: [{
      original_phrase: req.sourceText.substring(0, 50),
      adapted_phrase: '[Regional equivalent]',
      reason: 'Demo mode — connect Gemini API for real adaptation rationale',
    }],
    claim_preservation: [],
    cultural_warnings: [],
  };
}
