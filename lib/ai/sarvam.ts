// ═══════════════════════════════════════════════════════
// Braco OmniPulse — Sarvam AI Client
// Deep Indic linguistic intelligence, dialect transcreation,
// transliteration, and speech synthesis
// ═══════════════════════════════════════════════════════

export interface SarvamTranslateRequest {
  input: string;
  sourceLanguageCode?: string; // default "en-IN"
  targetLanguageCode: string; // e.g. "te-IN", "ta-IN", "hi-IN", "mr-IN"
  speakerGender?: 'Male' | 'Female';
  mode?: 'formal' | 'classic-colloquial' | 'code-mixed';
  model?: 'mayura:v1';
  apiKey?: string;
}

export interface SarvamTranslateResponse {
  translated_text: string;
}

export interface SarvamTransliterateRequest {
  input: string;
  sourceLanguageCode: string;
  targetLanguageCode?: string; // "Latn" for Latin / Romanized
  apiKey?: string;
}

export interface SarvamTTSRequest {
  inputs: string[];
  targetLanguageCode: string;
  speaker?: 'meera' | 'pavithra' | 'maitreyi' | 'arvind' | 'amartya';
  pitch?: number;
  pace?: number;
  apiKey?: string;
}

// Map human readable language strings to Sarvam BCP-47 codes
export const LANGUAGE_TO_SARVAM_CODE: Record<string, string> = {
  Telugu: 'te-IN',
  Tamil: 'ta-IN',
  Hindi: 'hi-IN',
  Kannada: 'kn-IN',
  Malayalam: 'ml-IN',
  Marathi: 'mr-IN',
  Bengali: 'bn-IN',
  Gujarati: 'gu-IN',
  Punjabi: 'pa-IN',
  Odia: 'od-IN',
  English: 'en-IN',
};

export function getSarvamLangCode(language: string): string {
  const normalized = language.trim().toLowerCase();
  for (const [key, code] of Object.entries(LANGUAGE_TO_SARVAM_CODE)) {
    if (key.toLowerCase() === normalized) return code;
  }
  return 'hi-IN'; // sensible default
}

export class SarvamClient {
  private defaultApiKey: string;

  constructor(apiKey?: string) {
    this.defaultApiKey = apiKey || process.env.SARVAM_API_KEY || '';
  }

  private resolveKey(overrideKey?: string): string {
    const key = overrideKey || this.defaultApiKey || process.env.SARVAM_API_KEY;
    if (!key) {
      throw new Error('Sarvam AI API key is not configured. Please supply an API key in settings or .env.local');
    }
    return key.trim();
  }

  /**
   * Test connection to Sarvam AI with a short translation request
   */
  async testConnection(customApiKey?: string): Promise<{ success: boolean; message: string; sampleTranslation?: string }> {
    try {
      const key = this.resolveKey(customApiKey);
      const res = await this.translate({
        input: 'Hello, welcome to Braco OmniPulse.',
        sourceLanguageCode: 'en-IN',
        targetLanguageCode: 'hi-IN',
        apiKey: key,
      });

      return {
        success: true,
        message: 'Successfully connected to Sarvam AI (mayura:v1)!',
        sampleTranslation: res.translated_text,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Connection to Sarvam AI failed',
      };
    }
  }

  /**
   * Translate text into authentic Indian regional language using mayura:v1
   */
  async translate(req: SarvamTranslateRequest): Promise<SarvamTranslateResponse> {
    const apiKey = this.resolveKey(req.apiKey);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      const response = await fetch('https://api.sarvam.ai/translate', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'api-subscription-key': apiKey,
        },
        body: JSON.stringify({
          input: req.input,
          source_language_code: req.sourceLanguageCode || 'en-IN',
          target_language_code: req.targetLanguageCode,
          speaker_gender: req.speakerGender || 'Female',
          mode: req.mode || 'formal',
          model: req.model || 'mayura:v1',
          enable_preprocessing: true,
        }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Sarvam AI translation error (${response.status}): ${errorText.slice(0, 200)}`);
      }

      const data = await response.json();
      return {
        translated_text: data.translated_text || '',
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      throw err;
    }
  }

  /**
   * Transliterate Indic script into Romanized Latin script for brand review
   */
  async transliterate(req: SarvamTransliterateRequest): Promise<string> {
    const apiKey = this.resolveKey(req.apiKey);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch('https://api.sarvam.ai/transliterate', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'api-subscription-key': apiKey,
        },
        body: JSON.stringify({
          input: req.input,
          source_language_code: req.sourceLanguageCode,
          target_language_code: req.targetLanguageCode || 'Latn',
        }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Sarvam transliteration error (${response.status}): ${errorText.slice(0, 150)}`);
      }

      const data = await response.json();
      return data.transliterated_text || req.input;
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.warn('[Sarvam] Transliteration failed, falling back:', err.message);
      return req.input;
    }
  }

  /**
   * Generate native Indian speech with Bulbul
   */
  async textToSpeech(req: SarvamTTSRequest): Promise<string[]> {
    const apiKey = this.resolveKey(req.apiKey);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    try {
      const response = await fetch('https://api.sarvam.ai/text-to-speech', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'api-subscription-key': apiKey,
        },
        body: JSON.stringify({
          inputs: req.inputs,
          target_language_code: req.targetLanguageCode,
          speaker: req.speaker || 'meera',
          pitch: req.pitch ?? 0,
          pace: req.pace ?? 1.0,
          loudness: 1.5,
          speech_sample_rate: 8000,
          enable_preprocessing: true,
          model: 'bulbul:v1',
        }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Sarvam TTS error (${response.status}): ${errorText.slice(0, 150)}`);
      }

      const data = await response.json();
      return data.audios || [];
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.warn('[Sarvam] TTS generation failed:', err.message);
      return [];
    }
  }
}

export const sarvamClient = new SarvamClient();
