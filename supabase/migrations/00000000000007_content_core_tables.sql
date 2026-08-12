-- FLEX Phase 02: canonical movie and series tables.
do $$
begin
  if not exists (
    select 1 from pg_type
    where typname = 'content_status'
      and typnamespace = 'public'::regnamespace
  ) then
    create domain public.content_status as text
      check (value in ('draft', 'review', 'published', 'archived'));
  end if;
end
$$;

create table if not exists public.movies (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  title_bn text,
  slug text not null unique check (slug = lower(slug)),
  status public.content_status not null default 'draft',
  original_title text,
  release_year smallint check (release_year between 1888 and 2200),
  duration_minutes integer check (duration_minutes is null or duration_minutes > 0),
  description text,
  description_bn text,
  tagline text,
  rating numeric(3,1) check (rating is null or rating between 0 and 10),
  content_rating text check (content_rating is null or content_rating in ('G', 'PG', '13', '18')),
  original_language_id uuid references public.languages(id) on delete set null,
  country_id uuid references public.countries(id) on delete set null,
  trailer_url text,
  seo_title text,
  seo_description text,
  seo_keywords text,
  aliases jsonb not null default '[]'::jsonb check (jsonb_typeof(aliases) = 'array'),
  search_keywords text,
  external_ids jsonb not null default '{}'::jsonb check (jsonb_typeof(external_ids) = 'object'),
  media jsonb not null default '{}'::jsonb check (jsonb_typeof(media) = 'object'),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  published_at timestamptz
);

create table if not exists public.series (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  title_bn text,
  slug text not null unique check (slug = lower(slug)),
  status public.content_status not null default 'draft',
  original_title text,
  release_year smallint check (release_year between 1888 and 2200),
  description text,
  description_bn text,
  tagline text,
  rating numeric(3,1) check (rating is null or rating between 0 and 10),
  content_rating text check (content_rating is null or content_rating in ('G', 'PG', '13', '18')),
  original_language_id uuid references public.languages(id) on delete set null,
  country_id uuid references public.countries(id) on delete set null,
  trailer_url text,
  seo_title text,
  seo_description text,
  seo_keywords text,
  aliases jsonb not null default '[]'::jsonb check (jsonb_typeof(aliases) = 'array'),
  search_keywords text,
  external_ids jsonb not null default '{}'::jsonb check (jsonb_typeof(external_ids) = 'object'),
  media jsonb not null default '{}'::jsonb check (jsonb_typeof(media) = 'object'),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  published_at timestamptz
);

create table if not exists public.seasons (
  id uuid primary key default gen_random_uuid(),
  series_id uuid not null references public.series(id) on delete cascade,
  season_number integer not null check (season_number > 0),
  title text,
  description text,
  status public.content_status not null default 'draft',
  media jsonb not null default '{}'::jsonb check (jsonb_typeof(media) = 'object'),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  published_at timestamptz,
  unique (series_id, season_number)
);

create table if not exists public.episodes (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.seasons(id) on delete cascade,
  episode_number integer not null check (episode_number > 0),
  title text not null,
  title_bn text,
  description text,
  duration_minutes integer check (duration_minutes is null or duration_minutes > 0),
  air_date date,
  status public.content_status not null default 'draft',
  media jsonb not null default '{}'::jsonb check (jsonb_typeof(media) = 'object'),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  published_at timestamptz,
  unique (season_id, episode_number)
);

create index if not exists movies_status_idx on public.movies (status);
create index if not exists series_status_idx on public.series (status);
create index if not exists seasons_series_status_idx on public.seasons (series_id, status);
create index if not exists episodes_season_status_idx on public.episodes (season_id, status);
create index if not exists movies_original_language_idx on public.movies (original_language_id);
create index if not exists movies_country_idx on public.movies (country_id);
create index if not exists series_original_language_idx on public.series (original_language_id);
create index if not exists series_country_idx on public.series (country_id);
