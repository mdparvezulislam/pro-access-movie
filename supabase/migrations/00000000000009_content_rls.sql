-- FLEX Phase 02: RLS-first read and write boundaries.
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'genres', 'categories', 'languages', 'countries', 'movies', 'series',
    'seasons', 'episodes', 'movie_genres', 'series_genres',
    'movie_categories', 'series_categories', 'people', 'cast', 'crew',
    'collections', 'collection_movies'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('drop policy if exists %I on public.%I', table_name || '_admin_write', table_name);
    execute format(
      'create policy %I on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())',
      table_name || '_admin_write', table_name
    );
  end loop;
end
$$;

-- Lookup rows are public metadata; writes still require admin authorization.
create policy "genres_public_read" on public.genres for select to anon, authenticated using (true);
create policy "categories_public_read" on public.categories for select to anon, authenticated using (true);
create policy "languages_public_read" on public.languages for select to anon, authenticated using (true);
create policy "countries_public_read" on public.countries for select to anon, authenticated using (true);

-- A content row is public only when its own lifecycle status is published.
create policy "movies_published_read" on public.movies for select to anon, authenticated using (status = 'published');
create policy "series_published_read" on public.series for select to anon, authenticated using (status = 'published');
create policy "seasons_published_read" on public.seasons for select to anon, authenticated using (
  status = 'published'
  and exists (select 1 from public.series s where s.id = series_id and s.status = 'published')
);
create policy "episodes_published_read" on public.episodes for select to anon, authenticated using (
  status = 'published'
  and exists (
    select 1 from public.seasons sn
    join public.series s on s.id = sn.series_id
    where sn.id = season_id and sn.status = 'published' and s.status = 'published'
  )
);

-- Relationship rows inherit visibility from their published parent content.
create policy "movie_genres_published_read" on public.movie_genres for select to anon, authenticated using (
  exists (select 1 from public.movies m where m.id = movie_id and m.status = 'published')
);
create policy "series_genres_published_read" on public.series_genres for select to anon, authenticated using (
  exists (select 1 from public.series s where s.id = series_id and s.status = 'published')
);
create policy "movie_categories_published_read" on public.movie_categories for select to anon, authenticated using (
  exists (select 1 from public.movies m where m.id = movie_id and m.status = 'published')
);
create policy "series_categories_published_read" on public.series_categories for select to anon, authenticated using (
  exists (select 1 from public.series s where s.id = series_id and s.status = 'published')
);

create policy "people_published_read" on public.people for select to anon, authenticated using (
  exists (
    select 1 from public."cast" c join public.movies m on m.id = c.movie_id
    where c.person_id = people.id and m.status = 'published'
  ) or exists (
    select 1 from public."cast" c join public.series s on s.id = c.series_id
    where c.person_id = people.id and s.status = 'published'
  ) or exists (
    select 1 from public.crew c join public.movies m on m.id = c.movie_id
    where c.person_id = people.id and m.status = 'published'
  ) or exists (
    select 1 from public.crew c join public.series s on s.id = c.series_id
    where c.person_id = people.id and s.status = 'published'
  )
);

create policy "cast_published_read" on public."cast" for select to anon, authenticated using (
  (movie_id is not null and exists (select 1 from public.movies m where m.id = movie_id and m.status = 'published'))
  or (series_id is not null and exists (select 1 from public.series s where s.id = series_id and s.status = 'published'))
);
create policy "crew_published_read" on public.crew for select to anon, authenticated using (
  (movie_id is not null and exists (select 1 from public.movies m where m.id = movie_id and m.status = 'published'))
  or (series_id is not null and exists (select 1 from public.series s where s.id = series_id and s.status = 'published'))
);

create policy "collections_published_read" on public.collections for select to anon, authenticated using (status = 'published');
create policy "collection_movies_published_read" on public.collection_movies for select to anon, authenticated using (
  exists (select 1 from public.collections c where c.id = collection_id and c.status = 'published')
  and exists (select 1 from public.movies m where m.id = movie_id and m.status = 'published')
);
