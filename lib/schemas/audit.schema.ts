import { z } from "zod";

export const BucketScoreSchema = z.object({
  id: z.string(),
  name: z.string(),
  weight: z.number(), // out of 100
  score: z.number(), // out of 100
  weightedPoints: z.number(),
  passedChecks: z.array(z.string()),
  failedChecks: z.array(z.string()),
  priority: z.number(), // for priority fixes
  severity: z.enum(["Critical", "High", "Medium", "Low"]),
  feedback: z.object({
    whatsWrong: z.string(),
    whyItHurts: z.string(),
    howToFix: z.string(),
    beforeRewrite: z.string().optional(),
    afterRewrite: z.string().optional()
  })
});

export const ResumeAuditSchema = z.object({
  rawScore: z.number(),
  finalScore: z.number(),
  isCapped: z.boolean(),
  capReason: z.string().optional(),
  gradeBadge: z.string(),
  aiBuzzwordProbability: z.number(),
  buckets: z.array(BucketScoreSchema),
  topPriorityFixes: z.array(BucketScoreSchema),
  jdMatchMode: z.boolean(),
  jdMatchScore: z.number().optional(),
  jdMatchMatrix: z.object({
    matchedKeywords: z.array(z.string()),
    missingKeywords: z.array(z.string())
  }).optional(),
  extractedSearchProfile: z.object({
    targetTitles: z.array(z.string()),
    topVerifiedSkills: z.array(z.string())
  }),
  experienceTier: z.string()
});

export type BucketScore = z.infer<typeof BucketScoreSchema>;
export type ResumeAuditPayload = z.infer<typeof ResumeAuditSchema>;
