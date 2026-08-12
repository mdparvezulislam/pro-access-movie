-- FLEX Phase 02: search-ready generated vectors and supporting indexes.
alter table public.movies
  add column if not exists published_content_fts tsvector generated always as (
    to_tsvector(
      'simple'::regconfig,
      concat_ws(' ', title, title_bn, original_title, search_keywords, aliases::text)
    )
  ) stored;

alter table public.series
  add column if not exists published_content_fts tsvector generated always as (
    to_tsvector(
      'simple'::regconfig,
      concat_ws(' ', title, title_bn, original_title, search_keywords, aliases::text)
    )
  ) stored;

create index if not exists movies_published_content_fts_idx
  on public.movies using gin (published_content_fts)
  where status = 'published';
create index if not exists series_published_content_fts_idx
  on public.series using gin (published_content_fts)
  where status = 'published';
create index if not exists movies_title_trgm_idx on public.movies using gin (title gin_trgm_ops);
create index if not exists movies_title_bn_trgm_idx on public.movies using gin (title_bn gin_trgm_ops);
create index if not exists series_title_trgm_idx on public.series using gin (title gin_trgm_ops);
create index if not exists series_title_bn_trgm_idx on public.series using gin (title_bn gin_trgm_ops);

comment on column public.movies.media is 'Reserved JSONB metadata for Phase 03 image and artwork references; no binary media is stored here.';
comment on column public.series.media is 'Reserved JSONB metadata for Phase 03 image and artwork references; no binary media is stored here.';
comment on column public.seasons.media is 'Reserved JSONB metadata for Phase 03 image and artwork references.';
comment on column public.episodes.media is 'Reserved JSONB metadata for Phase 03 image and artwork references.';
