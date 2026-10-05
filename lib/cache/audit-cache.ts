export const runtime = "nodejs";

import { createClient } from "@/lib/supabase/server";

interface CacheEntry {
  payload: any;
  timestamp: number;
}

// In-Memory Fast LRU Cache fallback for serverless execution (< 50ms)
const inMemoryCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function getCachedAudit(inputHash: string): Promise<any | null> {
  // 1. Check In-Memory Cache first (< 5ms)
  const memHit = inMemoryCache.get(inputHash);
  if (memHit) {
    if (Date.now() - memHit.timestamp < CACHE_TTL_MS) {
      return memHit.payload;
    } else {
      inMemoryCache.delete(inputHash);
    }
  }

  // 2. Check Supabase scan_cache Table
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("scan_cache")
      .select("audit_payload, created_at")
      .eq("input_hash", inputHash)
      .single();

    if (!error && data && data.audit_payload) {
      // Refresh in-memory cache
      inMemoryCache.set(inputHash, {
        payload: data.audit_payload,
        timestamp: new Date(data.created_at).getTime(),
      });
      return data.audit_payload;
    }
  } catch (err) {
    console.warn("Supabase Scan Cache fetch skipped:", err);
  }

  return null;
}

export async function setCachedAudit(inputHash: string, payload: any): Promise<void> {
  // 1. Save in Memory Cache
  inMemoryCache.set(inputHash, {
    payload,
    timestamp: Date.now(),
  });

  // 2. Save in Supabase scan_cache Table asynchronously
  try {
    const supabase = await createClient();
    await supabase.from("scan_cache").upsert({
      input_hash: inputHash,
      audit_payload: payload,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn("Supabase Scan Cache save skipped:", err);
  }
}

// In-Memory Rate Limiting for IP Protection (3 scans per 60 minutes)
const ipRateLimits = new Map<string, { count: number; windowStart: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 60 minutes
const MAX_FREE_SCANS_PER_HOUR = 3;

export function checkIpRateLimit(
  ipAddress: string,
  hasByok: boolean
): { allowed: boolean; remaining: number; resetMinutes: number } {
  // BYOK key bypasses IP rate limiting completely
  if (hasByok) {
    return { allowed: true, remaining: 999, resetMinutes: 0 };
  }

  const now = Date.now();
  const limit = ipRateLimits.get(ipAddress);

  if (!limit || now - limit.windowStart > RATE_LIMIT_WINDOW_MS) {
    ipRateLimits.set(ipAddress, { count: 1, windowStart: now });
    return { allowed: true, remaining: MAX_FREE_SCANS_PER_HOUR - 1, resetMinutes: 60 };
  }

  if (limit.count >= MAX_FREE_SCANS_PER_HOUR) {
    const elapsedMs = now - limit.windowStart;
    const resetMinutes = Math.ceil((RATE_LIMIT_WINDOW_MS - elapsedMs) / (1000 * 60));
    return { allowed: false, remaining: 0, resetMinutes };
  }

  limit.count += 1;
  ipRateLimits.set(ipAddress, limit);
  return {
    allowed: true,
    remaining: MAX_FREE_SCANS_PER_HOUR - limit.count,
    resetMinutes: 60,
  };
}
