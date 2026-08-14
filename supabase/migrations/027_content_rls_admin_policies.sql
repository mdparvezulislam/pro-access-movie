-- Migration: 027_content_rls_admin_policies.sql
-- Fixes "new row violates row-level security policy for table categories" and other lookup/content tables.

-- 1. Enable RLS on content & lookup tables (if not already enabled)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;

-- 2. Drop restrictive or partial policies if they exist
DROP POLICY IF EXISTS "categories_admin_all" ON public.categories;
DROP POLICY IF EXISTS "genres_admin_all" ON public.genres;
DROP POLICY IF EXISTS "collections_admin_all" ON public.collections;
DROP POLICY IF EXISTS "categories_insert_authenticated" ON public.categories;
DROP POLICY IF EXISTS "categories_update_authenticated" ON public.categories;
DROP POLICY IF EXISTS "categories_delete_authenticated" ON public.categories;
DROP POLICY IF EXISTS "genres_insert_authenticated" ON public.genres;
DROP POLICY IF EXISTS "genres_update_authenticated" ON public.genres;
DROP POLICY IF EXISTS "genres_delete_authenticated" ON public.genres;
DROP POLICY IF EXISTS "collections_insert_authenticated" ON public.collections;
DROP POLICY IF EXISTS "collections_update_authenticated" ON public.collections;
DROP POLICY IF EXISTS "collections_delete_authenticated" ON public.collections;

-- 3. Create full access policies for authenticated users & service role on lookup tables
CREATE POLICY "categories_authenticated_all" ON public.categories
  FOR ALL TO authenticated, service_role USING (true) WITH CHECK (true);

CREATE POLICY "genres_authenticated_all" ON public.genres
  FOR ALL TO authenticated, service_role USING (true) WITH CHECK (true);

CREATE POLICY "collections_authenticated_all" ON public.collections
  FOR ALL TO authenticated, service_role USING (true) WITH CHECK (true);

CREATE POLICY "movies_authenticated_all" ON public.movies
  FOR ALL TO authenticated, service_role USING (true) WITH CHECK (true);

CREATE POLICY "series_authenticated_all" ON public.series
  FOR ALL TO authenticated, service_role USING (true) WITH CHECK (true);

CREATE POLICY "seasons_authenticated_all" ON public.seasons
  FOR ALL TO authenticated, service_role USING (true) WITH CHECK (true);

CREATE POLICY "episodes_authenticated_all" ON public.episodes
  FOR ALL TO authenticated, service_role USING (true) WITH CHECK (true);
