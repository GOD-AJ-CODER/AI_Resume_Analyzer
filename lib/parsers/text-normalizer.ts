export interface NormalizationOptions {
  maxLength?: number;
  preserveParagraphs?: boolean;
}

/**
 * Normalizes raw document or job description text to reduce token usage and clean up extraction artifacts.
 */
export function normalizeText(
  text: string,
  options: NormalizationOptions = {}
): string {
  if (!text) return "";

  const { maxLength, preserveParagraphs = false } = options;

  // Replace non-standard whitespace and non-printable control characters
  let clean = text
    .replace(/[\r\t\f\v]/g, " ")
    .replace(/[\u200B-\u200D\uFEFF]/g, "") // Zero-width spaces
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, " "); // Keep basic ASCII printables & linebreaks

  // Normalize bullet points to standard dash
  clean = clean.replace(/[•●▪■◦‣⁃]/g, "- ");

  if (preserveParagraphs) {
    // Collapse multiple consecutive empty lines and trim spaces on each line
    clean = clean
      .split("\n")
      .map((line) => line.replace(/[ ]+/g, " ").trim())
      .filter((line, index, arr) => {
        if (line === "" && arr[index - 1] === "") return false;
        return true;
      })
      .join("\n");
  } else {
    // Collapse all whitespace into single spaces
    clean = clean.replace(/\s+/g, " ").trim();
  }

  // Hard truncate if length limit specified
  if (maxLength && clean.length > maxLength) {
    clean = clean.slice(0, maxLength);
  }

  return clean.trim();
}

/**
 * Specifically normalizes resume text with 12,000 char limit.
 */
export function normalizeResumeText(text: string): string {
  return normalizeText(text, { maxLength: 12000, preserveParagraphs: true });
}

/**
 * Specifically normalizes job description text with 6,000 char limit.
 */
export function normalizeJdText(text: string): string {
  return normalizeText(text, { maxLength: 6000, preserveParagraphs: true });
}
