# BRACO OMNIPULSE — ARCHITECTURAL & DESIGN DECISIONS (DECISIONS.md)

This log records implementation choices, architectural trade-offs, and design standards established for Braco OmniPulse according to the master specification (v3).

---

## 1. Zero Demo Data Standard (Section 2)
- **Decision**: All mock/seed fixtures (`seedDemo.ts`, `seed-initial.mjs`, fake creator statistics, and pre-filled form states) are completely removed.
- **Rationale**: The specification strictly mandates that every number on screen originates from real database records or user imports. A fresh installation starts with zero rows in all campaign/creator tables and displays clean empty states with an actionable next step.
- **Implementation**: Database migrations run empty table schemas. First-run detects an unconfigured instance and routes to `/setup` for workspace and admin onboarding.

## 2. Visual Design System — Dark Bento Shell (Section 3 & Finance_app_design.jpg)
- **Decision**: Adopt the dark-mode aesthetic from `Finance_app_design.jpg`:
  - Outer background: `#6B6B6B` with a faint swirl-line vector texture.
  - Core app enclosure: Near-black (`#050505`) with a 40px border radius and 24px margins.
  - Navigation: Floating vertical pill (`#111111`) with circular icon buttons. Active state is a high-contrast white circle with a black icon. Bottom pill houses notification and settings; pinned bottom circle for sign out.
  - Top header: Brand mark at left (`#2BD64F` green glyph), centered search pill (`#1C1C1C`), white pill primary action button, and user initials avatar.
  - Bento Grid: 24–28px rounded cards with surface tones `#161616` to `#1E1E1E` and circular header action buttons.
  - Typography: Poppins font for Latin text and bold quantitative metrics (32–44px); Google Noto Sans family for Indic scripts (Telugu, Devanagari, Tamil, Bengali, Kannada, Malayalam, Gujarati, Gurmukhi, Odia) with line-height 1.5–1.7.
  - Color Tokens: Primary Accent `#2BD64F` (Forest/Neon Green), Highlight Accent `#FFE234` (Yellow), Track Gray `#2A2A2A`, Blocking Warning `#FF5C5C`.

## 3. Database Architecture & Immutability Triggers (Section 8)
- **Decision**: Turso libSQL (`@libsql/client`) serves as the single source of truth. SQLite `BEFORE UPDATE` and `BEFORE DELETE` triggers abort write operations on version and audit tables:
  - `brief_versions`
  - `asset_versions`
  - `poster_versions`
  - `approval_decisions`
  - `audit_events`
- **Rationale**: Satisfies the legal and regulatory requirement that creative and brief versions, human approval records, and audit events are cryptographically sealed and append-only.

## 4. Dual AI Orchestration & Zero-Fixture Policy (Section 6)
- **Decision**: Unified server-side AI provider interface without client-side key leakage or mock fallbacks:
  - **Literal Translation**: Sarvam AI (`mayura:v1` model).
  - **Transliteration & Language ID**: Sarvam AI.
  - **Natural Regional Adaptation**: Gemini API with Zod-enforced structured JSON output.
  - **Claim Extraction & Contextual Risk**: Gemini API.
  - **Poster Art Direction & Visual Generation**: Gemini API (with text-free prompt guardrails).
  - **Fallback Behavior**: If API keys are missing or provider requests fail, the UI surfaces clear error banners and marks integrations as `Not connected`. No fake translations or invented summaries are returned.

## 5. Ad Poster Typography & Composition Engine (Section 7)
- **Decision**: Decouple visual background art generation from text typography:
  - Gemini generates clean, text-free visual backgrounds adhering to brand colors and visual brief.
  - The application composites verified, approved Indic text client-side via SVG and Canvas using real Noto Sans fonts.
  - Hash comparisons guarantee that the rendered text matches the approved asset version. Unapproved exports carry an explicit `UNAPPROVED DRAFT` watermark ribbon.

## 6. Authentication & Session Management
- **Decision**: Self-contained cookie-based session management using WebCrypto `PBKDF2-SHA256` password hashing and libSQL `sessions` table.
- **Rationale**: Eliminates reliance on external Gmail SMTP credentials while ensuring strict workspace-scoped role enforcement across all server operations.
