import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export interface PeerProfile {
  id: string;
  user_id?: string;
  display_name: string;
  is_anonymous: boolean;
  domain: string;
  experience_level: string;
  ats_score: number;
  ai_probability_score: number;
  verified_skills: string[];
  top_project_summary: string;
  top_xyz_bullet: string;
  github_url?: string;
  linkedin_url?: string;
  is_public: boolean;
  updated_at: string;
}

const SEED_PEER_PROFILES: PeerProfile[] = [
  {
    id: "seed-1",
    display_name: "Dev #4092 (Anonymized)",
    is_anonymous: true,
    domain: "Backend & Distributed Systems",
    experience_level: "Mid-Level (3-5 yrs)",
    ats_score: 94,
    ai_probability_score: 8,
    verified_skills: ["Go", "gRPC", "PostgreSQL", "Redis", "Docker", "Kafka"],
    top_project_summary: "High-throughput message streaming broker handling 50k req/sec with zero loss.",
    top_xyz_bullet: "Architected distributed Kafka pipeline in Go, reducing processing latency by [420 ms] across 2.5M daily events.",
    github_url: "https://github.com",
    is_public: true,
    updated_at: new Date().toISOString(),
  },
  {
    id: "seed-2",
    display_name: "Sarah Chen",
    is_anonymous: false,
    domain: "Frontend Engineering",
    experience_level: "Senior (5+ yrs)",
    ats_score: 91,
    ai_probability_score: 12,
    verified_skills: ["React 19", "Next.js 15", "TypeScript", "TailwindCSS", "Zustand", "GraphQL"],
    top_project_summary: "Design system & component library powering 4 enterprise web products.",
    top_xyz_bullet: "Front-loaded React 19 server components into checkout flow, boosting Core Web Vitals LCP by [65%].",
    github_url: "https://github.com",
    linkedin_url: "https://linkedin.com",
    is_public: true,
    updated_at: new Date().toISOString(),
  },
  {
    id: "seed-3",
    display_name: "Marcus Vance",
    is_anonymous: false,
    domain: "Full-Stack Engineering",
    experience_level: "Mid-Level (3-5 yrs)",
    ats_score: 88,
    ai_probability_score: 15,
    verified_skills: ["TypeScript", "Node.js", "Python", "Next.js", "AWS S3", "Prisma"],
    top_project_summary: "AI Document parser & analytics dashboard for legal tech platform.",
    top_xyz_bullet: "Implemented asynchronous PDF text extraction engine in Node.js, slashing document audit times from [14s] to [1.2s].",
    github_url: "https://github.com",
    is_public: true,
    updated_at: new Date().toISOString(),
  },
  {
    id: "seed-4",
    display_name: "Dev #8821 (Anonymized)",
    is_anonymous: true,
    domain: "Data Science & ML",
    experience_level: "Junior (1-2 yrs)",
    ats_score: 86,
    ai_probability_score: 18,
    verified_skills: ["Python", "PyTorch", "Pandas", "Scikit-Learn", "FastAPI", "MLflow"],
    top_project_summary: "NLP Intent classifier microservice for customer support routing.",
    top_xyz_bullet: "Trained BERT classifier on 120,000 support tickets, improving automatic routing accuracy by [28%].",
    is_public: true,
    updated_at: new Date().toISOString(),
  },
  {
    id: "seed-5",
    display_name: "David K.",
    is_anonymous: false,
    domain: "DevOps & Cloud Infrastructure",
    experience_level: "Senior (5+ yrs)",
    ats_score: 95,
    ai_probability_score: 5,
    verified_skills: ["Kubernetes", "Terraform", "AWS", "GitHub Actions", "Prometheus", "Helm"],
    top_project_summary: "Multi-region Kubernetes deployment pipeline with automated canary rollouts.",
    top_xyz_bullet: "Orchestrated Terraform AWS Infrastructure across 3 regions, achieving 99.999% SLA uptime.",
    github_url: "https://github.com",
    is_public: true,
    updated_at: new Date().toISOString(),
  },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const domainFilter = searchParams.get("domain") || "All";

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("peer_profiles")
      .select("*")
      .eq("is_public", true)
      .order("ats_score", { ascending: false });

    if (!error && data && data.length > 0) {
      const filtered = domainFilter === "All"
        ? data
        : data.filter((p) => p.domain === domainFilter);
      return NextResponse.json({ profiles: filtered });
    }
  } catch (err) {
    console.warn("Supabase Query Fallback:", err);
  }

  // Return seed fallback directory profiles filtered by domain
  const filteredSeed = domainFilter === "All"
    ? SEED_PEER_PROFILES
    : SEED_PEER_PROFILES.filter((p) => p.domain === domainFilter);

  return NextResponse.json({ profiles: filteredSeed });
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const profileData = {
      user_id: userData.user.id,
      display_name: body.is_anonymous ? `Dev #${userData.user.id.slice(0, 4)}` : (body.display_name || userData.user.email?.split("@")[0] || "Dev"),
      is_anonymous: !!body.is_anonymous,
      domain: body.domain || "Full-Stack Engineering",
      experience_level: body.experience_level || "Mid-Level (3-5 yrs)",
      ats_score: body.ats_score || 85,
      ai_probability_score: body.ai_probability_score || 10,
      verified_skills: body.verified_skills || ["TypeScript", "React", "Node.js"],
      top_project_summary: body.top_project_summary || "Engineering portfolio projects",
      top_xyz_bullet: body.top_xyz_bullet || "Accomplished [X] by doing [Z]",
      github_url: body.github_url || null,
      linkedin_url: body.linkedin_url || null,
      is_public: body.is_public !== undefined ? body.is_public : true,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("peer_profiles")
      .upsert(profileData, { onConflict: "user_id" })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ profile: data });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
