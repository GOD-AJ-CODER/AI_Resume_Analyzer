import { fetchDeterministicJobs } from "@/lib/jobs/job-fetcher";
import { VerifiedJob } from "@/lib/jobs/layer2-3-credibility";

export async function run3LayerJobPipeline(
  targetTitles: string[],
  topSkills: string[],
  experienceTier?: string,
  customApiKey?: string | null,
  location?: string,
  workPreference?: string,
  roleType?: string
): Promise<VerifiedJob[]> {
  try {
    const verifiedJobs = await fetchDeterministicJobs(
      targetTitles,
      topSkills,
      location,
      workPreference,
      roleType
    );
    return verifiedJobs;
  } catch (error) {
    console.error("Deterministic Job Pipeline Error:", error);
    return [];
  }
}
