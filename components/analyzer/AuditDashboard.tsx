"use client";

import { useState } from "react";
import { ResumeAuditPayload, BucketScore } from "@/lib/schemas/audit.schema";
import { VerifiedJob } from "@/lib/jobs/layer2-3-credibility";
import { VerifiedJobsList } from "@/components/jobs/VerifiedJobsList";
import { RotateCcw, FileSearch, Radar, AlertOctagon, TrendingUp, AlertTriangle, ArrowRight, CheckCircle2, ChevronRight, XCircle, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface AuditDashboardProps {
  deterministic?: any; // kept for compatibility, but we use aiAudit now
  aiAudit: ResumeAuditPayload | null;
  jobs?: VerifiedJob[];
  onReset: () => void;
  aiErrorMessage?: string;
}

export function AuditDashboard({
  deterministic,
  aiAudit,
  jobs = [],
  onReset,
  aiErrorMessage,
}: AuditDashboardProps) {
  const [activeTab, setActiveTab] = useState<"audit" | "jobs">("audit");
  const [activeBucket, setActiveBucket] = useState<BucketScore | null>(aiAudit?.buckets?.[0] || null);

  if (!aiAudit) return null; // Fallback if somehow null

  const getBucketColor = (score: number) => {
    if (score >= 80) return "#10b981"; // Emerald
    if (score >= 50) return "#f59e0b"; // Amber
    return "#f43f5e"; // Rose
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-20">
      {/* Top Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4 pb-4 border-b border-border-light dark:border-border-dark">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab("audit")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all ${
              activeTab === "audit"
                ? "bg-accent-espresso dark:bg-surface-light text-white dark:text-zinc-950"
                : "bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-text-primaryLight dark:text-text-mutedDark hover:bg-surface-elevatedLight dark:hover:bg-surface-light/5"
            }`}
          >
            <span>Resume Check</span>
          </button>

          <button
            onClick={() => setActiveTab("jobs")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all ${
              activeTab === "jobs"
                ? "bg-accent-espresso dark:bg-surface-light text-white dark:text-zinc-950"
                : "bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-text-primaryLight dark:text-text-mutedDark hover:bg-surface-elevatedLight dark:hover:bg-surface-light/5"
            }`}
          >
            <span>Jobs & Internships</span>
            {jobs.length > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                {jobs.length}
              </span>
            )}
          </button>
        </div>

        <button
          onClick={onReset}
          className="flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-text-primaryLight dark:text-text-mutedDark hover:bg-surface-elevatedLight dark:hover:bg-surface-light/5 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Scan New Resume</span>
        </button>
      </div>

      {aiErrorMessage && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <div>
            <p className="font-bold">Partial AI Mode Active</p>
            <p className="mt-0.5">Using strictly deterministic metrics because the LLM failed: {aiErrorMessage}</p>
          </div>
        </div>
      )}

      {/* Tab 1: 10-Bucket Dashboard */}
      {activeTab === "audit" && (
        <div className="space-y-8">
          
          {/* HARD CAP BANNER */}
          {aiAudit.isCapped && (
            <div className="flex items-start gap-4 p-5 bg-rose-50 dark:bg-rose-950/50 border-2 border-rose-500 dark:border-rose-800 rounded-xl shadow-sm">
              <AlertOctagon className="w-8 h-8 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-rose-800 dark:text-rose-300">
                  Critical Resume Violation Detected
                </h3>
                <p className="text-sm font-medium text-rose-700 dark:text-rose-200">
                  Raw Resume Quality: <span className="font-bold text-rose-900 dark:text-rose-100">{aiAudit.rawScore}/100</span> → Capped at <span className="font-bold text-rose-900 dark:text-rose-100">{aiAudit.finalScore}/100</span> because: <strong>{aiAudit.capReason}</strong>
                </p>
                <p className="text-sm text-rose-600 dark:text-rose-400 italic">
                  Fix this constraint immediately to unlock your full score potential.
                </p>
              </div>
            </div>
          )}

          {/* GRADE BAND HEADER */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-2 p-6 rounded-md bg-accent-espresso dark:bg-surface-dark border border-border-light dark:border-border-dark text-zinc-100 flex flex-col justify-center">
              <p className="text-text-mutedLight font-mono text-xs uppercase tracking-wider mb-2">Final {aiAudit.jdMatchMode ? "Blended" : "General"} Score</p>
              <div className="flex items-end gap-3">
                <span className="text-6xl font-semibold tracking-tighter text-text-primaryLight dark:text-text-primaryDark">{aiAudit.finalScore}</span>
                <span className="text-2xl font-medium text-text-mutedLight mb-1.5">/ 100</span>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className="px-3 py-1 bg-surface-elevatedLight dark:bg-surface-light/10 text-text-primaryLight dark:text-text-primaryDark border border-border-light dark:border-border-dark rounded-md text-xs font-medium">{aiAudit.gradeBadge}</span>
                {aiAudit.isCapped && <span className="px-3 py-1 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 rounded-md text-xs font-medium">Capped</span>}
              </div>
            </div>

            {aiAudit.jdMatchMode && (
              <div className="p-6 rounded-md bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark flex flex-col justify-center">
                <p className="text-text-mutedLight font-mono text-xs uppercase tracking-wider mb-2">JD Match Score</p>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-semibold text-text-primaryLight dark:text-text-primaryDark">{aiAudit.jdMatchScore}</span>
                  <span className="text-lg font-medium text-text-mutedLight mb-1">/ 100</span>
                </div>
                <div className="mt-3 text-xs space-y-1">
                  <p className="text-emerald-600 dark:text-emerald-400"><span className="font-bold">{aiAudit.jdMatchMatrix?.matchedKeywords.length || 0}</span> keywords matched</p>
                  <p className="text-rose-600 dark:text-rose-400"><span className="font-bold">{aiAudit.jdMatchMatrix?.missingKeywords.length || 0}</span> missing critical keywords</p>
                </div>
              </div>
            )}

            <div className="p-6 rounded-md bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark flex flex-col justify-center">
              <p className="text-text-mutedLight font-mono text-xs uppercase tracking-wider mb-2">AI Buzzword Risk</p>
              <div className="flex items-end gap-2">
                <span className={`text-4xl font-semibold ${aiAudit.aiBuzzwordProbability > 40 ? 'text-rose-600 dark:text-rose-400' : 'text-text-primaryLight dark:text-text-primaryDark'}`}>{aiAudit.aiBuzzwordProbability}%</span>
              </div>
              <p className="mt-3 text-xs text-text-mutedLight leading-relaxed">
                Flags generic jargon that makes you sound like an AI.
              </p>
            </div>
            
            {!aiAudit.jdMatchMode && (
              <div className="p-6 rounded-md bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark flex flex-col justify-center">
                <p className="text-text-mutedLight font-mono text-xs uppercase tracking-wider mb-2">Detected Level</p>
                <p className="text-xl font-semibold text-text-primaryLight dark:text-text-primaryDark">{aiAudit.experienceTier}</p>
                <p className="mt-3 text-xs text-text-mutedLight leading-relaxed">
                  Based on trajectory and complexity of projects.
                </p>
              </div>
            )}
          </div>

          {/* INTERACTIVE 10-BUCKET CHART & INSPECTOR */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 p-6 rounded-md border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
              <h3 className="text-lg font-semibold text-text-primaryLight dark:text-text-primaryDark mb-6 tracking-tight">
                10-Bucket Breakdown
              </h3>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={aiAudit.buckets}
                    layout="vertical"
                    margin={{ top: 0, right: 30, left: 40, bottom: 0 }}
                  >
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      width={120} 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                      content={({ payload }) => {
                        if (payload && payload.length) {
                          const data = payload[0].payload as BucketScore;
                          return (
                            <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-xs border border-slate-700">
                              <p className="font-bold mb-1">{data.name}</p>
                              <p>Score: {data.score}/100</p>
                              <p>Weight: {data.weight}%</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar 
                      dataKey="score" 
                      radius={[0, 4, 4, 0]}
                      onClick={(data: any) => setActiveBucket(data.payload || data)}
                      className="cursor-pointer transition-opacity hover:opacity-80"
                    >
                      {aiAudit.buckets.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getBucketColor(entry.score)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-center text-xs text-slate-400 mt-4 italic">Click any bar to inspect details</p>
            </div>

            {/* LIVE CATEGORY INSPECTOR CARD */}
            {activeBucket && (
              <div className="lg:col-span-6 p-6 rounded-md border border-border-light dark:border-border-dark bg-surface-elevatedLight dark:bg-surface-elevatedDark flex flex-col space-y-5">
                <div className="flex items-center justify-between border-b border-border-light dark:border-border-dark pb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-text-primaryLight dark:text-text-primaryDark tracking-tight">{activeBucket.name}</h3>
                    <p className="text-xs font-mono text-text-mutedLight mt-1">Weight: {activeBucket.weight}% | Earned: {activeBucket.weightedPoints.toFixed(1)} pts</p>
                  </div>
                  <div className={`px-3 py-1 rounded-md text-sm font-bold text-white`} style={{ backgroundColor: getBucketColor(activeBucket.score) }}>
                    {activeBucket.score}/100
                  </div>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto pr-2">
                  {activeBucket.failedChecks.map((check, i) => (
                    <div key={`fail-${i}`} className="flex items-start gap-2 text-sm">
                      <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <span className="text-text-primaryLight dark:text-text-mutedDark">{check}</span>
                    </div>
                  ))}
                  {activeBucket.passedChecks.map((check, i) => (
                    <div key={`pass-${i}`} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-text-mutedLight dark:text-text-mutedLight">{check}</span>
                    </div>
                  ))}
                </div>

                {(activeBucket.feedback.beforeRewrite || activeBucket.feedback.afterRewrite) && (
                  <div className="pt-4 border-t border-border-light dark:border-border-dark space-y-3">
                    <p className="text-xs font-semibold text-text-primaryLight dark:text-text-primaryDark tracking-tight">Instant Fix Example</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 rounded-md bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30">
                        <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 uppercase">Before</span>
                        <p className="text-xs text-text-primaryLight dark:text-text-mutedDark mt-1 line-through opacity-80">"{activeBucket.feedback.beforeRewrite}"</p>
                      </div>
                      <div className="p-3 rounded-md bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase">After</span>
                        <p className="text-xs text-text-primaryLight dark:text-text-primaryDark mt-1 font-medium">"{activeBucket.feedback.afterRewrite}"</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* TOP PRIORITY FIXES */}
          {aiAudit.topPriorityFixes.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-text-primaryLight dark:text-text-primaryDark tracking-tight pb-2">
                Top Priority Fixes
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {aiAudit.topPriorityFixes.map((fix, idx) => (
                  <div key={fix.id} className="flex flex-col md:flex-row gap-4 p-5 rounded-md border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-1 h-full ${fix.severity === 'Critical' ? 'bg-rose-500' : fix.severity === 'High' ? 'bg-amber-500' : 'bg-surface-elevatedLight0'}`}></div>
                    
                    <div className="w-full md:w-1/3 flex flex-col justify-between pl-2">
                      <div>
                        <span className="text-xs font-mono text-text-mutedLight tracking-wider">Priority #{idx + 1}</span>
                        <h4 className="text-base font-medium text-text-primaryLight dark:text-text-primaryDark mt-1">{fix.name}</h4>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${fix.severity === 'Critical' ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400' : fix.severity === 'High' ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400' : 'bg-surface-elevatedLight dark:bg-surface-light/10 text-text-primaryLight dark:text-text-mutedDark'}`}>
                            {fix.severity} Severity
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="w-full md:w-2/3 space-y-4 text-sm text-text-primaryLight dark:text-text-mutedDark">
                      <div className="space-y-1">
                        <p className="font-semibold text-text-primaryLight dark:text-text-primaryDark">
                          What's Wrong
                        </p>
                        <p className="text-text-mutedLight dark:text-text-mutedLight">{fix.feedback.whatsWrong}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="font-semibold text-text-primaryLight dark:text-text-primaryDark">
                          Why It Hurts You
                        </p>
                        <p className="text-text-mutedLight dark:text-text-mutedLight">{fix.feedback.whyItHurts}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="font-semibold text-text-primaryLight dark:text-text-primaryDark">
                          How To Fix It
                        </p>
                        <p className="bg-surface-elevatedLight dark:bg-surface-light/5 p-3 rounded-md border border-border-light dark:border-border-dark font-medium">
                          {fix.feedback.howToFix}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Tab 2: Verified Job Radar */}
      {activeTab === "jobs" && (
        <VerifiedJobsList 
          initialJobs={jobs} 
          aiAudit={aiAudit} 
          deterministic={deterministic} 
        />
      )}
    </div>
  );
}
