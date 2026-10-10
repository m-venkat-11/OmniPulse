/**
 * Utility for SHA-256 hashing strings (used for content hashes and audit chaining).
 * Uses the Web Crypto API, available in Next.js Edge and Node.js >= 18 environments.
 */
export async function generateSHA256(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Normalizes text for hashing (NFC normalization as requested in the prompt).
 */
export function normalizeTextForHash(text: string): string {
  // NFKC or NFC. The prompt specifically asks for NFC normalization for Indic text.
  return text.normalize('NFC');
}

/**
 * Convenience function to hash an object.
 */
export async function hashObject(obj: Record<string, any>): Promise<string> {
  // Deterministic stringify (simplistic version for the demo).
  // In a real production system, use a stable stringify library.
  const str = JSON.stringify(obj, Object.keys(obj).sort());
  const normalized = normalizeTextForHash(str);
  return generateSHA256(normalized);
}

/**
 * Convenience: hash any string with NFC normalization for Indic text support.
 */
export async function computeHash(text: string): Promise<string> {
  const normalized = normalizeTextForHash(text);
  return generateSHA256(normalized);
}
