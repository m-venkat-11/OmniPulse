import { createClient } from "@libsql/client";
import crypto from "crypto";

const db = createClient({
  url: "file:local.db"
});

function hash(str) {
  return crypto.createHash("sha256").update(str).digest("hex");
}

async function seed() {
  const wsId = 'ws-default';
  const userId = 'user-demo';

  // 1. Workspace
  await db.execute({
    sql: 'INSERT OR IGNORE INTO workspaces (id, name) VALUES (?, ?)',
    args: [wsId, 'Default Workspace']
  });

  // 2. User
  await db.execute({
    sql: 'INSERT OR IGNORE INTO users (id, email, name, role, company) VALUES (?, ?, ?, ?, ?)',
    args: [userId, 'admin@bracoomnipulse.com', 'Demo Admin', 'Admin', 'Braco Corp']
  });

  await db.execute({
    sql: 'INSERT OR IGNORE INTO workspace_members (workspace_id, user_id, role) VALUES (?, ?, ?)',
    args: [wsId, userId, 'Admin']
  });

  // 3. Demo 1 Campaign
  const campId = 'camp-demo-festive-snack';
  await db.execute({
    sql: `INSERT OR REPLACE INTO campaigns (
      id, workspace_id, name, brand_name, product_name, objective,
      target_audience, source_language, target_languages, channels,
      key_message, call_to_action, tone, schedule, status, is_demo, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      campId,
      wsId,
      'Festive Snack Regional Launch',
      'Rasa Foods',
      'Rasa Crispy Millet Bites',
      'Drive festive awareness and trial of the new family pack across Andhra Pradesh, Telangana, and North Indian markets.',
      'Urban & semi-urban families, health-conscious mothers aged 25-45',
      'English',
      JSON.stringify(['Telugu', 'Hindi']),
      JSON.stringify(['social_media', 'video']),
      'Celebrate this Diwali with pure energy. Rasa Millet Bites delivers 4x dietary fiber with 100% whole grains and zero palm oil.',
      'Order the Festive Family Pack today with 20% festive discount.',
      'Festive, Warm & Inspiring',
      'Oct 15 - Nov 15, 2026',
      'active',
      1,
      userId
    ]
  });

  // 4. Brief version
  const briefId = 'brief-demo-festive-snack';
  const briefData = {
    name: "Festive Snack Regional Launch",
    brandName: "Rasa Foods",
    productName: "Rasa Crispy Millet Bites",
    objective: "Drive festive awareness and trial of the new family pack across Andhra Pradesh, Telangana, and North Indian markets.",
    approvedFacts: "Rasa Crispy Millet Bites provide 4x dietary fiber of regular potato chips.\n100% whole grain millets roasted in cold pressed sunflower oil with zero palm oil.",
    prohibitedClaims: "Guaranteed cure for acidity or chronic fatigue.\nSuperlative: Best breakfast in India without clinical citations.",
    requiredDisclaimers: "*Based on ICMR RDA for adult sedentary women. Consume as part of balanced diet."
  };
  const briefJson = JSON.stringify(briefData);
  const briefHash = hash(briefJson);

  await db.execute({
    sql: `INSERT OR REPLACE INTO brief_versions (
      id, campaign_id, version_number, content_hash, brief_json, created_by
    ) VALUES (?, ?, 1, ?, ?, ?)`,
    args: [briefId, campId, briefHash, briefJson, userId]
  });

  // 5. Claim Atoms
  const atoms = [
    {
      id: 'atom-fiber-4x',
      claim_text: 'Contains 4x dietary fiber compared to regular potato chips',
      claim_type: 'product_fact',
      locked_tokens: JSON.stringify(['4x', 'dietary fiber']),
      evidence_status: 'verified_with_citation',
      qualifications: 'Based on 100g test vs market chips'
    },
    {
      id: 'atom-zero-palm',
      claim_text: 'Zero palm oil used; made with cold-pressed sunflower oil',
      claim_type: 'ingredient',
      locked_tokens: JSON.stringify(['zero palm oil', 'sunflower oil']),
      evidence_status: 'verified_with_citation',
      qualifications: 'Batch cert QA-M-442'
    },
    {
      id: 'atom-100-wholegrain',
      claim_text: '100% whole grain millets (Foxtail and Ragi)',
      claim_type: 'compositional',
      locked_tokens: JSON.stringify(['100%', 'whole grain millets']),
      evidence_status: 'verified_with_citation',
      qualifications: 'APB-2024 produce cert'
    },
    {
      id: 'atom-cure-acidity-planted',
      claim_text: 'Permanently eliminates gastric acidity in 7 days',
      claim_type: 'health_claim',
      locked_tokens: JSON.stringify(['permanently', '7 days']),
      evidence_status: 'unverified',
      qualifications: 'Planted violation: Unsubstantiated medical claim'
    }
  ];

  for (const a of atoms) {
    await db.execute({
      sql: `INSERT OR REPLACE INTO claim_atoms (
        id, campaign_id, brief_version_id, claim_text, claim_type,
        locked_tokens, evidence_status, qualifications
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        a.id,
        campId,
        briefId,
        a.claim_text,
        a.claim_type,
        a.locked_tokens,
        a.evidence_status,
        a.qualifications
      ]
    });
  }

  // 6. Creative Asset
  const assetId = 'asset-festive-digital';
  await db.execute({
    sql: `INSERT OR REPLACE INTO creative_assets (
      id, campaign_id, title, channel
    ) VALUES (?, ?, ?, ?)`,
    args: [assetId, campId, 'Festive Social Carousel Copy', 'social_media']
  });

  // Variant A: Telugu Verified
  const v1Text = 'ఈ దీపావళికి రుచికరమైన చిరుతిండి – 4 రెట్లు ఎక్కువ ఫైబర్! రసా క్రిస్పీ మిల్లెట్ బైట్స్ లో 100% చిరుధాన్యాలు, పామాయిల్ సున్నా.';
  await db.execute({
    sql: `INSERT OR REPLACE INTO asset_versions (
      id, asset_id, version_number, source_brief_version_id, source_text,
      literal_translation, regional_adaptation, meaning_summary, adaptation_rationale,
      source_language, target_language, region, content_hash, status, generated_by_mode, created_by
    ) VALUES (?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', 'demo_fixture', ?)`,
    args: [
      'ver-te-good',
      assetId,
      briefId,
      'Celebrate this Diwali with pure energy. Rasa Millet Bites delivers 4x dietary fiber with 100% whole grains and zero palm oil.',
      'This Diwali delicious snack – 4 times more fiber! Rasa Crispy Millet Bites has 100% millets, zero palm oil.',
      v1Text,
      'Promotes whole grain millet snacking with traditional festive celebration.',
      JSON.stringify(['Siridhanyalu cultural resonance', 'Diwali gifting context']),
      'English',
      'Telugu',
      'Telangana & Andhra Pradesh',
      hash(v1Text),
      userId
    ]
  });

  // Variant B: Telugu Flagged (Planted Proof Point)
  const v2Text = 'దీపావళి స్నాక్స్ తిన్నా ఎసిడిటీ పూర్తిగా పోతుంది – 100% గ్యారెంటీ! ఈ మిల్లెట్ బైట్స్ తింటే ఎసిడిటీ శాశ్వతంగా నయమవుతుంది.';
  await db.execute({
    sql: `INSERT OR REPLACE INTO asset_versions (
      id, asset_id, version_number, source_brief_version_id, source_text,
      literal_translation, regional_adaptation, meaning_summary, adaptation_rationale,
      source_language, target_language, region, content_hash, status, generated_by_mode, created_by
    ) VALUES (?, ?, 2, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'flagged', 'demo_fixture', ?)`,
    args: [
      'ver-te-bad',
      assetId,
      briefId,
      'Celebrate this Diwali with pure energy. Rasa Millet Bites delivers 4x dietary fiber with 100% whole grains and zero palm oil.',
      'Eating Diwali snacks will cure acidity completely – 100% guarantee! Permanently cures acidity in 7 days.',
      v2Text,
      'Planted violation test case containing prohibited medical claims.',
      JSON.stringify(['Planted acidity claim violation', 'Breaches ASCI food code']),
      'English',
      'Telugu',
      'Telangana (Planted Test)',
      hash(v2Text),
      userId
    ]
  });

  // Variant C: Hindi
  const v3Text = 'इस दिवाली सेहत और स्वाद दोनों — 4 गुना अधिक फाइबर के साथ! रासा मिलेट बाइट्स: 100% मोटे अनाज और शून्य पाम ऑयल।';
  await db.execute({
    sql: `INSERT OR REPLACE INTO asset_versions (
      id, asset_id, version_number, source_brief_version_id, source_text,
      literal_translation, regional_adaptation, meaning_summary, adaptation_rationale,
      source_language, target_language, region, content_hash, status, generated_by_mode, created_by
    ) VALUES (?, ?, 3, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', 'demo_fixture', ?)`,
    args: [
      'ver-hi-good',
      assetId,
      briefId,
      'Celebrate this Diwali with pure energy. Rasa Millet Bites delivers 4x dietary fiber with 100% whole grains and zero palm oil.',
      'This Diwali health and taste both — with 4x more fiber! Rasa Millet Bites: 100% whole millets and zero palm oil.',
      v3Text,
      'Wholesome festive snacking with whole grains and zero palm oil.',
      JSON.stringify(['Diwali family health focus', 'Shuddh swaad resonance']),
      'English',
      'Hindi',
      'Delhi NCR & UP',
      hash(v3Text),
      userId
    ]
  });

  console.log("SUCCESS: Initial database and Demo 1 seeded perfectly!");
}

seed().catch(console.error);
