-- Local compatibility contract for Phase 01.
-- Production Phase 01 migrations may already provide these objects; all statements
-- are guarded so this file is safe to apply before or alongside them.
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  language_preference text not null default 'en',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'moderator')),
  created_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, role)
);

create or replace function public.is_admin(candidate_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = coalesce(candidate_user_id, auth.uid()) and role = 'admin'
  );
$$;

revoke all on function public.is_admin(uuid) from public;
grant execute on function public.is_admin(uuid) to anon, authenticated;

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;

drop policy if exists "profiles_authenticated_read" on public.profiles;
create policy "profiles_authenticated_read" on public.profiles for select to authenticated using (true);
drop policy if exists "profiles_owner_update" on public.profiles;
create policy "profiles_owner_update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists "user_roles_authenticated_read" on public.user_roles;
create policy "user_roles_authenticated_read" on public.user_roles for select to authenticated using (true);
drop policy if exists "user_roles_admin_write" on public.user_roles;
create policy "user_roles_admin_write" on public.user_roles for all to authenticated using (public.is_admin()) with check (public.is_admin());
