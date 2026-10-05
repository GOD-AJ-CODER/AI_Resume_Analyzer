import { NextRequest, NextResponse } from "next/server";
import { run3LayerJobPipeline } from "@/lib/jobs/job-pipeline";

export async function POST(req: NextRequest) {
  try {
    const customApiKey = req.headers.get("x-custom-api-key");
    const body = await req.json();
    
    const targetTitles = body.targetTitles || ["Full Stack Software Engineer", "Backend Engineer"];
    const topSkills = body.topSkills || ["TypeScript", "React", "Node.js"];
    const experienceTier = body.experienceTier || "Mid-Level (3-5 yrs)";
    const location = body.location || "";
    const workPreference = body.workPreference || "";
    const roleType = body.roleType || "";

    const verifiedJobs = await run3LayerJobPipeline(
      targetTitles,
      topSkills,
      experienceTier,
      customApiKey,
      location,
      workPreference,
      roleType
    );

    return NextResponse.json({ jobs: verifiedJobs }, { status: 200 });
  } catch (error: any) {
    console.error("Job API Error:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch and verify jobs." },
      { status: 500 }
    );
  }
}
