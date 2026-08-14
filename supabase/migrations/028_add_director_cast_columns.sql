-- Migration: 028_add_director_cast_columns.sql
-- Adds director and cast text columns to movies and series tables for fast inline metadata storage.

ALTER TABLE public.movies
  ADD COLUMN IF NOT EXISTS director TEXT,
  ADD COLUMN IF NOT EXISTS "cast" TEXT;

ALTER TABLE public.series
  ADD COLUMN IF NOT EXISTS director TEXT,
  ADD COLUMN IF NOT EXISTS "cast" TEXT;
