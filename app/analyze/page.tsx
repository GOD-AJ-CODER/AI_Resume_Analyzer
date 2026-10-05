"use client";

import { useState, useEffect } from "react";
import { UploadWorkspace } from "@/components/analyzer/UploadWorkspace";
import { AuditDashboard } from "@/components/analyzer/AuditDashboard";
import { ByokModal } from "@/components/modals/ByokModal";

import { ResumeAuditPayload } from "@/lib/schemas/audit.schema";
import { VerifiedJob } from "@/lib/jobs/layer2-3-credibility";
import { Zap, Sparkles, ShieldCheck } from "lucide-react";

interface AnalysisResultData {
  deterministic: any;
  aiAudit: ResumeAuditPayload | null;
  jobs?: VerifiedJob[];
  isCacheHit?: boolean;
  remainingScans?: number;
  error?: string;
}

export default function AnalyzePage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResultData | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isByokOpen, setIsByokOpen] = useState(false);

  useEffect(() => {
    // Listen for custom BYOK modal trigger event if dispatched from Navbar or error banners
    const handleTriggerByok = () => setIsByokOpen(true);
    window.addEventListener("open-byok-modal", handleTriggerByok);
    return () => window.removeEventListener("open-byok-modal", handleTriggerByok);
  }, []);

  const handleAnalyze = async (file: File | null, jdText: string, rawText?: string) => {
    setIsAnalyzing(true);
    setApiError(null);

    try {
      const formData = new FormData();
      if (file) {
        formData.append("file", file);
      }
      if (rawText) {
        formData.append("rawText", rawText);
      }
      if (jdText) {
        formData.append("jdText", jdText);
      }

      const customApiKey = typeof window !== "undefined" ? localStorage.getItem("custom_groq_api_key") : null;

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: customApiKey ? { "x-custom-api-key": customApiKey } : {},
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.openByokModal) {
          setIsByokOpen(true);
        }
        throw new Error(data.message || data.error || "Failed to analyze resume.");
      }

      setAnalysisResult({
        deterministic: data.deterministic,
        aiAudit: data.aiAudit,
        jobs: data.jobs || [],
        isCacheHit: data.isCacheHit,
        remainingScans: data.remainingScans,
        error: data.error,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setApiError(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setApiError(null);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background-light dark:bg-background-dark py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      <ByokModal
        isOpen={isByokOpen}
        onClose={() => setIsByokOpen(false)}
      />

      {apiError && (
        <div className="max-w-5xl mx-auto p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm flex items-center justify-between shadow-sm">
          <span>{apiError}</span>
          <button
            onClick={() => setApiError(null)}
            className="font-bold underline text-xs hover:text-rose-900 dark:hover:text-rose-100 ml-4 shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {analysisResult?.isCacheHit && (
        <div className="max-w-5xl mx-auto p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between font-mono">
          <span className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <strong className="font-bold">[⚡ SHA-256 Cache Hit]</strong> Served instant audit from deduplication cache ($0 LLM tokens spent).
          </span>
        </div>
      )}

      {!analysisResult ? (
        <div className="space-y-12">
          {/* Main Dropzone & Workspace */}
          <UploadWorkspace onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />

          {/* Live Feature Breakdown Cards */}
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-xs pt-6 border-t border-slate-200 dark:border-zinc-800">
            <div className="p-5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-surface-light dark:bg-accent-espresso shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-accent-espresso dark:text-accent-lime font-bold">
                <Zap className="w-4 h-4" />
                <span>0ms Deterministic Checks</span>
              </div>
              <p className="text-slate-600 dark:text-text-mutedLight leading-relaxed">
                Contact metadata, multi-column layout trap detection, word count calibration, and section structure pre-scanned in under 10ms.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-surface-light dark:bg-accent-espresso shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-accent-espresso dark:text-accent-lime font-bold">
                <Sparkles className="w-4 h-4" />
                <span>Google X-Y-Z Humanizer</span>
              </div>
              <p className="text-slate-600 dark:text-text-mutedLight leading-relaxed">
                Flags Lexical Clichés ("spearheaded", "delved") and rewrites bullets into grounded, metric-dense engineering statements.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-surface-light dark:bg-accent-espresso shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-accent-espresso dark:text-accent-lime font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>3-Layer Job Radar</span>
              </div>
              <p className="text-slate-600 dark:text-text-mutedLight leading-relaxed">
                Filters postings &le;14 days old, evaluates ghost-job risk, and computes exact match odds with a 1-sentence Tactical Edge tip.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <AuditDashboard
          deterministic={analysisResult.deterministic}
          aiAudit={analysisResult.aiAudit}
          jobs={analysisResult.jobs}
          onReset={handleReset}
          aiErrorMessage={analysisResult.error}
        />
      )}
    </div>
  );
}
