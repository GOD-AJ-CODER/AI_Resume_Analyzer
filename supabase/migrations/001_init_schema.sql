-- 1. Scan Cache Table (SHA-256 Deduplication to save LLM quota)
CREATE TABLE IF NOT EXISTS public.scan_cache (
    input_hash TEXT PRIMARY KEY,
    audit_payload JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. IP Rate Limiting Table (Zero-Redis serverless rate limiting)
CREATE TABLE IF NOT EXISTS public.rate_limits (
    ip_address TEXT PRIMARY KEY,
    scan_count INT DEFAULT 1,
    window_start TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Peer Showcase Directory Table (Opt-In Public Profiles)
CREATE TABLE IF NOT EXISTS public.peer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    display_name TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    domain TEXT NOT NULL,
    experience_level TEXT NOT NULL,
    ats_score INT NOT NULL CHECK (ats_score >= 0 AND ats_score <= 100),
    ai_probability_score INT NOT NULL CHECK (ai_probability_score >= 0 AND ai_probability_score <= 100),
    verified_skills TEXT[] NOT NULL DEFAULT '{}',
    top_project_summary TEXT NOT NULL,
    top_xyz_bullet TEXT NOT NULL,
    github_url TEXT,
    linkedin_url TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast Peer Directory filtering
CREATE INDEX IF NOT EXISTS idx_peer_profiles_domain ON public.peer_profiles(domain) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_peer_profiles_score ON public.peer_profiles(ats_score DESC) WHERE is_public = TRUE;

-- Enable Row Level Security (RLS)
ALTER TABLE public.peer_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Peer Directory
CREATE POLICY "Public profiles are viewable by everyone"
ON public.peer_profiles FOR SELECT
USING (is_public = TRUE OR auth.uid() = user_id);

CREATE POLICY "Users can upsert their own profile"
ON public.peer_profiles FOR ALL
USING (auth.uid() = user_id);
