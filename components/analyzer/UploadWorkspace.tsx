"use client";

import { useState, useRef, ChangeEvent, DragEvent } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle, ArrowRight, Sparkles } from "lucide-react";

interface UploadWorkspaceProps {
  onAnalyze: (file: File | null, jdText: string, rawText?: string) => void;
  isAnalyzing: boolean;
}

const SAMPLE_RESUME = `Alex Mercer
alex.mercer@email.com | (555) 019-2834 | github.com/alexmercer | linkedin.com/in/alexmercer

TECHNICAL SKILLS
Languages: TypeScript, JavaScript, Python, Go, SQL, HTML5, CSS3
Frameworks & Libraries: React, Next.js, Node.js, Express, TailwindCSS, GraphQL
Cloud & Tools: AWS (S3, EC2), Docker, PostgreSQL, Redis, Git, Jest

WORK EXPERIENCE
Senior Full-Stack Engineer | TechCorp Inc. | 2022 - Present
- Spearheaded the redesign of core checkout platform using Next.js 14, increasing conversion by [24%] and cutting load time by [450 ms].
- Architected scalable GraphQL microservice in Go to handle 15,000 requests/sec with 99.99% uptime.
- Delved into legacy database queries and leveraged Redis caching to improve response cadence seamlessly.
- Fostered agile culture across 8 cross-functional developers and orchestrated zero-downtime CI/CD deployment pipelines.

Software Engineer | Innovate Solutions | 2020 - 2022
- Built real-time analytics dashboard with React and WebSockets, rendering 10,000 data points with zero frame drops.
- Leveraged synergies across product teams to seamlessly deliver pivotal features for enterprise users.
- Cutting-edge optimization of SQL queries reduced API latency by 35%.

EDUCATION
B.S. in Computer Science | University of California, Berkeley | 2016 - 2020`;

export function UploadWorkspace({ onAnalyze, isAnalyzing }: UploadWorkspaceProps) {
  const [file, setFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.size > 5 * 1024 * 1024) {
      setErrorMsg("File size exceeds 5MB limit. Please upload a smaller file.");
      return;
    }
    const ext = selectedFile.name.toLowerCase();
    if (!ext.endsWith(".pdf") && !ext.endsWith(".docx") && !ext.endsWith(".txt")) {
      setErrorMsg("Only PDF (.pdf), Word (.docx), or Text (.txt) files are supported.");
      return;
    }
    setErrorMsg("");
    setFile(selectedFile);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSampleClick = () => {
    setFile(null);
    setErrorMsg("");
    onAnalyze(null, jdText, SAMPLE_RESUME);
  };

  const handleSubmit = () => {
    if (!file) {
      setErrorMsg("Please select or drop a PDF/DOCX resume file, or try the sample resume.");
      return;
    }
    onAnalyze(file, jdText);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-text-primaryLight dark:text-text-primaryDark sm:text-4xl">
          Engineering Resume & Job Fit Audit
        </h1>
        <p className="text-text-mutedLight dark:text-text-mutedDark text-sm sm:text-base max-w-2xl mx-auto">
          Drop your PDF below to see exactly why your resume is getting rejected and find verified Indian jobs that match your real skills.
        </p>
      </div>

      {/* Dual Input Workspace Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Left Card: File Dropzone */}
        <div className="p-6 rounded-md border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold tracking-tight text-text-primaryLight dark:text-text-primaryDark">
                1. Upload Resume
              </span>
              <button
                type="button"
                onClick={handleSampleClick}
                disabled={isAnalyzing}
                className="text-xs font-bold text-text-mutedLight dark:text-text-mutedDark hover:text-text-primaryLight dark:hover:text-text-primaryDark transition-colors flex items-center gap-1 uppercase tracking-wider"
              >
                Try Sample
              </button>
            </div>

            {/* Dropzone Box */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border border-dashed rounded-md p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? "border-accent-espresso dark:border-accent-lime bg-surface-elevatedLight dark:bg-surface-elevatedDark"
                  : file
                  ? "border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-elevatedDark"
                  : "border-border-light dark:border-border-dark hover:border-accent-espresso dark:hover:border-accent-lime bg-surface-light dark:bg-surface-dark"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  if (e.target.files && e.target.files[0]) handleFileSelect(e.target.files[0]);
                }}
                className="hidden"
              />

              {file ? (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <p className="font-bold text-sm text-text-primaryLight dark:text-text-primaryDark truncate max-w-xs mx-auto">
                    {file.name}
                  </p>
                  <p className="text-xs font-mono text-text-mutedLight dark:text-text-mutedDark">
                    {(file.size / 1024).toFixed(1)} KB • Click or drop to replace
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-full bg-surface-elevatedLight dark:bg-surface-elevatedDark text-text-mutedLight dark:text-text-mutedDark flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-text-primaryLight dark:text-text-primaryDark">
                    Drag & drop PDF / DOCX resume
                  </p>
                  <p className="text-xs text-text-mutedLight dark:text-text-mutedDark">
                    Max 5MB • Instant text extraction
                  </p>
                </div>
              )}
            </div>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 text-xs border border-rose-200 dark:border-rose-800/60">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Right Card: Target Job Description */}
        <div className="p-6 rounded-md border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold tracking-tight text-text-primaryLight dark:text-text-primaryDark">
                2. Target Job Description
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-text-mutedLight dark:text-text-mutedDark font-mono">
                Optional
              </span>
            </div>

            <textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste the target job description here... If left blank, we perform a General Domain Audit."
              className="w-full h-40 p-3 rounded-md border border-border-light dark:border-border-dark bg-surface-elevatedLight dark:bg-surface-elevatedDark text-text-primaryLight dark:text-text-primaryDark text-xs placeholder:text-text-mutedLight dark:placeholder:text-text-mutedDark focus:outline-none focus:ring-1 focus:ring-accent-espresso dark:focus:ring-accent-lime font-mono resize-none"
            />
          </div>

          <p className="text-xs text-text-mutedLight dark:text-text-mutedDark italic">
            Leave blank for a General Domain & Career Readiness Audit.
          </p>
        </div>
      </div>

      {/* Main Action Button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isAnalyzing}
        className={`w-full py-4 px-6 rounded-md font-bold text-xs uppercase tracking-wider transition-opacity flex items-center justify-center gap-2 ${
          isAnalyzing
            ? "bg-surface-elevatedLight dark:bg-surface-elevatedDark text-text-mutedLight dark:text-text-mutedDark cursor-not-allowed border border-border-light dark:border-border-dark"
            : "bg-accent-espresso dark:bg-accent-lime text-background-light dark:text-background-dark hover:opacity-90"
        }`}
      >
        {isAnalyzing ? (
          <>
            <span className="w-4 h-4 border-2 border-text-mutedLight dark:border-text-mutedDark border-t-transparent rounded-full animate-spin" />
            <span>Analyzing Resume...</span>
          </>
        ) : (
          <>
            <span>Run Audit</span>
            <ArrowRight className="w-4 h-4 -rotate-45" />
          </>
        )}
      </button>
    </div>
  );
}
