import Groq from "groq-sdk";
import { ResumeAuditSchema, type ResumeAuditPayload } from "@/lib/schemas/audit.schema";

export function getGroqClient(customApiKey?: string | null): Groq {
  const apiKey = customApiKey?.trim() || process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GROQ_API_KEY is not configured. Please set GROQ_API_KEY in your environment or provide a key via the BYOK modal."
    );
  }

  return new Groq({ apiKey });
}

const FALLBACK_MODELS = [
  process.env.GROQ_MODEL,
  "openai/gpt-oss-120b",
  "qwen/qwen3.8-27b",
  "openai/gpt-oss-20b",
].filter(Boolean) as string[];

export async function runGroqAudit(
  systemPrompt: string,
  userContent: string,
  customApiKey?: string | null
): Promise<ResumeAuditPayload> {
  const groq = getGroqClient(customApiKey);

  let lastError: unknown;

  for (const model of FALLBACK_MODELS) {
    try {
      const completion = await groq.chat.completions.create({
        model,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userContent,
          },
        ],
      });

      const rawJson = completion.choices[0]?.message?.content;
      if (!rawJson) {
        throw new Error("Received empty response from Groq AI model.");
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(rawJson);
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to parse Groq response as JSON: ${msg}`);
      }

      const validated = ResumeAuditSchema.safeParse(parsed);
      if (!validated.success) {
        console.error("Zod Validation Error:", validated.error.format());
        throw new Error(
          `Groq AI JSON schema validation failed: ${validated.error.issues[0]?.message || "Invalid schema structure"}`
        );
      }

      return validated.data;
    } catch (err: any) {
      lastError = err;
      const is404 =
        err?.status === 404 ||
        err?.error?.code === "model_not_found" ||
        err?.message?.includes("does not exist");

      if (is404) {
        console.warn(`[Groq Audit] Model '${model}' returned 404, falling back to next available model...`);
        continue;
      }
      throw err;
    }
  }

  throw lastError || new Error("All candidate Groq models failed.");
}
