import { z } from "zod";
import { HealthCheckResult } from "./types";

const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

export class GeminiService {
  private apiKey: string;
  private textModel: string;
  private imageModel: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || "";
    // Default to the current production/available Gemini models
    this.textModel = process.env.GEMINI_TEXT_MODEL || "gemini-2.5-flash";
    this.imageModel = process.env.GEMINI_IMAGE_MODEL || "imagen-3.0-generate-002";
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  /**
   * Structured generation with JSON mode and Zod validation
   */
  async generateStructured<T>(
    prompt: string,
    schema: z.ZodSchema<T>,
    systemInstruction?: string,
    retries = 2
  ): Promise<T> {
    if (!this.isConfigured()) {
      throw new Error("Gemini API is not configured. Missing GEMINI_API_KEY.");
    }

    const candidateModels = [
      this.textModel,
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-1.5-flash",
    ].filter((m, i, arr) => arr.indexOf(m) === i);

    let lastError: any = null;

    for (const model of candidateModels) {
      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 45000);

          const body: any = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 4096,
              responseMimeType: "application/json",
            },
          };

          if (systemInstruction) {
            body.systemInstruction = {
              parts: [{ text: systemInstruction }],
            };
          }

          const res = await fetch(`${GEMINI_BASE_URL}/${model}:generateContent?key=${this.apiKey.trim()}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            signal: controller.signal,
          });

          clearTimeout(timeout);

          if (!res.ok) {
            const errBody = await res.text();
            throw new Error(`Gemini ${model} HTTP ${res.status}: ${errBody.slice(0, 200)}`);
          }

          const data = await res.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!rawText) {
            throw new Error(`Gemini ${model} returned empty content.`);
          }

          const cleanJson = this.extractJson(rawText);
          const parsed = JSON.parse(cleanJson);
          return schema.parse(parsed);
        } catch (err: any) {
          lastError = err;
          if (attempt < retries) {
            await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
          }
        }
      }
    }

    throw lastError || new Error("Gemini structured generation failed on all models.");
  }

  /**
   * Generates a text-free background image via Imagen
   */
  async generateImage(prompt: string, aspectRatio: "1:1" | "4:5" | "9:16" | "16:9" = "1:1"): Promise<Buffer | null> {
    if (!this.isConfigured()) return null;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 40000);

      // Guardrail prompt: strictly forbid text, logos, people
      const safePrompt = `${prompt}. High quality commercial advertising background, abstract product environment, strictly text-free, logo-free, no readable typography, no human faces or identifiable people, professional studio lighting.`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.imageModel}:predict?key=${this.apiKey.trim()}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            instances: [{ prompt: safePrompt }],
            parameters: {
              sampleCount: 1,
              aspectRatio: aspectRatio === "4:5" ? "3:4" : aspectRatio,
            },
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeout);

      if (!res.ok) {
        console.warn(`[Gemini Imagen] Image generation failed with HTTP ${res.status}`);
        return null;
      }

      const data = await res.json();
      const b64 = data?.predictions?.[0]?.bytesBase64Encoded;
      if (b64) {
        return Buffer.from(b64, "base64");
      }
      return null;
    } catch (err: any) {
      console.warn("[Gemini Imagen] Image generation error:", err.message);
      return null;
    }
  }

  /**
   * Live connectivity health check
   */
  async healthCheck(): Promise<HealthCheckResult> {
    const start = Date.now();
    if (!this.isConfigured()) {
      return {
        provider: "gemini",
        status: "not_connected",
        model: this.textModel,
        lastChecked: new Date().toISOString(),
        latencyMs: 0,
        message: "GEMINI_API_KEY environment variable is not configured.",
      };
    }

    try {
      const pingSchema = z.object({ status: z.string() });
      await this.generateStructured(
        'Return JSON: {"status": "ok"}',
        pingSchema,
        undefined,
        0
      );

      return {
        provider: "gemini",
        status: "connected",
        model: this.textModel,
        lastChecked: new Date().toISOString(),
        latencyMs: Date.now() - start,
      };
    } catch (err: any) {
      return {
        provider: "gemini",
        status: "error",
        model: this.textModel,
        lastChecked: new Date().toISOString(),
        latencyMs: Date.now() - start,
        message: err.message || "Failed health check probe.",
      };
    }
  }

  private extractJson(text: string): string {
    let cleaned = text.replace(/```json\n?/gi, "").replace(/```\n?/g, "").trim();
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      return cleaned.slice(firstBrace, lastBrace + 1);
    }
    const firstBracket = cleaned.indexOf("[");
    const lastBracket = cleaned.lastIndexOf("]");
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      return cleaned.slice(firstBracket, lastBracket + 1);
    }
    return cleaned;
  }
}

export const geminiService = new GeminiService();
