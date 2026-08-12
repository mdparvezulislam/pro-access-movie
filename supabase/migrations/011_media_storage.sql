-- Migration: 011_media_storage.sql
-- Creates flex media storage buckets, public.media_files tracking table, and storage RLS policies.

-- 1. Insert Storage Buckets (Private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('flex-posters', 'flex-posters', false, 8388608, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('flex-backdrops', 'flex-backdrops', false, 8388608, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('flex-people', 'flex-people', false, 8388608, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('flex-trailers', 'flex-trailers', false, 524288000, ARRAY['video/mp4', 'video/webm'])
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Create public.media_files tracking table
CREATE TABLE IF NOT EXISTS public.media_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket TEXT NOT NULL CHECK (bucket IN ('flex-posters', 'flex-backdrops', 'flex-people', 'flex-trailers')),
  path TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL CHECK (size_bytes > 0),
  width INTEGER,
  height INTEGER,
  content_type TEXT NOT NULL CHECK (content_type IN ('poster', 'backdrop', 'photo', 'trailer')),
  movie_id UUID REFERENCES public.movies(id) ON DELETE CASCADE,
  series_id UUID REFERENCES public.series(id) ON DELETE CASCADE,
  person_id UUID REFERENCES public.people(id) ON DELETE CASCADE,
  CONSTRAINT media_files_polymorphic_ref_check CHECK (num_nonnulls(movie_id, series_id, person_id) = 1),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_media_files_bucket_path ON public.media_files (bucket, path);
CREATE INDEX IF NOT EXISTS idx_media_files_movie ON public.media_files (movie_id, status);
CREATE INDEX IF NOT EXISTS idx_media_files_series ON public.media_files (series_id, status);
CREATE INDEX IF NOT EXISTS idx_media_files_person ON public.media_files (person_id, status);

-- 3. Enable RLS on public.media_files
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "media_files_active_read" ON public.media_files;
DROP POLICY IF EXISTS "media_files_admin_write" ON public.media_files;

CREATE POLICY "media_files_active_read"
  ON public.media_files FOR SELECT
  TO anon, authenticated
  USING (status = 'active');

CREATE POLICY "media_files_admin_write"
  ON public.media_files FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 4. Storage Objects Policies for Flex Buckets
DROP POLICY IF EXISTS "Flex storage objects admin access" ON storage.objects;

CREATE POLICY "Flex storage objects admin access"
  ON storage.objects FOR ALL
  TO authenticated
  USING (
    bucket_id IN ('flex-posters', 'flex-backdrops', 'flex-people', 'flex-trailers')
    AND public.is_admin()
  )
  WITH CHECK (
    bucket_id IN ('flex-posters', 'flex-backdrops', 'flex-people', 'flex-trailers')
    AND public.is_admin()
  );
