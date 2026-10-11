// ═══════════════════════════════════════════════════════
// Braco OmniPulse — Dynamic Regional Creator Matching Engine
// ═══════════════════════════════════════════════════════

export interface CreatorProfile {
  id: string;
  name: string;
  handle: string;
  initials: string;
  avatarGradient: string;
  niche: string;
  location: string;
  followers: string;
  engagement: string;
  dialectFit: string;
  dialectScore: number;
  brandSafetyScore: number;
  recommendedFormat: string;
  talkingPoints: string[];
  mandatoryDisclaimers: string[];
  prohibitedPhrases: string[];
  creatorBrief: string;
}

export function matchDynamicCreators(params: {
  brand: string;
  product: string;
  category: string;
  language: string;
  region: string;
  audience: string;
  talkingPoints?: string[];
  prohibitedClaims?: string[];
}): CreatorProfile[] {
  const { brand, product, category, language, region, audience } = params;
  const isTech = /tech|mobile|electronic|phone|software|gadget|5g/i.test(category + ' ' + product);
  const isBeverage = /beverage|juice|drink|nectar|tea|coffee|mango/i.test(category + ' ' + product);
  const isBeauty = /beauty|skin|hair|cosmetic|care|personal/i.test(category + ' ' + product);

  const points = params.talkingPoints && params.talkingPoints.length > 0
    ? params.talkingPoints
    : [
        `Demonstrate real-world experience of ${brand} ${product}`,
        `Showcase packaging declarations and verified credentials`,
        `Relate directly to daily consumer routines in ${region}`
      ];

  const prohibited = params.prohibitedClaims && params.prohibitedClaims.length > 0
    ? params.prohibitedClaims
    : [
        `Never claim absolute medical cures or unverified permanent results`,
        `Do not make '#1' claims without cited lab benchmarks`
      ];

  const makeBrief = (name: string, handle: string, format: string) =>
    `BRACO OMNIPULSE CREATOR BRIEF (VERSION-LOCKED)
Campaign: ${brand} — ${product} Regional Flight
Creator: ${name} (${handle})
Region: ${region} | Language: ${language}
Target Audience: ${audience}
Deliverables: ${format}

LOCKED APPROVED TALKING POINTS:
${points.map(p => `• ${p}`).join('\n')}

STRICTLY PROHIBITED STATEMENTS:
${prohibited.map(p => `• ${p}`).join('\n')}

MANDATORY STATUTORY DISCLAIMERS:
• #Ad #PaidPartnership with ${brand}
• Verify packaging instructions before consumption`;

  if (isTech) {
    return [
      {
        id: 'creator-tech-1',
        name: language === 'Tamil' ? 'Karthik Subramanian' : language === 'Telugu' ? 'Nikhil Reddy' : 'Rohan Deshmukh',
        handle: language === 'Tamil' ? '@techkarthik_tamil' : language === 'Telugu' ? '@telugutechbytes' : '@gadgetguru_marathi',
        initials: language === 'Tamil' ? 'KS' : language === 'Telugu' ? 'NR' : 'RD',
        avatarGradient: 'from-blue-500 via-indigo-600 to-cyan-400',
        niche: `Consumer Tech & Unboxing • ${region}`,
        location: region,
        followers: '342K',
        engagement: '5.8%',
        dialectFit: `${language} (${region} Tech Vernacular)`,
        dialectScore: 98,
        brandSafetyScore: 99,
        recommendedFormat: `30s ${product} Speed Benchmark & Daily Battery Run-Down Reel`,
        talkingPoints: points,
        mandatoryDisclaimers: [`#Ad #PaidPartnership with ${brand}`, `Lab test benchmarks conducted under standard conditions`],
        prohibitedPhrases: prohibited,
        creatorBrief: makeBrief('Tech Reviewer', '@techlead', '30s Benchmark Reel + 1x Story'),
      },
      {
        id: 'creator-tech-2',
        name: language === 'Telugu' ? 'Sravani Varma' : 'Ananya Sen',
        handle: language === 'Telugu' ? '@sravani_techlifestyle' : '@gadgetgirl_india',
        initials: 'SV',
        avatarGradient: 'from-purple-500 to-pink-500',
        niche: `Campus Lifestyle & Gadget Styling • ${region}`,
        location: region,
        followers: '198K',
        engagement: '6.4%',
        dialectFit: `${language} (College Colloquial)`,
        dialectScore: 96,
        brandSafetyScore: 98,
        recommendedFormat: `Day-in-the-Life with ${product}: Camera & Performance Stress Test`,
        talkingPoints: points,
        mandatoryDisclaimers: [`#Ad #SponsoredBy${brand.replace(/\s+/g, '')}`],
        prohibitedPhrases: prohibited,
        creatorBrief: makeBrief('Campus Tech', '@gadget_collab', '45s Campus Vlog Reel'),
      },
      {
        id: 'creator-tech-3',
        name: 'Arjun Mehta',
        handle: '@indiatestinglab',
        initials: 'AM',
        avatarGradient: 'from-emerald-500 to-teal-700',
        niche: `Technical Durability & Value Analysis • Tier-2 Focus`,
        location: region,
        followers: '512K',
        engagement: '4.9%',
        dialectFit: `${language} / Hinglish Code-Mixed`,
        dialectScore: 95,
        brandSafetyScore: 100,
        recommendedFormat: `Side-by-side spec verification: Does ${product} deliver on its promises?`,
        talkingPoints: points,
        mandatoryDisclaimers: [`#Ad #IndependentTestBenchmark`],
        prohibitedPhrases: prohibited,
        creatorBrief: makeBrief('Arjun Mehta', '@indiatestinglab', '60s YouTube Short + Carousel'),
      },
    ];
  }

  if (isBeverage || /juice|mango|fruit/i.test(product)) {
    return [
      {
        id: 'creator-bev-1',
        name: language === 'Marathi' ? 'Meera Deshmukh' : language === 'Telugu' ? 'Kavitha Rao' : 'Aparna Sundar',
        handle: language === 'Marathi' ? '@swad_maharashtra' : language === 'Telugu' ? '@telanganaruchulu' : '@chennaichef',
        initials: 'MD',
        avatarGradient: 'from-amber-400 via-orange-500 to-rose-400',
        niche: `Regional Food & Pure Heritage • ${region}`,
        location: region,
        followers: '286K',
        engagement: '5.2%',
        dialectFit: `${language} (Authentic Homestyle Idiom)`,
        dialectScore: 99,
        brandSafetyScore: 99,
        recommendedFormat: `Family Breakfast Ritual featuring ${brand} ${product} with packaging review`,
        talkingPoints: points,
        mandatoryDisclaimers: [`#Ad #PaidPartnership with ${brand}`, `Organic certifications certified by Jaivik Bharat`],
        prohibitedPhrases: prohibited,
        creatorBrief: makeBrief('Heritage Creator', '@foodheritage', '30s Recipe Reel + Packaging Inspection'),
      },
      {
        id: 'creator-bev-2',
        name: 'Tanvi Patwardhan',
        handle: '@tanvi_healthyliving',
        initials: 'TP',
        avatarGradient: 'from-lime-500 to-emerald-600',
        niche: `Family Wellness & Clean Nutrition • Pune & Konkan`,
        location: region,
        followers: '175K',
        engagement: '6.1%',
        dialectFit: `${language} (Conversational Contemporary)`,
        dialectScore: 97,
        brandSafetyScore: 100,
        recommendedFormat: `Unboxing the taste of authentic regional mango nectar with zero preservatives`,
        talkingPoints: points,
        mandatoryDisclaimers: [`#Ad #NutritionalTransparency`],
        prohibitedPhrases: prohibited,
        creatorBrief: makeBrief('Tanvi Patwardhan', '@tanvi_healthyliving', '1x 30s Reel'),
      },
      {
        id: 'creator-bev-3',
        name: 'Vikram Joshi',
        handle: '@farmers_market_india',
        initials: 'VJ',
        avatarGradient: 'from-yellow-400 to-amber-600',
        niche: `Farm-to-Table & Traditional Harvesting • ${region}`,
        location: region,
        followers: '230K',
        engagement: '4.7%',
        dialectFit: `${language} (Rural / Agrarian Resonance)`,
        dialectScore: 98,
        brandSafetyScore: 99,
        recommendedFormat: `Behind-the-orchard review: Authentic fruit purity of ${product}`,
        talkingPoints: points,
        mandatoryDisclaimers: [`#Ad #FarmStory`],
        prohibitedPhrases: prohibited,
        creatorBrief: makeBrief('Vikram Joshi', '@farmers_market_india', '1x Reel + 2x Stories'),
      },
    ];
  }

  // FMCG / Packaged Foods default
  return [
    {
      id: 'creator-gen-1',
      name: language === 'Telugu' ? 'Priya Krishna' : language === 'Tamil' ? 'Divya Bharathi' : 'Pooja Hegde',
      handle: language === 'Telugu' ? '@telanganaruchulu' : language === 'Tamil' ? '@tamillifestyle_divya' : '@swasthapariwar',
      initials: 'PK',
      avatarGradient: 'from-amber-400 via-rose-400 to-indigo-500',
      niche: `${category} & Family Lifestyle • ${region}`,
      location: region,
      followers: '315K',
      engagement: '5.4%',
      dialectFit: `${language} (${region} Colloquial)`,
      dialectScore: 98,
      brandSafetyScore: 100,
      recommendedFormat: `30s Kitchen Routine Demonstration showcasing ${product} packaging & nutritional label`,
      talkingPoints: points,
      mandatoryDisclaimers: [`#Ad #PaidPartnership with ${brand}`],
      prohibitedPhrases: prohibited,
      creatorBrief: makeBrief('Primary Regional Creator', '@regionalstar', '1x 30s Reel + 1x Story'),
    },
    {
      id: 'creator-gen-2',
      name: language === 'Telugu' ? 'Harsha Vardhan' : 'Siddharth Nair',
      handle: language === 'Telugu' ? '@harsha_dailyfinds' : '@siddharth_finds',
      initials: 'HV',
      avatarGradient: 'from-indigo-500 to-cyan-400',
      niche: `Smart Consumer Buying & Product Testing • ${region}`,
      location: region,
      followers: '240K',
      engagement: '6.0%',
      dialectFit: `${language} (Youth Everyday)`,
      dialectScore: 97,
      brandSafetyScore: 99,
      recommendedFormat: `Ingredient Breakdown & Value Analysis of ${brand} ${product}`,
      talkingPoints: points,
      mandatoryDisclaimers: [`#Ad #ProductAudit`],
      prohibitedPhrases: prohibited,
      creatorBrief: makeBrief('Smart Consumer', '@smartconsumer', '45s Reel'),
    },
    {
      id: 'creator-gen-3',
      name: 'Dr. Radhika Sharma',
      handle: '@wellness_with_radhika',
      initials: 'RS',
      avatarGradient: 'from-emerald-400 to-teal-600',
      niche: `Certified Nutrition & Evidence-Based Wellness`,
      location: region,
      followers: '460K',
      engagement: '4.8%',
      dialectFit: `${language} (Professional & Trustworthy)`,
      dialectScore: 96,
      brandSafetyScore: 100,
      recommendedFormat: `Fact-Checking the claims of ${product}: Why laboratory credentials matter`,
      talkingPoints: points,
      mandatoryDisclaimers: [`#Ad #DoctorExplains`],
      prohibitedPhrases: prohibited,
      creatorBrief: makeBrief('Dr. Radhika Sharma', '@wellness_with_radhika', '60s Short + Educational Carousel'),
    },
  ];
}
