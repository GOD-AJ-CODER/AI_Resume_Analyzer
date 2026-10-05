"use client";

import { VerifiedJob } from "@/lib/jobs/layer2-3-credibility";
import { ExternalLink, ShieldCheck, AlertTriangle, AlertOctagon, Sparkles, Clock, Building2, MapPin } from "lucide-react";

interface JobCardProps {
  job: VerifiedJob;
}

export function JobCard({ job }: JobCardProps) {
  const getBadgeStyle = (badge: "HIGH_INTENT" | "CAUTIOUS" | "RED_FLAG") => {
    switch (badge) {
      case "HIGH_INTENT":
        return {
          label: "High Intent",
          icon: ShieldCheck,
          className:
            "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60",
        };
      case "CAUTIOUS":
        return {
          label: "Cautious",
          icon: AlertTriangle,
          className:
            "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60",
        };
      case "RED_FLAG":
        return {
          label: "Ghost Risk",
          icon: AlertOctagon,
          className:
            "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60",
        };
    }
  };

  const badgeInfo = getBadgeStyle(job.credibilityBadge);
  const BadgeIcon = badgeInfo.icon;

  const oddsColor =
    job.hiringOddsScore >= 80
      ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800"
      : job.hiringOddsScore >= 60
      ? "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800"
      : "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800";

  return (
    <div className="p-5 rounded-md border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark space-y-4 hover:border-accent-espresso dark:hover:border-accent-lime transition-all">
      {/* Top Header: Title, Company, Location & Badges */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="text-base font-bold text-text-primaryLight dark:text-text-primaryDark tracking-tight">
              {job.title}
            </h4>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-surface-elevatedLight dark:bg-surface-elevatedDark text-text-mutedLight dark:text-text-mutedDark border border-border-light dark:border-border-dark">
              {job.sourceType}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-text-mutedLight dark:text-text-mutedDark">
            <span className="flex items-center gap-1 font-bold text-text-primaryLight dark:text-text-primaryDark">
              <Building2 className="w-3.5 h-3.5" />
              {job.company}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {job.location}
            </span>
            <span className="flex items-center gap-1 font-mono text-[11px]">
              <Clock className="w-3.5 h-3.5" />
              Posted {job.postedDaysAgo}d ago
            </span>
          </div>
        </div>

        {/* Right Badges: Intent Badge + Odds Score */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-semibold border ${badgeInfo.className}`}
            title={job.credibilityReason}
          >
            <BadgeIcon className="w-3.5 h-3.5" />
            <span>{badgeInfo.label}</span>
          </div>

          <div
            className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${oddsColor}`}
            title="Estimated hiring probability based on resume match"
          >
            {job.hiringOddsScore}% Match
          </div>
        </div>
      </div>

      {/* Layer 2 Credibility Reason Explanation */}
      <p className="text-xs text-text-mutedLight dark:text-text-mutedDark italic bg-surface-elevatedLight dark:bg-surface-elevatedDark p-2.5 rounded-md border border-border-light dark:border-border-dark">
        <span className="font-bold text-text-primaryLight dark:text-text-primaryDark">Credibility Audit:</span>{" "}
        {job.credibilityReason}
      </p>

      {/* Layer 3 Tactical Edge Callout Box */}
      <div className="p-3.5 rounded-md border border-accent-espresso/20 dark:border-accent-lime/20 bg-accent-espresso/5 dark:bg-accent-lime/10 text-xs space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-accent-espresso dark:text-accent-lime">
          <Sparkles className="w-4 h-4 text-accent-espresso dark:text-accent-lime" />
          <span>Tactical Edge Resume Tweak:</span>
        </div>
        <p className="text-text-primaryLight dark:text-text-primaryDark leading-relaxed font-bold">
          {job.tacticalTip}
        </p>
      </div>

      {/* Footer: Skills & Apply Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border-light dark:border-border-dark text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-mono font-bold text-text-mutedLight dark:text-text-mutedDark">Skills:</span>
          {job.matchedSkills.map((s, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded-sm text-[11px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50"
            >
              {s}
            </span>
          ))}
          {job.missingSkills.length > 0 && <span className="font-mono font-bold text-text-mutedLight dark:text-text-mutedDark ml-2">To Learn:</span>}
          {job.missingSkills.map((s, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded-sm text-[11px] font-mono font-bold bg-surface-elevatedLight dark:bg-surface-elevatedDark text-text-mutedLight dark:text-text-mutedDark border border-border-light dark:border-border-dark"
            >
              +{s}
            </span>
          ))}
        </div>

        <a
          href={job.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-4 py-2 rounded-md font-bold text-xs uppercase tracking-wider bg-accent-espresso dark:bg-accent-lime text-background-light dark:text-background-dark hover:opacity-90 transition-opacity"
        >
          <span>Apply Direct</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
