-- Migration: 025_collection_series.sql
-- Adds collection_series junction table for linking series to collections.

CREATE TABLE IF NOT EXISTS public.collection_series (
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  series_id UUID NOT NULL REFERENCES public.series(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (collection_id, series_id)
);

CREATE INDEX IF NOT EXISTS idx_collection_series_series ON public.collection_series (series_id);

ALTER TABLE public.collection_series ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "collection_series_published_read" ON public.collection_series;
DROP POLICY IF EXISTS "collection_series_admin_all" ON public.collection_series;

CREATE POLICY "collection_series_published_read" ON public.collection_series 
  FOR SELECT TO anon, authenticated USING (
    EXISTS (SELECT 1 FROM public.collections c WHERE c.id = collection_id AND c.status = 'published')
  );

CREATE POLICY "collection_series_admin_all" ON public.collection_series 
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
