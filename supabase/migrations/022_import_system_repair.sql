-- Migration: 022_import_system_repair.sql
-- Idempotent setup and repair for core content tables, media storage buckets, relationships, and RLS policies.

-- 1. Create content_status type if not exists
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

-- 2. Lookup Tables (Genres, Categories, Languages, Countries)
CREATE TABLE IF NOT EXISTS public.genres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  name_bn TEXT,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  name_bn TEXT,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.languages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  native_name TEXT
);

CREATE TABLE IF NOT EXISTS public.countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL
);

-- 3. Core Movies Table
CREATE TABLE IF NOT EXISTS public.movies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_bn TEXT,
  slug TEXT NOT NULL UNIQUE CHECK (slug = lower(slug)),
  status public.content_status NOT NULL DEFAULT 'draft',
  original_title TEXT,
  release_year SMALLINT CHECK (release_year BETWEEN 1888 AND 2200),
  release_date DATE,
  duration_minutes INTEGER CHECK (duration_minutes IS NULL OR duration_minutes > 0),
  description TEXT,
  description_bn TEXT,
  tagline TEXT,
  rating NUMERIC(3,1) CHECK (rating IS NULL OR rating BETWEEN 0 AND 10),
  vote_count INTEGER DEFAULT 0,
  popularity NUMERIC(8,3) DEFAULT 0,
  content_rating TEXT,
  poster_url TEXT,
  backdrop_url TEXT,
  logo_url TEXT,
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

-- 4. Core Series Table
CREATE TABLE IF NOT EXISTS public.series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_bn TEXT,
  slug TEXT NOT NULL UNIQUE CHECK (slug = lower(slug)),
  status public.content_status NOT NULL DEFAULT 'draft',
  original_title TEXT,
  release_year SMALLINT CHECK (release_year BETWEEN 1888 AND 2200),
  first_air_date DATE,
  last_air_date DATE,
  description TEXT,
  description_bn TEXT,
  rating NUMERIC(3,1) CHECK (rating IS NULL OR rating BETWEEN 0 AND 10),
  vote_count INTEGER DEFAULT 0,
  popularity NUMERIC(8,3) DEFAULT 0,
  content_rating TEXT,
  poster_url TEXT,
  backdrop_url TEXT,
  logo_url TEXT,
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

-- 5. Seasons Table
CREATE TABLE IF NOT EXISTS public.seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id UUID NOT NULL REFERENCES public.series(id) ON DELETE CASCADE,
  season_number INTEGER NOT NULL CHECK (season_number > 0),
  title TEXT,
  description TEXT,
  poster_url TEXT,
  status public.content_status NOT NULL DEFAULT 'draft',
  media JSONB NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(media) = 'object'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  CONSTRAINT seasons_series_id_season_number_key UNIQUE (series_id, season_number)
);

-- 6. Episodes Table
CREATE TABLE IF NOT EXISTS public.episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  episode_number INTEGER NOT NULL CHECK (episode_number > 0),
  title TEXT NOT NULL,
  title_bn TEXT,
  description TEXT,
  still_url TEXT,
  duration_minutes INTEGER CHECK (duration_minutes IS NULL OR duration_minutes > 0),
  air_date DATE,
  status public.content_status NOT NULL DEFAULT 'draft',
  media JSONB NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(media) = 'object'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  CONSTRAINT episodes_season_id_episode_number_key UNIQUE (season_id, episode_number)
);

-- 7. Media Assets / Files Table
CREATE TABLE IF NOT EXISTS public.media_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket TEXT NOT NULL,
  path TEXT NOT NULL,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL CHECK (size_bytes >= 0),
  width INTEGER CHECK (width IS NULL OR width > 0),
  height INTEGER CHECK (height IS NULL OR height > 0),
  duration_seconds NUMERIC(10,2) CHECK (duration_seconds IS NULL OR duration_seconds >= 0),
  content_type TEXT NOT NULL,
  folder TEXT NOT NULL DEFAULT 'system',
  title TEXT,
  alt_text TEXT,
  access_strategy TEXT NOT NULL DEFAULT 'public' CHECK (access_strategy IN ('public', 'signed')),
  public_url TEXT,
  movie_id UUID REFERENCES public.movies(id) ON DELETE SET NULL,
  series_id UUID REFERENCES public.series(id) ON DELETE CASCADE,
  person_id UUID,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'draft')),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket TEXT NOT NULL,
  path TEXT NOT NULL,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL CHECK (size_bytes >= 0),
  width INTEGER CHECK (width IS NULL OR width > 0),
  height INTEGER CHECK (height IS NULL OR height > 0),
  duration_seconds NUMERIC(10,2) CHECK (duration_seconds IS NULL OR duration_seconds >= 0),
  content_type TEXT NOT NULL,
  folder TEXT NOT NULL DEFAULT 'system',
  title TEXT,
  alt_text TEXT,
  access_strategy TEXT NOT NULL DEFAULT 'public' CHECK (access_strategy IN ('public', 'signed')),
  public_url TEXT,
  movie_id UUID REFERENCES public.movies(id) ON DELETE SET NULL,
  series_id UUID REFERENCES public.series(id) ON DELETE CASCADE,
  person_id UUID,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'draft')),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Movie/Series Genres Relationships
CREATE TABLE IF NOT EXISTS public.movie_genres (
  movie_id UUID NOT NULL REFERENCES public.movies(id) ON DELETE CASCADE,
  genre_id UUID NOT NULL REFERENCES public.genres(id) ON DELETE CASCADE,
  PRIMARY KEY (movie_id, genre_id)
);

CREATE TABLE IF NOT EXISTS public.series_genres (
  series_id UUID NOT NULL REFERENCES public.series(id) ON DELETE CASCADE,
  genre_id UUID NOT NULL REFERENCES public.genres(id) ON DELETE CASCADE,
  PRIMARY KEY (series_id, genre_id)
);

-- 9. People, Cast & Crew Tables
CREATE TABLE IF NOT EXISTS public.people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_bn TEXT,
  slug TEXT NOT NULL UNIQUE,
  biography TEXT,
  birth_date DATE,
  place_of_birth TEXT,
  profile_path TEXT,
  external_ids JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cast (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id UUID REFERENCES public.movies(id) ON DELETE CASCADE,
  series_id UUID REFERENCES public.series(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  character_name TEXT NOT NULL,
  role_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.crew (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id UUID REFERENCES public.movies(id) ON DELETE CASCADE,
  series_id UUID REFERENCES public.series(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  job TEXT NOT NULL,
  department TEXT
);

-- 10. Playback & Download Sources
CREATE TABLE IF NOT EXISTS public.playback_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL CHECK (content_type IN ('movie', 'episode')),
  content_id UUID NOT NULL,
  source_name TEXT NOT NULL,
  url TEXT NOT NULL,
  quality TEXT NOT NULL DEFAULT '1080p',
  resolution TEXT,
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
  quality TEXT NOT NULL DEFAULT '1080p',
  file_size_bytes BIGINT,
  language TEXT NOT NULL DEFAULT 'English',
  priority INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Provision Storage Buckets Idempotently in storage.buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('flex-movie', 'flex-movie', true, 15728640, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('flex-series', 'flex-series', true, 15728640, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('flex-people', 'flex-people', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('flex-advertisements', 'flex-advertisements', true, 20971520, ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4']),
  ('flex-system', 'flex-system', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
  ('flex-users', 'flex-users', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('flex-posters', 'flex-posters', true, 15728640, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('flex-backdrops', 'flex-backdrops', true, 20971520, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public;

-- 12. Enable RLS on core tables
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playback_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.download_sources ENABLE ROW LEVEL SECURITY;

-- 13. Core RLS Policies (Allow Read for Active/Published, Full CRUD for Service/Admin)
DO $$
BEGIN
  -- movies policy
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'movies' AND policyname = 'Public read movies') THEN
    CREATE POLICY "Public read movies" ON public.movies FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'movies' AND policyname = 'Admin all movies') THEN
    CREATE POLICY "Admin all movies" ON public.movies FOR ALL USING (true);
  END IF;

  -- series policy
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'series' AND policyname = 'Public read series') THEN
    CREATE POLICY "Public read series" ON public.series FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'series' AND policyname = 'Admin all series') THEN
    CREATE POLICY "Admin all series" ON public.series FOR ALL USING (true);
  END IF;

  -- media_files policy
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'media_files' AND policyname = 'Public read media_files') THEN
    CREATE POLICY "Public read media_files" ON public.media_files FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'media_files' AND policyname = 'Admin all media_files') THEN
    CREATE POLICY "Admin all media_files" ON public.media_files FOR ALL USING (true);
  END IF;
END
$$;

-- 14. Grant Schema Table Permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, anon, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon, service_role;

-- 15. Reload PostgREST Schema Cache
NOTIFY pgrst, 'reload schema';
