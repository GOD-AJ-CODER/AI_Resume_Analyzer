import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isSupabaseConfigured = !!(SUPABASE_URL && SUPABASE_ANON_KEY);

if (!isSupabaseConfigured && typeof window !== "undefined") {
  console.warn(
    "[ResumeOS] Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
    "NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file to enable authentication. " +
    "The app will continue to function in offline mode without auth."
  );
}

export function createClient() {
  return createBrowserClient(
    SUPABASE_URL ?? "https://placeholder.supabase.co",
    SUPABASE_ANON_KEY ?? "placeholder-anon-key"
  );
}

/** Returns true only when real Supabase credentials are present. */
export function isSupabaseReady(): boolean {
  return isSupabaseConfigured;
}
