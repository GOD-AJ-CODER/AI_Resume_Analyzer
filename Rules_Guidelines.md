# Development Rules & Guardrails (`rules.md`)

> **CRITICAL DIRECTIVE FOR AI CODING AGENT (ANTIGRAVITY):**
> You must read and obey every rule in this file before creating or modifying any code. Violating these constraints will break the build, exhaust free-tier API quotas, or corrupt the application architecture.

---

## 1. Workflow & Context Discipline

1. **Source-of-Truth Hierarchy:**
   * Always cross-reference `project_requirement.md`, `architecture.md`, `design.md`, and `phases.md` before writing code.
   * After completing any task or sub-phase, immediately update `memory.md` with completed files, architectural state, and the next step.
2. **Strict Dependency Lock (Zero Hallucinated Packages):**
   * Only install and use packages explicitly defined in `architecture.md`:
     * Core: `next`, `react`, `react-dom`, `typescript`, `zod`
     * Styling & UI: `tailwindcss`, `next-themes`, `lucide-react`, `clsx`, `tailwind-merge`, `shadcn/ui` primitives
     * AI & Parsing: `groq-sdk`, `pdf-parse` (or `unpdf`), `mammoth`
     * Backend/Auth: `@supabase/supabase-js`, `@supabase/ssr`
   * **FORBIDDEN:** Do not install heavy headless browsers (`puppeteer`, `playwright`, `selenium`), complex state libraries (`redux`), or paid third-party AI wrappers (`langchain` bloat).
3. **Incremental Verification:**
   * Never generate 15 files at once without verifying types and imports. Build and verify module-by-module according to `phases.md`.

---

## 2. TypeScript & Next.js App Router Guardrails

1. **Zero `any` Policy:**
   * `any` is strictly prohibited. All data structures must import and adhere to the interfaces in `src/types/index.ts`.
   * Every external payload (LLM responses, Job API responses, Request bodies) must be parsed through `zod` schemas in `src/lib/ai/schemas.ts`.
2. **Server vs. Client Component Boundaries:**
   * Default all components to React Server Components (RSC).
   * Add `"use client"` at the very top of a file **only** when the component uses React hooks (`useState`, `useEffect`), browser APIs (`localStorage` for BYOK), interactive event handlers, or `next-themes`.
   * **CRITICAL:** Never import `pdf-parse`, `mammoth`, `crypto`, or server-side Supabase/Groq clients inside a `"use client"` file. All document extraction and LLM inference must happen strictly inside `src/app/api/**/route.ts`.
3. **Node.js Runtime for Document Parsing:**
   * In `src/app/api/analyze/route.ts`, explicitly export `export const runtime = "nodejs";` at the top of the file so `Buffer`, `crypto`, `pdf-parse`, and `mammoth` execute without Edge runtime crashes.

---

## 3. Quota Protection & $0 Cost Enforcement Rules

1. **Mandatory Text Sanitization Before LLM Calls:**
   * Never send raw PDF/DOCX buffers or base64 strings to Groq.
   * Strip redundant whitespace, non-ASCII control characters, and collapse multiple newlines (`text.replace(/\s+/g, " ").trim()`).
   * Hard-truncate extracted resume text at $12,000\text{ characters}$ ($\approx 3,000\text{ tokens}$) and JD text at $6,000\text{ characters}$ to guarantee we never exceed Groq's free-tier Token-Per-Minute (TPM) limits.
2. **SHA-256 Deduplication First:**
   * Before calling Groq in `/api/analyze`, compute `SHA-256(clean_resume_text + "::" + clean_jd_text)`.
   * Query Supabase `public.scan_cache` for `input_hash`. If found, return the cached JSON payload immediately ($0\text{ tokens}$ used).
3. **Strict IP Rate Limiting & BYOK Bypass:**
   * Check if the incoming request includes a non-empty `x-custom-groq-key` header (from the user's BYOK modal).
   * If `x-custom-groq-key` is provided: instantiate `new Groq({ apiKey: customKey })` and **bypass** server IP rate limits.
   * If using the server's `process.env.GROQ_API_KEY`: enforce a strict limit of $3\text{ scans per } 60\text{-minute window}$ per IP address via `src/lib/utils/rateLimit.ts`. When exceeded, return HTTP `429` with a structured error flag `{ error: "RATE_LIMIT_EXCEEDED", openByokModal: true }`.
4. **Parallel Execution Mandate:**
   * Always run independent checks concurrently using `Promise.all([runDeterministicAts(text), runGroqSemanticAudit(text, jd)])` to keep end-to-end latency $< 2\text{ seconds}$.

---

## 4. LLM Prompting & AI-Detection Rules (`llama-3.3-70b-versatile`)

1. **Strict JSON Mode:**
   * Every Groq API call must specify:
     * `model: "llama-3.3-70b-versatile"`
     * `temperature: 0.2` (for consistent, deterministic scoring)
     * `response_format: { type: "json_object" }`
2. **Enforcing the 3 AI-Detection Constraints:**
   * Your system prompt in `src/lib/ai/prompts.ts` must explicitly instruct the LLM to flag bullets and calculate `aiGeneratedProbability` ($0\%$ to $100\%$) based on:
     1. **Lexical Clichés:** Flag words like *"spearheaded"*, *"delved"*, *"tapestry"*, *"leveraged synergies"*, *"pivotal role"*, *"seamlessly"*, *"cutting-edge"*, *"testament"*, *"fostered"*, *"orchestrated"*.
     2. **Metric-to-Adjective Ratio:** Flag sentences with $\ge 2$ fluffy adjectives/adverbs and $0$ hard numbers.
     3. **Cadence Uniformity (Burstiness):** Flag resumes where $> 70\%$ of bullets have uniform word lengths ($18\text{ to } 22\text{ words}$) and identical `[Action Verb] + [Vague Task] + [To achieve X]` structure.
3. **Enforcing the 4-Pillar Humanizer Rewrites:**
   * Every rewritten bullet point (`humanizedRewrite`) must:
     * Start with a concrete engineering verb and core tool within the **first $4\text{ words}$** (6-Second Front-Load Rule).
     * Follow the **Google X-Y-Z Formula** (*Accomplished $[X]$ as measured by $[Y]$, by doing $[Z]$*). If the user's original bullet lacks a number, insert a realistic bracketed placeholder like `[X%]` or `[X ms]` so the user knows exactly what metric to fill in—**never invent fake statistics as facts**.
     * Sound like a real engineer wrote it (direct, concise, zero corporate buzzwords).

---

## 5. Job Discovery & 3-Layer Credibility Rules

1. **No LinkedIn Scraping or Cookie Hacks:**
   * Never attempt to scrape LinkedIn directly or use cookie-based MCP tools.
2. **Layer 1 Hard Constraints:**
   * Filter out any job where `postedDaysAgo > 14`.
   * Classify URLs containing `greenhouse.io`, `lever.co`, `myworkdayjobs.com`, `ashbyhq.com`, or direct company domains as `"Direct ATS"` or `"Company Portal"`. Classify known mass staffing domains as `"Staffing Agency"`.
3. **Resilient Fallback Mode:**
   * If `process.env.JSEARCH_API_KEY` is missing, expired, or returns an error, `src/lib/jobs/jobPipeline.ts` **must not throw a 500 error**. Instead, gracefully generate verified-format smart job cards using the candidate's extracted `extractedTargetRoles` and `topFiveVerifiedSkills` with direct Boolean search URLs for Greenhouse, Lever, and LinkedIn (filtered to past week `f_TPR=r604800`).

---

## 6. UI, Styling & Dark/Light Mode Rules

1. **Mandatory Dark & Light Mode Parity:**
   * The Top Navigation Bar (`TopNavbar.tsx`) must always render `ThemeToggle.tsx` allowing instant switching between **Dark Mode** and **Light Mode** via `next-themes`.
   * Never hardcode dark-only or light-only hex colors. Always pair semantic Tailwind classes (e.g., `bg-white dark:bg-slate-900`, `text-slate-900 dark:text-slate-100`, `border-slate-200 dark:border-slate-800`).
2. **Semantic Status Colors:**
   * **High Match / High Intent / Optimal ($80\text{--}100$):** Emerald (`text-emerald-600 dark:text-emerald-400`, `bg-emerald-500/10`)
   * **Medium / Cautious ($50\text{--}79$):** Amber (`text-amber-600 dark:text-amber-400`, `bg-amber-500/10`)
   * **Red Flag / High AI Fluff / Missing ($< 50$):** Rose (`text-rose-600 dark:text-rose-400`, `bg-rose-500/10`)

---

## 7. Security & Privacy Rules

1. **Secret Key Isolation:**
   * `GROQ_API_KEY`, `JSEARCH_API_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` must **never** be prefixed with `NEXT_PUBLIC_`.
   * Only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are allowed on the client.
2. **Privacy-First Peer Directory:**
   * Guests can analyze resumes without logging in.
   * Authenticated users' profiles in `public.peer_profiles` must default to `is_public = false`. A profile is only shown in `/directory` when the user explicitly toggles the opt-in switch.