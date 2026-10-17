import { TranslateRequest, TransliterateRequest, HealthCheckResult } from "./types";

const SARVAM_BASE_URL = "https://api.sarvam.ai";

// Language name / code mapping to Sarvam BCP-47
export const SARVAM_LANG_MAP: Record<string, string> = {
  English: "en-IN",
  Hindi: "hi-IN",
  Telugu: "te-IN",
  Tamil: "ta-IN",
  Bengali: "bn-IN",
  Marathi: "mr-IN",
  Kannada: "kn-IN",
  Malayalam: "ml-IN",
  Gujarati: "gu-IN",
  Punjabi: "pa-IN",
  Odia: "od-IN",
  // Script codes
  en: "en-IN",
  hi: "hi-IN",
  te: "te-IN",
  ta: "ta-IN",
  bn: "bn-IN",
  mr: "mr-IN",
  kn: "kn-IN",
  ml: "ml-IN",
  gu: "gu-IN",
  pa: "pa-IN",
  od: "od-IN",
};

export function resolveSarvamCode(lang: string): string {
  const normalized = lang.trim();
  return SARVAM_LANG_MAP[normalized] || SARVAM_LANG_MAP[normalized.toLowerCase()] || "en-IN";
}

export class SarvamService {
  private apiKey: string;
  private model: string;

  constructor() {
    this.apiKey = process.env.SARVAM_API_KEY || "";
    this.model = process.env.SARVAM_TRANSLATE_MODEL || "mayura:v1";
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  private async fetchWithRetry(endpoint: string, payload: any, retries = 2): Promise<any> {
    if (!this.isConfigured()) {
      throw new Error("Sarvam AI is not configured. Missing SARVAM_API_KEY.");
    }

    let lastError: any = null;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);

        const res = await fetch(`${SARVAM_BASE_URL}${endpoint}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-subscription-key": this.apiKey.trim(),
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Sarvam API error (${res.status}): ${errText}`);
        }

        return await res.json();
      } catch (err: any) {
        lastError = err;
        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
        }
      }
    }

    throw lastError || new Error("Failed to communicate with Sarvam AI.");
  }

  /**
   * Literal Translation via Sarvam mayura:v1
   */
  async translate(req: TranslateRequest): Promise<string> {
    const sourceCode = resolveSarvamCode(req.sourceLang);
    const targetCode = resolveSarvamCode(req.targetLang);

    if (sourceCode === targetCode) {
      return req.text;
    }

    const payload = {
      input: req.text,
      source_language_code: sourceCode,
      target_language_code: targetCode,
      speaker_gender: "Female",
      mode: req.mode || "formal",
      model: this.model,
      enable_preprocessing: true,
    };

    const res = await this.fetchWithRetry("/translate", payload);
    if (!res.translated_text) {
      throw new Error("Sarvam translate returned empty response.");
    }

    return res.translated_text.trim();
  }

  /**
   * Transliteration to Latin or target script
   */
  async transliterate(req: TransliterateRequest): Promise<string> {
    const sourceCode = resolveSarvamCode(req.sourceLang);
    const payload = {
      input: req.text,
      source_language_code: sourceCode,
      target_language_code: req.targetScript || "Latn",
    };

    try {
      const res = await this.fetchWithRetry("/transliterate", payload);
      return res.transliterated_text || req.text;
    } catch {
      return req.text; // Return original if transliterate is unavailable
    }
  }

  /**
   * Language identification
   */
  async detectLanguage(text: string): Promise<{ languageCode: string; confidence: number }> {
    try {
      const res = await this.fetchWithRetry("/language-identification", { input: text.slice(0, 500) });
      return {
        languageCode: res.language_code || "unknown",
        confidence: res.confidence || 0.9,
      };
    } catch {
      // Heuristic fallback based on Unicode blocks
      if (/[\u0C00-\u0C7F]/.test(text)) return { languageCode: "te-IN", confidence: 0.95 };
      if (/[\u0900-\u097F]/.test(text)) return { languageCode: "hi-IN", confidence: 0.95 };
      if (/[\u0B80-\u0BFF]/.test(text)) return { languageCode: "ta-IN", confidence: 0.95 };
      if (/[\u0980-\u09FF]/.test(text)) return { languageCode: "bn-IN", confidence: 0.95 };
      if (/[\u0C80-\u0CFF]/.test(text)) return { languageCode: "kn-IN", confidence: 0.95 };
      if (/[\u0D00-\u0D7F]/.test(text)) return { languageCode: "ml-IN", confidence: 0.95 };
      if (/[\u0A80-\u0AFF]/.test(text)) return { languageCode: "gu-IN", confidence: 0.95 };
      if (/[\u0B00-\u0B7F]/.test(text)) return { languageCode: "od-IN", confidence: 0.95 };
      return { languageCode: "en-IN", confidence: 0.8 };
    }
  }

  /**
   * Health Check with live latency measurement
   */
  async healthCheck(): Promise<HealthCheckResult> {
    const start = Date.now();
    if (!this.isConfigured()) {
      return {
        provider: "sarvam",
        status: "not_connected",
        model: this.model,
        lastChecked: new Date().toISOString(),
        latencyMs: 0,
        message: "SARVAM_API_KEY environment variable is not configured.",
      };
    }

    try {
      await this.translate({
        text: "Health check verification",
        sourceLang: "English",
        targetLang: "Hindi",
      });

      return {
        provider: "sarvam",
        status: "connected",
        model: this.model,
        lastChecked: new Date().toISOString(),
        latencyMs: Date.now() - start,
      };
    } catch (err: any) {
      return {
        provider: "sarvam",
        status: "error",
        model: this.model,
        lastChecked: new Date().toISOString(),
        latencyMs: Date.now() - start,
        message: err.message || "Failed health check probe.",
      };
    }
  }
}

export const sarvamService = new SarvamService();
