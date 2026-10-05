"use client";

import { useState, useEffect } from "react";
import { VerifiedJob } from "@/lib/jobs/layer2-3-credibility";
import { JobCard } from "@/components/jobs/JobCard";
import { Radar, EyeOff, SlidersHorizontal, MapPin, Briefcase, RefreshCw, Loader2, GraduationCap } from "lucide-react";
import { ResumeAuditPayload } from "@/lib/schemas/audit.schema";


interface VerifiedJobsListProps {
  initialJobs: VerifiedJob[];
  aiAudit: ResumeAuditPayload | null;
  deterministic: any;
}

export function VerifiedJobsList({ initialJobs, aiAudit, deterministic }: VerifiedJobsListProps) {
  const [jobs, setJobs] = useState<VerifiedJob[]>(initialJobs);
  const [isFetching, setIsFetching] = useState(false);
  
  const [roleType, setRoleType] = useState("All Opportunities");
  const [location, setLocation] = useState("All India (Tech Hubs + Remote)");
  const [workPreference, setWorkPreference] = useState("Remote");
  
  useEffect(() => {
    setJobs(initialJobs);
  }, [initialJobs]);

  const handleRefreshJobs = async () => {
    setIsFetching(true);
    try {
      const customApiKey = typeof window !== "undefined" ? localStorage.getItem("custom_groq_api_key") : null;
      
      const targetTitles = aiAudit?.extractedSearchProfile?.targetTitles?.length ? aiAudit.extractedSearchProfile.targetTitles : ["Full Stack Software Engineer", "Backend Engineer"];
      const topSkills = aiAudit?.extractedSearchProfile?.topVerifiedSkills?.length ? aiAudit.extractedSearchProfile.topVerifiedSkills : (deterministic?.contextualSkills?.length > 0 ? deterministic.contextualSkills : ["TypeScript", "React", "Node.js"]);
      const experienceTier = aiAudit?.experienceTier || "Mid-Level (3-5 yrs)";

      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(customApiKey && { "x-custom-api-key": customApiKey }),
        },
        body: JSON.stringify({
          roleType,
          location,
          workPreference,
          targetTitles,
          topSkills,
          experienceTier
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.jobs) {
          setJobs(data.jobs);
        }
      }
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    } finally {
      setIsFetching(false);
    }
  };

  const [sortOption, setSortOption] = useState<"odds" | "newest" | "credibility">("odds");
  const [hideRedFlags, setHideRedFlags] = useState(true);

  const filteredJobs = jobs.filter((job) => (hideRedFlags ? job.credibilityBadge !== "RED_FLAG" : true));

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (sortOption === "odds") return b.hiringOddsScore - a.hiringOddsScore;
    if (sortOption === "newest") return a.postedDaysAgo - b.postedDaysAgo;
    if (sortOption === "credibility") {
      const rank = { HIGH_INTENT: 3, CAUTIOUS: 2, RED_FLAG: 1 };
      return rank[b.credibilityBadge] - rank[a.credibilityBadge];
    }
    return 0;
  });

  const highIntentCount = jobs.filter((j) => j.credibilityBadge === "HIGH_INTENT").length;
  const redFlagCount = jobs.filter((j) => j.credibilityBadge === "RED_FLAG").length;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Transparency Header */}
      <div className="p-6 rounded-md border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-accent-espresso dark:bg-accent-lime text-background-light dark:text-background-dark flex items-center justify-center font-bold">
              <Radar className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primaryLight dark:text-text-primaryDark tracking-tight">
                Verified Fresh Job Radar
              </h3>
              <p className="text-xs text-text-mutedLight dark:text-text-mutedDark">
                Deterministic Skill Match &bull; Direct Portals &bull; High Reliability
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono font-bold">
            <span className="px-3 py-1 rounded-sm bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50">
              {highIntentCount} High Intent
            </span>
            {redFlagCount > 0 && (
              <span className="px-3 py-1 rounded-sm bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
                {redFlagCount} Ghost Risk Flagged
              </span>
            )}
          </div>
        </div>

        {/* Location & Preferences Input Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 pt-3 border-t border-border-light dark:border-border-dark w-full">
          <div className="flex-1 flex flex-wrap gap-2 w-full">
            <div className="relative w-full sm:w-auto flex-1 min-w-[200px]">
              <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-mutedLight dark:text-text-mutedDark" />
              <select
                value={roleType}
                onChange={(e) => setRoleType(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-surface-elevatedLight dark:bg-surface-elevatedDark border border-border-light dark:border-border-dark rounded-md text-xs font-bold text-text-primaryLight dark:text-text-primaryDark focus:outline-none focus:ring-1 focus:ring-accent-espresso dark:focus:ring-accent-lime transition-shadow appearance-none cursor-pointer"
              >
                <option value="All Opportunities">All Opportunities</option>
                <option value="Student Internships">Student Internships</option>
                <option value="Govt & Research (AICTE / DRDO / ISRO / MeitY)">Govt & Research</option>
                <option value="Fresher / SDE-1 Full-Time">Fresher / SDE-1 Full-Time</option>
              </select>
            </div>

            <div className="relative w-full sm:w-auto flex-1 min-w-[200px]">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-mutedLight dark:text-text-mutedDark" />
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-surface-elevatedLight dark:bg-surface-elevatedDark border border-border-light dark:border-border-dark rounded-md text-xs font-bold text-text-primaryLight dark:text-text-primaryDark focus:outline-none focus:ring-1 focus:ring-accent-espresso dark:focus:ring-accent-lime transition-shadow appearance-none cursor-pointer"
              >
                <option value="All India (Tech Hubs + Remote)">All India (Tech Hubs + Remote)</option>
                <option value="Chandigarh / Mohali (Tricity)">Chandigarh / Mohali (Tricity)</option>
                <option value="Bengaluru, Karnataka">Bengaluru, Karnataka</option>
                <option value="Pune, Maharashtra">Pune, Maharashtra</option>
                <option value="Hyderabad, Telangana">Hyderabad, Telangana</option>
                <option value="Delhi NCR (Gurugram / Noida)">Delhi NCR (Gurugram / Noida)</option>
                <option value="Mumbai, Maharashtra">Mumbai, Maharashtra</option>
                <option value="Chennai, Tamil Nadu">Chennai, Tamil Nadu</option>
                <option value="Remote (Work from Anywhere in India)">Remote (Work from Anywhere in India)</option>
              </select>
            </div>

            <div className="relative w-full sm:w-auto flex-1 min-w-[150px]">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-mutedLight dark:text-text-mutedDark" />
              <select
                value={workPreference}
                onChange={(e) => setWorkPreference(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-surface-elevatedLight dark:bg-surface-elevatedDark border border-border-light dark:border-border-dark rounded-md text-xs font-bold text-text-primaryLight dark:text-text-primaryDark focus:outline-none focus:ring-1 focus:ring-accent-espresso dark:focus:ring-accent-lime transition-shadow appearance-none cursor-pointer"
              >
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-Site">On-Site</option>
              </select>
            </div>
          </div>
          <button
            onClick={handleRefreshJobs}
            disabled={isFetching}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-accent-espresso dark:bg-accent-lime text-background-light dark:text-background-dark rounded-md text-xs font-bold uppercase tracking-wider transition-opacity hover:opacity-90 disabled:opacity-50 shrink-0"
          >
            {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {isFetching ? "Searching" : "Update Radar"}
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border-light dark:border-border-dark text-xs">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-text-mutedLight dark:text-text-mutedDark" />
            <span className="font-bold text-text-primaryLight dark:text-text-primaryDark">Sort by:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as any)}
              className="px-2 py-1.5 rounded-md border border-border-light dark:border-border-dark bg-surface-elevatedLight dark:bg-surface-elevatedDark text-text-primaryLight dark:text-text-primaryDark font-mono focus:outline-none"
            >
              <option value="odds">Highest Match Odds</option>
              <option value="newest">Newest First (&le;14d)</option>
              <option value="credibility">Highest Intent Rating</option>
            </select>
          </div>

          <button
            onClick={() => setHideRedFlags(!hideRedFlags)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-mono font-bold transition-colors ${
              hideRedFlags
                ? "bg-surface-elevatedLight dark:bg-surface-elevatedDark text-text-mutedLight dark:text-text-mutedDark"
                : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-900/50"
            }`}
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>{hideRedFlags ? "Hide Ghost Risk Jobs (On)" : "Show All Jobs (Including Ghost Flags)"}</span>
          </button>
        </div>
      </div>

      {/* Jobs Feed Grid */}
      {sortedJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {sortedJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark rounded-md space-y-3">
          <Radar className="w-8 h-8 text-text-mutedLight dark:text-text-mutedDark mx-auto" />
          <p className="text-sm font-bold text-text-primaryLight dark:text-text-primaryDark">
            No jobs match the active filter criteria.
          </p>
          <p className="text-xs text-text-mutedLight dark:text-text-mutedDark">
            Try toggling "Show All Jobs" or expanding your resume target skills.
          </p>
        </div>
      )}
    </div>
  );
}
