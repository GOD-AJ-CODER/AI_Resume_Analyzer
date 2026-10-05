# Project Requirements Document (PRD): AI Resume Analyzer & Verified Job Discovery Engine

## 1. Project Overview & Core Vision
Build an ultra-fast, zero-maintenance web application that performs a hybrid deterministic + LLM-powered audit on user resumes, detects AI-generated fluff with humanized rewrites, matches candidates with verified fresh job postings filtered through a 3-layer anti-ghost-job pipeline, and offers an opt-in Peer Showcase Directory for domain-specific benchmarking.

---

## 2. Core Functional Requirements

### 2.1 Multi-Format Resume Ingestion & Pre-Processing
* **File Support:** Drag-and-drop upload supporting `.pdf` and `.docx` files (up to $5\text{ MB}$).
* **Evaluation Modes:**
  * **General Audit Mode:** Evaluates the resume standalone against industry engineering/professional standards.
  * **Targeted JD Match Mode:** Accepts an optional pasted Job Description (JD) to perform side-by-side keyword gap analysis and role alignment scoring.
* **Server-Side Text Sanitization:** Strip binary metadata, redundant whitespace, and non-printable characters before invoking the LLM to reduce token usage by $40\%$ to $50\%$.

---

### 2.2 Hybrid Resume Audit Engine

#### A. Deterministic Layout & ATS Sanity Layer (Zero AI Cost)
Executes locally on the server in $< 50\text{ ms}$:
* **Contact & Metadata Check:** Validates presence of Email, Phone Number, LinkedIn URL, and GitHub/Portfolio links.
* **Parser Hazard Detection:** Flags multi-column table traps, text missing standard section headers (`Experience`, `Education`, `Skills`, `Projects`), and overly dense character lines.
* **Word Count & Length Check:** Flags resumes that are too sparse ($< 250$ words) or bloated ($> 1000$ words for junior/mid-level profiles).

#### B. The 4-Pillar Semantic Logic Engine (Groq Llama-3.3-70B)
Evaluates the extracted resume text using four strict recruiter-aligned heuristics:
1. **The 6-Second Front-Load Rule:** Scans the first $3$ to $4$ words of every bullet point. Flags passive openings (e.g., *"Was responsible for..."*, *"Helped team with..."*) and shifts high-impact action verbs and core technologies to the front.
2. **Contextual Skills vs. Keyword Stuffing:** Cross-references every tool listed in the standalone `Skills` section against `Work Experience` and `Projects`. Flags isolated skills that lack project proof.
3. **Metric Density (Google X-Y-Z Formula):** Flags bullet points $> 15$ words that lack quantifiable metrics ($\%$, $\text{ms}$, $\$$, user scale, or time saved). Generates side-by-side rewrites using the structure: *Accomplished $[X]$ as measured by $[Y]$, by doing $[Z]$*.
4. **Seniority & Scope Calibration:** Checks whether action verbs and claimed architectural scope align with the candidate's total years of experience (e.g., flagging unrealistic enterprise-architect claims on an entry-level resume).

---

### 2.3 AI Detection & "De-AI" Humanizer Engine
Analyzes the resume for synthetic LLM generation and provides authentic human alternatives.

* **AI Generation Probability Score ($0\%$ to $100\%$):** Displays an overall percentage likelihood that the resume was copy-pasted from a generic LLM.
* **The 3 Detection Constraints:**
  1. **Lexical Clichés & Tropes:** Flags overused AI buzzwords (*"spearheaded"*, *"delved"*, *"tapestry"*, *"leveraged synergies"*, *"pivotal role"*, *"cutting-edge"*, *"seamlessly"*).
  2. **Metric-to-Adjective Ratio:** Flags high-adjective, zero-number sentences that sound impressive but communicate zero concrete engineering or business value.
  3. **Cadence Uniformity (Burstiness):** Detects monotonous sentence lengths (e.g., consecutive bullets all between $18$ and $22$ words following identical `[Verb] + [Task] + [Vague Outcome]` syntax).
* **Side-by-Side Humanizer Output:** For every bullet point flagged as AI-generated, provide a grounded, direct, human-toned rewrite that prioritizes specific tools and realistic outcomes over corporate fluff.

---

### 2.4 Real-Time Job Discovery & 3-Layer Credibility Pipeline
Uses extracted candidate roles, seniority, and top skills to query open job aggregator APIs (e.g., JSearch / Adzuna / Remotive) and filters them through three verification layers:

#### Layer 1: Deterministic Freshness & Sanity Filter
* **Strict Age Cap:** Hardcoded API filter restricting results to postings created within the last $3$ to $14$ days (`date_posted=week` or $\le 14\text{ days}$). Stale postings ($> 14\text{ days}$) are dropped automatically.
* **Source Classification:** Distinguishes direct employer ATS links (Greenhouse, Lever, Workday, Ashby) from third-party mass staffing/recruitment agencies.
* **Link Sanity:** Ensures a valid direct application URL exists.

#### Layer 2: "Ghost Job" & Red-Flag Audit
Evaluates job snippets to assign a **Credibility Badge**:
* **Unicorn Hunter Check:** Flags entry-level/junior roles demanding $5+$ years of experience across disconnected tech stacks for low pay.
* **Vague Scope Check:** Flags generic, evergreen descriptions that lack concrete team deliverables (a primary indicator of resume-harvesting ghost jobs).
* **Badge Assignment:**
  * 🟢 **High Intent:** Fresh posting ($\le 7\text{ days}$), direct company hire, clear deliverables and stack.
  * 🟡 **Medium / Cautious:** Reposted listing or slightly broad scope.
  * 🔴 **Low Intent / Red Flag:** Suspected ghost job, agency spam, or unrealistic unicorn requirements.

#### Layer 3: Hiring Probability Score & Tactical Edge
* **Match Odds Score ($0\%$ to $100\%$):** Calculated based on skill overlap and seniority fit.
* **1-Line Application Cheat-Sheet:** Provides a specific tactical instruction before the user applies (e.g., *"Move your FastAPI project to the top and explicitly mention Docker to pass their primary ATS filter"*).
* **Direct Apply Action:** One-click button linking straight to the job portal.

---

### 2.5 Lightweight Auth & Opt-In Peer Showcase Directory
* **Authentication (Supabase Auth / Clerk):**
  * Optional one-click OAuth via GitHub or Google.
  * Guest users can run scans immediately without forced login; signing in unlocks scan history and the Peer Directory.
* **Automatic Domain Classification:**
  * The LLM categorizes the user's profile into a standardized domain (e.g., `Frontend Engineering`, `Backend & Distributed Systems`, `Full-Stack`, `Data Science & ML`, `DevOps & Cloud`, `Product & Design`).
* **Opt-In Peer Showcase:**
  * Users can toggle: `[ ] Make my profile & score card visible to peers in my field`.
  * **Directory View:** Users browse anonymized or public profile cards of peers in their exact domain, displaying:
    * ATS Score Badge & Domain Tag.
    * Top $5$ Verified Skills.
    * Featured Project summary & optional GitHub/LinkedIn links.

---

## 3. UI/UX & Theme Requirements
* **Top Navigation Bar with Theme Toggle:**
  * Persistent top navbar containing brand logo, navigation links (`Analyzer`, `Verified Jobs`, `Peer Directory`), Auth status button, and an instant **Dark Mode / Light Mode Toggle** (`next-themes` with system preference support, defaulting to sleek Dark Mode).
* **Split-View Interactive Dashboard:**
  * **Tab 1 (Resume Doctor):** Circular score gauges (ATS Score, AI-Written Probability), deterministic format checklist, keyword gap badges (Matched vs. Missing), and the side-by-side Bullet Diff Rewriter (Original vs. X-Y-Z Humanized).
  * **Tab 2 (Verified Fresh Jobs):** Filterable job cards displaying the Freshness timestamp, Credibility Badge (🟢/🟡/🔴), Hiring Odds %, and the 1-line Tactical Tip.
  * **Tab 3 (Peer Directory):** Filterable grid by technical domain and experience tier.
* **Exportable Report:** One-click export of the audit results and rewritten bullets as a clean `.md` or printable PDF summary.

---

## 4. Non-Functional Requirements: Performance, Quota & Cost Protection
* **Zero-Cost Operation ($0 Budget):** Powered by Groq Cloud API (`llama-3.3-70b-versatile`) free tier and free-tier job APIs + Supabase free tier.
* **Sub-2-Second Execution:** Use `Promise.all` to run deterministic checks, Groq LLM inference, and job API fetching concurrently.
* **SHA-256 Deduplication Caching:** Hash `resume_text + jd_text`. Repeated scans of identical inputs return cached JSON immediately without consuming LLM tokens.
* **IP Rate Limiting:** Restrict anonymous users to $3\text{ scans per hour}$ per IP to prevent automated scraping or credit exhaustion.
* **Bring Your Own Key (BYOK) Fallback:** Include a settings modal where users can optionally paste their own free Groq API key to bypass rate limits.