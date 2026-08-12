-- FLEX Phase 02: normalized lookup tables.
create table if not exists public.genres (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug = lower(slug)),
  name text not null,
  name_bn text,
  description text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug = lower(slug)),
  name text not null,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.languages (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code = lower(code)),
  name text not null,
  name_bn text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.countries (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code = upper(code)),
  name text not null,
  name_bn text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists genres_name_trgm_idx on public.genres using gin (name gin_trgm_ops);
create index if not exists categories_sort_order_idx on public.categories (sort_order, name);
create index if not exists languages_name_idx on public.languages (name);
create index if not exists countries_name_idx on public.countries (name);
