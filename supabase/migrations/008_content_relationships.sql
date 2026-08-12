-- Migration: 008_content_relationships.sql
-- Relationship junction tables, people domain, cast/crew, and collections.

-- 1. Junction Tables
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

CREATE TABLE IF NOT EXISTS public.movie_categories (
  movie_id UUID NOT NULL REFERENCES public.movies(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (movie_id, category_id)
);

CREATE TABLE IF NOT EXISTS public.series_categories (
  series_id UUID NOT NULL REFERENCES public.series(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (series_id, category_id)
);

-- 2. People Domain Table
CREATE TABLE IF NOT EXISTS public.people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_bn TEXT,
  slug TEXT NOT NULL UNIQUE CHECK (slug = lower(slug)),
  bio TEXT,
  photo_url TEXT,
  external_ids JSONB NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(external_ids) = 'object'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Polymorphic Cast Table
CREATE TABLE IF NOT EXISTS public.cast (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id UUID REFERENCES public.movies(id) ON DELETE CASCADE,
  series_id UUID REFERENCES public.series(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  character_name TEXT,
  ordering INTEGER NOT NULL DEFAULT 0,
  CHECK ((movie_id IS NOT NULL) <> (series_id IS NOT NULL))
);

-- 4. Polymorphic Crew Table
CREATE TABLE IF NOT EXISTS public.crew (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id UUID REFERENCES public.movies(id) ON DELETE CASCADE,
  series_id UUID REFERENCES public.series(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (length(trim(role)) > 0),
  ordering INTEGER NOT NULL DEFAULT 0,
  CHECK ((movie_id IS NOT NULL) <> (series_id IS NOT NULL))
);

-- 5. Collections Domain Tables
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE CHECK (slug = lower(slug)),
  title TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  status public.content_status NOT NULL DEFAULT 'draft',
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.collection_movies (
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  movie_id UUID NOT NULL REFERENCES public.movies(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (collection_id, movie_id)
);

-- Relationship indexes
CREATE INDEX IF NOT EXISTS idx_movie_genres_genre ON public.movie_genres (genre_id, movie_id);
CREATE INDEX IF NOT EXISTS idx_series_genres_genre ON public.series_genres (genre_id, series_id);
CREATE INDEX IF NOT EXISTS idx_movie_categories_category ON public.movie_categories (category_id, movie_id);
CREATE INDEX IF NOT EXISTS idx_series_categories_category ON public.series_categories (category_id, series_id);
CREATE INDEX IF NOT EXISTS idx_cast_movie ON public.cast (movie_id, ordering);
CREATE INDEX IF NOT EXISTS idx_cast_series ON public.cast (series_id, ordering);
CREATE INDEX IF NOT EXISTS idx_cast_person ON public.cast (person_id);
CREATE INDEX IF NOT EXISTS idx_crew_movie ON public.crew (movie_id, ordering);
CREATE INDEX IF NOT EXISTS idx_crew_series ON public.crew (series_id, ordering);
CREATE INDEX IF NOT EXISTS idx_crew_person ON public.crew (person_id);
CREATE INDEX IF NOT EXISTS idx_collections_status ON public.collections (status, sort_order);
