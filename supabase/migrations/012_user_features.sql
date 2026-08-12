-- Migration: 012_user_features.sql
-- Creates user_watchlist and user_watch_history tables with Row Level Security.

-- 1. Watchlist Table
CREATE TABLE IF NOT EXISTS public.user_watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  movie_id UUID REFERENCES public.movies(id) ON DELETE CASCADE,
  series_id UUID REFERENCES public.series(id) ON DELETE CASCADE,
  CONSTRAINT watchlist_polymorphic_ref_check CHECK (num_nonnulls(movie_id, series_id) = 1),
  CONSTRAINT watchlist_user_movie_unique UNIQUE (user_id, movie_id),
  CONSTRAINT watchlist_user_series_unique UNIQUE (user_id, series_id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_watchlist_user ON public.user_watchlist (user_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.user_watchlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own watchlist" ON public.user_watchlist;
DROP POLICY IF EXISTS "Users can insert own watchlist" ON public.user_watchlist;
DROP POLICY IF EXISTS "Users can delete own watchlist" ON public.user_watchlist;

CREATE POLICY "Users can read own watchlist"
  ON public.user_watchlist FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own watchlist"
  ON public.user_watchlist FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own watchlist"
  ON public.user_watchlist FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 2. Watch History Table
CREATE TABLE IF NOT EXISTS public.user_watch_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  movie_id UUID REFERENCES public.movies(id) ON DELETE CASCADE,
  episode_id UUID REFERENCES public.episodes(id) ON DELETE CASCADE,
  CONSTRAINT watch_history_polymorphic_ref_check CHECK (num_nonnulls(movie_id, episode_id) = 1),
  CONSTRAINT history_user_movie_unique UNIQUE (user_id, movie_id),
  CONSTRAINT history_user_episode_unique UNIQUE (user_id, episode_id),
  progress_seconds INTEGER NOT NULL DEFAULT 0 CHECK (progress_seconds >= 0),
  duration_seconds INTEGER NOT NULL DEFAULT 0 CHECK (duration_seconds >= 0),
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_watch_history_user ON public.user_watch_history (user_id, updated_at DESC);

-- Enable RLS
ALTER TABLE public.user_watch_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own watch history" ON public.user_watch_history;
DROP POLICY IF EXISTS "Users can write own watch history" ON public.user_watch_history;

CREATE POLICY "Users can read own watch history"
  ON public.user_watch_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can write own watch history"
  ON public.user_watch_history FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
