-- Migration: 023_media_sources_v2.sql
-- Upgrades playback_sources and download_sources for Movies, Series, and Episodes.

-- 1. Create or update playback_sources table
CREATE TABLE IF NOT EXISTS public.playback_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL DEFAULT 'movie',
  content_id UUID NOT NULL,
  source_name TEXT NOT NULL,
  url TEXT NOT NULL,
  format TEXT NOT NULL DEFAULT 'hls',
  quality TEXT NOT NULL DEFAULT '1080p',
  resolution TEXT DEFAULT '1920x1080',
  language TEXT NOT NULL DEFAULT 'English',
  subtitle_url TEXT,
  notes TEXT,
  priority INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add missing columns safely if playback_sources table existed prior
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'playback_sources' AND column_name = 'format') THEN
    ALTER TABLE public.playback_sources ADD COLUMN format TEXT NOT NULL DEFAULT 'hls';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'playback_sources' AND column_name = 'notes') THEN
    ALTER TABLE public.playback_sources ADD COLUMN notes TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'playback_sources' AND column_name = 'content_type') THEN
    ALTER TABLE public.playback_sources ADD COLUMN content_type TEXT NOT NULL DEFAULT 'movie';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'playback_sources' AND column_name = 'content_id') THEN
    ALTER TABLE public.playback_sources ADD COLUMN content_id UUID;
  END IF;
END $$;

-- 2. Create or update download_sources table
CREATE TABLE IF NOT EXISTS public.download_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL DEFAULT 'movie',
  content_id UUID NOT NULL,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  quality TEXT NOT NULL DEFAULT '1080p',
  file_type TEXT NOT NULL DEFAULT 'mp4',
  file_size_bytes BIGINT DEFAULT 0,
  language TEXT NOT NULL DEFAULT 'English',
  priority INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add missing columns safely if download_sources table existed prior
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'download_sources' AND column_name = 'file_type') THEN
    ALTER TABLE public.download_sources ADD COLUMN file_type TEXT NOT NULL DEFAULT 'mp4';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'download_sources' AND column_name = 'content_type') THEN
    ALTER TABLE public.download_sources ADD COLUMN content_type TEXT NOT NULL DEFAULT 'movie';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'download_sources' AND column_name = 'content_id') THEN
    ALTER TABLE public.download_sources ADD COLUMN content_id UUID;
  END IF;
END $$;

-- 3. Indexes for fast ordering
CREATE INDEX IF NOT EXISTS idx_playback_sources_lookup ON public.playback_sources (content_type, content_id, priority ASC);
CREATE INDEX IF NOT EXISTS idx_download_sources_lookup ON public.download_sources (content_type, content_id, priority ASC);

-- 4. Enable RLS
ALTER TABLE public.playback_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.download_sources ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
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
