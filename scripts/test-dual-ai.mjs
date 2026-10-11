// Native env loading via node --env-file=.env.local

const geminiKey = process.env.GEMINI_API_KEY;
const sarvamKey = process.env.SARVAM_API_KEY;

console.log('Testing Dual AI Orchestration...');
console.log('Gemini Key present:', !!geminiKey);
console.log('Sarvam Key present:', !!sarvamKey);

// 1. Test Gemini ad copy generation
async function testGeminiAd() {
  const prompt = `You are an expert Indian regional advertising copywriter.
Write a compelling, ASCI-compliant English ad copy for:
Brand: Sri Millets
Product: Multi-Millet Dosa Mix
Category: Packaged Foods & Nutrition
Target Region: Andhra & Telangana
Target Audience: Health-conscious Families
Tone: Festive Warm & Trustworthy
Key Benefits to Highlight: 100% whole grain foxtail millet, 0 added sugar, 14g plant protein
STRICTLY AVOID: absolute cure claims or unverified superlatives

Requirements:
1. Write ONE compelling 2-3 sentence ad copy headline + body (in English)
2. Include at least 1 specific verifiable product claim
3. Include Call To Action
4. Return ONLY the ad copy text.`;

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${geminiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 1024 }
    })
  });
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return text?.trim();
}

// 2. Test Sarvam AI translation
async function testSarvamTranslate(text) {
  const res = await fetch('https://api.sarvam.ai/translate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-subscription-key': sarvamKey
    },
    body: JSON.stringify({
      input: text,
      source_language_code: 'en-IN',
      target_language_code: 'te-IN',
      speaker_gender: 'Female',
      mode: 'formal',
      model: 'mayura:v1',
      enable_preprocessing: true
    })
  });
  const data = await res.json();
  return data.translated_text;
}

// 3. Test Gemini ad-evidence claim audit
async function testGeminiAudit(adCopy) {
  const prompt = `You are the lead Ad-Evidence, Multimodal Product Fact-Checker for Indian regional advertising compliance.
Evaluate this ad copy against ASCI / FSSAI codes:
Ad Copy: "${adCopy}"
Packaging Evidence: "Packaging: 100% Foxtail & Barnyard Millet. 14g Protein per 100g. 0g Added Sugar. FSSAI Lic #10020042000123."
Brand Guidelines: "Ban on permanent medical cures. Must qualify comparative claims."

Return valid JSON:
{
  "overallScore": number,
  "asciComplianceStatus": "compliant" | "warning",
  "asciViolationsCount": number,
  "summary": string,
  "claims": [
    {
      "id": "cl-1",
      "claimText": string,
      "claimType": "product_spec",
      "lockedTokens": string[],
      "evidenceStatus": "supported" | "contradicted",
      "evidenceSource": string,
      "qualifications": string
    }
  ]
}`;

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${geminiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 2048,
        responseMimeType: 'application/json'
      }
    })
  });
  const data = await res.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return JSON.parse(rawText);
}

async function run() {
  console.log('\n--- Step 1: Generating Live Ad Copy with Gemini 3.8 Flash ---');
  const adCopy = await testGeminiAd();
  console.log('Generated Ad Copy:\n', adCopy);

  console.log('\n--- Step 2: Translating Ad Copy with Sarvam AI (mayura:v1) to Telugu ---');
  const teluguCopy = await testSarvamTranslate(adCopy);
  console.log('Sarvam Telugu Adaptation:\n', teluguCopy);

  console.log('\n--- Step 3: Auditing Ad Evidence with Gemini 3.8 Flash ---');
  const audit = await testGeminiAudit(adCopy);
  console.log('Compliance Score:', audit.overallScore, 'Status:', audit.asciComplianceStatus);
  console.log('Summary:', audit.summary);
  console.log('Extracted Claims Count:', audit.claims?.length);
  console.log('Claims:', audit.claims);

  console.log('\nSUCCESS! Dual AI coordination verified end-to-end.');
}

run().catch(console.error);
