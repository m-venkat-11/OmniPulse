# Braco OmniPulse — Regional Campaign Intelligence

**Hackathon Submission: Samartha Stage 1**
**Domain:** Brand Marketing Innovation

Braco OmniPulse is a premium AI-assisted regional marketing and campaign intelligence platform. It connects fact-locked regional adaptation, three-pass brand checks, version-bound human approval, creator briefing, and pre-registered, honest measurement into one tamper-evident workflow.

---

## 1. Architecture Summary
- **Frontend**: Next.js 16 (App Router), React, Tailwind v4, Recharts, Lucide React.
- **Backend**: Next.js Server Actions & Route Handlers.
- **Database & Auth**: Supabase PostgreSQL (Auth + DB) mapped via SQL migrations.
- **AI Integration**: Vercel AI SDK adapter pattern (featuring a built-in deterministic "Demo Fixture" fallback so reviewers can test the exact flow without requiring OpenAI API keys).
- **Security & Audit**: Web Crypto API for SHA-256 hashing (NFC-normalized for Indic text support), immutable append-only versioning.

---

## 2. Setup and Run Steps (Offline/Demo Mode)

The application is built to run flawlessly for judges even without live API credentials.

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Explore the Demo:**
   - Open `http://localhost:3000`
   - Click "Sign In"
   - You do **not** need to enter real credentials. Click "Sign in" to automatically bypass auth into the Demo Workspace.

*(Optional: Live Supabase Setup)*
If you wish to connect a live database:
1. Create a Supabase project.
2. Run the SQL in `supabase/migrations/00001_initial_schema.sql` in the SQL Editor.
3. Add the env vars (see section 3).

---

## 3. Environment Variables (`.env.example`)

To run with live integrations, create a `.env.local` file:

```env
# Supabase Authentication & Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Optional: AI Provider Key (if missing, app falls back to Demo Fixtures)
OPENAI_API_KEY=sk-your-key
```

---

## 4. Implemented vs. Mocked Features

**✅ Fully Implemented:**
- Complete design system (Forest green, Ivory, Brass) and responsive layout.
- 3D Regional Campaign Sphere (Canvas fallback for performance).
- Supabase Authentication & Session Management (with Demo bypass).
- Zod schema validation for all forms and AI outputs.
- SHA-256 Hashing for Asset Versions and the Decision Trace.
- Honest Analytics calculation logic (CTR, event gating, recharts).
- Indic text rendering (Noto Sans Telugu/Devanagari).

**🛠️ Mocked / Simulated (For Hackathon Constraints):**
- **AI Generation**: If no API key is provided, the app uses a deterministic "Demo Fixture" that perfectly simulates the AI's behavior, including returning structured Zod output and deliberately planting a non-compliant claim for the Guardian to catch.
- **Brand Guardian**: The 3-pass check is visually simulated to demonstrate the workflow.
- **Creator Profiles**: Labelled "Synthetic Profile" to respect data scraping rules.
- **Analytics Data**: Driven by hardcoded synthetic data arrays.

**🔮 Future Work (Not Implemented):**
- Automated publishing to Meta/Google Ads APIs.
- Real-time social listening.
- Vector DB semantic search for Brand Knowledge.

---

## 5. Four-Minute Judging Demo Script

Follow this exact click-path to demonstrate the full platform value to the judges:

### 0:00 - 0:30 (The Problem & Setup)
*   **Action:** Open `http://localhost:3000`. Show the premium landing page and 3D sphere.
*   **Talk Track:** "Indian brands struggle to adapt campaigns across regions. Translators lose the brand voice, and AI hallucinates illegal claims. OmniPulse fixes this with a tamper-evident, fact-locked loop."
*   **Action:** Click **Sign In**, leave the demo credentials, and click Sign in to enter the Dashboard.

### 0:30 - 1:10 (Brief to Variants)
*   **Action:** From the Dashboard, click **New Campaign**.
*   **Action:** Step 1: Fill out basic info. Click Next.
*   **Action:** Step 2: Show the **Claim Atoms**. Explain how we select pre-approved facts ("100% daily iron") and *lock* them into the AI prompt. Click Next.
*   **Action:** Step 3: Review the brief, click **Create & Generate**.

### 1:10 - 1:55 (Adaptation & Guardian Check)
*   **Action:** On the Creative Studio page, click **Generate Variants**.
*   **Talk Track:** "The AI generates Telugu variants. Notice the **Adaptation Card**: it explicitly proves the Fact Layer (100% iron) survived the translation, while explaining why it changed the Creative Layer (using urban slang)."
*   **Action:** Point out the warning on Variant B. Click **Run Brand Guardian**.

### 1:55 - 2:30 (Review & Gated Approval)
*   **Action:** On the Guardian page, click **Run Brand Guardian**.
*   **Talk Track:** "The system catches the illegal phrase 'గ్యారెంటీ' (guaranteed). It gives the reviewer exact text spans and resolution buttons."
*   **Action:** Click **Delete claim from asset**, then click **Send to Review Center**.
*   **Action:** In the Review Center, show the **Delta Review** (crossed out text) and the server-enforced **Approval Gates**. Click **Approve Version**.

### 2:30 - 3:00 (Creator & Passport)
*   **Action:** Click **View Decision Passport**. 
*   **Talk Track:** "We now have an immutable, printable, hash-chained record of exactly who approved this Telugu asset and why."
*   **Action:** Use the top nav/URL to go to `/campaigns/123/creators`. Show the auto-generated brief and transparent creator matching rationale.

### 3:00 - 4:00 (Honest Analytics)
*   **Action:** Click **Plan Experiment**, then **Pre-Register & Lock**.
*   **Action:** Click **Import Data & Analyze**.
*   **Action:** Click **Test with Flawed CSV** to show the validation engine catching errors (clicks > impressions).
*   **Action:** Click **Import Valid Synthetic CSV**. Show the chart and the Data Sufficiency check (proving we don't declare winners on tiny sample sizes).
*   **Action:** Show the "Proposed Learning" inbox at the bottom, proving the loop is closed.
