"use client";

import { useState, useEffect } from "react";
import { PeerProfile } from "@/app/api/directory/route";
import { PeerCard } from "@/components/directory/PeerCard";
import { Users, Filter, Sparkles, ShieldCheck } from "lucide-react";

const DOMAINS = [
  "All",
  "Backend & Distributed Systems",
  "Frontend Engineering",
  "Full-Stack Engineering",
  "Data Science & ML",
  "DevOps & Cloud Infrastructure",
];

export default function DirectoryPage() {
  const [selectedDomain, setSelectedDomain] = useState("All");
  const [profiles, setProfiles] = useState<PeerProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDirectory() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/directory?domain=${encodeURIComponent(selectedDomain)}`);
        if (res.ok) {
          const data = await res.json();
          setProfiles(data.profiles || []);
        }
      } catch (err) {
        console.error("Failed to load directory:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDirectory();
  }, [selectedDomain]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background-light dark:bg-background-dark py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-indigo-50 dark:bg-accent-lime/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            <Users className="w-3.5 h-3.5" />
            <span>Opt-In Engineering Benchmark Directory</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-text-primaryDark sm:text-4xl">
            Peer Showcase & Resume Benchmarks
          </h1>
          <p className="text-slate-600 dark:text-text-mutedLight text-sm sm:text-base max-w-2xl mx-auto">
            Benchmark your ATS score, human tone %, and Google X-Y-Z project bullets against top engineering peers.
          </p>
        </div>

        {/* Domain Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {DOMAINS.map((domain) => (
            <button
              key={domain}
              onClick={() => setSelectedDomain(domain)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedDomain === domain
                  ? "bg-indigo-600 dark:bg-indigo-500 text-white shadow-md"
                  : "bg-surface-light dark:bg-accent-espresso border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-text-mutedDark hover:bg-slate-100 dark:hover:bg-zinc-800"
              }`}
            >
              {domain}
            </button>
          ))}
        </div>

        {/* Directory Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-64 rounded-xl border border-slate-200 dark:border-zinc-800 bg-surface-light/50 dark:bg-accent-espresso/50 animate-pulse p-5"
              />
            ))}
          </div>
        ) : profiles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {profiles.map((profile) => (
              <PeerCard key={profile.id} profile={profile} />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center border border-slate-200 dark:border-zinc-800 bg-surface-light dark:bg-accent-espresso rounded-xl space-y-3">
            <Users className="w-8 h-8 text-slate-400 dark:text-text-primaryDark0 mx-auto" />
            <p className="text-sm font-semibold text-slate-700 dark:text-text-mutedDark">
              No showcase profiles found for "{selectedDomain}".
            </p>
            <p className="text-xs text-slate-500 dark:text-text-mutedLight">
              Be the first to publish your audited resume card to this domain!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
