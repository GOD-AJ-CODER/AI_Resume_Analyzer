"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, CheckCircle2, XCircle } from "lucide-react";

export default function LandingPage() {
  const [isSlop, setIsSlop] = useState(true);

  return (
    <div className="flex flex-col min-h-screen text-text-primaryLight dark:text-text-primaryDark">
      {/* HERO SECTION - Asymmetric Editorial Split */}
      <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 border-b border-border-light dark:border-border-dark overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          {/* Giant Spanning Headline */}
          <div className="mb-12 md:mb-16">
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-[5.2rem] leading-[1.05] break-words tracking-tight py-2">
              <span className="text-accent-espresso dark:text-accent-lime block">Small fixes.</span>
              <span className="italic block">Giant callbacks.</span>
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
            {/* Left Column (Action & Floating Widget) */}
            <div className="lg:col-span-5 space-y-8">
              <p className="text-lg text-text-mutedLight dark:text-text-mutedDark leading-relaxed max-w-md font-sans">
                Most resumes get rejected in 6 seconds for dumb reasons—broken two-column layouts, zero numbers in bullets, or obvious ChatGPT copy-pasting. Drop your PDF to see what's broken and find verified internships & tech roles across India.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <Link
                  href="/analyze"
                  className="w-full sm:w-auto justify-center px-6 py-3 rounded-md font-bold text-xs tracking-wider uppercase bg-accent-espresso dark:bg-accent-lime text-background-light dark:text-background-dark hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  <span>CHECK MY RESUME</span>
                  <ArrowRight className="w-4 h-4 -rotate-45" />
                </Link>

                <Link
                  href="/analyze#jobs"
                  className="w-full sm:w-auto justify-center flex text-center px-6 py-3 rounded-md font-bold text-xs tracking-wider uppercase border border-accent-espresso dark:border-accent-lime text-accent-espresso dark:text-accent-lime hover:bg-surface-elevatedLight dark:hover:bg-surface-elevatedDark transition-colors"
                >
                  INDIA JOBS & INTERNSHIPS
                </Link>
              </div>

              {/* Bottom-Left Floating Widget Card */}
              <div className="mt-12 rounded-xl bg-gradient-to-br from-[#D6FF6B] via-[#E8FFB0] to-[#C6F8E5] text-[#07241D] p-5 shadow-lg max-w-sm relative">
                <div className="text-[10px] font-bold uppercase tracking-widest mb-4 opacity-80 font-mono">
                  LIVE BULLET CHECK
                </div>
                
                <div className="space-y-4">
                  <div 
                    onClick={() => setIsSlop(true)}
                    className={`p-3 rounded-md text-xs cursor-pointer transition-all border ${isSlop ? 'bg-white border-[#07241D]/20 shadow-sm' : 'border-transparent hover:bg-white/50 opacity-70'}`}
                  >
                    <div className="flex items-center gap-2 mb-1.5 font-bold">
                      <XCircle className="w-4 h-4 text-rose-500" />
                      <span>ChatGPT Slop</span>
                    </div>
                    <p className="italic">"Passionate undergrad eager to leverage cutting-edge skills..."</p>
                  </div>
                  
                  <div 
                    onClick={() => setIsSlop(false)}
                    className={`p-3 rounded-md text-xs cursor-pointer transition-all border ${!isSlop ? 'bg-white border-[#07241D]/20 shadow-sm' : 'border-transparent hover:bg-white/50 opacity-70'}`}
                  >
                    <div className="flex items-center gap-2 mb-1.5 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Human Fix</span>
                    </div>
                    <p className="font-medium">"Built a FastAPI + SQLite portal handling 1,200+ local records offline."</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (Tall Framed Visual Centerpiece) */}
            <div className="lg:col-span-7 relative flex flex-col gap-6">
              {/* Overlapping Circular Stamp Badge */}
              <div className="absolute -top-6 right-2 lg:-left-12 lg:top-12 z-30 flex w-[90px] h-[90px] lg:w-[130px] lg:h-[130px] rounded-full border border-dashed border-accent-espresso/40 dark:border-accent-lime/60 backdrop-blur-md flex-col items-center justify-center text-center bg-background-light/80 dark:bg-background-dark/80 rotate-[-10deg] shadow-xl">
                <span className="font-serif text-3xl lg:text-5xl font-bold text-accent-espresso dark:text-accent-lime leading-none">10</span>
                <span className="text-[6px] lg:text-[8px] font-bold uppercase tracking-widest mt-1 max-w-[60px] lg:max-w-[80px] leading-tight">Scoring Buckets<br/>India First</span>
              </div>

              {/* ATS Funnel Bars & Toggle */}
              <div className="w-full bg-surface-elevatedLight dark:bg-[#0A2C23] border border-border-light dark:border-border-dark p-4 rounded-md shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div className="text-xs font-bold uppercase tracking-wider text-text-primaryLight dark:text-text-primaryDark">
                    ATS Robot X-Ray
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-md text-[10px] uppercase font-bold bg-accent-espresso dark:bg-accent-lime text-background-light dark:text-background-dark cursor-default">Parseability</span>
                    <span className="px-3 py-1 rounded-md text-[10px] uppercase font-bold bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-text-mutedLight dark:text-text-mutedDark cursor-default">Impact</span>
                    <span className="px-3 py-1 rounded-md text-[10px] uppercase font-bold bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-text-mutedLight dark:text-text-mutedDark cursor-default">AI Detector</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-[10px] font-mono mb-1 text-text-mutedLight dark:text-text-mutedDark">
                      <span>Human Verification</span>
                      <span className="text-emerald-600 dark:text-emerald-400">92%</span>
                    </div>
                    <div className="h-2 w-full bg-surface-light dark:bg-surface-dark rounded-full overflow-hidden border border-border-light dark:border-border-dark">
                      <div className="h-full w-[92%] bg-emerald-500"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-mono mb-1 text-text-mutedLight dark:text-text-mutedDark">
                      <span>ATS Readability Index</span>
                      <span className="text-amber-600 dark:text-amber-400">64%</span>
                    </div>
                    <div className="h-2 w-full bg-surface-light dark:bg-surface-dark rounded-full overflow-hidden border border-border-light dark:border-border-dark">
                      <div className="h-full w-[64%] bg-amber-500"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-mono mb-1 text-text-mutedLight dark:text-text-mutedDark">
                      <span>AI Cliché Density</span>
                      <span className="text-rose-600 dark:text-rose-400">89%</span>
                    </div>
                    <div className="h-2 w-full bg-surface-light dark:bg-surface-dark rounded-full overflow-hidden border border-border-light dark:border-border-dark">
                      <div className="h-full w-[89%] bg-rose-500"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tall Framed Visual Centerpiece */}
              <div className="min-h-[380px] lg:min-h-[480px] border border-border-light dark:border-border-dark bg-[#F3EDE2] dark:bg-[#0A2C23] p-4 lg:p-6 relative overflow-hidden rounded-md shadow-sm">
                
                {/* Resume Specimen Sheet */}
                <div className="bg-white dark:bg-[#0C3228] w-full h-[500px] lg:h-[600px] rounded border border-border-light dark:border-border-dark p-4 lg:p-6 shadow-xl relative -rotate-1 origin-bottom-right">
                  <div className="h-4 lg:h-6 w-1/3 bg-surface-elevatedLight dark:bg-surface-elevatedDark mb-6 rounded-sm"></div>
                  
                  <div className="space-y-4">
                    <div className="h-2 w-full bg-surface-elevatedLight dark:bg-surface-elevatedDark rounded-sm"></div>
                    <div className="h-2 w-5/6 bg-surface-elevatedLight dark:bg-surface-elevatedDark rounded-sm"></div>
                    
                    {/* Mock Strikethrough Annotation */}
                    <div className="relative inline-block mt-4 mb-2">
                       <span className="line-through text-text-mutedLight dark:text-text-mutedDark text-xs lg:text-sm italic mr-2">Spearheaded synergistic web...</span>
                       <div className="absolute -top-3 -right-2 bg-rose-500 text-white text-[8px] lg:text-[9px] font-bold px-1.5 py-0.5 rounded rotate-12">
                         AI SLOP
                       </div>
                    </div>
                    
                    <div className="h-2 w-full bg-surface-elevatedLight dark:bg-surface-elevatedDark rounded-sm"></div>
                  </div>

                  {/* Mock Score Callout */}
                  <div className="absolute top-1/3 -right-2 lg:-right-4 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark p-2 lg:p-3 rounded-md shadow-lg rotate-3 z-10 w-40 lg:w-48">
                     <p className="text-[9px] lg:text-[10px] font-bold uppercase tracking-wider mb-1 lg:mb-2 text-text-mutedLight dark:text-text-mutedDark">Raw Specimen Score</p>
                     <p className="font-mono text-lg lg:text-xl text-emerald-600 dark:text-emerald-400 font-bold mb-1">ATS Layout: 92/100</p>
                     <div className="h-1.5 w-full bg-emerald-100 dark:bg-emerald-900/30 rounded-full overflow-hidden">
                       <div className="h-full w-[92%] bg-emerald-500"></div>
                     </div>
                  </div>

                  <div className="absolute bottom-1/4 -left-4 lg:-left-6 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark p-2 lg:p-3 rounded-md shadow-lg -rotate-2 z-10 w-44 lg:w-52">
                     <p className="text-[9px] lg:text-[10px] font-bold uppercase tracking-wider mb-1 text-text-mutedLight dark:text-text-mutedDark">Format Check</p>
                     <p className="text-[10px] lg:text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                       <XCircle className="w-3 h-3" /> Missing Phone Cap: 50
                     </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION A — "What We Actually Check" */}
      <section className="py-24 border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {/* Column 1 */}
            <div className="space-y-4">
              <span className="font-serif text-5xl md:text-6xl text-text-mutedLight/50 dark:text-text-mutedDark/30 block mb-6">01</span>
              <h3 className="text-lg font-bold tracking-tight uppercase">
                Parser & Hard Caps
              </h3>
              <p className="text-sm text-text-mutedLight dark:text-text-mutedDark leading-relaxed">
                Forgot your phone number? Used a fancy 2-column Canva template? Standard parsers drop you automatically. We show your raw score vs. your capped score so you know the 1 thing holding you back.
              </p>
            </div>

            {/* Column 2 */}
            <div className="space-y-4">
              <span className="font-serif text-5xl md:text-6xl text-text-mutedLight/50 dark:text-text-mutedDark/30 block mb-6">02</span>
              <h3 className="text-lg font-bold tracking-tight uppercase">
                10-Bucket Breakdown
              </h3>
              <p className="text-sm text-text-mutedLight dark:text-text-mutedDark leading-relaxed">
                No mystery numbers. Click through all 10 weighted buckets—Projects, Work Experience, Skills, Impact, and Format—and get copy-pasteable before-and-after rewrites.
              </p>
            </div>

            {/* Column 3 */}
            <div className="space-y-4">
              <span className="font-serif text-5xl md:text-6xl text-text-mutedLight/50 dark:text-text-mutedDark/30 block mb-6">03</span>
              <h3 className="text-lg font-bold tracking-tight uppercase">
                AI Slop & India Radar
              </h3>
              <p className="text-sm text-text-mutedLight dark:text-text-mutedDark leading-relaxed">
                We catch the exact LinkedIn and ChatGPT phrases making your resume look fake, then match your real tech stack to internships, Indian startups, and govt portals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION B — Interactive 10-Bucket Weight Strip */}
      <section className="py-12 border-b border-border-light dark:border-border-dark overflow-x-auto whitespace-nowrap hide-scrollbar bg-background-light dark:bg-background-dark">
        <div className="inline-flex gap-8 px-6 lg:px-8 min-w-full justify-between items-center text-xs font-mono uppercase font-bold text-text-mutedLight dark:text-text-mutedDark">
          <span className="hover:text-text-primaryLight dark:hover:text-text-primaryDark transition-colors cursor-default">Work Experience <span className="text-accent-espresso dark:text-accent-lime">20%</span></span>
          <span className="hover:text-text-primaryLight dark:hover:text-text-primaryDark transition-colors cursor-default">ATS <span className="text-accent-espresso dark:text-accent-lime">15%</span></span>
          <span className="hover:text-text-primaryLight dark:hover:text-text-primaryDark transition-colors cursor-default">Skills <span className="text-accent-espresso dark:text-accent-lime">15%</span></span>
          <span className="hover:text-text-primaryLight dark:hover:text-text-primaryDark transition-colors cursor-default">Format <span className="text-accent-espresso dark:text-accent-lime">10%</span></span>
          <span className="hover:text-text-primaryLight dark:hover:text-text-primaryDark transition-colors cursor-default">Impact <span className="text-accent-espresso dark:text-accent-lime">10%</span></span>
          <span className="hover:text-text-primaryLight dark:hover:text-text-primaryDark transition-colors cursor-default">Readability <span className="text-accent-espresso dark:text-accent-lime">10%</span></span>
          <span className="hover:text-text-primaryLight dark:hover:text-text-primaryDark transition-colors cursor-default">Contact <span className="text-accent-espresso dark:text-accent-lime">5%</span></span>
          <span className="hover:text-text-primaryLight dark:hover:text-text-primaryDark transition-colors cursor-default">Summary <span className="text-accent-espresso dark:text-accent-lime">5%</span></span>
          <span className="hover:text-text-primaryLight dark:hover:text-text-primaryDark transition-colors cursor-default">Education <span className="text-accent-espresso dark:text-accent-lime">5%</span></span>
          <span className="hover:text-text-primaryLight dark:hover:text-text-primaryDark transition-colors cursor-default">Projects <span className="text-accent-espresso dark:text-accent-lime">5%</span></span>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-24 text-center">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 space-y-8">
          <h2 className="font-serif text-4xl tracking-tight">
            Takes 5 seconds. India jobs only.
          </h2>
          <div>
            <Link
              href="/analyze"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-md font-bold text-xs tracking-wider uppercase bg-accent-espresso dark:bg-accent-lime text-background-light dark:text-background-dark hover:opacity-90 transition-opacity"
            >
              <span>X-RAY MY RESUME</span>
              <ArrowRight className="w-4 h-4 -rotate-45" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
