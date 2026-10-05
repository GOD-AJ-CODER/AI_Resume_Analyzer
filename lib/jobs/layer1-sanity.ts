import { RawJob } from "@/lib/jobs/job-fetcher";

export interface Layer1VerifiedJob extends RawJob {
  sourceType: "Direct ATS" | "Company Portal" | "Staffing Agency";
}

const DIRECT_ATS_DOMAINS = [
  "greenhouse.io",
  "lever.co",
  "myworkdayjobs.com",
  "ashbyhq.com",
  "breezy.hr",
  "workable.com",
  "smartrecruiters.com",
  "jobvite.com",
  "icims.com",
];

const STAFFING_AGENCY_DOMAINS = [
  "cybercoders.com",
  "roberthalf.com",
  "apexsystems.com",
  "teksystems.com",
  "dice.com",
  "jobot.com",
  "hays.com",
  "adecco.com",
  "randstad.com",
  "kellyservices.com",
];

export function runLayer1SanityFilter(rawJobs: RawJob[]): Layer1VerifiedJob[] {
  return rawJobs
    .filter((job) => {
      // 1. Strict Freshness Guard: date_posted <= 14 days
      if (job.postedDaysAgo > 14) return false;

      // 2. Apply URL protocol check
      if (!job.applyUrl || (!job.applyUrl.startsWith("http://") && !job.applyUrl.startsWith("https://"))) {
        return false;
      }

      return true;
    })
    .map((job) => {
      const urlLower = job.applyUrl.toLowerCase();
      const companyLower = job.company.toLowerCase();
      const pubLower = (job.publisher || "").toLowerCase();

      let sourceType: "Direct ATS" | "Company Portal" | "Staffing Agency" = "Company Portal";

      if (
        DIRECT_ATS_DOMAINS.some((domain) => urlLower.includes(domain)) ||
        DIRECT_ATS_DOMAINS.some((domain) => pubLower.includes(domain.split(".")[0]))
      ) {
        sourceType = "Direct ATS";
      } else if (
        STAFFING_AGENCY_DOMAINS.some((domain) => urlLower.includes(domain)) ||
        pubLower.includes("staffing") ||
        pubLower.includes("agency") ||
        companyLower.includes("staffing") ||
        companyLower.includes("recruiting group")
      ) {
        sourceType = "Staffing Agency";
      }

      return {
        ...job,
        sourceType,
      };
    });
}
