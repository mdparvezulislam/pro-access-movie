-- Migration: 009_content_rls.sql
-- Enables RLS on all content domain tables and defines security policies.

DO $$
DECLARE
  table_name TEXT;
BEGIN
  FOR table_name IN ARRAY ARRAY[
    'genres', 'categories', 'languages', 'countries', 'movies', 'series',
    'seasons', 'episodes', 'movie_genres', 'series_genres',
    'movie_categories', 'series_categories', 'people', 'cast', 'crew',
    'collections', 'collection_movies'
  ] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', table_name || '_admin_write', table_name);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin())',
      table_name || '_admin_write', table_name
    );
  END LOOP;
END
$$;

-- 1. Public Read Policies for Lookup Metadata
CREATE POLICY "genres_public_read" ON public.genres FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "categories_public_read" ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "languages_public_read" ON public.languages FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "countries_public_read" ON public.countries FOR SELECT TO anon, authenticated USING (true);

-- 2. Public Read Policies for Core Content (ONLY status = 'published')
CREATE POLICY "movies_published_read" ON public.movies FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "series_published_read" ON public.series FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "seasons_published_read" ON public.seasons FOR SELECT TO anon, authenticated USING (
  status = 'published'
  AND EXISTS (SELECT 1 FROM public.series s WHERE s.id = series_id AND s.status = 'published')
);
CREATE POLICY "episodes_published_read" ON public.episodes FOR SELECT TO anon, authenticated USING (
  status = 'published'
  AND EXISTS (
    SELECT 1 FROM public.seasons sn
    JOIN public.series s ON s.id = sn.series_id
    WHERE sn.id = season_id AND sn.status = 'published' AND s.status = 'published'
  )
);

-- 3. Public Read Policies for Relationships (Inherit visibility from published parent)
CREATE POLICY "movie_genres_published_read" ON public.movie_genres FOR SELECT TO anon, authenticated USING (
  EXISTS (SELECT 1 FROM public.movies m WHERE m.id = movie_id AND m.status = 'published')
);
CREATE POLICY "series_genres_published_read" ON public.series_genres FOR SELECT TO anon, authenticated USING (
  EXISTS (SELECT 1 FROM public.series s WHERE s.id = series_id AND s.status = 'published')
);
CREATE POLICY "movie_categories_published_read" ON public.movie_categories FOR SELECT TO anon, authenticated USING (
  EXISTS (SELECT 1 FROM public.movies m WHERE m.id = movie_id AND m.status = 'published')
);
CREATE POLICY "series_categories_published_read" ON public.series_categories FOR SELECT TO anon, authenticated USING (
  EXISTS (SELECT 1 FROM public.series s WHERE s.id = series_id AND s.status = 'published')
);

CREATE POLICY "people_published_read" ON public.people FOR SELECT TO anon, authenticated USING (
  EXISTS (
    SELECT 1 FROM public.cast c JOIN public.movies m ON m.id = c.movie_id
    WHERE c.person_id = people.id AND m.status = 'published'
  ) OR EXISTS (
    SELECT 1 FROM public.cast c JOIN public.series s ON s.id = c.series_id
    WHERE c.person_id = people.id AND s.status = 'published'
  ) OR EXISTS (
    SELECT 1 FROM public.crew c JOIN public.movies m ON m.id = c.movie_id
    WHERE c.person_id = people.id AND m.status = 'published'
  ) OR EXISTS (
    SELECT 1 FROM public.crew c JOIN public.series s ON s.id = c.series_id
    WHERE c.person_id = people.id AND s.status = 'published'
  )
);

CREATE POLICY "cast_published_read" ON public.cast FOR SELECT TO anon, authenticated USING (
  (movie_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.movies m WHERE m.id = movie_id AND m.status = 'published'))
  OR (series_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.series s WHERE s.id = series_id AND s.status = 'published'))
);
CREATE POLICY "crew_published_read" ON public.crew FOR SELECT TO anon, authenticated USING (
  (movie_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.movies m WHERE m.id = movie_id AND m.status = 'published'))
  OR (series_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.series s WHERE s.id = series_id AND s.status = 'published'))
);

CREATE POLICY "collections_published_read" ON public.collections FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "collection_movies_published_read" ON public.collection_movies FOR SELECT TO anon, authenticated USING (
  EXISTS (SELECT 1 FROM public.collections c WHERE c.id = collection_id AND c.status = 'published')
  AND EXISTS (SELECT 1 FROM public.movies m WHERE m.id = movie_id AND m.status = 'published')
);
