-- Migration: 019_content_import_schema.sql
-- Optimizes indexing for duplicate detection and metadata import queries.

-- 1. Index external_ids JSONB on movies and series for fast lookup by tmdb_id / imdb_id
CREATE INDEX IF NOT EXISTS idx_movies_external_ids_gin ON public.movies USING gin (external_ids);
CREATE INDEX IF NOT EXISTS idx_series_external_ids_gin ON public.series USING gin (external_ids);

-- 2. Index release_year and title for fuzzy match duplicate checks
CREATE INDEX IF NOT EXISTS idx_movies_release_year ON public.movies (release_year);
CREATE INDEX IF NOT EXISTS idx_series_release_year ON public.series (release_year);

-- 3. Ensure content_rating constraint accepts modern rating codes ('G', 'PG', '13', '13+', '16+', '18+', 'R', 'TV-MA', 'PG-13')
ALTER TABLE public.movies
  DROP CONSTRAINT IF EXISTS movies_content_rating_check;

ALTER TABLE public.movies
  ADD CONSTRAINT movies_content_rating_check
  CHECK (content_rating IS NULL OR content_rating IN ('G', 'PG', '13', '13+', '16+', '18+', 'R', 'TV-MA', 'PG-13', 'TV-14', 'TV-PG'));

ALTER TABLE public.series
  DROP CONSTRAINT IF EXISTS series_content_rating_check;

ALTER TABLE public.series
  ADD CONSTRAINT series_content_rating_check
  CHECK (content_rating IS NULL OR content_rating IN ('G', 'PG', '13', '13+', '16+', '18+', 'R', 'TV-MA', 'PG-13', 'TV-14', 'TV-PG'));
