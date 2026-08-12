-- Migration: 007_content_core_tables.sql
-- Core content domain: content_status domain, movies, series, seasons, episodes.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type
    WHERE typname = 'content_status'
      AND typnamespace = 'public'::regnamespace
  ) THEN
    CREATE DOMAIN public.content_status AS TEXT
      CHECK (value IN ('draft', 'review', 'published', 'archived'));
  END IF;
END
$$;

-- 1. Movies Table
CREATE TABLE IF NOT EXISTS public.movies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_bn TEXT,
  slug TEXT NOT NULL UNIQUE CHECK (slug = lower(slug)),
  status public.content_status NOT NULL DEFAULT 'draft',
  original_title TEXT,
  release_year SMALLINT CHECK (release_year BETWEEN 1888 AND 2200),
  duration_minutes INTEGER CHECK (duration_minutes IS NULL OR duration_minutes > 0),
  description TEXT,
  description_bn TEXT,
  tagline TEXT,
  rating NUMERIC(3,1) CHECK (rating IS NULL OR rating BETWEEN 0 AND 10),
  content_rating TEXT CHECK (content_rating IS NULL OR content_rating IN ('G', 'PG', '13', '18')),
  original_language_id UUID REFERENCES public.languages(id) ON DELETE SET NULL,
  country_id UUID REFERENCES public.countries(id) ON DELETE SET NULL,
  trailer_url TEXT,
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT,
  aliases JSONB NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(aliases) = 'array'),
  search_keywords TEXT,
  external_ids JSONB NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(external_ids) = 'object'),
  media JSONB NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(media) = 'object'),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- 2. Series Table
CREATE TABLE IF NOT EXISTS public.series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_bn TEXT,
  slug TEXT NOT NULL UNIQUE CHECK (slug = lower(slug)),
  status public.content_status NOT NULL DEFAULT 'draft',
  original_title TEXT,
  release_year SMALLINT CHECK (release_year BETWEEN 1888 AND 2200),
  description TEXT,
  description_bn TEXT,
  tagline TEXT,
  rating NUMERIC(3,1) CHECK (rating IS NULL OR rating BETWEEN 0 AND 10),
  content_rating TEXT CHECK (content_rating IS NULL OR content_rating IN ('G', 'PG', '13', '18')),
  original_language_id UUID REFERENCES public.languages(id) ON DELETE SET NULL,
  country_id UUID REFERENCES public.countries(id) ON DELETE SET NULL,
  trailer_url TEXT,
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT,
  aliases JSONB NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(aliases) = 'array'),
  search_keywords TEXT,
  external_ids JSONB NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(external_ids) = 'object'),
  media JSONB NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(media) = 'object'),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- 3. Seasons Table
CREATE TABLE IF NOT EXISTS public.seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id UUID NOT NULL REFERENCES public.series(id) ON DELETE CASCADE,
  season_number INTEGER NOT NULL CHECK (season_number > 0),
  title TEXT,
  description TEXT,
  status public.content_status NOT NULL DEFAULT 'draft',
  media JSONB NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(media) = 'object'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  CONSTRAINT seasons_series_id_season_number_key UNIQUE (series_id, season_number)
);

-- 4. Episodes Table
CREATE TABLE IF NOT EXISTS public.episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  episode_number INTEGER NOT NULL CHECK (episode_number > 0),
  title TEXT NOT NULL,
  title_bn TEXT,
  description TEXT,
  duration_minutes INTEGER CHECK (duration_minutes IS NULL OR duration_minutes > 0),
  air_date DATE,
  status public.content_status NOT NULL DEFAULT 'draft',
  media JSONB NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(media) = 'object'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  CONSTRAINT episodes_season_id_episode_number_key UNIQUE (season_id, episode_number)
);

-- Core indexes
CREATE INDEX IF NOT EXISTS idx_movies_status ON public.movies (status);
CREATE INDEX IF NOT EXISTS idx_movies_slug ON public.movies (slug);
CREATE INDEX IF NOT EXISTS idx_series_status ON public.series (status);
CREATE INDEX IF NOT EXISTS idx_series_slug ON public.series (slug);
CREATE INDEX IF NOT EXISTS idx_seasons_series_status ON public.seasons (series_id, status);
CREATE INDEX IF NOT EXISTS idx_episodes_season_status ON public.episodes (season_id, status);
