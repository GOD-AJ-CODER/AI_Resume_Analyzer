"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { createClient, isSupabaseReady } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import {
  ShieldCheck,
  LogOut,
  Globe,
  Lock,
  Github,
  Loader2,
  Mail,
  KeyRound,
  UserPlus,
  LogIn,
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react";

/* ─── Friendly Error Mapper ──────────────────────────────────────────────── */
function friendlyAuthError(raw: string): string {
  const checks: [string, string][] = [
    ["provider is not enabled", "This sign-in method isn't enabled yet. Use Email / Password or enable the provider in your Supabase dashboard → Authentication → Providers."],
    ["Provider not found",      "This sign-in method isn't enabled yet. Use Email / Password or enable the provider in your Supabase dashboard → Authentication → Providers."],
    ["Invalid login credentials","Incorrect email or password. Double-check and try again."],
    ["invalid_credentials",     "Incorrect email or password. Double-check and try again."],
    ["Email not confirmed",     "Check your inbox for a confirmation link before signing in."],
    ["User already registered", "An account with this email already exists — try signing in."],
    ["Password should be at least", "Password must be at least 6 characters."],
    ["Unable to validate email", "Please enter a valid email address."],
    ["rate limit",              "Too many attempts — wait a moment and try again."],
    ["too many requests",       "Too many attempts — wait a moment and try again."],
  ];
  for (const [needle, msg] of checks) {
    if (raw.includes(needle)) return msg;
  }
  return raw;
}

/* ─── Google "G" SVG Icon ─────────────────────────────────────────────────── */
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

/* ─── Component ──────────────────────────────────────────────────────────── */
export function UserNav() {
  const [user, setUser] = useState<User | null>(null);
  const [isShowcasePublic, setIsShowcasePublic] = useState(false);
  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const [isOpenAuthModal, setIsOpenAuthModal] = useState(false);

  const [activeTab, setActiveTab] = useState<"social" | "email">("email");
  const [emailMode, setEmailMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningIn, setIsSigningIn] = useState<"github" | "google" | "email" | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  const supabaseReady = isSupabaseReady();
  const supabase = useMemo(() => createClient(), []);

  /* ── Auth listener ─ */
  useEffect(() => {
    if (!supabaseReady) return;
    (async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error && !error.message.includes("Auth session missing")) {
        console.error("[ResumeOS] getUser:", error.message);
      }
      setUser(error ? null : data.user);
    })();

    const { data: listener } = supabase.auth.onAuthStateChange((_ev, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, [supabase, supabaseReady]);

  /* ── Helpers ─ */
  const reset = useCallback(() => {
    setAuthError(null); setAuthSuccess(null); setIsSigningIn(null);
    setEmail(""); setPassword("");
  }, []);

  /* ESC to close */
  useEffect(() => {
    if (!isOpenAuthModal) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") { setIsOpenAuthModal(false); reset(); } };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpenAuthModal, reset]);

  /* ── OAuth ─ */
  const handleOAuth = async (provider: "github" | "google") => {
    setAuthError(null); setAuthSuccess(null); setIsSigningIn(provider);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider, options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) { setAuthError(friendlyAuthError(error.message)); setIsSigningIn(null); }
    } catch (err: unknown) {
      setAuthError(friendlyAuthError(err instanceof Error ? err.message : "Unknown error"));
      setIsSigningIn(null);
    }
  };

  /* ── Email ─ */
  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null); setAuthSuccess(null);
    if (!email.trim()) { setAuthError("Enter your email address."); return; }
    if (password.length < 6) { setAuthError("Password must be at least 6 characters."); return; }

    setIsSigningIn("email");
    try {
      if (emailMode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) { setAuthError(friendlyAuthError(error.message)); setIsSigningIn(null); }
        else { setIsOpenAuthModal(false); reset(); }
      } else {
        const { error } = await supabase.auth.signUp({
          email: email.trim(), password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) { setAuthError(friendlyAuthError(error.message)); setIsSigningIn(null); }
        else { setAuthSuccess("Account created — check your email for a verification link."); setEmailMode("signin"); setPassword(""); setIsSigningIn(null); }
      }
    } catch (err: unknown) {
      setAuthError(friendlyAuthError(err instanceof Error ? err.message : "Unknown error"));
      setIsSigningIn(null);
    }
  };

  /* ── Sign Out ─ */
  const handleSignOut = async () => {
    await supabase.auth.signOut().catch(() => {});
    setUser(null); setIsOpenMenu(false);
  };

  if (!supabaseReady) return null;

  /* ═══════════════════════════════════════════════════════════════════════
     UNAUTHENTICATED — Sign In button + modal
     ═══════════════════════════════════════════════════════════════════════ */
  if (!user) {
    return (
      <>
        <button
          id="user-nav-signin-btn"
          onClick={() => { reset(); setIsOpenAuthModal(true); }}
          className="group flex items-center gap-2 h-8 px-3.5 rounded-lg text-xs font-semibold
            border border-slate-200 dark:border-zinc-700/80
            bg-surface-light dark:bg-zinc-800/80
            text-slate-700 dark:text-zinc-200
            hover:border-indigo-400 dark:hover:border-indigo-500
            hover:opacity-90 dark:hover:opacity-90/30
            shadow-sm transition-all duration-150"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-accent-espresso dark:text-accent-lime" />
          Sign In
        </button>

        {/* ── Modal Overlay ── */}
        {isOpenAuthModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4
              bg-black/50 dark:bg-background-dark/70 backdrop-blur-sm"
            onClick={e => { if (e.target === e.currentTarget) { setIsOpenAuthModal(false); reset(); } }}
          >
            {/* Card */}
            <div className="relative w-[92vw] max-w-md mx-auto p-5 sm:p-6 rounded-2xl overflow-hidden
              border border-slate-200/90 dark:border-border-dark
              bg-surface-light dark:bg-accent-espresso
              shadow-2xl shadow-black/10 dark:shadow-black/40">

              {/* Close */}
              <button onClick={() => { setIsOpenAuthModal(false); reset(); }}
                className="absolute top-3.5 right-3.5 z-10 p-1 rounded-md
                  text-slate-400 dark:text-text-primaryDark0
                  hover:text-slate-600 dark:hover:text-zinc-300
                  hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Header */}
              <div className="px-6 pt-6 pb-4 text-center">
                <div className="w-11 h-11 mx-auto mb-3 rounded-xl
                  bg-gradient-to-br from-indigo-600 to-violet-600
                  text-white flex items-center justify-center
                  font-bold font-mono text-xl shadow-lg shadow-indigo-600/25">
                  R
                </div>
                <h2 className="text-[17px] font-bold text-slate-900 dark:text-text-primaryDark tracking-[-0.01em]">
                  Sign in to ResumeOS
                </h2>
                <p className="mt-1 text-[13px] text-slate-500 dark:text-text-mutedLight">
                  Unlock Peer Directory publishing &amp; saved audit history.
                </p>
              </div>

              {/* Tab Bar */}
              <div className="mx-6 p-1 rounded-xl bg-slate-100 dark:bg-zinc-800/60 flex gap-1">
                {([
                  { key: "email" as const, label: "Email", icon: Mail },
                  { key: "social" as const, label: "Social", icon: Globe },
                ]).map(({ key, label, icon: Icon }) => (
                  <button key={key} type="button"
                    onClick={() => { setActiveTab(key); setAuthError(null); setAuthSuccess(null); }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                      activeTab === key
                        ? "bg-surface-light dark:bg-zinc-700 text-slate-900 dark:text-text-primaryDark shadow-sm"
                        : "text-slate-500 dark:text-text-mutedLight hover:text-slate-700 dark:hover:text-zinc-200"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="px-6 pt-4 pb-5 space-y-3.5">

                {/* ── Email Tab ── */}
                {activeTab === "email" && (
                  <>
                    {/* Sign In / Sign Up pill */}
                    <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/60 dark:border-zinc-700/40">
                      {([
                        { mode: "signin" as const, label: "Sign In", icon: LogIn },
                        { mode: "signup" as const, label: "Create Account", icon: UserPlus },
                      ]).map(({ mode, label, icon: Icon }) => (
                        <button key={mode} type="button"
                          onClick={() => { setEmailMode(mode); setAuthError(null); setAuthSuccess(null); }}
                          className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${
                            emailMode === mode
                              ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/20"
                              : "text-slate-500 dark:text-text-mutedLight hover:text-slate-800 dark:hover:text-zinc-200"
                          }`}
                        >
                          <Icon className="w-3 h-3" />
                          {label}
                        </button>
                      ))}
                    </div>

                    <form onSubmit={handleEmail} className="space-y-3">
                      {/* Email field */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-text-mutedLight mb-1.5 pl-0.5">
                          Email
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-text-primaryDark0 pointer-events-none" />
                          <input id="auth-email-input" type="email" autoComplete="email"
                            value={email} onChange={e => setEmail(e.target.value)}
                            placeholder="you@company.com" required
                            className="w-full h-10 pl-10 pr-3 rounded-lg text-[13px] font-medium
                              border border-slate-200 dark:border-zinc-700
                              bg-surface-light dark:bg-zinc-800/60
                              text-slate-900 dark:text-text-primaryDark
                              placeholder:text-slate-400 dark:placeholder:text-text-mutedLight
                              focus:outline-none focus:ring-2 focus:ring-accent-espresso dark:focus:ring-accent-lime/40 focus:border-indigo-500
                              dark:focus:ring-indigo-400/30 dark:focus:border-indigo-400
                              transition-all duration-150"
                          />
                        </div>
                      </div>

                      {/* Password field */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-text-mutedLight mb-1.5 pl-0.5">
                          Password
                        </label>
                        <div className="relative">
                          <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-text-primaryDark0 pointer-events-none" />
                          <input id="auth-password-input" type="password"
                            autoComplete={emailMode === "signup" ? "new-password" : "current-password"}
                            value={password} onChange={e => setPassword(e.target.value)}
                            placeholder={emailMode === "signup" ? "Min. 6 characters" : "••••••••"}
                            required minLength={6}
                            className="w-full h-10 pl-10 pr-3 rounded-lg text-[13px] font-medium
                              border border-slate-200 dark:border-zinc-700
                              bg-surface-light dark:bg-zinc-800/60
                              text-slate-900 dark:text-text-primaryDark
                              placeholder:text-slate-400 dark:placeholder:text-text-mutedLight
                              focus:outline-none focus:ring-2 focus:ring-accent-espresso dark:focus:ring-accent-lime/40 focus:border-indigo-500
                              dark:focus:ring-indigo-400/30 dark:focus:border-indigo-400
                              transition-all duration-150"
                          />
                        </div>
                      </div>

                      {/* Submit */}
                      <button id="auth-email-submit-btn" type="submit"
                        disabled={isSigningIn !== null}
                        className="w-full h-10 flex items-center justify-center gap-2 rounded-lg
                          text-[13px] font-bold text-white
                          bg-indigo-600 hover:opacity-90
                          dark:bg-indigo-500 dark:hover:opacity-90
                          shadow-sm shadow-indigo-600/20
                          disabled:opacity-60 disabled:cursor-not-allowed
                          transition-colors duration-150"
                      >
                        {isSigningIn === "email"
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : emailMode === "signin" ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                        {isSigningIn === "email"
                          ? "Authenticating…"
                          : emailMode === "signin" ? "Sign In" : "Create Account"}
                      </button>
                    </form>
                  </>
                )}

                {/* ── Social Tab ── */}
                {activeTab === "social" && (
                  <div className="space-y-2.5 pt-1">
                    <button id="signin-github-btn"
                      onClick={() => handleOAuth("github")}
                      disabled={isSigningIn !== null}
                      className="w-full h-10 flex items-center justify-center gap-2.5 rounded-lg
                        text-[13px] font-semibold
                        border border-slate-800 dark:border-zinc-600
                        bg-slate-900 dark:bg-zinc-800 text-white
                        hover:bg-slate-800 dark:hover:bg-zinc-700
                        disabled:opacity-60 disabled:cursor-not-allowed
                        transition-colors duration-150"
                    >
                      {isSigningIn === "github"
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Github className="w-4 h-4" />}
                      {isSigningIn === "github" ? "Redirecting…" : "Continue with GitHub"}
                    </button>

                    <button id="signin-google-btn"
                      onClick={() => handleOAuth("google")}
                      disabled={isSigningIn !== null}
                      className="w-full h-10 flex items-center justify-center gap-2.5 rounded-lg
                        text-[13px] font-semibold
                        border border-slate-200 dark:border-zinc-700
                        bg-surface-light dark:bg-zinc-800/60
                        text-slate-700 dark:text-zinc-200
                        hover:bg-slate-50 dark:hover:bg-zinc-700
                        disabled:opacity-60 disabled:cursor-not-allowed
                        transition-colors duration-150"
                    >
                      {isSigningIn === "google"
                        ? <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                        : <GoogleIcon className="w-4 h-4" />}
                      {isSigningIn === "google" ? "Redirecting…" : "Continue with Google"}
                    </button>

                    <p className="text-center text-[11px] text-slate-400 dark:text-text-primaryDark0 pt-1">
                      OAuth must be enabled in your Supabase project.
                    </p>
                  </div>
                )}

                {/* ── Feedback Banners ── */}
                {authError && (
                  <div className="flex items-start gap-2 p-3 rounded-lg
                    border border-rose-200 dark:border-rose-800/60
                    bg-rose-50/80 dark:bg-rose-950/30
                    text-rose-700 dark:text-rose-300">
                    <AlertCircle className="w-4 h-4 mt-px flex-shrink-0" />
                    <p className="text-xs leading-relaxed font-medium">{authError}</p>
                  </div>
                )}
                {authSuccess && (
                  <div className="flex items-start gap-2 p-3 rounded-lg
                    border border-emerald-200 dark:border-emerald-800/60
                    bg-emerald-50/80 dark:bg-emerald-950/30
                    text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 mt-px flex-shrink-0" />
                    <p className="text-xs leading-relaxed font-medium">{authSuccess}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  /* ═══════════════════════════════════════════════════════════════════════
     AUTHENTICATED — User dropdown
     ═══════════════════════════════════════════════════════════════════════ */
  const initial = user.email ? user.email[0].toUpperCase() : "U";

  return (
    <div className="relative">
      <button id="user-nav-menu-btn"
        onClick={() => setIsOpenMenu(v => !v)}
        className="flex items-center gap-2 h-8 px-2.5 rounded-full
          border border-slate-200 dark:border-zinc-700/80
          bg-surface-light dark:bg-zinc-800/80
          text-slate-700 dark:text-text-mutedDark
          hover:bg-slate-50 dark:hover:bg-zinc-800
          shadow-sm transition-all duration-150"
      >
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600
          text-white flex items-center justify-center text-[11px] font-mono font-bold shadow-inner">
          {initial}
        </div>
        <span className="text-xs font-mono font-medium hidden sm:inline-block max-w-[100px] truncate">
          {user.email}
        </span>
        <span className={`w-1.5 h-1.5 rounded-full ${isShowcasePublic ? "bg-emerald-500 animate-pulse" : "bg-slate-400 dark:bg-zinc-600"}`} />
      </button>

      {isOpenMenu && (
        <div className="absolute right-0 mt-2 w-56 p-1.5 rounded-xl
          border border-slate-200/90 dark:border-zinc-700/70
          bg-surface-light dark:bg-accent-espresso
          shadow-xl shadow-black/8 dark:shadow-black/30
          space-y-0.5 text-xs z-50">

          <div className="px-3 py-2 border-b border-slate-100 dark:border-zinc-800">
            <p className="font-semibold text-slate-900 dark:text-text-primaryDark truncate">{user.email}</p>
            <p className="text-[10px] text-slate-400 dark:text-text-primaryDark0 font-mono mt-0.5">Authenticated</p>
          </div>

          <button onClick={() => setIsShowcasePublic(p => !p)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg
              hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors text-left">
            <span className="flex items-center gap-2 text-slate-700 dark:text-text-mutedDark">
              {isShowcasePublic ? <Globe className="w-3.5 h-3.5 text-emerald-500" /> : <Lock className="w-3.5 h-3.5 text-slate-400" />}
              Showcase Profile
            </span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
              isShowcasePublic
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                : "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-text-mutedLight"
            }`}>
              {isShowcasePublic ? "Public" : "Private"}
            </span>
          </button>

          <button onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg
              hover:bg-rose-50 dark:hover:bg-rose-950/40
              text-rose-600 dark:text-rose-400 transition-colors text-left font-medium">
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
