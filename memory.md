# MEMORY.md — Active State Tracker, Decisions Log & AntiGravity Prompts

## 1. Current Project Status Matrix
* **Project Name:** ResumeOS — AI Resume Analyzer, De-AI Humanizer & 3-Layer Verified Job Matcher
* **Current Active Phase:** `Page Flow Restructuring Complete & Verified`
* **Overall Completion:** `100% (Phases 1-5 + Dedicated Marketing Landing Page & Workspace Separation Verified)`

### Blueprint Files Inventory
| File Name | Role | Status |
| :--- | :--- | :--- |
| `project_requirement.md` | Core functional specs, 4-Pillar Logic, AI Detection & 3-Layer Job rules | ✅ Locked |
| `architecture.md` | System data flow, Next.js + Groq + Supabase schemas, Zod contracts | ✅ Locked |
| `rules.md` | Strict TypeScript laws, quota protection guardrails, banned patterns | ✅ Locked |
| `design.md` | Dual-theme (Light/Dark) tokens, top bar specs, ASCII wireframes | ✅ Locked |
| `phases.md` | 5-phase execution checklist & verification checkpoints | ✅ Locked |
| `memory.md` | Active state tracker, architectural memory & session prompts | ✅ Complete |

### Phase Execution Tracker
- [x] **Phase 1:** Foundation, Dual-Theme Top Bar (`ThemeToggle.tsx`), Document Parser & Deterministic ATS Engine
- [x] **Phase 2:** Groq `llama-3.3-70b-versatile` Engine, Zod Schema, System Prompt, `/api/analyze` Route & Tab 1 Split-View Dashboard
- [x] **Phase 3:** 3-Layer Live Job Credibility Engine (`job-fetcher.ts`, `layer1-sanity.ts`, `layer2-3-credibility.ts`) & Tab 2 Verified Job Radar UI (`JobCard.tsx`, `VerifiedJobsList.tsx`)
- [x] **Phase 4:** Supabase OAuth & Opt-In Peer Showcase Directory
- [x] **Phase 5:** SHA-256 Deduplication Cache, IP Rate Limiter, BYOK Modal & Production Build
- [x] **Restructuring:** Dedicated Marketing Landing Page (`/`), Dedicated Workspace (`/analyze`), and Navbar links (`Home`, `Try It Out`, `Verified Jobs`, `Peer Directory`)

---

## 2. Core Architectural & Product Decisions Log

1. **Next.js App Router Architecture & Restructured Routing:**
   - `app/page.tsx`: Dedicated marketing landing page presenting The Problem (6-second black hole, broken ATS parser corruption, ghost jobs), The Solution & UN SDG 8 alignment (Decent Work & Economic Growth), system architecture, and primary CTA.
   - `app/analyze/page.tsx`: Dedicated interactive workspace with dual dropzone, live audit progress, deterministic layout checklist, and Tab 1 (Deep Resume Audit) vs Tab 2 (Verified Job Radar) split-view dashboard.
   - `app/directory/page.tsx`: Opt-in Peer Showcase directory with domain filters.

2. **Hydration-Safe Theme Toggle & Sticky Navbar:**
   `ThemeToggle.tsx` utilizes a `mounted` state guard to render a skeleton state during SSR and prevent React hydration mismatch warnings. `Navbar.tsx` features brand logo, view navigation (`Home`, `Try It Out`, `Verified Jobs`, `Peer Directory`), BYOK scan pill, ThemeToggle, and auth trigger.

3. **Node.js Runtime Enforced Document Parsers & SHA-256 Hasher:**
   - `lib/parsers/document-parser.ts` explicitly enforces `export const runtime = "nodejs"` and handles PDF (`pdf-parse`) and DOCX (`mammoth`) up to 5MB.
   - `lib/parsers/text-normalizer.ts` strips control characters, normalizes bullets, and enforces 12,000 char (resume) and 6,000 char (JD) limits.
   - `lib/crypto/hash.ts` explicitly enforces `export const runtime = "nodejs"` and uses native `crypto.createHash('sha256')`.

4. **0ms Deterministic ATS Engine:**
   `lib/engines/ats-deterministic.ts` executes instant regex contact metadata verification (Email, Phone, LinkedIn, GitHub), standard section check (Experience, Projects, Education, Skills), word count status, multi-column/table risk detection, AI cliché pre-scanner, and contextual vs isolated skill cross-checks.

5. **Groq Llama-3.3-70b-versatile Audit Engine & Zod Validation:**
   - `lib/schemas/audit.schema.ts` enforces strict runtime Zod validation (`ResumeAuditSchema`) for scores, 4-pillar logic grid, AI detection probability, keyword matrices, and bullet point critiques.
   - `lib/ai/groq-client.ts` supports server `GROQ_API_KEY` and client `x-custom-api-key` header (BYOK mode) in strict JSON object mode (`temperature: 0.2`).
   - `lib/ai/prompts/resume-audit.prompt.ts` implements 3 AI Detection Constraints (Lexical Clichés, Metric-to-Adjective Ratio, Cadence Uniformity) and 4-Pillar Recruiter Logic Rules.
   - `app/api/analyze/route.ts` specifies `export const runtime = "nodejs";` and orchestrates text extraction, normalization, deterministic checks, Groq LLM semantic audit, and 3-layer job pipeline concurrently using `Promise.allSettled`.

6. **3-Layer Live Job Credibility Engine:**
   - `lib/jobs/job-fetcher.ts` connects to JSearch API with realistic dev fallback dataset.
   - `lib/jobs/layer1-sanity.ts` enforces `date_posted <= 14` days strictly and classifies Direct ATS (`greenhouse.io`, `lever.co`, `myworkdayjobs.com`, `ashbyhq.com`) vs Staffing Agency.
   - `lib/jobs/layer2-3-credibility.ts` performs ghost job evaluation (`HIGH_INTENT` 🟢, `CAUTIOUS` 🟡, `RED_FLAG` 🔴) and calculates candidate match odds % with a 1-sentence Tactical Edge tip.
   - `lib/jobs/job-pipeline.ts` orchestrates all 3 layers.

7. **Supabase Auth & Opt-In Peer Directory:**
   - `lib/supabase/client.ts` & `lib/supabase/server.ts` provide SSR Supabase authentication helpers.
   - `supabase/migrations/001_init_schema.sql` defines `scan_cache`, `rate_limits`, and `peer_profiles` SQL tables with RLS policies.
   - `app/auth/callback/route.ts` handles OAuth code exchange.
   - `components/layout/UserNav.tsx` manages Google/GitHub OAuth modal triggers and showcase public/private status toggles.
   - `app/api/directory/route.ts` provides domain-filtered GET profiles & authenticated POST profile publishing with seed fallback.
   - `app/directory/page.tsx` & `components/directory/PeerCard.tsx` display domain filter pills, anonymized handles, ATS scores, human tone %, and Google X-Y-Z project bullet highlights.

8. **BYOK Modal, SHA-256 Deduplication Cache & IP Protection:**
   - `components/modals/ByokModal.tsx` provides localStorage API key configuration for unlimited zero-rate-limit scans.
   - `lib/cache/audit-cache.ts` provides SHA-256 cache lookup (< 50ms response, $0 LLM tokens) and IP rate-limiting (3 scans/hour per IP for free tier).

---

## 3. Critical Technical Gotchas & Guardrails

1. **Gotcha 1 — Next.js Node Runtime for Binary Parsers & Route Handlers:**
   `pdf-parse`, `mammoth`, `crypto`, and `/api/analyze/route.ts` specify `export const runtime = "nodejs"`.

2. **Gotcha 2 — Promise.allSettled Non-Blocking Execution:**
   `/api/analyze/route.ts` executes Groq Resume Audit and 3-Layer Job Pipeline concurrently using `Promise.allSettled`. If one task fails or times out, the other returns cleanly.

3. **Gotcha 3 — Strict TypeScript Verification & Production Build:**
   Zero `any` policy enforced. Verified via `npx tsc --noEmit` (0 errors) and `npm run build` (0 errors across 9 routes).

---

## 4. Active Build Log

- **[Session 1 — Phase 1 Complete]:** Built Next.js foundation, dual-theme tokens, sticky navbar, theme toggle, document parser, text normalizer, SHA-256 hasher, 0ms deterministic ATS engine.
- **[Session 2 — Phase 2 Complete]:** Built Zod schema, Groq client, system prompt, `/api/analyze` route, and all 6 Tab 1 Split-View Dashboard components.
- **[Session 3 — Phase 3 Complete]:** Built JSearch job fetcher + dev fallback, Layer 1 freshness filter, Layer 2 ghost job badge & Layer 3 tactical edge tip, 3-layer pipeline orchestrator, `JobCard.tsx`, `VerifiedJobsList.tsx`, and updated `AuditDashboard.tsx` with Tab 1 vs Tab 2 navigation.
- **[Session 4 — Phase 4 Complete]:** Built Supabase SSR clients, SQL schema migration with RLS, OAuth callback route, `UserNav.tsx`, `/api/directory` endpoint, `PeerCard.tsx`, and `app/directory/page.tsx`.
- **[Session 5 — Phase 5 Complete]:** Built `ByokModal.tsx`, `audit-cache.ts` (SHA-256 cache & IP rate limiter), updated `/api/analyze/route.ts`, finalized `app/page.tsx` and `Navbar.tsx`, verified `npx tsc --noEmit` (0 errors), and executed successful `npm run build` production compilation.
- **[Session 6 — Restructuring Step 1 Complete]:**
  1. Created dedicated marketing landing page at [`app/page.tsx`](file:///home/god_aj/Resume_Fucking_Analyzer/app/page.tsx) detailing the Problem (6-second skim, ATS parser corruption, ghost jobs), Solution & UN SDG 8 alignment, Engineering Architecture, and CTA.
  2. Moved active analyzer tool into [`app/analyze/page.tsx`](file:///home/god_aj/Resume_Fucking_Analyzer/app/analyze/page.tsx).
  3. Updated [`components/layout/Navbar.tsx`](file:///home/god_aj/Resume_Fucking_Analyzer/components/layout/Navbar.tsx) with navigation links: `Home`, `Try It Out`, `Verified Jobs`, and `Peer Directory`.
  4. Verified `npx tsc --noEmit` (**0 errors**) and `npm run build` (**9/9 routes compiled cleanly**).
- **[Session 7 — Supabase Auth Bulletproofed]:**
  1. Updated [`lib/supabase/client.ts`](file:///home/god_aj/Resume_Fucking_Analyzer/lib/supabase/client.ts): Added `isSupabaseReady()` export. Added browser-side `console.warn` when env vars are missing. Kept placeholder fallback to prevent constructor crash.
  2. Updated [`lib/supabase/server.ts`](file:///home/god_aj/Resume_Fucking_Analyzer/lib/supabase/server.ts): Added `isSupabaseReady()` export. Added server-side `console.warn` when env vars are missing. Placeholder fallback maintained for unconfigured environments.
  3. Updated [`app/auth/callback/route.ts`](file:///home/god_aj/Resume_Fucking_Analyzer/app/auth/callback/route.ts): Added `isSupabaseReady()` guard at the top. Logs `exchangeCodeForSession` errors explicitly. Redirects gracefully to `next` path when Supabase is unconfigured instead of crashing.
  4. Updated [`components/layout/UserNav.tsx`](file:///home/god_aj/Resume_Fucking_Analyzer/components/layout/UserNav.tsx): Imports `isSupabaseReady()`. Returns `null` early if Supabase is unconfigured, preventing broken OAuth buttons from rendering in offline/dev mode.
  5. Verified `npx tsc --noEmit` (**0 errors**). All four files pass strict TypeScript checks.
- **[Session 8 — OAuth Sign-In Debugged & Fixed]:**
  Root causes identified and fixed in [`components/layout/UserNav.tsx`](file:///home/god_aj/Resume_Fucking_Analyzer/components/layout/UserNav.tsx):
  1. **Bug 1 (Critical — Infinite Re-render):** `createClient()` was called directly inside the component body and passed to `useEffect`'s deps array. Each render created a new Supabase instance, re-triggering `useEffect` → infinite auth listener subscription loop. **Fix:** Wrapped `createClient()` in `useMemo(() => createClient(), [])` so the client is created exactly once per mount.
  2. **Bug 2 (Silent Failure):** `signInWithOAuth` had no error handling. If Supabase rejected the call, nothing was logged or shown. **Fix:** Wrapped in `try/catch`, destructured the `error` from the return value, and logged it to `console.error`.
  3. **Bug 3 (Poor UX):** No visual feedback during OAuth redirect. **Fix:** Added `isSigningIn` state with a `Loader2` spinner and "Redirecting…" label on the active button; added disabled state to both buttons during auth flow; added an inline `authError` display inside the modal.
  4. Verified `npx tsc --noEmit` (**0 errors**).
- **[Session 9 — Guest Session Noise Fixed]:**
  [`components/layout/UserNav.tsx`](file:///home/god_aj/Resume_Fucking_Analyzer/components/layout/UserNav.tsx): `checkUser()` now silently ignores `"Auth session missing!"` errors (Supabase's expected response for unauthenticated guests) while still logging any other unexpected auth errors. `setUser(null)` is always called on any error path so the component renders the Sign In button correctly for guests. Verified `npx tsc --noEmit` (**0 errors**).
- **[Session 10 — Email/Password Auth + Friendly Error Mapping]:**
  Full rebuild of [`components/layout/UserNav.tsx`](file:///home/god_aj/Resume_Fucking_Analyzer/components/layout/UserNav.tsx) auth modal:
  1. **Tabbed modal UI:** "Social Login" tab (GitHub/Google OAuth) and "Email / Password" tab with a Sign In / Create Account toggle.
  2. **Email auth:** `signInWithPassword({ email, password })` for existing users; `signUp({ email, password, options: { emailRedirectTo } })` for new users. On signup success, shows a green confirmation banner prompting the user to check their inbox.
  3. **`friendlyAuthError()` mapper:** Converts raw Supabase error messages into readable strings — catches `"provider is not enabled"`, `"Invalid login credentials"`, `"Email not confirmed"`, `"User already registered"`, `"Password should be at least"`, rate limits, etc.
  4. **OAuth error surface:** `signInWithOAuth` errors (e.g. provider not enabled) are now caught and rendered in the modal with a friendly tip to enable the provider in Supabase or use Email/Password.
  5. **UX polish:** `isSigningIn` spinner on the active button, both buttons disabled during async flow, `AlertCircle` error banner, `CheckCircle2` success banner, backdrop click to dismiss.
  6. Verified `npx tsc --noEmit` (**0 errors**).
- **[Session 11 — Groq Model 404 Resilience & Auth Modal Redesign]:**
  1. **Groq Multi-Model Fallback Chain:** Updated [`lib/ai/groq-client.ts`](file:///home/god_aj/Resume_Fucking_Analyzer/lib/ai/groq-client.ts) and [`lib/jobs/layer2-3-credibility.ts`](file:///home/god_aj/Resume_Fucking_Analyzer/lib/jobs/layer2-3-credibility.ts) with a fallback model chain (`process.env.GROQ_MODEL` -> `llama-3.1-8b-instant` -> `llama-3.3-70b-versatile` -> `llama3-70b-8192`). If any model throws 404 `model_not_found`, it automatically retries with the next active model.
  2. **Auth Modal Redesign:** Upgraded [`components/layout/UserNav.tsx`](file:///home/god_aj/Resume_Fucking_Analyzer/components/layout/UserNav.tsx) with glassmorphism dark-mode aesthetics, subtle borders, glowing brand icon, pill tab switcher, focus-ring inputs with icons, gradient submit button with loading spinner, ESC key listener, and zero layout shift.
  3. Verified `npx tsc --noEmit` (**0 errors**).
- **[Session 12 — Verified Groq Model Swap & Premium Auth Modal]:**
  1. **Live API model audit:** Queried `GET /openai/v1/models` against the live Groq API. **All previous Llama models are decommissioned** (`llama-3.3-70b-versatile`, `llama-3.1-8b-instant`, `llama3-70b-8192`, `llama3-8b-8192`). Active models: `openai/gpt-oss-120b` (128K ctx), `qwen/qwen3.8-27b` (128K ctx), `openai/gpt-oss-20b` (128K ctx).
  2. **Model swap:** Updated fallback chains in [`lib/ai/groq-client.ts`](file:///home/god_aj/Resume_Fucking_Analyzer/lib/ai/groq-client.ts) and [`lib/jobs/layer2-3-credibility.ts`](file:///home/god_aj/Resume_Fucking_Analyzer/lib/jobs/layer2-3-credibility.ts) to `gpt-oss-120b → qwen3.8-27b → gpt-oss-20b`. Tested `gpt-oss-120b` JSON mode via `curl` — returns valid `{"status":"ok"}`.
  3. **Premium Auth Modal v3:** Full rewrite of [`components/layout/UserNav.tsx`](file:///home/god_aj/Resume_Funny_Analyzer/components/layout/UserNav.tsx): proper Google "G" SVG icon (replaced Lucide Chrome icon), fixed 40px input heights for zero layout shift, `useCallback` for reset, clean dark-mode borders (`zinc-700`), pill tab/segment switcher, minimal code with no unused imports.
  4. Verified `npx tsc --noEmit` (**0 errors**).

- **[Session 13 — Job Radar Location Overhaul]:**
  1. **Dynamic Location-Aware Job Matching:** Updated `lib/jobs/job-fetcher.ts` JSearch query to explicitly target "India OR Remote India".
  2. **Link Integrity & Fallback Overhaul:** Replaced hardcoded US locations (Boston, Seattle, etc.) in `getFallbackDevJobs` with India-based tech hubs (Bangalore, Pune, NCR, Hyderabad, Chandigarh/Mohali) and updated dead links with active query URLs for LinkedIn India, Instahyre, and Wellfound.
  3. Verified `npx tsc --noEmit` (**0 errors**).

- **[Session 14 — Job Radar Preferences & Dynamic Overhaul]:**
  1. **Dynamic Job API Route:** Created `app/api/jobs/route.ts` to expose the 3-Layer Job Pipeline for frontend refetches with active Location and Work Preference inputs.
  2. **UI Input Bar:** Added Location and Work Preference filters to `VerifiedJobsList.tsx` with a dynamic "Update Radar" button.
  3. **Backend Location-Aware Routing:** Plumbed `location` and `workPreference` parameters into `job-pipeline.ts`, `job-fetcher.ts` (modifying both the RapidAPI JSearch query and local dev fallbacks dynamically), and `layer2-3-credibility.ts` (adding preference constraints to the Groq LLM prompt).
  4. Verified `npx tsc --noEmit` (**0 errors**).

- **[Session 15 — Deterministic Job Engine Replacement]:**
  1. **Removed LLM Job Scraping:** Replaced the unreliable LLM-based ghost job generation pipeline with a 100% deterministic engine using active URLs.
  2. **Indian Internship & Gov Portals:** Configured deterministic live-query links for Internshala, Unstop, Wellfound, LinkedIn India, and explicit Government portals (AICTE, MeitY, NATS) mapped to the user's detected resume skills.
  3. **Live Remote API Integration:** Connected the `remotive.com` free public API with dynamic resume skill filtering.
  4. **Mathematical Match Scoring:** Discarded arbitrary percentages for a deterministic calculation algorithm (matching resume skills to job requirements). Switched missing skill chips in `JobCard.tsx` to neutral "To Learn" badges instead of red flags.
  5. **UI Redesign:** Replaced the generic inputs in `VerifiedJobsList.tsx` with targeted dropdowns for Role Type, Location, and Work Mode.
  6. Verified `npx tsc --noEmit` (**0 errors**).

- **[Session 16 — 10-Bucket Scoring & UI Redesign]:**
  1. **Deterministic Pipeline Overhaul:** Replaced the abstract AI logic pillars with a strict 10-Bucket Regex/Heuristic engine (`ats-deterministic.ts`). This guarantees accurate checks for ATS Parseability, Format, Contacts, Summary, Experience, Skills, Education, Projects, Metrics, and Readability even if LLM API fails.
  2. **Job Match Mode:** Added an optional JD textarea in `UploadWorkspace.tsx`. When provided, the final score uses a blended weight (70% General / 30% JD Match) taking into account Hard/Soft Skills and Keywords.
  3. **Hard Caps & Priority Fixes:** Implemented automatic penalty caps (e.g. missing contact caps score at 50). UI now displays a dynamic Hard Cap Banner. Built a mathematical Priority Ranker that surfaces the Top 5 most urgent fixes written in crystal-clear Grade 8 reading level.
  4. **Interactive Recharts Dashboard:** Rebuilt `AuditDashboard.tsx` from scratch using `recharts` for an interactive 10-Bucket bar chart. Hovering or clicking a bucket loads a Live Category Inspector Card showing exact passed/failed checks and Google X-Y-Z Before/After rewrites.
  6. Verified `npx tsc --noEmit` (**0 errors**).

- **[Session 17 — UX Minimalism & Heuristics Overhaul]:**
  1. **Seniority / Experience Detection:** Built `calculateExperienceTier` in `ats-deterministic.ts` that safely calculates years of experience while ignoring "Education" dates. Fallbacks correctly identify "Student / Fresher" or "Intern" based on keywords (e.g. B.Tech, Undergrad) and duration.
  2. **AI-Written Detector Rebuild:** Replaced regex word lists with a 3-signal heuristic in `ats-deterministic.ts` checking for ChatGPT clichés (Signal A), Sentence Tails like ", resulting in" (Signal B), and High Adjective Density without metrics (Signal C). Merged this with Groq LLM probability (Signal D) for accurate AI-slop detection.
  3. **Minimalist Human Studio UI:** Overhauled `globals.css`, `Navbar.tsx`, `UploadWorkspace.tsx`, and `AuditDashboard.tsx` with a dark mode matte background (`#0A0A0B`), pure white (`bg-zinc-100`) action buttons, subtle `#111113` cards, and removed all generic AI gradients, neon glows, and unnecessary icons for a Linear/Vercel aesthetic.
  4. **Plain English Copywriting:** Rewrote `app/page.tsx` entirely. Removed all pretentious AI lingo, UN SDG badges, and telemetry UI. Replaced with direct, blunt English ("Your resume is probably getting filtered out for dumb reasons") and simplified tabs ("Resume Check", "Jobs & Internships").
  5. Verified `npx tsc --noEmit` (**0 errors**).

- **[Session 18 — Editorial Design Overhaul & 100% India-Locked Jobs]:**
  1. **Editorial Design System:** Updated `tailwind.config.ts`, `globals.css`, and `layout.tsx` to include `Playfair Display`, `Plus Jakarta Sans`, and `JetBrains Mono`. Switched to an editorial "Forest Pine & Acid Lime" dark mode and "Warm Cream & Espresso" light mode.
  2. **Editorial Landing Page:** Completely rebuilt `app/page.tsx` with an asymmetric layout, overlapping serif typography, an interactive X-Ray specimen sheet widget, and an overlapping circular stamp badge.
  3. **100% India-Locked Job Engine:** Removed Remotive API. Added strict `isAllowedIndiaLocation` guard. Rewrote `lib/jobs/job-fetcher.ts` to output 18+ dynamic Indian opportunities including Top Startups, AICTE/MeitY Government Internships, and localized LinkedIn searches (geoId 102713980).
  4. **Job Filters & UI Update:** Updated `VerifiedJobsList.tsx` and `JobCard.tsx` to match the editorial styling, and added robust Indian Location (Tricity, NCR, etc.) and Role Type drop-downs.
  5. Verified `npx tsc --noEmit` (**0 errors**).

- **[Session 19 — Mobile-First Responsive Overhaul]:**
  1. **Global Overflow & Padding Fixes:** Added `overflow-x-hidden` to `html` and `body` in `app/layout.tsx` to prevent horizontal scrolling on mobile.
  2. **Responsive Navbar & Drawer:** Implemented a hamburger menu toggle in `Navbar.tsx` for `< 1024px` viewports, which opens a slide-down mobile drawer containing the center navigation links, BYOK badge, and UserNav.
  3. **Responsive Modals:** Forced the Auth Modal (`UserNav.tsx`) and BYOK Modal (`ByokModal.tsx`) to use `w-[92vw] max-w-md mx-auto` constraints to eliminate off-screen clipping on phones.
  4. **Home Page Scale & Stacking:** Made the giant Serif hero headline scale efficiently down to `4xl` on mobile in `app/page.tsx`. Set the hero split and CTAs to wrap naturally. Added the 3-tab ATS Robot X-Ray funnel visualizer explicitly in the right column and positioned the overlapping Circular Stamp Badge to snap within the top-right frame on mobile safely.
  5. **Analyzer & Workspace Mobile Grids:** Shifted the main Dual Dropzone (`UploadWorkspace.tsx`) to stack vertically cleanly on mobile (`grid-cols-1 md:grid-cols-2`), and wrapped the 10-Bucket Breakdown charts and Instant Rewrite views (`AuditDashboard.tsx`) to single columns on `< 1024px` viewports.
  6. **Jobs & Peer Feed Wrap Handling:** Modified `VerifiedJobsList.tsx` filter/location inputs to use `flex-wrap`, and shifted both the Jobs Feed and Peer Directory Grid (`app/directory/page.tsx`) to use a responsive card grid (`grid-cols-1 md:grid-cols-2 xl:grid-cols-3`).
  7. Verified `npx tsc --noEmit` (**0 errors**).
