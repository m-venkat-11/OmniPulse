import { turso } from '@/lib/turso';
import { generateId, initializeDatabase } from '@/lib/db';
import { computeHash } from '@/lib/utils/hash';

export interface SeedResult {
  campaignId: string;
  name: string;
  demoType: string;
}

export async function seedDemoCampaign(demoType: 'festive_snack' | 'personal_care' | 'public_awareness'): Promise<SeedResult> {
  await initializeDatabase();
  const wsId = 'ws-default';
  const userId = 'user-demo';

  if (demoType === 'festive_snack') {
    const campaignId = 'demo-festive-snack-' + Date.now().toString().slice(-4);
    const briefId = generateId();

    const briefData = {
      name: "[DEMO] South India Festive Snack Launch",
      brandName: "Rasa Foods",
      productName: "Rasa Oats Festive Family Pack",
      objective: "Drive festive awareness and trial of the new family pack across Andhra Pradesh, Telangana, and North Indian markets.",
      targetAudience: "Urban & semi-urban families, health-conscious mothers aged 25-45",
      sourceLanguage: "English",
      targetLanguages: ["Telugu", "Hindi"],
      channels: ["social_media", "video"],
      keyMessage: "Celebrate this Diwali with pure energy. Rasa Oats delivers 100% of your daily iron needs with milk for the whole family.",
      callToAction: "Order the Festive Family Pack today with 20% festive discount.",
      tone: "Festive, Warm & Inspiring",
      schedule: "Oct 15 - Nov 15, 2026",
      approvedFacts: "Rasa Oats provides 100% of your daily iron needs when consumed with 200ml milk.\nContains 100% whole grain rolled oats with zero added refined sugar.",
      prohibitedClaims: "Guaranteed cure for acidity or chronic fatigue.\nSuperlative: Best breakfast in India without clinical citations.",
      requiredDisclaimers: "*Based on ICMR RDA for adult sedentary women. Consume as part of balanced diet.",
    };

    const briefJson = JSON.stringify(briefData);
    const briefHash = await computeHash(briefJson);

    // 1. Insert Campaign
    await turso.execute({
      sql: `INSERT INTO campaigns (id, workspace_id, name, brand_name, product_name, objective, target_audience, source_language, target_languages, channels, key_message, call_to_action, tone, schedule, status, is_demo, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', 1, ?)`,
      args: [
        campaignId, wsId, briefData.name, briefData.brandName, briefData.productName,
        briefData.objective, briefData.targetAudience, briefData.sourceLanguage,
        JSON.stringify(briefData.targetLanguages), JSON.stringify(briefData.channels),
        briefData.keyMessage, briefData.callToAction, briefData.tone, briefData.schedule,
        userId
      ]
    });

    // 2. Insert Brief Version
    await turso.execute({
      sql: `INSERT INTO brief_versions (id, campaign_id, version_number, content_hash, brief_json, created_by)
            VALUES (?, ?, 1, ?, ?, ?)`,
      args: [briefId, campaignId, briefHash, briefJson, userId]
    });

    // 3. Insert Claim Atoms (including planted unsupported claim)
    const claim1Id = generateId();
    await turso.execute({
      sql: `INSERT INTO claim_atoms (id, campaign_id, brief_version_id, claim_text, claim_type, locked_tokens, evidence_status, qualifications)
            VALUES (?, ?, ?, ?, 'product_fact', ?, 'supported', ?)`,
      args: [
        claim1Id, campaignId, briefId,
        "Provides 100% of daily iron needs when consumed with 200ml milk",
        JSON.stringify(["100%", "daily iron needs", "200ml milk"]),
        "Validated by NABL accredited lab certificate #NABL-2026-F09"
      ]
    });

    const claim2Id = generateId();
    await turso.execute({
      sql: `INSERT INTO claim_atoms (id, campaign_id, brief_version_id, claim_text, claim_type, locked_tokens, evidence_status, qualifications)
            VALUES (?, ?, ?, ?, 'product_fact', ?, 'supported', ?)`,
      args: [
        claim2Id, campaignId, briefId,
        "100% whole grain rolled oats with zero added refined sugar",
        JSON.stringify(["100% whole grain", "zero added refined sugar"]),
        "Product spec sheet v2.4"
      ]
    });

    // PLANTED ISSUE: Unsupported health promise
    const claim3Id = generateId();
    await turso.execute({
      sql: `INSERT INTO claim_atoms (id, campaign_id, brief_version_id, claim_text, claim_type, locked_tokens, evidence_status, qualifications)
            VALUES (?, ?, ?, ?, 'prohibited_claim', ?, 'unsupported', ?)`,
      args: [
        claim3Id, campaignId, briefId,
        "100% cures morning acidity and fatigue instantly",
        JSON.stringify(["100% cures acidity"]),
        "UNSUPPORTED: Medical cure claims prohibited by ASCI Food & Beverage Code 2024"
      ]
    });

    // 4. Creative Assets & Versions
    // Asset 1: Telugu Variant A (Clean & Compliant)
    const asset1Id = generateId();
    const version1Id = generateId();
    await turso.execute({
      sql: `INSERT INTO creative_assets (id, campaign_id, title, channel) VALUES (?, ?, ?, 'social_media')`,
      args: [asset1Id, campaignId, "Telugu Festive Variant A — Family Energy"]
    });

    const teluguTextA = "పండుగ సీజన్‌లో మీ కుటుంబ ఆరోగ్యానికి సరైన కానుక. రుచికరమైన రసా ఓట్స్, ప్రతి ఉదయం పాలతో తీసుకుంటే మీ 100% రోజువారీ ఐరన్ అవసరాలను తీరుస్తుంది. మీ ఉదయాలకు నూతన ఉత్సాహం!";
    const hash1 = await computeHash(teluguTextA);

    await turso.execute({
      sql: `INSERT INTO asset_versions (id, asset_id, version_number, source_brief_version_id, source_text, literal_translation, regional_adaptation, meaning_summary, adaptation_rationale, source_language, target_language, region, dialect, tone, slang_level, formality, content_hash, status, generated_by_mode, created_by)
            VALUES (?, ?, 1, ?, ?, ?, ?, ?, ?, 'English', 'Telugu', 'Andhra & Telangana', 'Standard Telugu', 'Festive Warm', 'low', 'conversational', ?, 'approved', 'gemini-2.0-flash', ?)`,
      args: [
        version1Id, asset1Id, briefId,
        briefData.keyMessage,
        "The right gift for your family's health this festive season. Delicious Rasa Oats, taken with milk every morning, fulfills your 100% daily iron needs. New vigor for your mornings!",
        teluguTextA,
        "Warm festive tone focused on family health, celebrating Diwali morning routines without hyperbolic claims.",
        JSON.stringify(["Replaced generic greeting with festive context", "Preserved 100% daily iron fact verbatim", "Used culturally natural phrasing for morning vitality"]),
        hash1, userId
      ]
    });

    // Asset 2: Telugu Variant B (Planted Issue with Unsupported Claim)
    const asset2Id = generateId();
    const version2Id = generateId();
    await turso.execute({
      sql: `INSERT INTO creative_assets (id, campaign_id, title, channel) VALUES (?, ?, ?, 'social_media')`,
      args: [asset2Id, campaignId, "Telugu Festive Variant B — Planted Acidity Claim"]
    });

    const teluguTextB = "ఈ దీపావళికి మీ కడుపులో ఎసిడిటీని 100% శాశ్వతంగా నయం చేయండి! రసా ఓట్స్ ఒక్క స్పూన్ తింటే చాలు, గ్యాస్ మరియు అలసట పూర్తిగా మాయమవుతాయి. రోజువారీ ఐరన్ శక్తి కూడా లభిస్తుంది.";
    const hash2 = await computeHash(teluguTextB);

    await turso.execute({
      sql: `INSERT INTO asset_versions (id, asset_id, version_number, source_brief_version_id, source_text, literal_translation, regional_adaptation, meaning_summary, adaptation_rationale, source_language, target_language, region, dialect, tone, slang_level, formality, content_hash, status, generated_by_mode, created_by)
            VALUES (?, ?, 1, ?, ?, ?, ?, ?, ?, 'English', 'Telugu', 'Telangana', 'Hyderabadi colloquial', 'Hyperbolic', 'moderate', 'colloquial', ?, 'rejected', 'gemini-2.0-flash', ?)`,
      args: [
        version2Id, asset2Id, briefId,
        briefData.keyMessage,
        "Cure acidity in your stomach 100% permanently this Diwali! Just one spoonful of Rasa Oats, and gas and tiredness completely vanish. Daily iron power is also received.",
        teluguTextB,
        "Aggressive claim promising permanent cure for acidity and fatigue — violates ASCI food guidelines.",
        JSON.stringify(["Planted unverified superlative", "Medical cure claim without clinical validation"]),
        hash2, userId
      ]
    });

    // 5. Verification Run for Variant B (Showing Brand Guardian detection)
    const runId = generateId();
    await turso.execute({
      sql: `INSERT INTO verification_runs (id, asset_version_id, pass_a_status, pass_b_status, pass_c_status, overall_status, summary)
            VALUES (?, ?, 'fail', 'fail', 'warn', 'blocked', 'Planted medical claim detected: 100% permanent cure for acidity without substantiation.')`,
      args: [runId, version2Id]
    });

    await turso.execute({
      sql: `INSERT INTO verification_findings (id, run_id, pass_type, severity, category, flagged_text, explanation, evidence_status, suggested_correction, requires_human_review)
            VALUES (?, ?, 'pass_a_deterministic', 'critical', 'prohibited_medical_claim', '100% శాశ్వతంగా నయం చేయండి (100% cure permanently)', 'ASCI Food Guidelines Rule 4.2 prohibits claiming food products permanently cure medical conditions such as acidity or gastritis.', 'contradicted', 'Use: మీ రోజూవారీ పోషకాహార అవసరాలను తీర్చడంలో సహాయపడుతుంది (Helps fulfill daily nutritional needs)', 1)`,
      args: [generateId(), runId]
    });

    await turso.execute({
      sql: `INSERT INTO verification_findings (id, run_id, pass_type, severity, category, flagged_text, explanation, evidence_status, suggested_correction, requires_human_review)
            VALUES (?, ?, 'pass_b_claim_drift', 'high', 'claim_atom_drift', 'గ్యాస్ మరియు అలసట పూర్తిగా మాయమవుతాయి', 'Unapproved claim not found in brief Claim Atom registry. Brand facts only validate iron supplementation with milk.', 'unsupported', 'Remove superlative claims regarding gas and fatigue.', 1)`,
      args: [generateId(), runId]
    });

    // 6. Approval for Variant A
    const approvalId = generateId();
    await turso.execute({
      sql: `INSERT INTO approvals (id, asset_version_id, content_hash, reviewer_id, decision, review_comments)
            VALUES (?, ?, ?, ?, 'approved', 'Verified all ICMR RDA citations and Telugu script naturalness. Ready for creator deployment.')`,
      args: [approvalId, version1Id, hash1, userId]
    });

    // 7. Seed Experiment
    const expId = generateId();
    await turso.execute({
      sql: `INSERT INTO experiments (id, campaign_id, hypothesis, variant_a_id, variant_b_id, primary_metric, secondary_metrics, target_region, attribution_window, test_duration, is_locked)
            VALUES (?, ?, 'Telugu Festive Variant A with explicit 100% iron RDA framing will generate >= 25% higher CTR than generic festival greetings.', ?, ?, 'CTR', ?, 'Andhra Pradesh & Telangana', '7-day click', '14 days', 1)`,
      args: [expId, campaignId, version1Id, version2Id, JSON.stringify(["VTR", "Conversion Rate", "ROAS"])]
    });

    // Add metric observations with explicit data classes
    await turso.execute({
      sql: `INSERT INTO metric_observations (id, experiment_id, variant_key, metric_name, metric_value, metric_unit, sample_size, time_window, attribution_window, source, provenance_type, data_quality_warning)
            VALUES (?, ?, 'variant_a', 'CTR', 2.84, '%', 42500, 'Day 1-7', '7-day click', 'Meta Ads Ingestion API [MOCKED]', 'synthetic_demo', 'Synthetic demo data for evaluation; sample size meets 95% statistical confidence.')`,
      args: [generateId(), expId]
    });

    await turso.execute({
      sql: `INSERT INTO metric_observations (id, experiment_id, variant_key, metric_name, metric_value, metric_unit, sample_size, time_window, attribution_window, source, provenance_type, data_quality_warning)
            VALUES (?, ?, 'variant_b', 'CTR', 1.91, '%', 38200, 'Day 1-7', '7-day click', 'Meta Ads Ingestion API [MOCKED]', 'synthetic_demo', 'Variant B was halted early due to brand safety flags.')`,
      args: [generateId(), expId]
    });

    // 8. Audit event
    await turso.execute({
      sql: `INSERT INTO audit_events (id, workspace_id, campaign_id, actor_id, event_type, entity_type, entity_id, hash, metadata_json)
            VALUES (?, ?, ?, ?, 'demo_campaign_seeded', 'campaign', ?, ?, ?)`,
      args: [generateId(), wsId, campaignId, userId, campaignId, briefHash, JSON.stringify({ demo_name: briefData.name })]
    });

    return { campaignId, name: briefData.name, demoType: 'festive_snack' };
  }

  if (demoType === 'personal_care') {
    const campaignId = 'demo-personal-care-' + Date.now().toString().slice(-4);
    const briefId = generateId();

    const briefData = {
      name: "[DEMO] Everyday Ayurvedic Scalp Care",
      brandName: "VedaCare Naturals",
      productName: "Bhringraj & Amla Intensive Hair Oil",
      objective: "Expand authentic Ayurvedic scalp therapy into Maharashtra and West Bengal with scientifically validated botanical benefits.",
      targetAudience: "Working women & men aged 22-40 seeking natural hairfall reduction",
      sourceLanguage: "English",
      targetLanguages: ["Marathi", "Bengali"],
      channels: ["social_media", "ecommerce"],
      keyMessage: "Enriched with 12 cold-pressed Ayurvedic herbs, VedaCare reduces hair breakage by up to 70% in 4 weeks.",
      callToAction: "Experience ancient Ayurveda today. Available on Amazon and Nykaa.",
      tone: "Reassuring, Scientific & Authentic",
      schedule: "Nov 01 - Dec 31, 2026",
      approvedFacts: "Clinically tested: Reduces hair fall due to breakage by up to 70% after 4 weeks of regular use.\nFormulated with 100% virgin coconut oil and cold-pressed Bhringraj extract.",
      prohibitedClaims: "Guaranteed cure for hereditary male pattern baldness.\nClaiming instant results within 24 hours.",
      requiredDisclaimers: "*Based on clinical study on 120 subjects over 28 days compared to unbranded mineral oil.",
    };

    const briefJson = JSON.stringify(briefData);
    const briefHash = await computeHash(briefJson);

    await turso.execute({
      sql: `INSERT INTO campaigns (id, workspace_id, name, brand_name, product_name, objective, target_audience, source_language, target_languages, channels, key_message, call_to_action, tone, schedule, status, is_demo, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', 1, ?)`,
      args: [
        campaignId, wsId, briefData.name, briefData.brandName, briefData.productName,
        briefData.objective, briefData.targetAudience, briefData.sourceLanguage,
        JSON.stringify(briefData.targetLanguages), JSON.stringify(briefData.channels),
        briefData.keyMessage, briefData.callToAction, briefData.tone, briefData.schedule,
        userId
      ]
    });

    await turso.execute({
      sql: `INSERT INTO brief_versions (id, campaign_id, version_number, content_hash, brief_json, created_by)
            VALUES (?, ?, 1, ?, ?, ?)`,
      args: [briefId, campaignId, briefHash, briefJson, userId]
    });

    // Claim Atoms
    await turso.execute({
      sql: `INSERT INTO claim_atoms (id, campaign_id, brief_version_id, claim_text, claim_type, locked_tokens, evidence_status, qualifications)
            VALUES (?, ?, ?, 'Reduces hair fall due to breakage by up to 70% in 4 weeks', 'product_fact', ?, 'supported', 'Clinical study #CTRI-2025-V01')`,
      args: [generateId(), campaignId, briefId, JSON.stringify(["up to 70%", "4 weeks", "due to breakage"])]
    });

    // Planted contradictory claim
    await turso.execute({
      sql: `INSERT INTO claim_atoms (id, campaign_id, brief_version_id, claim_text, claim_type, locked_tokens, evidence_status, qualifications)
            VALUES (?, ?, ?, '100% chemical free and works for everyone instantly without hair fall', 'prohibited_claim', ?, 'contradicted', 'CONTRADICTED: Violates approved qualification (4 weeks required, breakage only)')`,
      args: [generateId(), campaignId, briefId, JSON.stringify(["works for everyone instantly"])]
    });

    return { campaignId, name: briefData.name, demoType: 'personal_care' };
  }

  // Demo 3: Public Awareness
  const campaignId = 'demo-public-awareness-' + Date.now().toString().slice(-4);
  const briefId = generateId();

  const briefData = {
    name: "[DEMO] Suraksha Jal Community Water Testing",
    brandName: "Suraksha Jal Mission",
    productName: "Gram Panchayat Clean Water Testing Drive",
    objective: "Encourage rural households across Tamil Nadu and Karnataka to submit well water samples for free certified contamination checks.",
    targetAudience: "Rural household heads, farmers, local community leaders",
    sourceLanguage: "English",
    targetLanguages: ["Tamil", "Kannada"],
    channels: ["community_radio", "print", "social_media"],
    keyMessage: "Safeguard your family's health: Free certified water testing at your Gram Panchayat this Saturday with Aadhaar verification.",
    callToAction: "Bring a 500ml clean water sample to the village center by 11 AM.",
    tone: "Authoritative, Reassuring & Urgent",
    schedule: "Every Saturday through 2026",
    approvedFacts: "Testing is 100% free with valid Aadhaar or ration card.\nCertified report on 14 safety parameters delivered within 24 hours.",
    prohibitedClaims: "Boiling eliminates chemical heavy metals.\nWater testing guarantees clean supply.",
    requiredDisclaimers: "A government-supported rural public health initiative.",
  };

  const briefJson = JSON.stringify(briefData);
  const briefHash = await computeHash(briefJson);

  await turso.execute({
    sql: `INSERT INTO campaigns (id, workspace_id, name, brand_name, product_name, objective, target_audience, source_language, target_languages, channels, key_message, call_to_action, tone, schedule, status, is_demo, created_by)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', 1, ?)`,
    args: [
      campaignId, wsId, briefData.name, briefData.brandName, briefData.productName,
      briefData.objective, briefData.targetAudience, briefData.sourceLanguage,
      JSON.stringify(briefData.targetLanguages), JSON.stringify(briefData.channels),
      briefData.keyMessage, briefData.callToAction, briefData.tone, briefData.schedule,
      userId
    ]
  });

  await turso.execute({
    sql: `INSERT INTO brief_versions (id, campaign_id, version_number, content_hash, brief_json, created_by)
          VALUES (?, ?, 1, ?, ?, ?)`,
    args: [briefId, campaignId, briefHash, briefJson, userId]
  });

  await turso.execute({
    sql: `INSERT INTO claim_atoms (id, campaign_id, brief_version_id, claim_text, claim_type, locked_tokens, evidence_status, qualifications)
          VALUES (?, ?, ?, 'Free testing with valid Aadhaar or ration card', 'product_fact', ?, 'supported', 'Govt Circular #PHD-2026')`,
    args: [generateId(), campaignId, briefId, JSON.stringify(["100% free", "Aadhaar", "ration card"])]
  });

  // Planted missing evidence issue
  await turso.execute({
    sql: `INSERT INTO claim_atoms (id, campaign_id, brief_version_id, claim_text, claim_type, locked_tokens, evidence_status, qualifications)
          VALUES (?, ?, ?, 'Eligible for immediate financial grant for RO filter installation', 'unverified_benefit', ?, 'needs_human_review', 'EVIDENCE MISSING: Grant scheme eligibility not confirmed in circular')`,
    args: [generateId(), campaignId, briefId, JSON.stringify(["financial grant", "RO filter"])]
  });

  return { campaignId, name: briefData.name, demoType: 'public_awareness' };
}
