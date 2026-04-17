-- ============================================================
-- SkillProof ATS — Supabase Schema Migration
-- Run this in your Supabase SQL Editor
-- Table: analyses (stores every analysis run by a user)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.analyses (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Input metadata
  job_title     TEXT,                      -- extracted or user-provided
  github_username TEXT,
  background_type TEXT,

  -- Scores (stored as integers: 0-100)
  overall_match     INTEGER NOT NULL,
  semantic_fit      INTEGER NOT NULL DEFAULT 0,
  achievement_score INTEGER NOT NULL DEFAULT 0,
  github_score      INTEGER NOT NULL DEFAULT 0,
  match_level       TEXT NOT NULL,         -- 'Strong Match' | 'Moderate Match' | 'Low Match'

  -- Rich data (stored as JSON arrays/objects)
  missing_skills    JSONB DEFAULT '[]',
  alternative_roles JSONB DEFAULT '[]',
  insights          JSONB DEFAULT '[]',
  github_analysis   TEXT,

  -- Truncated resume text for re-analysis reference (max ~2000 chars)
  resume_snippet    TEXT
);

-- Enable Row-Level Security (users can only see their own data)
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own analyses"
  ON public.analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own analyses"
  ON public.analyses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analyses"
  ON public.analyses FOR DELETE
  USING (auth.uid() = user_id);

-- Index for fast user history queries
CREATE INDEX IF NOT EXISTS analyses_user_id_idx ON public.analyses(user_id, created_at DESC);
