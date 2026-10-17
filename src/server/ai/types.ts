import { z } from "zod";

// ── Structured Regional Adaptation Schema (Section 6 Contract) ──
export const StructuredAdaptationOutputSchema = z.object({
  asset_text: z.object({
    headline: z.string(),
    subline: z.string().default(""),
    body: z.string().default(""),
    cta: z.string().default(""),
    disclosure: z.string().default(""),
  }),
  language: z.string(),
  channel: z.string().default("social_media"),
  format: z.string().default("copy"),
  angle: z.string().default("regional_relevance"),
  literal_translation: z.string().default(""),
  adaptation_rationale: z.array(
    z.object({
      original_phrase: z.string(),
      adapted_phrase: z.string(),
      change: z.string(),
      reason: z.string(),
      confidence_note: z.string().default(""),
    })
  ).default([]),
  claims: z.array(
    z.object({
      text_span: z.string(),
      type: z.string(), // product_fact, approved_term, prohibited_claim, etc.
      atom_ids: z.array(z.string()).default([]),
      source_ids: z.array(z.string()).default([]),
      evidence_status: z.string(), // Supported, Unsupported, Contradicted, Evidence missing
    })
  ).default([]),
  locked_tokens_used: z.array(z.string()).default([]),
  review_flags: z.array(
    z.object({
      category: z.string(),
      severity: z.enum(["Low", "Medium", "High", "Critical"]),
      span: z.string(),
      explanation: z.string(),
      source_ids: z.array(z.string()).default([]),
      recommended_action: z.string(),
    })
  ).default([]),
  uncertain_local_context: z.array(z.string()).default([]),
  required_human_reviews: z.array(z.string()).default([]),
});

export type StructuredAdaptationOutput = z.infer<typeof StructuredAdaptationOutputSchema>;

// ── Claim Extraction Schema (Section 4.3 & 6) ──
export const ExtractedClaimSchema = z.object({
  claim_text: z.string(),
  claim_type: z.enum([
    "product_fact",
    "approved_term",
    "prohibited_claim",
    "disclosure",
    "offer_price",
    "legal_high_risk",
  ]),
  locked_tokens: z.array(z.string()).default([]),
  qualifications: z.string().default(""),
  evidence_needed: z.string().default(""),
});

export const ClaimExtractionResponseSchema = z.object({
  claims: z.array(ExtractedClaimSchema),
});

export type ExtractedClaim = z.infer<typeof ExtractedClaimSchema>;

// ── Poster Visual Direction Spec (Section 7) ──
export const PosterSpecSchema = z.object({
  palette: z.object({
    primary: z.string(),
    secondary: z.string(),
    background: z.string(),
    text_contrast: z.string(),
  }),
  layout_template_id: z.enum(["centered_hero", "split_modern", "bottom_band", "card_focus"]),
  text_zones: z.array(
    z.object({
      zone_id: z.string(),
      min_font_size_px: z.number(),
      max_font_size_px: z.number(),
      alignment: z.enum(["left", "center", "right"]),
    })
  ),
  mood: z.string(),
  alt_text: z.string(),
  background_prompt: z.string(),
});

export type PosterSpec = z.infer<typeof PosterSpecSchema>;

// ── Translation & Transliteration Requests ──
export interface TranslateRequest {
  text: string;
  sourceLang: string;
  targetLang: string;
  mode?: "formal" | "colloquial" | "code-mixed";
}

export interface TransliterateRequest {
  text: string;
  sourceLang: string;
  targetScript?: string;
}

export interface HealthCheckResult {
  provider: "gemini" | "sarvam";
  status: "connected" | "not_connected" | "error";
  model: string;
  lastChecked: string;
  latencyMs: number;
  message?: string;
}

// ── AI Provider Interface (Section 6) ──
export interface AIProvider {
  translate(req: TranslateRequest): Promise<string>;
  transliterate(req: TransliterateRequest): Promise<string>;
  detectLanguage(text: string): Promise<{ languageCode: string; confidence: number }>;
  generateStructured<T>(prompt: string, schema: z.ZodSchema<T>, systemInstruction?: string): Promise<T>;
  generateImage(prompt: string, aspectRatio?: "1:1" | "4:5" | "9:16" | "16:9"): Promise<Buffer | null>;
  healthCheck(): Promise<HealthCheckResult>;
}
