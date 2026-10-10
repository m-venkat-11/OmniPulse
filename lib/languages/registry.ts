// ═══════════════════════════════════════════════════════
// Braco OmniPulse — Multilingual Language Registry
// Configurable catalogue of Indian languages, scripts & dialects
// ═══════════════════════════════════════════════════════

export interface DialectOption {
  id: string;
  name: string;
  region: string;
  description: string;
}

export interface LanguageEntry {
  id: string;
  name: string;
  nativeName: string;
  code: string;         // ISO 639-1 or BCP47
  script: string;
  tier: 1 | 2;
  fontFamily: string;   // CSS font-family for proper rendering
  dialects: DialectOption[];
  isEnabled: boolean;
}

export const LANGUAGE_REGISTRY: LanguageEntry[] = [
  // ── Tier 1: Priority Languages ──
  {
    id: 'en', name: 'English', nativeName: 'English', code: 'en',
    script: 'Latin', tier: 1, fontFamily: '"Inter", sans-serif',
    dialects: [
      { id: 'en-in', name: 'Indian English', region: 'India', description: 'Standard Indian English usage' }
    ],
    isEnabled: true,
  },
  {
    id: 'hi', name: 'Hindi', nativeName: 'हिन्दी', code: 'hi',
    script: 'Devanagari', tier: 1, fontFamily: '"Noto Sans Devanagari", sans-serif',
    dialects: [
      { id: 'hi-standard', name: 'Standard Hindi', region: 'North India', description: 'Modern Standard Hindi (Khariboli)' },
      { id: 'hi-bhojpuri', name: 'Bhojpuri influence', region: 'Bihar / Eastern UP', description: 'Bhojpuri-influenced Hindi usage' },
      { id: 'hi-haryanvi', name: 'Haryanvi influence', region: 'Haryana', description: 'Haryanvi-influenced Hindi usage' },
      { id: 'hi-rajasthani', name: 'Rajasthani influence', region: 'Rajasthan', description: 'Rajasthani-influenced Hindi usage' },
    ],
    isEnabled: true,
  },
  {
    id: 'bn', name: 'Bengali', nativeName: 'বাংলা', code: 'bn',
    script: 'Bengali', tier: 1, fontFamily: '"Noto Sans Bengali", sans-serif',
    dialects: [
      { id: 'bn-kolkata', name: 'Standard Bengali (Kolkata)', region: 'West Bengal', description: 'Standard Kolkata Bengali' },
      { id: 'bn-bangal', name: 'Bangal variety', region: 'Eastern dialects', description: 'Eastern/Bangladeshi influenced' },
    ],
    isEnabled: true,
  },
  {
    id: 'mr', name: 'Marathi', nativeName: 'मराठी', code: 'mr',
    script: 'Devanagari', tier: 1, fontFamily: '"Noto Sans Devanagari", sans-serif',
    dialects: [
      { id: 'mr-standard', name: 'Standard Marathi', region: 'Pune / Mumbai', description: 'Standard Pune-Mumbai Marathi' },
      { id: 'mr-vidarbha', name: 'Vidarbha Marathi', region: 'Vidarbha', description: 'Vidarbha regional variety' },
      { id: 'mr-marathwada', name: 'Marathwada Marathi', region: 'Marathwada', description: 'Marathwada regional variety' },
    ],
    isEnabled: true,
  },
  {
    id: 'te', name: 'Telugu', nativeName: 'తెలుగు', code: 'te',
    script: 'Telugu', tier: 1, fontFamily: '"Noto Sans Telugu", sans-serif',
    dialects: [
      { id: 'te-standard', name: 'Standard Telugu', region: 'General', description: 'Standard literary Telugu' },
      { id: 'te-andhra', name: 'Andhra Coastal Telugu', region: 'Andhra Pradesh (Coastal)', description: 'Coastal Andhra regional variety' },
      { id: 'te-rayalaseema', name: 'Rayalaseema Telugu', region: 'Rayalaseema', description: 'Rayalaseema regional variety' },
      { id: 'te-telangana', name: 'Telangana Telugu', region: 'Telangana / Hyderabad', description: 'Telangana / Deccan regional variety' },
    ],
    isEnabled: true,
  },
  {
    id: 'ta', name: 'Tamil', nativeName: 'தமிழ்', code: 'ta',
    script: 'Tamil', tier: 1, fontFamily: '"Noto Sans Tamil", sans-serif',
    dialects: [
      { id: 'ta-standard', name: 'Standard Tamil', region: 'Chennai', description: 'Standard Chennai Tamil' },
      { id: 'ta-madurai', name: 'Madurai Tamil', region: 'Madurai', description: 'Southern Tamil variety' },
      { id: 'ta-kongu', name: 'Kongu Tamil', region: 'Coimbatore', description: 'Western Tamil variety' },
    ],
    isEnabled: true,
  },
  {
    id: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', code: 'gu',
    script: 'Gujarati', tier: 1, fontFamily: '"Noto Sans Gujarati", sans-serif',
    dialects: [
      { id: 'gu-standard', name: 'Standard Gujarati', region: 'Ahmedabad / Vadodara', description: 'Standard Gujarati' },
    ],
    isEnabled: true,
  },
  {
    id: 'ur', name: 'Urdu', nativeName: 'اردو', code: 'ur',
    script: 'Nastaliq / Arabic', tier: 1, fontFamily: '"Noto Nastaliq Urdu", serif',
    dialects: [
      { id: 'ur-standard', name: 'Standard Urdu', region: 'North India', description: 'Standard literary Urdu' },
    ],
    isEnabled: true,
  },
  {
    id: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', code: 'kn',
    script: 'Kannada', tier: 1, fontFamily: '"Noto Sans Kannada", sans-serif',
    dialects: [
      { id: 'kn-standard', name: 'Standard Kannada', region: 'Bangalore / Mysore', description: 'Standard Kannada' },
    ],
    isEnabled: true,
  },
  {
    id: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', code: 'or',
    script: 'Odia', tier: 1, fontFamily: '"Noto Sans Oriya", sans-serif',
    dialects: [
      { id: 'or-standard', name: 'Standard Odia', region: 'Odisha', description: 'Standard Odia' },
    ],
    isEnabled: true,
  },
  {
    id: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', code: 'ml',
    script: 'Malayalam', tier: 1, fontFamily: '"Noto Sans Malayalam", sans-serif',
    dialects: [
      { id: 'ml-standard', name: 'Standard Malayalam', region: 'Kerala', description: 'Standard Kerala Malayalam' },
    ],
    isEnabled: true,
  },
  {
    id: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', code: 'pa',
    script: 'Gurmukhi', tier: 1, fontFamily: '"Noto Sans Gurmukhi", sans-serif',
    dialects: [
      { id: 'pa-standard', name: 'Standard Punjabi', region: 'Punjab', description: 'Standard Gurmukhi Punjabi' },
    ],
    isEnabled: true,
  },
  {
    id: 'as', name: 'Assamese', nativeName: 'অসমীয়া', code: 'as',
    script: 'Bengali', tier: 1, fontFamily: '"Noto Sans Bengali", sans-serif',
    dialects: [
      { id: 'as-standard', name: 'Standard Assamese', region: 'Assam', description: 'Standard Assamese' },
    ],
    isEnabled: true,
  },

  // ── Tier 2: Expandable Languages ──
  {
    id: 'mai', name: 'Maithili', nativeName: 'मैथिली', code: 'mai',
    script: 'Devanagari', tier: 2, fontFamily: '"Noto Sans Devanagari", sans-serif',
    dialects: [], isEnabled: false,
  },
  {
    id: 'sat', name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ', code: 'sat',
    script: 'Ol Chiki', tier: 2, fontFamily: 'sans-serif',
    dialects: [], isEnabled: false,
  },
  {
    id: 'ks', name: 'Kashmiri', nativeName: 'कॉशुर', code: 'ks',
    script: 'Arabic / Devanagari', tier: 2, fontFamily: '"Noto Sans Devanagari", sans-serif',
    dialects: [], isEnabled: false,
  },
  {
    id: 'ne', name: 'Nepali', nativeName: 'नेपाली', code: 'ne',
    script: 'Devanagari', tier: 2, fontFamily: '"Noto Sans Devanagari", sans-serif',
    dialects: [], isEnabled: false,
  },
  {
    id: 'sd', name: 'Sindhi', nativeName: 'سنڌي', code: 'sd',
    script: 'Arabic / Devanagari', tier: 2, fontFamily: 'sans-serif',
    dialects: [], isEnabled: false,
  },
  {
    id: 'doi', name: 'Dogri', nativeName: 'डोगरी', code: 'doi',
    script: 'Devanagari', tier: 2, fontFamily: '"Noto Sans Devanagari", sans-serif',
    dialects: [], isEnabled: false,
  },
  {
    id: 'kok', name: 'Konkani', nativeName: 'कोंकणी', code: 'kok',
    script: 'Devanagari', tier: 2, fontFamily: '"Noto Sans Devanagari", sans-serif',
    dialects: [], isEnabled: false,
  },
  {
    id: 'mni', name: 'Manipuri', nativeName: 'মৈতৈলোন্', code: 'mni',
    script: 'Bengali / Meetei Mayek', tier: 2, fontFamily: '"Noto Sans Bengali", sans-serif',
    dialects: [], isEnabled: false,
  },
  {
    id: 'brx', name: 'Bodo', nativeName: 'बड़ो', code: 'brx',
    script: 'Devanagari', tier: 2, fontFamily: '"Noto Sans Devanagari", sans-serif',
    dialects: [], isEnabled: false,
  },
  {
    id: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्', code: 'sa',
    script: 'Devanagari', tier: 2, fontFamily: '"Noto Sans Devanagari", sans-serif',
    dialects: [], isEnabled: false,
  },
];

// Helper: Get enabled languages for selectors
export function getEnabledLanguages(): LanguageEntry[] {
  return LANGUAGE_REGISTRY.filter(l => l.isEnabled);
}

// Helper: Get language by ID
export function getLanguageById(id: string): LanguageEntry | undefined {
  return LANGUAGE_REGISTRY.find(l => l.id === id);
}

// Helper: Get dialects for a language
export function getDialectsForLanguage(langId: string): DialectOption[] {
  const lang = getLanguageById(langId);
  return lang?.dialects ?? [];
}

// Tone options for the adaptation engine
export const TONE_OPTIONS = [
  { id: 'professional', label: 'Professional' },
  { id: 'friendly', label: 'Friendly' },
  { id: 'emotional', label: 'Emotional' },
  { id: 'premium', label: 'Premium / Luxury' },
  { id: 'humorous', label: 'Humorous' },
  { id: 'aspirational', label: 'Aspirational' },
  { id: 'trustworthy', label: 'Trustworthy' },
  { id: 'energetic', label: 'Energetic' },
] as const;

export const SLANG_LEVELS = [
  { id: 'none', label: 'No slang — formal language only' },
  { id: 'low', label: 'Low — occasional conversational phrases' },
  { id: 'medium', label: 'Medium — natural colloquial language' },
  { id: 'high', label: 'High — heavy local slang and expressions' },
] as const;

export const FORMALITY_OPTIONS = [
  { id: 'formal', label: 'Formal' },
  { id: 'neutral', label: 'Neutral / Balanced' },
  { id: 'conversational', label: 'Conversational / Casual' },
] as const;
