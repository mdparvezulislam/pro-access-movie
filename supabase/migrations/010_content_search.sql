-- Migration: 010_content_search.sql
-- Full-Text Search tsvector columns, GIN indexes, and trigram indexes for Banglish searching.

ALTER TABLE public.movies
  ADD COLUMN IF NOT EXISTS published_content_fts tsvector GENERATED ALWAYS AS (
    to_tsvector(
      'simple'::regconfig,
      concat_ws(' ', title, title_bn, original_title, search_keywords, aliases::text)
    )
  ) STORED;

ALTER TABLE public.series
  ADD COLUMN IF NOT EXISTS published_content_fts tsvector GENERATED ALWAYS AS (
    to_tsvector(
      'simple'::regconfig,
      concat_ws(' ', title, title_bn, original_title, search_keywords, aliases::text)
    )
  ) STORED;

-- Full-text search GIN indexes
CREATE INDEX IF NOT EXISTS movies_published_content_fts_idx
  ON public.movies USING gin (published_content_fts)
  WHERE status = 'published';

CREATE INDEX IF NOT EXISTS series_published_content_fts_idx
  ON public.series USING gin (published_content_fts)
  WHERE status = 'published';

-- Trigram GIN indexes for fuzzy Banglish & English search
CREATE INDEX IF NOT EXISTS movies_title_trgm_idx ON public.movies USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS movies_title_bn_trgm_idx ON public.movies USING gin (title_bn gin_trgm_ops);
CREATE INDEX IF NOT EXISTS series_title_trgm_idx ON public.series USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS series_title_bn_trgm_idx ON public.series USING gin (title_bn gin_trgm_ops);

COMMENT ON COLUMN public.movies.media IS 'Reserved JSONB metadata for Phase 03 artwork & video source references; no binary data.';
COMMENT ON COLUMN public.series.media IS 'Reserved JSONB metadata for Phase 03 artwork references.';
COMMENT ON COLUMN public.seasons.media IS 'Reserved JSONB metadata for Phase 03 artwork references.';
COMMENT ON COLUMN public.episodes.media IS 'Reserved JSONB metadata for Phase 03 artwork & video source references.';
