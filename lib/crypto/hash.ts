export const runtime = "nodejs";

import crypto from "crypto";

/**
 * Generates a deterministic SHA-256 hash for deduplication scan caching.
 */
export function generateInputHash(
  normalizedResumeText: string,
  normalizedJdText: string = ""
): string {
  const combinedInput = `${normalizedResumeText.trim()}::${normalizedJdText.trim()}`;
  return crypto.createHash("sha256").update(combinedInput, "utf8").digest("hex");
}
