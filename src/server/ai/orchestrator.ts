import { sarvamService } from "./sarvam";
import { geminiService } from "./gemini";
import {
  StructuredAdaptationOutput,
  StructuredAdaptationOutputSchema,
  ClaimExtractionResponseSchema,
  ExtractedClaim,
  PosterSpec,
  PosterSpecSchema,
  HealthCheckResult,
} from "./types";

export interface AdaptationInput {
  sourceText: string;
  sourceLanguage: string;
  targetLanguage: string;
  region?: string;
  dialect?: string;
  tone: string;
  formality: string;
  slangIntensity: string;
  culturalContext?: string;
  brandName: string;
  productName: string;
  approvedClaims: { id: string; text: string; type: string }[];
  prohibitedClaims: string[];
  mandatoryDisclosures?: string[];
  channel?: string;
}

export class AIOrchestrator {
  /**
   * Complete Dual-Provider Adaptation (Diagram 4.2):
   * 1. Literal Translation via Sarvam mayura:v1
   * 2. Natural Regional Adaptation via Gemini with Claim Atoms & Context
   */
  async adapt(input: AdaptationInput): Promise<StructuredAdaptationOutput> {
    // Step 1: Literal Translation via Sarvam
    let literalTranslation = "";
    try {
      literalTranslation = await sarvamService.translate({
        text: input.sourceText,
        sourceLang: input.sourceLanguage,
        targetLang: input.targetLanguage,
        mode: input.formality === "formal" ? "formal" : "colloquial",
      });
    } catch (err: any) {
      console.warn("[Orchestrator] Sarvam translation failed, will note in output:", err.message);
      literalTranslation = `[Translation unavailable: ${err.message}]`;
    }

    // Step 2: Build Structured Prompt for Gemini
    const prompt = `You are a regional brand advertising specialist for Indian markets.
You must adapt a campaign message from ${input.sourceLanguage} to ${input.targetLanguage} for the ${input.region || "General"} region.

CAMPAIGN BRIEF:
- Brand Name: ${input.brandName}
- Product: ${input.productName}
- Channel: ${input.channel || "social_media"}
- Source Message: "${input.sourceText}"
- Literal Reference Translation: "${literalTranslation}"

REGIONAL SETTINGS:
- Target Language: ${input.targetLanguage}
- Region: ${input.region || "Standard"}
- Dialect / Variety: ${input.dialect || "standard"}
- Tone: ${input.tone}
- Formality: ${input.formality}
- Slang Intensity: ${input.slangIntensity}
- Cultural Context / Event: ${input.culturalContext || "None specified"}

APPROVED CLAIM ATOMS (You may ONLY state product facts that cite these IDs):
${input.approvedClaims.map((c) => `- ID: [${c.id}] | Type: ${c.type} | Text: "${c.text}"`).join("\n") || "None specified"}

PROHIBITED CLAIMS & WORDS (Strictly forbidden):
${input.prohibitedClaims.map((p) => `- "${p}"`).join("\n") || "No absolute cure claims, unverified superlatives, or medical guarantees."}

MANDATORY DISCLOSURES:
${input.mandatoryDisclosures?.map((d) => `- "${d}"`).join("\n") || "None"}

INSTRUCTIONS:
1. Provide a natural, culturally resonant transcreation in ${input.targetLanguage} native script.
2. Structure output into headline, subline, body, cta, and disclosure.
3. Compare against the literal translation and document adaptation_rationale for key phrase changes.
4. Extract all claims in the adapted text, mapping each to an approved Claim Atom ID. If a fact lacks an ID, flag evidence_status as 'Evidence missing' or 'Unsupported'.
5. Include any cultural mismatch warnings or items requiring human verification.
6. Return strictly valid JSON adhering to the required schema.`;

    const systemInstruction = `You are an enterprise AI advertising system. Return ONLY valid JSON conforming to the schema. Never invent facts or evidence. Never use prohibited phrases.`;

    const result = await geminiService.generateStructured(
      prompt,
      StructuredAdaptationOutputSchema,
      systemInstruction
    );

    // Attach literal translation if missing
    if (!result.literal_translation || result.literal_translation.trim() === "") {
      result.literal_translation = literalTranslation;
    }

    return result;
  }

  /**
   * Extract Claim Atoms from user-provided brief text
   */
  async extractClaims(briefText: string, brandName: string, productName: string): Promise<ExtractedClaim[]> {
    const prompt = `Analyze this campaign brief and extract all atomic claims (product facts, approved terms, disclosures, pricing/offers, and regulatory claims).

Brand: ${brandName}
Product: ${productName}

Brief Text:
"""
${briefText}
"""

Instructions:
Extract each distinct, verifiable claim. Identify locked tokens (such as specific numbers, units like '14g', qualifiers like 'up to', certifications).
Classify each claim_type as one of: product_fact, approved_term, prohibited_claim, disclosure, offer_price, legal_high_risk.
Return JSON with the "claims" array.`;

    const res = await geminiService.generateStructured(prompt, ClaimExtractionResponseSchema);
    return res.claims;
  }

  /**
   * Poster Art Direction & Visual Prompt Spec (Section 7)
   */
  async generatePosterSpec(params: {
    headline: string;
    subline: string;
    brandName: string;
    productName: string;
    targetLanguage: string;
    format: "1:1" | "4:5" | "9:16" | "16:9";
    visualBrief?: string;
    brandColors?: string;
  }): Promise<PosterSpec> {
    const prompt = `You are an art director designing an advertising poster layout for an Indian brand campaign.

Brand: ${params.brandName}
Product: ${params.productName}
Language: ${params.targetLanguage}
Format Ratio: ${params.format}
Headline: "${params.headline}"
Subline: "${params.subline}"
Visual Brief: "${params.visualBrief || "Modern premium commercial aesthetic"}"
Brand Color Guidance: "${params.brandColors || "Primary emerald/gold, dark background"}"

Requirements:
1. Choose an optimal layout template: centered_hero, split_modern, bottom_band, or card_focus.
2. Define a high-contrast harmonious palette (minimum 4.5:1 contrast for body text).
3. Create a descriptive prompt for an AI background image. The background prompt MUST be strictly TEXT-FREE, LOGO-FREE, and contain NO HUMAN FACES. Focus on lighting, textures, depth, and atmospheric product staging.
4. Define text zones with min/max font sizes for responsive SVG rendering.`;

    return await geminiService.generateStructured(prompt, PosterSpecSchema);
  }

  /**
   * Live health check for both Gemini and Sarvam
   */
  async checkAllHealth(): Promise<{ gemini: HealthCheckResult; sarvam: HealthCheckResult }> {
    const [gemini, sarvam] = await Promise.all([
      geminiService.healthCheck(),
      sarvamService.healthCheck(),
    ]);
    return { gemini, sarvam };
  }
}

export const aiOrchestrator = new AIOrchestrator();
