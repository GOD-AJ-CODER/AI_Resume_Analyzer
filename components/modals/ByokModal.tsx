"use client";

import { useState, useEffect } from "react";
import { KeyRound, CheckCircle2, AlertCircle, Trash2, ExternalLink, X, ShieldAlert } from "lucide-react";

interface ByokModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved?: () => void;
}

export function ByokModal({ isOpen, onClose, onKeySaved }: ByokModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("custom_groq_api_key");
      if (stored) {
        setSavedKey(stored);
        setApiKey(stored);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveKey = () => {
    const trimmed = apiKey.trim();
    if (!trimmed) return;

    if (typeof window !== "undefined") {
      localStorage.setItem("custom_groq_api_key", trimmed);
      setSavedKey(trimmed);
      setSaveSuccess(true);
      if (onKeySaved) onKeySaved();
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1200);
    }
  };

  const handleClearKey = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("custom_groq_api_key");
      setSavedKey(null);
      setApiKey("");
      if (onKeySaved) onKeySaved();
    }
  };

  const maskedKey = savedKey
    ? `${savedKey.slice(0, 4)}...${savedKey.slice(-4)}`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-[92vw] max-w-md p-5 sm:p-6 mx-auto rounded-2xl border border-slate-200 dark:border-border-dark bg-surface-light dark:bg-accent-espresso shadow-2xl space-y-5 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-espresso/10 dark:bg-accent-lime/10 text-accent-espresso dark:text-accent-lime flex items-center justify-center">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-text-primaryDark">
              Bring Your Own Key (BYOK)
            </h3>
            <p className="text-xs text-slate-500 dark:text-text-mutedLight">
              Unlock unlimited high-speed audits using your own free Groq API key
            </p>
          </div>
        </div>

        {/* Current Status Pill */}
        <div className="p-3 rounded-lg border border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-background-dark/50 text-xs flex items-center justify-between">
          <span className="text-slate-600 dark:text-text-mutedLight font-mono">Status:</span>
          {savedKey ? (
            <span className="flex items-center gap-1 font-mono font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              BYOK Key Active ({maskedKey})
            </span>
          ) : (
            <span className="flex items-center gap-1 font-mono font-semibold text-amber-600 dark:text-amber-400">
              <ShieldAlert className="w-3.5 h-3.5" />
              Shared Server Key (3 Scans/Hour Limit)
            </span>
          )}
        </div>

        {/* Key Input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-text-mutedDark block">
            Groq API Key (gsk_...)
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="gsk_..."
            className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-surface-light dark:bg-background-dark text-slate-900 dark:text-text-primaryDark font-mono text-xs focus:outline-none focus:ring-2 focus:ring-accent-espresso dark:focus:ring-accent-lime"
          />
        </div>

        {/* Instructions Link */}
        <div className="p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30 text-xs text-slate-600 dark:text-text-mutedLight flex items-start gap-2">
          <ExternalLink className="w-4 h-4 text-accent-espresso dark:text-accent-lime shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Don't have a key? Get a free 300+ token/sec Groq API key in 30 seconds at{" "}
            <a
              href="https://console.groq.com/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-espresso dark:text-accent-lime font-semibold underline underline-offset-2"
            >
              console.groq.com/keys
            </a>
            . Your key is stored strictly in your browser's localStorage.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2">
          {savedKey ? (
            <button
              onClick={handleClearKey}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove Key</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-text-mutedLight hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleSaveKey}
              disabled={!apiKey.trim()}
              className={`px-4 py-2 rounded-lg text-xs font-semibold text-white shadow-sm transition-all flex items-center gap-1.5 ${
                saveSuccess
                  ? "bg-emerald-600"
                  : "bg-indigo-600 hover:opacity-90 dark:bg-indigo-500 dark:hover:opacity-90"
              }`}
            >
              {saveSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Key Saved!</span>
                </>
              ) : (
                <span>Save Key & Bypass Limits</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
