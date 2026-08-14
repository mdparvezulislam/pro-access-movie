-- Migration: 026_categories_sort_order.sql
-- Ensures categories table has sort_order and name_bn columns with default values.

ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS name_bn TEXT;

CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON public.categories (sort_order, name);
