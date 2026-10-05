# PHASES.md — End-to-End Execution Roadmap & Verification Checkpoints

## Overview & Execution Law for AntiGravity
This project is built across **5 sequential phases**. 
* **Strict Rule:** Do NOT skip ahead to a later phase until the current phase's **Verification Checkpoint** passes with zero TypeScript (`tsc --noEmit`) or runtime errors.
* After completing each phase, immediately update `memory.md` to mark completed tasks and log any environment or schema adjustments.


Copy each block below using the copy button in the top-right corner of each box and save them as phases.md and memory.md.
File 5: phases.md
Markdown

# PHASES.md — End-to-End Execution Roadmap & Verification Checkpoints

## Overview & Execution Law for AntiGravity
This project is built across **5 sequential phases**. 
* **Strict Rule:** Do NOT skip ahead to a later phase until the current phase's **Verification Checkpoint** passes with zero TypeScript (`tsc --noEmit`) or runtime errors.
* After completing each phase, immediately update `memory.md` to mark completed tasks and log any environment or schema adjustments.

Phase 1: Foundation, Dual-Theme Top Bar & Deterministic Ingestion Engine

Objective: Initialize the Next.js App Router workspace, build the sticky top navigation bar with the hydration-safe Dark/Light mode toggle, implement server-side PDF/DOCX text extraction, and run the 0ms deterministic ATS checks.
1.1 Workspace & Theme Setup

    [ ] 1.1.1: Initialize Next.js (App Router, TypeScript strict mode, Tailwind CSS, ESLint) and install core dependencies:

        lucide-react, next-themes, clsx, tailwind-merge, zod

        pdf-parse (plus @types/pdf-parse), mammoth

    [ ] 1.1.2: Configure Tailwind for class-based dark mode (darkMode: ["class"]) and map the Slate (Light) and Zinc (Dark) surface tokens defined in design.md.

    [ ] 1.1.3: Create components/providers/ThemeProvider.tsx wrapping the root layout in app/layout.tsx with attribute="class", defaultTheme="dark", and enableSystem.

    [ ] 1.1.4: Build components/layout/ThemeToggle.tsx with a mounted state guard (useEffect) so switching between Sun (Light Mode) and Moon (Dark Mode) in the top bar causes zero SSR hydration mismatch.

    [ ] 1.1.5: Build components/layout/Navbar.tsx containing the brand identity (ResumeOS), view navigation links (Analyzer, Verified Jobs, Peer Directory), the BYOK / Quota pill button, the ThemeToggle button, and the Sign In / Showcase trigger.

1.2 Document Parsing & Normalization Pipeline

    [ ] 1.2.1: Create lib/parsers/document-parser.ts (enforcing Node.js runtime) to accept a File buffer (application/pdf or .docx up to 5MB), extract raw text, and strip binary artifacts.

    [ ] 1.2.2: Create lib/parsers/text-normalizer.ts to collapse redundant blank lines, normalize bullet characters, and reduce unnecessary token bloat by 35–50% before LLM submission.

    [ ] 1.2.3: Create lib/crypto/hash.ts using Node's native crypto.createHash('sha256') to generate a deterministic cache key from normalizedResumeText + "::" + normalizedJdText.

1.3 Deterministic ATS & Format Engine (0ms Cost-Free Layer)

    [ ] 1.3.1: Create lib/engines/ats-deterministic.ts implementing pure TypeScript checks:

        Contact & Profile Metadata Check: Regex verification for email, phone number, GitHub, and LinkedIn URLs.

        Parser-Safe Layout Heuristic: Detects broken multi-column line-wrapping anomalies, table artifacts, or missing standard headers (Experience, Projects, Education, Skills).

        Contextual Skill Cross-Check: Compares technologies listed in the Skills block against the body of Experience and Projects to flag unverified/isolated skills.

        Lexical Cliché Pre-Scanner: Dictionary scan counting high-probability AI buzzwords ("spearheaded", "delved", "synergy", "orchestrated", "cutting-edge", "seamlessly", "tapestry").

    [ ] 1.3.2: Build components/analyzer/UploadWorkspace.tsx (drag-and-drop PDF/DOCX dropzone + optional Target Job Description textarea + "Try Sample Resume" button).

Phase 1 Verification Checkpoint

    Top bar Dark/Light mode button toggles the entire application palette between Slate Light and Zinc Dark with zero console warnings.

    Uploading a PDF or DOCX extracts normalized text and renders the deterministic format checklist in under 100ms.

Phase 2: Groq Llama-3.3 Audit Engine, AI Detector & X-Y-Z Humanizer

Objective: Integrate Groq Cloud (llama-3.3-70b-versatile) with strict Zod JSON validation to power the 4-Pillar Logic Engine, AI-written probability scoring, and side-by-side Google X-Y-Z bullet point rewrites.
2.1 Strict Schemas & Groq Client

    [ ] 2.1.1: Install groq-sdk and create lib/schemas/audit.schema.ts defining the complete Zod validation schema (ResumeAuditSchema) matching architecture.md:

        atsScore (0–100), aiDetection (probability 0–100, clichesFound, metricToAdjectiveRatio, cadenceVerdict), detectedDomain, experienceTier

        logicPillars (frontLoadScore, contextualSkillProof, metricDensityScore, seniorityAlignment)

        keywordMatrix (matched, missingCritical, unprovenInProjects)

        bulletCritiques (array of { original, aiRiskScore, flaggedBuzzwords, pillarViolated, humanizedXyzRewrite, metricsAdded })

        extractedSearchProfile (targetTitles, topVerifiedSkills, seniorityKeyword)

    [ ] 2.1.2: Create lib/ai/groq-client.ts supporting:

        Primary server environment variable process.env.GROQ_API_KEY

        Optional user-supplied header x-custom-api-key (for BYOK mode)

        Strict JSON enforcement (response_format: { type: "json_object" }, temperature: 0.2).

    [ ] 2.1.3: Create lib/ai/prompts/resume-audit.prompt.ts embedding the 3 AI Detection Constraints (Lexical Clichés, Metric-to-Adjective Ratio, Cadence Burstiness) and the 4-Pillar Logic Rules (6-Second Front-Load, Contextual Skills, Google X-Y-Z Metric Density, Seniority Calibration).

2.2 Split-View Dashboard UI (Tab 1: Resume Deep Audit)

    [ ] 2.2.1: Build components/analyzer/ScoreHeader.tsx with dual SVG radial gauges for ATS Match (0–100) and AI-Written Risk (0–100%), plus the auto-detected Engineering Domain badge.

    [ ] 2.2.2: Build components/analyzer/FormatCheckCard.tsx displaying the 5 deterministic layout & parser checks in the left sticky sidebar.

    [ ] 2.2.3: Build components/analyzer/AiDetectionCard.tsx rendering the 3 heuristic progress bars and rose-highlighted AI buzzword pills.

    [ ] 2.2.4: Build components/analyzer/LogicPillarsGrid.tsx (2x2 diagnostic grid for the 4 Recruiter Logic Pillars).

    [ ] 2.2.5: Build components/analyzer/BulletDiffCard.tsx showing the side-by-side Original Bullet (with rose == tags around AI clichés) vs Humanized Google X-Y-Z Rewrite (with emerald underlined metrics and a 1-click Copy Rewrite button).

    [ ] 2.2.6: Build components/analyzer/KeywordMatrix.tsx displaying Matched, Missing Critical, and Unproven Listed skills.

Phase 2 Verification Checkpoint

    Submitting a resume (+ optional JD) hits /api/analyze and returns a Zod-validated JSON payload from Groq llama-3.3-70b-versatile in under 1.8 seconds.

    Every weak or AI-heavy bullet renders in BulletDiffCard.tsx with accurate cliché highlights and a concrete, human-sounding Google X-Y-Z replacement.

Phase 3: 3-Layer Job Credibility & Anti-Ghost Job Pipeline

Objective: Automatically query live job postings using the skills and role titles extracted from the user's resume, then filter every listing through the 3-Layer Credibility Engine to eliminate stale postings and ghost jobs.
3.1 Live Job Aggregator & Layer 1 (Deterministic Freshness Filter)

    [ ] 3.1.1: Create lib/jobs/job-fetcher.ts connecting to JSearch API (rapidapi) / Adzuna API with a graceful fallback dataset if the external job API key is unconfigured in local dev.

    [ ] 3.1.2: Hardcode Layer 1 Deterministic Filters in lib/jobs/layer1-sanity.ts:

        Enforce date_posted=week (strictly reject any job where postedAgeDays > 14).

        Validate applyUrl protocol and drop malformed/expired links.

        Classify source domain: tag direct employer ATS links (greenhouse.io, lever.co, myworkdayjobs.com, ashbyhq.com) as Direct Employer ATS and flag known bulk staffing aggregators as Third-Party Agency.

3.2 Layer 2 (Ghost Job & Red-Flag Audit) & Layer 3 (Hiring Odds + Tactical Edge)

    [ ] 3.2.1: Create lib/jobs/layer2-3-credibility.ts executing a lightweight batch evaluation via Groq (llama-3.3-70b-versatile or llama-3.1-8b-instant for ultra-low token cost) on the top 8–12 Layer-1-verified jobs:

        Layer 2 Checks: Flag "Unicorn Hunter" mismatches (e.g., entry-level/junior role demanding 5+ years across 10+ tools) and vague, deliverable-free evergreen descriptions. Assign credibilityScore (0–100) and badge (HIGH_INTENT 🟢, CAUTIOUS 🟡, RED_FLAG 🔴).

        Layer 3 Checks: Compute hiringOddsPercent (0–100%) against the user's resume and generate a 1-sentence tacticalEdgeTip telling the candidate exactly which project or skill to front-load before clicking apply.

    [ ] 3.2.2: Wire Promise.allSettled inside /api/analyze/route.ts so the Deterministic ATS Engine, Groq Resume Audit, and 3-Layer Job Pipeline execute concurrently without blocking each other.

3.3 Verified Job Radar UI (Tab 2)

    [ ] 3.3.1: Build components/jobs/VerifiedJobsList.tsx with the pipeline transparency header (Scanned X postings -> Y verified fresh jobs), sort selector (Highest Hiring Odds, Newest First, Highest Credibility), and a toggle to show/hide filtered red-flag jobs.

    [ ] 3.3.2: Build components/jobs/JobCard.tsx rendering the Layer 1 Freshness pill, Layer 2 Intent badge, Layer 3 Hiring Odds badge, the indigo Tactical Edge callout box, matched/missing skill pills, and the direct apply link.

Phase 3 Verification Checkpoint

    Job results never contain postings older than 14 days.

    Each job card clearly displays its 3-Layer verification breakdown, a tailored Tactical Edge tip referencing the user's actual resume projects, and a working apply link.

Phase 4: Supabase Auth & Opt-In Peer Showcase Directory

Objective: Add lightweight Google/GitHub OAuth via Supabase and build the opt-in Peer Directory where users can benchmark their resume scores and verified project bullets against peers in the same engineering domain.
4.1 Supabase Client & Database Schema

    [ ] 4.1.1: Install @supabase/supabase-js and @supabase/ssr. Create lib/supabase/client.ts and lib/supabase/server.ts.

    [ ] 4.1.2: Create supabase/migrations/001_init_schema.sql containing the SQL tables and Row-Level Security (RLS) policies defined in architecture.md:

        profiles (user metadata, domain, experience tier)

        peer_showcase (opt-in flag is_public, display_name, is_anonymous, domain, ats_score, human_tone_score, verified_skills, top_xyz_bullet, github_url, linkedin_url)

        scan_cache (input_hash primary key, audit_payload, jobs_payload, created_at, expires_at)

    [ ] 4.1.3: Build /auth/callback/route.ts and components/layout/UserNav.tsx for one-click sign-in and sign-out.

4.2 Peer Showcase Publishing & Directory UI

    [ ] 4.2.1: Create /api/directory/route.ts (GET filtered by engineering domain; POST/PATCH for authenticated users toggling their showcase card).

    [ ] 4.2.2: Build app/directory/page.tsx and components/directory/PeerCard.tsx featuring:

        Domain filter bar (All, Backend & Distributed Systems, Frontend & UI, AI, ML & Data Science, Cybersecurity, Linux & Systems, Full-Stack Web).

        Peer cards displaying verified ATS score, Human Tone %, top 5 project-proven skills, and their highest-scoring Google X-Y-Z bullet point.

        Seed fallback showcase cards so the directory looks populated and interactive even before external users sign up.

Phase 4 Verification Checkpoint

    Authenticated users can toggle "Showcase My Profile" from either the dashboard sidebar or top bar, choosing between their real name or an anonymized handle (Dev #4092).

    Filtering by domain in /directory updates the benchmark grid instantaneously.

Phase 5: Quota Hardening, BYOK Mode, Export & Production Deployment

Objective: Lock down API credit protection so free-tier quotas never burn out, add one-click Markdown report export, and verify production build readiness for Vercel + custom domain mapping.
5.1 Zero-Cost Quota Protection & BYOK Modal

    [ ] 5.1.1: Connect SHA-256 deduplication cache in /api/analyze/route.ts: if input_hash exists in scan_cache (or in-memory LRU cache fallback) within the last 24 hours, return the cached audit in < 50ms with 0 LLM tokens spent.

    [ ] 5.1.2: Implement IP-based rate limiting (lib/security/rate-limiter.ts) allowing 3 free scans per hour per IP when using the server's default API key.

    [ ] 5.1.3: Build components/modals/ByokModal.tsx allowing users to paste their own free Groq or Gemini API key into localStorage. When present, bypass the server IP rate limit and pass the key via x-custom-api-key.

5.2 Report Exporter & Final Production Polish

    [ ] 5.2.1: Create lib/export/markdown-exporter.ts to generate and download a formatted resume-audit-report.md containing the user's scores, 4-pillar diagnostics, missing keywords, and all Before/After bullet rewrites.

    [ ] 5.2.2: Run full production verification:

        npx tsc --noEmit (Zero TypeScript errors)

        npm run lint (Zero ESLint errors)

        npm run build (Clean Next.js production build)

    [ ] 5.2.3: Configure .env.example documenting GROQ_API_KEY, JSEARCH_API_KEY, NEXT_PUBLIC_SUPABASE_URL, and NEXT_PUBLIC_SUPABASE_ANON_KEY.

Phase 5 Verification Checkpoint

    Re-uploading the exact same resume + JD returns an instant [⚡ Cache Hit] badge in under 50ms without calling Groq.

    Entering a custom Groq API key in the top bar BYOK modal unlocks unlimited scans.

    npm run build succeeds cleanly for immediate Vercel deployment.