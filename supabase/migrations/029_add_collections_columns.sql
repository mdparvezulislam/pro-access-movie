-- Migration: 029_add_collections_columns.sql
-- Ensures collections table has sort_order, featured, and status columns.

ALTER TABLE public.collections
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'published';

CREATE INDEX IF NOT EXISTS idx_collections_sort_order ON public.collections (sort_order, title);
