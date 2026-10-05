import { Layer1VerifiedJob } from "@/lib/jobs/layer1-sanity";
import { getGroqClient } from "@/lib/ai/groq-client";

export interface VerifiedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  postedDaysAgo: number;
  sourceType: "Direct ATS" | "Company Portal" | "Staffing Agency" | "Government Portal" | "Job Board";
  applyUrl: string;
  credibilityBadge: "HIGH_INTENT" | "CAUTIOUS" | "RED_FLAG";
  credibilityReason: string;
  hiringOddsScore: number;
  tacticalTip: string;
  matchedSkills: string[];
  missingSkills: string[];
}

const FALLBACK_JOB_MODELS = [
  process.env.GROQ_MODEL,
  "openai/gpt-oss-120b",
  "qwen/qwen3.8-27b",
  "openai/gpt-oss-20b",
].filter(Boolean) as string[];

export async function runLayer2And3CredibilityPipeline(
  layer1Jobs: Layer1VerifiedJob[],
  candidateSkills: string[],
  candidateTier: string = "Mid-Level (3-5 yrs)",
  customApiKey?: string | null,
  location?: string,
  workPreference?: string
): Promise<VerifiedJob[]> {
  if (!layer1Jobs || layer1Jobs.length === 0) return [];

  // Try running Groq batch micro-audit first if API key is present
  try {
    const groq = getGroqClient(customApiKey);
    const systemPrompt = `You are an expert Anti-Ghost Job Verification Engine and Hiring Odds Calculator.
Evaluate the following array of job postings against candidate skills: [${candidateSkills.join(", ")}] and candidate seniority: "${candidateTier}".
Target Location: ${location || "India"}. Work Preference: ${workPreference || "Any"}. Strictly evaluate if these jobs align with the location/work preferences.

Return a JSON array of objects with the exact schema:
[
  {
    "id": string (job id),
    "credibilityBadge": "HIGH_INTENT" | "CAUTIOUS" | "RED_FLAG",
    "credibilityReason": string (1 short sentence why),
    "hiringOddsScore": number (0-100),
    "tacticalTip": string (1 concise actionable resume tweak tip for this specific role),
    "matchedSkills": [string],
    "missingSkills": [string]
  }
]
`;

    const userPrompt = JSON.stringify(
      layer1Jobs.map((j) => ({
        id: j.id,
        title: j.title,
        company: j.company,
        sourceType: j.sourceType,
        description: j.description.slice(0, 400),
      }))
    );

    let completion: any = null;
    for (const model of FALLBACK_JOB_MODELS) {
      try {
        completion = await groq.chat.completions.create({
          model,
          temperature: 0.1,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemPrompt + "\nCRITICAL: Output JSON with key \"results\" containing the array." },
            { role: "user", content: userPrompt },
          ],
        });
        if (completion) break;
      } catch (err: any) {
        if (err?.status === 404 || err?.error?.code === "model_not_found" || err?.message?.includes("does not exist")) {
          console.warn(`[Groq Job Audit] Model '${model}' 404, retrying next model...`);
          continue;
        }
        throw err;
      }
    }

    const content = completion?.choices[0]?.message?.content;
    if (content) {
      const parsed = JSON.parse(content);
      const resultsArray = Array.isArray(parsed) ? parsed : parsed.results || parsed.jobs;

      if (Array.isArray(resultsArray) && resultsArray.length > 0) {
        const resultMap = new Map<string, any>();
        resultsArray.forEach((r: any) => resultMap.set(r.id, r));

        return layer1Jobs.map((job) => {
          const evalResult = resultMap.get(job.id);
          if (evalResult) {
            return {
              id: job.id,
              title: job.title,
              company: job.company,
              location: job.location,
              postedDaysAgo: job.postedDaysAgo,
              sourceType: job.sourceType,
              applyUrl: job.applyUrl,
              credibilityBadge: evalResult.credibilityBadge || "HIGH_INTENT",
              credibilityReason: evalResult.credibilityReason || "Verified active posting.",
              hiringOddsScore: typeof evalResult.hiringOddsScore === "number" ? evalResult.hiringOddsScore : 82,
              tacticalTip: evalResult.tacticalTip || `Front-load ${candidateSkills[0] || "core skills"} in your top project bullet.`,
              matchedSkills: Array.isArray(evalResult.matchedSkills) ? evalResult.matchedSkills : candidateSkills.slice(0, 3),
              missingSkills: Array.isArray(evalResult.missingSkills) ? evalResult.missingSkills : [],
            };
          }
          return fallbackSingleJobAudit(job, candidateSkills);
        });
      }
    }
  } catch (error) {
    console.warn("Groq Job Micro-Audit skipped or failed, using deterministic Layer 2/3 evaluator:", error);
  }

  // Pure Deterministic Layer 2 & 3 Evaluator Fallback
  return layer1Jobs.map((job) => fallbackSingleJobAudit(job, candidateSkills));
}

function fallbackSingleJobAudit(job: Layer1VerifiedJob, candidateSkills: string[]): VerifiedJob {
  const descLower = job.description.toLowerCase();
  const titleLower = job.title.toLowerCase();

  // Matched vs Missing Skills
  const matchedSkills = candidateSkills.filter((skill) =>
    descLower.includes(skill.toLowerCase())
  );
  const missingSkills = candidateSkills.filter(
    (skill) => !descLower.includes(skill.toLowerCase())
  ).slice(0, 2);

  // Layer 2 Credibility Check
  let credibilityBadge: "HIGH_INTENT" | "CAUTIOUS" | "RED_FLAG" = "HIGH_INTENT";
  let credibilityReason = "Direct employer posting with high active intent.";

  if (job.sourceType === "Staffing Agency" || descLower.includes("rockstar") || descLower.includes("confidential client")) {
    credibilityBadge = "RED_FLAG";
    credibilityReason = "Third-party staffing agency posting with high ghost-job / lead-gen risk.";
  } else if (descLower.includes("5+ years") && (titleLower.includes("junior") || titleLower.includes("entry"))) {
    credibilityBadge = "CAUTIOUS";
    credibilityReason = "Unicorn Hunter alert: Entry/Junior title demanding 5+ years experience.";
  } else if (job.postedDaysAgo > 10) {
    credibilityBadge = "CAUTIOUS";
    credibilityReason = "Posting is approaching 14-day freshness limit.";
  }

  // Layer 3 Hiring Odds Score
  const matchRatio = candidateSkills.length > 0 ? matchedSkills.length / candidateSkills.length : 0.7;
  let hiringOddsScore = Math.round(60 + matchRatio * 35);
  if (credibilityBadge === "RED_FLAG") hiringOddsScore = Math.min(hiringOddsScore, 45);
  if (credibilityBadge === "HIGH_INTENT" && job.sourceType === "Direct ATS") hiringOddsScore = Math.min(98, hiringOddsScore + 10);

  // Tactical Edge Tip
  const primaryMatch = matchedSkills[0] || candidateSkills[0] || "TypeScript";
  const tacticalTip = `Front-load your ${primaryMatch} metrics within the first 4 words of your top project bullet for ${job.company}.`;

  return {
    id: job.id,
    title: job.title,
    company: job.company,
    location: job.location,
    postedDaysAgo: job.postedDaysAgo,
    sourceType: job.sourceType,
    applyUrl: job.applyUrl,
    credibilityBadge,
    credibilityReason,
    hiringOddsScore,
    tacticalTip,
    matchedSkills: matchedSkills.length > 0 ? matchedSkills : candidateSkills.slice(0, 3),
    missingSkills,
  };
}
