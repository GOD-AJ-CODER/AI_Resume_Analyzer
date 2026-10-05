"use client";

import { PeerProfile } from "@/app/api/directory/route";
import { ShieldCheck, User, Github, Linkedin, Sparkles, CheckCircle2, Lock } from "lucide-react";

interface PeerCardProps {
  profile: PeerProfile;
}

export function PeerCard({ profile }: PeerCardProps) {
  const humanToneScore = 100 - profile.ai_probability_score;

  return (
    <div className="p-5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-surface-light dark:bg-accent-espresso shadow-sm space-y-4 hover:border-accent-espresso dark:hover:border-accent-lime transition-all flex flex-col justify-between">
      <div className="space-y-3">
        {/* Top Bar: Handle / Name & Domain */}
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-accent-espresso/10 dark:bg-accent-lime/10 text-accent-espresso dark:text-accent-lime flex items-center justify-center text-xs font-mono font-bold">
              {profile.is_anonymous ? <Lock className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-text-primaryDark tracking-tight flex items-center gap-1.5">
                {profile.display_name}
              </h4>
              <p className="text-[11px] font-mono text-slate-500 dark:text-text-mutedLight">
                {profile.experience_level}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              {profile.ats_score} ATS Score
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              {humanToneScore}% Human Tone
            </span>
          </div>
        </div>

        {/* Domain Badge */}
        <div>
          <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-text-mutedDark border border-slate-200 dark:border-zinc-700">
            {profile.domain}
          </span>
        </div>

        {/* Project Bullet Highlight Box */}
        <div className="p-3 rounded-lg border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/20 dark:bg-emerald-950/20 text-xs space-y-1">
          <div className="flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400 text-[11px] font-mono uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Top Quantified X-Y-Z Bullet:</span>
          </div>
          <p className="text-slate-800 dark:text-zinc-200 font-medium leading-relaxed italic">
            "{profile.top_xyz_bullet}"
          </p>
        </div>

        {/* Top 5 Verified Skills */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-mono text-slate-400 dark:text-text-primaryDark0 uppercase tracking-wider">
            Verified Project Skills:
          </span>
          <div className="flex flex-wrap gap-1">
            {profile.verified_skills.slice(0, 6).map((skill, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-text-mutedDark border border-slate-200 dark:border-zinc-700 flex items-center gap-1"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Links */}
      {(profile.github_url || profile.linkedin_url) && (
        <div className="pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center gap-3 text-xs">
          {profile.github_url && (
            <a
              href={profile.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-slate-600 dark:text-text-mutedLight hover:text-accent-espresso dark:hover:text-indigo-400 font-mono transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
          )}
          {profile.linkedin_url && (
            <a
              href={profile.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-slate-600 dark:text-text-mutedLight hover:text-accent-espresso dark:hover:text-indigo-400 font-mono transition-colors"
            >
              <Linkedin className="w-3.5 h-3.5" />
              <span>LinkedIn</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
}
