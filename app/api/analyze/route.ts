export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { parseDocument } from "@/lib/parsers/document-parser";
import { normalizeResumeText, normalizeJdText } from "@/lib/parsers/text-normalizer";
import { generateInputHash } from "@/lib/crypto/hash";
import { generateDeterministicBuckets, calculateExperienceTier, calculateAiRisk } from "@/lib/engines/ats-deterministic";
import { runGroqAudit } from "@/lib/ai/groq-client";
import { RESUME_AUDIT_SYSTEM_PROMPT, buildUserPrompt } from "@/lib/ai/prompts/resume-audit.prompt";
import { run3LayerJobPipeline } from "@/lib/jobs/job-pipeline";
import { VerifiedJob } from "@/lib/jobs/layer2-3-credibility";
import { ResumeAuditPayload, BucketScore } from "@/lib/schemas/audit.schema";
import { getCachedAudit, setCachedAudit, checkIpRateLimit } from "@/lib/cache/audit-cache";

export async function POST(req: NextRequest) {
  try {
    const customApiKey = req.headers.get("x-custom-api-key");
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";

    const rateLimit = checkIpRateLimit(clientIp, !!customApiKey);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "RATE_LIMIT_EXCEEDED",
          message: `Free scan limit (3 scans/hour) reached. Please try again in ${rateLimit.resetMinutes} minutes or enter your free Groq API Key via the BYOK modal in the top bar.`,
          openByokModal: true,
        },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const rawText = (formData.get("rawText") as string | null) || "";
    const rawJd = (formData.get("jdText") as string | null) || "";

    let extractedResumeText = "";
    let fileName = "pasted-resume.txt";
    let mimeType = "text/plain";
    let fileSize = 0;

    if (file && file.size > 0) {
      fileName = file.name;
      mimeType = file.type;
      fileSize = file.size;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const parsedDoc = await parseDocument(buffer, fileName, mimeType);
      extractedResumeText = parsedDoc.text;
    } else if (rawText.trim().length > 0) {
      extractedResumeText = rawText;
      fileSize = Buffer.byteLength(rawText, "utf-8");
    } else {
      return NextResponse.json(
        { error: "No resume file or text content provided." },
        { status: 400 }
      );
    }

    const cleanResumeText = normalizeResumeText(extractedResumeText);
    const cleanJdText = normalizeJdText(rawJd);

    const inputHash = generateInputHash(cleanResumeText, cleanJdText);

    const cachedPayload = await getCachedAudit(inputHash);
    if (cachedPayload) {
      return NextResponse.json(
        {
          ...cachedPayload,
          isCacheHit: true,
          remainingScans: rateLimit.remaining,
        },
        { status: 200 }
      );
    }

    // 1. Run 100% Deterministic Evaluator
    const buckets: BucketScore[] = generateDeterministicBuckets(cleanResumeText);
    let rawScore = buckets.reduce((acc, b) => acc + b.weightedPoints, 0);
    const expTier = calculateExperienceTier(cleanResumeText);
    const aiRiskResult = calculateAiRisk(cleanResumeText);

    // 2. Call LLM for Semantic Rewrites & JD Matching
    let aiAuditPayload: any = null;
    let aiErrorMsg: string | undefined = undefined;

    try {
      // Automatic fallback handled in groq-client (we assume it handles 70b -> 8b)
      aiAuditPayload = await runGroqAudit(
        RESUME_AUDIT_SYSTEM_PROMPT,
        buildUserPrompt(cleanResumeText, cleanJdText),
        customApiKey
      );
    } catch (err) {
      aiErrorMsg = `AI Audit unavailable: ${err instanceof Error ? err.message : String(err)}`;
      console.warn(aiErrorMsg);
    }

    // 3. Merge AI Rewrites into Buckets
    if (aiAuditPayload?.semanticRewrites) {
      const b4 = buckets.find(b => b.id === "b4");
      if (b4 && aiAuditPayload.semanticRewrites.summary) {
        b4.feedback.beforeRewrite = aiAuditPayload.semanticRewrites.summary.before;
        b4.feedback.afterRewrite = aiAuditPayload.semanticRewrites.summary.after;
      }
      const b5 = buckets.find(b => b.id === "b5");
      if (b5 && aiAuditPayload.semanticRewrites.workExperience) {
        b5.feedback.beforeRewrite = aiAuditPayload.semanticRewrites.workExperience.before;
        b5.feedback.afterRewrite = aiAuditPayload.semanticRewrites.workExperience.after;
      }
      const b8 = buckets.find(b => b.id === "b8");
      if (b8 && aiAuditPayload.semanticRewrites.projects) {
        b8.feedback.beforeRewrite = aiAuditPayload.semanticRewrites.projects.before;
        b8.feedback.afterRewrite = aiAuditPayload.semanticRewrites.projects.after;
      }
      const b10 = buckets.find(b => b.id === "b10");
      if (b10 && aiAuditPayload.semanticRewrites.readability) {
        b10.feedback.beforeRewrite = aiAuditPayload.semanticRewrites.readability.before;
        b10.feedback.afterRewrite = aiAuditPayload.semanticRewrites.readability.after;
      }
    }

    // 4. Hard Constraints & Penalty Caps
    let finalScore = rawScore;
    let isCapped = false;
    let capReason = undefined;
    const wordCount = cleanResumeText.split(/\s+/).length;
    const hasPhone = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(cleanResumeText);
    const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i.test(cleanResumeText);
    const hasDates = /\b(19|20)\d{2}\b/.test(cleanResumeText);
    const hasExp = /(experience|employment)/i.test(cleanResumeText);
    const hasProj = /(projects)/i.test(cleanResumeText);
    const hasSkills = /(skills)/i.test(cleanResumeText);

    if (wordCount < 50) {
      finalScore = Math.min(finalScore, 20);
      isCapped = true;
      capReason = "Unreadable / <50 words extracted.";
    } else if (fileName.endsWith(".pdf") && wordCount < 100) {
      finalScore = Math.min(finalScore, 30);
      isCapped = true;
      capReason = "Image-only or scanned PDF.";
    } else if (!hasEmail || !hasPhone) {
      finalScore = Math.min(finalScore, 50);
      isCapped = true;
      capReason = "Missing Email OR Phone Number.";
    } else if (!hasDates) {
      finalScore = Math.min(finalScore, 60);
      isCapped = true;
      capReason = "Missing Dates on Experience/Education.";
    } else if ((!hasExp && !hasProj) || !hasSkills) {
      finalScore = Math.min(finalScore, 60);
      isCapped = true;
      capReason = "Missing core sections (Experience/Projects or Skills).";
    }

    const b1 = buckets.find(b => b.id === "b1");
    if (b1 && b1.failedChecks.some(c => c.includes("column layout"))) {
      b1.score = Math.min(b1.score, 40);
      b1.weightedPoints = (b1.score * 15) / 100;
      finalScore = buckets.reduce((acc, b) => acc + b.weightedPoints, 0); // recalculate
      if (!isCapped) {
        isCapped = true;
        capReason = "Multi-column / broken table layout.";
      }
    }

    finalScore = Math.round(finalScore);
    rawScore = Math.round(rawScore);

    // 5. Calculate JD Match Mode
    let jdMatchMode = false;
    let jdMatchScore = undefined;
    let jdMatchMatrix = undefined;
    if (cleanJdText.length > 50 && aiAuditPayload?.jdMatch) {
      jdMatchMode = true;
      const jdm = aiAuditPayload.jdMatch;
      // Keyword Coverage (40%), Hard Skills Match (25%), Soft Skills Match (10%), Job Title/Role Alignment (10%), Experience Level Match (10%), Education/Certification Match (5%).
      const calcJdScore = 
        (jdm.keywordCoverage * 0.40) + 
        (jdm.hardSkillsMatch * 0.25) + 
        (jdm.softSkillsMatch * 0.10) + 
        (jdm.roleAlignment * 0.10) + 
        (jdm.experienceMatch * 0.10) + 
        (jdm.educationMatch * 0.05);
      
      jdMatchScore = Math.round(calcJdScore);
      finalScore = Math.round((0.7 * finalScore) + (0.3 * jdMatchScore));
      jdMatchMatrix = {
        matchedKeywords: jdm.matchedKeywords || [],
        missingKeywords: jdm.missingKeywords || []
      };
    }

    const gradeBadge = finalScore >= 90 ? "90–100 Excellent" : finalScore >= 75 ? "75–89 Good" : finalScore >= 60 ? "60–74 Needs Work" : finalScore >= 40 ? "40–59 Poor" : "0–39 Critical";

    // Sort Priority Fixes
    const topPriorityFixes = [...buckets]
      .filter(b => b.score < 100)
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 5);

    const finalAiBuzzwordProb = Math.min(100, aiRiskResult.baseAiRisk + (aiAuditPayload?.aiBuzzwordProbability ? (aiAuditPayload.aiBuzzwordProbability * 0.3) : 0));

    const payload: ResumeAuditPayload = {
      rawScore,
      finalScore,
      isCapped,
      capReason,
      gradeBadge,
      aiBuzzwordProbability: Math.round(finalAiBuzzwordProb),
      buckets,
      topPriorityFixes,
      jdMatchMode,
      jdMatchScore,
      jdMatchMatrix,
      extractedSearchProfile: aiAuditPayload?.extractedSearchProfile || { targetTitles: ["Software Engineer"], topVerifiedSkills: ["JavaScript"] },
      experienceTier: expTier
    };

    // Refine jobs in background (doesn't block return, but wait, the prompt doesn't specify if we must return jobs here for Tab 2, yes we should, because AuditDashboard takes both).
    // Tab 2 uses jobs. 
    let jobsPayload: VerifiedJob[] = [];
    try {
      jobsPayload = await run3LayerJobPipeline(
        payload.extractedSearchProfile.targetTitles,
        payload.extractedSearchProfile.topVerifiedSkills,
        payload.experienceTier,
        customApiKey,
        "",
        "",
        "Internships (Student/Fresher)"
      );
    } catch (e) {
      console.warn("Job pipeline error:", e);
    }

    const responsePayload = {
      inputHash,
      deterministic: { contextualSkills: payload.extractedSearchProfile.topVerifiedSkills },
      aiAudit: payload,
      jobs: jobsPayload,
      error: aiErrorMsg,
      isCacheHit: false,
      remainingScans: rateLimit.remaining,
      meta: { fileName, fileSize, parsedCharLength: cleanResumeText.length, jdCharLength: cleanJdText.length },
    };

    if (aiAuditPayload) {
      await setCachedAudit(inputHash, responsePayload);
    }

    return NextResponse.json(responsePayload, { status: 200 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Analysis API Error:", msg);
    return NextResponse.json({ error: `Resume analysis failed: ${msg}` }, { status: 500 });
  }
}
