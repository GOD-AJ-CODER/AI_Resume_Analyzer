"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        aria-label="Toggle theme skeleton"
        className="w-9 h-9 rounded-lg border border-slate-200 dark:border-zinc-800 flex items-center justify-center bg-slate-100/50 dark:bg-zinc-800/50 text-slate-400 dark:text-text-primaryDark0 transition-colors"
        disabled
      >
        <span className="w-4 h-4 rounded-full bg-slate-300 dark:bg-zinc-700 animate-pulse" />
      </button>
    );
  }

  const isDark = resolvedTheme === "dark" || theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className="w-9 h-9 rounded-lg border border-slate-200 dark:border-zinc-800 flex items-center justify-center bg-surface-light dark:bg-accent-espresso text-slate-700 dark:text-text-mutedDark hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 transition-transform duration-200 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-slate-700 transition-transform duration-200 hover:-rotate-12" />
      )}
    </button>
  );
}
