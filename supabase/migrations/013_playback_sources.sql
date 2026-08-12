-- Migration: 013_playback_sources.sql
-- Creates playback_sources table for CDN streams, resolution quality, and download mirrors.

CREATE TABLE IF NOT EXISTS public.playback_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id UUID REFERENCES public.movies(id) ON DELETE CASCADE,
  episode_id UUID REFERENCES public.episodes(id) ON DELETE CASCADE,
  CONSTRAINT playback_sources_polymorphic_ref_check CHECK (num_nonnulls(movie_id, episode_id) = 1),
  label TEXT NOT NULL,
  quality TEXT NOT NULL CHECK (quality IN ('1080p', '720p', '480p', '360p', 'auto')),
  url TEXT NOT NULL,
  format TEXT NOT NULL DEFAULT 'hls' CHECK (format IN ('hls', 'mp4', 'embed')),
  provider_name TEXT NOT NULL DEFAULT 'FLEX CDN',
  priority INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_playback_sources_movie ON public.playback_sources (movie_id, priority ASC);
CREATE INDEX IF NOT EXISTS idx_playback_sources_episode ON public.playback_sources (episode_id, priority ASC);

-- Enable RLS
ALTER TABLE public.playback_sources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Active playback sources read" ON public.playback_sources;
DROP POLICY IF EXISTS "Admin write playback sources" ON public.playback_sources;

CREATE POLICY "Active playback sources read"
  ON public.playback_sources FOR SELECT
  TO anon, authenticated
  USING (is_active = TRUE);

CREATE POLICY "Admin write playback sources"
  ON public.playback_sources FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
