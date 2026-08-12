-- Migration: 021_admin_content_studio_schema.sql
-- Playback sources and download sources management for Movies and TV Series episodes.

CREATE TABLE IF NOT EXISTS public.playback_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL CHECK (content_type IN ('movie', 'episode')),
  content_id UUID NOT NULL,
  source_name TEXT NOT NULL,
  url TEXT NOT NULL,
  quality TEXT NOT NULL DEFAULT '1080p' CHECK (quality IN ('360p', '480p', '720p', '1080p', '4K', 'Auto')),
  resolution TEXT DEFAULT '1920x1080',
  language TEXT NOT NULL DEFAULT 'English',
  subtitle_url TEXT,
  priority INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.download_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL CHECK (content_type IN ('movie', 'episode')),
  content_id UUID NOT NULL,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  quality TEXT NOT NULL DEFAULT '1080p' CHECK (quality IN ('480p', '720p', '1080p', '4K', 'BD-Rip', 'WEB-DL')),
  resolution TEXT DEFAULT '1920x1080',
  file_size_bytes BIGINT DEFAULT 0,
  language TEXT NOT NULL DEFAULT 'English',
  priority INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_playback_sources_content ON public.playback_sources (content_type, content_id, priority ASC);
CREATE INDEX IF NOT EXISTS idx_download_sources_content ON public.download_sources (content_type, content_id, priority ASC);

-- Enable RLS
ALTER TABLE public.playback_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.download_sources ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Playback Sources
DROP POLICY IF EXISTS "playback_sources_admin_all" ON public.playback_sources;
DROP POLICY IF EXISTS "playback_sources_public_read" ON public.playback_sources;

CREATE POLICY "playback_sources_admin_all"
  ON public.playback_sources FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "playback_sources_public_read"
  ON public.playback_sources FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

-- RLS Policies for Download Sources
DROP POLICY IF EXISTS "download_sources_admin_all" ON public.download_sources;
DROP POLICY IF EXISTS "download_sources_public_read" ON public.download_sources;

CREATE POLICY "download_sources_admin_all"
  ON public.download_sources FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "download_sources_public_read"
  ON public.download_sources FOR SELECT
  TO authenticated, anon
  USING (is_active = true);
