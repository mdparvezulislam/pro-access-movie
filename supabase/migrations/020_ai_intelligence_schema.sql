-- Migration: 020_ai_intelligence_schema.sql
-- Schema for AI Content Intelligence: usage logging, token consumption, latency, and model metrics.

CREATE TABLE IF NOT EXISTS public.ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  operation TEXT NOT NULL CHECK (operation IN (
    'generate_description',
    'localize_bengali',
    'generate_seo',
    'suggest_classification',
    'enhance_text'
  )),
  model TEXT NOT NULL,
  content_id UUID,
  content_type TEXT CHECK (content_type IS NULL OR content_type IN ('movie', 'series', 'episode')),
  status TEXT NOT NULL CHECK (status IN ('success', 'failed')),
  prompt_tokens INTEGER NOT NULL DEFAULT 0 CHECK (prompt_tokens >= 0),
  completion_tokens INTEGER NOT NULL DEFAULT 0 CHECK (completion_tokens >= 0),
  total_tokens INTEGER NOT NULL DEFAULT 0 CHECK (total_tokens >= 0),
  latency_ms INTEGER NOT NULL DEFAULT 0 CHECK (latency_ms >= 0),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_created ON public.ai_usage_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user ON public.ai_usage_logs (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_operation ON public.ai_usage_logs (operation);

-- Enable RLS
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ai_logs_admin_read" ON public.ai_usage_logs;
DROP POLICY IF EXISTS "ai_logs_admin_insert" ON public.ai_usage_logs;

CREATE POLICY "ai_logs_admin_read"
  ON public.ai_usage_logs FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "ai_logs_admin_insert"
  ON public.ai_usage_logs FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin() OR auth.uid() = user_id);
