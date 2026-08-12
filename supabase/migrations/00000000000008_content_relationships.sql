-- FLEX Phase 02: normalized relationships, people, and curated collections.
create table if not exists public.movie_genres (
  movie_id uuid not null references public.movies(id) on delete cascade,
  genre_id uuid not null references public.genres(id) on delete cascade,
  primary key (movie_id, genre_id)
);

create table if not exists public.series_genres (
  series_id uuid not null references public.series(id) on delete cascade,
  genre_id uuid not null references public.genres(id) on delete cascade,
  primary key (series_id, genre_id)
);

create table if not exists public.movie_categories (
  movie_id uuid not null references public.movies(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  primary key (movie_id, category_id)
);

create table if not exists public.series_categories (
  series_id uuid not null references public.series(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  primary key (series_id, category_id)
);

create table if not exists public.people (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_bn text,
  slug text not null unique check (slug = lower(slug)),
  bio text,
  photo_url text,
  external_ids jsonb not null default '{}'::jsonb check (jsonb_typeof(external_ids) = 'object'),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public."cast" (
  id uuid primary key default gen_random_uuid(),
  movie_id uuid references public.movies(id) on delete cascade,
  series_id uuid references public.series(id) on delete cascade,
  person_id uuid not null references public.people(id) on delete cascade,
  character_name text,
  ordering integer not null default 0,
  check ((movie_id is not null) <> (series_id is not null))
);

create table if not exists public.crew (
  id uuid primary key default gen_random_uuid(),
  movie_id uuid references public.movies(id) on delete cascade,
  series_id uuid references public.series(id) on delete cascade,
  person_id uuid not null references public.people(id) on delete cascade,
  role text not null check (length(trim(role)) > 0),
  ordering integer not null default 0,
  check ((movie_id is not null) <> (series_id is not null))
);

create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug = lower(slug)),
  title text not null,
  description text,
  sort_order integer not null default 0,
  status public.content_status not null default 'draft',
  featured boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  published_at timestamptz
);

create table if not exists public.collection_movies (
  collection_id uuid not null references public.collections(id) on delete cascade,
  movie_id uuid not null references public.movies(id) on delete cascade,
  sort_order integer not null default 0,
  primary key (collection_id, movie_id)
);

create index if not exists movie_genres_genre_idx on public.movie_genres (genre_id, movie_id);
create index if not exists series_genres_genre_idx on public.series_genres (genre_id, series_id);
create index if not exists movie_categories_category_idx on public.movie_categories (category_id, movie_id);
create index if not exists series_categories_category_idx on public.series_categories (category_id, series_id);
create index if not exists cast_movie_idx on public."cast" (movie_id, ordering);
create index if not exists cast_series_idx on public."cast" (series_id, ordering);
create index if not exists cast_person_idx on public."cast" (person_id);
create index if not exists crew_movie_idx on public.crew (movie_id, ordering);
create index if not exists crew_series_idx on public.crew (series_id, ordering);
create index if not exists crew_person_idx on public.crew (person_id);
create index if not exists collections_status_sort_idx on public.collections (status, sort_order);
create index if not exists collection_movies_movie_idx on public.collection_movies (movie_id, collection_id);
create index if not exists people_name_trgm_idx on public.people using gin (name gin_trgm_ops);
