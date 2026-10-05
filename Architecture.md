# System Architecture Document: AI Resume Analyzer & Verified Job Discovery Engine

## 1. Tech Stack & Core Dependencies

* **Framework:** Next.js (App Router, TypeScript, Server Route Handlers)
* **Styling & Theme:** Tailwind CSS, `shadcn/ui`, `next-themes` (Dark/Light Mode support in Top Navbar), `lucide-react`
* **AI Inference Engine:** `groq-sdk` running `llama-3.3-70b-versatile` (JSON Object Mode)
* **Document Parsing (Server-Side):**
  * PDF Extraction: `pdf-parse` (or `unpdf` for edge compatibility)
  * DOCX Extraction: `mammoth`
* **Database & Authentication:** Supabase (`@supabase/supabase-js`, `@supabase/ssr`) — PostgreSQL + OAuth (GitHub / Google)
* **Job Discovery API:** JSearch API (RapidAPI) or Adzuna / Remotive REST API (with deterministic fallback mock generator if API key is absent in dev)
* **Validation & Cryptography:** `zod` (strict runtime schema parsing), Node native `crypto` (`SHA-256` hashing)

---

## 2. High-Level System Data Flow & Parallel Pipeline

To achieve a total execution time of $< 2\text{ seconds}$, the backend uses a non-blocking parallel execution architecture:

```
[ Client Browser (Next.js UI) ]
   │  Uploads PDF/DOCX + Optional JD + Optional Header (x-groq-api-key)
   ▼
[ POST /api/analyze ]
   │
   ├─► 1. IP Rate Limit Check (Bypassed if BYOK header present)
   ├─► 2. In-Memory Text Extraction & Sanitization (Strip binary/whitespace)
   ├─► 3. SHA-256 Hash Generation: H(clean_resume_text + clean_jd_text)
   │      └──► [Cache Hit?] ──► Return Cached JSON from Supabase (< 100ms)
   │
   └─► 4. [Cache Miss] Parallel Execution Pipeline (Promise.all):
          │
          ├──► Thread A: Deterministic ATS Engine (< 30ms)
          │      • Regex validation (Email, Phone, LinkedIn, GitHub)
          │      • Section header check, word count, multi-column table trap check
          │
          └──► Thread B: Groq LLM Semantic & AI-Detection Engine (~900ms - 1400ms)
                 • 4-Pillar Logic Evaluation (6-sec front-load, contextual skills, X-Y-Z metrics, seniority)
                 • AI Generation Probability (0-100%) + De-AI Humanized Bullet Rewrites
                 • Candidate Metadata Extraction (Domain, Target Roles, Top 5 Skills, YoE)
                        │
                        ▼
          [ POST /api/jobs/discover ] (Triggered automatically with extracted metadata)
                 │
                 ├─► Layer 1: Fetch Jobs (date_posted <= 14 days) + ATS Source Classification
                 └─► Layer 2 & 3: Batch Groq Micro-Audit (Ghost Job Badge + Hiring Odds % + 1-Line Tip)
```

---

## 3. Project Directory Structure

```text
src/
├── app/
│   ├── layout.tsx                 # Root layout with ThemeProvider (Dark/Light mode) & TopNavbar
│   ├── page.tsx                   # Main Split-View Workspace (Upload + Dashboard Tabs)
│   ├── directory/
│   │   └── page.tsx               # Opt-In Peer Showcase Directory Page
│   ├── auth/
│   │   └── callback/route.ts      # Supabase OAuth callback handler
│   └── api/
│       ├── analyze/route.ts       # Core PDF/DOCX ingestion, ATS check, Groq audit & caching
│       ├── jobs/route.ts          # 3-Layer Job Discovery & Ghost-Job Verification API
│       └── directory/route.ts     # GET/POST Peer Showcase profiles
├── components/
│   ├── layout/
│   │   ├── TopNavbar.tsx          # Brand, Nav links, ThemeToggle, BYOK Settings, Auth Button
│   │   ├── ThemeToggle.tsx        # Dark / Light mode switch using next-themes
│   │   └── ByokModal.tsx          # Bring-Your-Own-Key localStorage configuration modal
│   ├── analyzer/
│   │   ├── UploadDropzone.tsx     # Drag & drop PDF/DOCX + JD textarea
│   │   ├── ScoreGauges.tsx        # Circular gauges: ATS Score, AI-Written %, JD Match %
│   │   ├── DeterministicAudit.tsx # Contact checks, section warnings, formatting flags
│   │   ├── AiHumanizerDiff.tsx    # Side-by-side AI-flagged bullets vs. Humanized X-Y-Z rewrites
│   │   └── KeywordMatrix.tsx      # Contextual skills vs. isolated skills + missing JD keywords
│   ├── jobs/
│   │   ├── JobFeed.tsx            # Filterable list of verified fresh jobs
│   │   └── JobCard.tsx            # Freshness badge, Credibility (Green/Amber/Red), Odds %, 1-line tip
│   └── directory/
│       ├── PeerGrid.tsx           # Domain-filtered grid of opted-in peers
│       └── PeerOptInCard.tsx      # Toggle switch to publish/unpublish user's audited card
├── lib/
│   ├── parsers/
│   │   ├── extractText.ts         # PDF & DOCX buffer-to-clean-string extractor
│   │   └── deterministicAts.ts    # Zero-AI regex & structural layout analyzer
│   ├── ai/
│   │   ├── groqClient.ts          # Groq SDK initializer (supports Server Key or BYOK header)
│   │   ├── prompts.ts             # System prompts for Resume Audit & Layer 2/3 Job Verification
│   │   └── schemas.ts             # Strict Zod schemas for LLM JSON output validation
│   ├── jobs/
│   │   └── jobPipeline.ts         # JSearch/Adzuna fetcher + Layer 1 deterministic filter
│   ├── supabase/
│   │   ├── client.ts              # Browser Supabase client
│   │   └── server.ts              # Server-side Supabase client
│   └── utils/
│       ├── hash.ts                # SHA-256 generator
│       └── rateLimit.ts           # IP-based rate limiter (3 req / hour for anonymous users)
└── types/
    └── index.ts                   # Shared TypeScript interfaces across Frontend & Backend
```

---

## 4. Database Schema (Supabase PostgreSQL)

Run the following SQL migrations inside the Supabase SQL Editor:

```sql
-- 1. Scan Cache Table (SHA-256 Deduplication to save LLM quota)
CREATE TABLE public.scan_cache (
    input_hash TEXT PRIMARY KEY,
    audit_payload JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. IP Rate Limiting Table (Zero-Redis serverless rate limiting)
CREATE TABLE public.rate_limits (
    ip_address TEXT PRIMARY KEY,
    scan_count INT DEFAULT 1,
    window_start TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Peer Showcase Directory Table (Opt-In Public Profiles)
CREATE TABLE public.peer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    display_name TEXT NOT NULL,
    domain TEXT NOT NULL, -- e.g., 'Backend & Distributed Systems', 'Frontend Engineering'
    experience_level TEXT NOT NULL, -- 'Intern/Entry', 'Junior (1-2 yrs)', 'Mid-Level', 'Senior'
    ats_score INT NOT NULL CHECK (ats_score >= 0 AND ats_score <= 100),
    ai_probability_score INT NOT NULL CHECK (ai_probability_score >= 0 AND ai_probability_score <= 100),
    verified_skills TEXT[] NOT NULL DEFAULT '{}',
    top_project_summary TEXT NOT NULL,
    github_url TEXT,
    linkedin_url TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast Peer Directory filtering
CREATE INDEX idx_peer_profiles_domain ON public.peer_profiles(domain) WHERE is_public = TRUE;
CREATE INDEX idx_peer_profiles_score ON public.peer_profiles(ats_score DESC) WHERE is_public = TRUE;

-- Enable Row Level Security (RLS)
ALTER TABLE public.peer_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Peer Directory
CREATE POLICY "Public profiles are viewable by everyone"
ON public.peer_profiles FOR SELECT
USING (is_public = TRUE OR auth.uid() = user_id);

CREATE POLICY "Users can upsert their own profile"
ON public.peer_profiles FOR ALL
USING (auth.uid() = user_id);
```

---

## 5. Strict Data Contracts & TypeScript Interfaces

All LLM responses must use `response_format: { type: "json_object" }` and be validated against these exact interfaces:

```typescript
// src/types/index.ts

export type TechnicalDomain =
  | "Frontend Engineering"
  | "Backend & Distributed Systems"
  | "Full-Stack Engineering"
  | "Data Science & ML"
  | "DevOps & Cloud Infrastructure"
  | "Mobile Development"
  | "Cybersecurity"
  | "Product & Design";

export interface DeterministicAtsResult {
  hasEmail: boolean;
  hasPhone: boolean;
  hasLinkedin: boolean;
  hasGithubOrPortfolio: boolean;
  wordCount: number;
  wordCountStatus: "optimal" | "too_short" | "too_long";
  missingSections: string[];
  hasTableOrColumnRisk: boolean;
  deterministicScore: number; // 0 - 100
}

export interface BulletCritique {
  originalText: string;
  isAiFlagged: boolean;
  aiDetectionReason?: string; // Lexical clichés, zero metrics, or uniform burstiness
  violatedPillars: ("front_load_rule" | "missing_metrics" | "weak_verb" | "scope_mismatch")[];
  humanizedRewrite: string; // Rewritten using Google X-Y-Z formula in grounded human tone
}

export interface SkillVerification {
  contextualizedSkills: string[]; // Found in both Skills section AND Experience/Projects
  isolatedSkills: string[];       // Listed in Skills section ONLY (Keyword stuffing risk)
  missingJdKeywords: string[];    // Required by JD but absent from resume
}

export interface SemanticAuditResult {
  overallAtsScore: number;        // 0 - 100
  aiGeneratedProbability: number; // 0 - 100%
  aiSummaryVerdict: string;
  detectedDomain: TechnicalDomain;
  extractedTargetRoles: string[];
  experienceLevel: "Entry/Intern" | "Junior (1-2 yrs)" | "Mid-Level (3-5 yrs)" | "Senior (5+ yrs)";
  topFiveVerifiedSkills: string[];
  featuredProjectSummary: string;
  tailoredSummaryRewrite: string;
  skillAnalysis: SkillVerification;
  bulletCritiques: BulletCritique[];
}

export interface VerifiedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  postedDaysAgo: number;          // Must be <= 14
  sourceType: "Direct ATS" | "Company Portal" | "Staffing Agency";
  applyUrl: string;
  credibilityBadge: "HIGH_INTENT" | "CAUTIOUS" | "RED_FLAG";
  credibilityReason: string;      // Explanation from Layer 2 Ghost-Job check
  hiringOddsScore: number;        // 0 - 100%
  tacticalTip: string;            // 1-line actionable resume tweak for this specific role
}
```

---

## 6. Quota Protection, Rate Limiting & BYOK Mechanics

1. **Text Sanitization (`extractText.ts`):**
   * Collapse multiple spaces/newlines into single spaces (`text.replace(/\s+/g, ' ').trim()`).
   * Hard-truncate input at $12,000\text{ characters}$ ($\approx 3,000\text{ tokens}$) to guarantee every Groq request stays well within free-tier token-per-minute (TPM) limits.
2. **IP Rate Limiting (`rateLimit.ts`):**
   * Extract client IP from `x-forwarded-for`.
   * If `x-custom-groq-key` request header is present and valid, bypass rate limiting completely.
   * Otherwise, query `public.rate_limits`: allow maximum $3\text{ requests per } 60\text{-minute rolling window}$. Return HTTP `429 Too Many Requests` with a prompt encouraging the user to enter a free Groq key in the BYOK modal.
3. **Resilient Job API Fallback:**
   * If the external Job API (`JSEARCH_API_KEY`) is rate-limited or unconfigured in local development, `jobPipeline.ts` automatically falls back to generating realistic, domain-matched live search structures with direct LinkedIn/Greenhouse Boolean URLs so the UI never crashes.