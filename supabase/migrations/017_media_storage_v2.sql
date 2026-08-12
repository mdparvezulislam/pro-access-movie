-- Migration: 017_media_storage_v2.sql
-- Upgrades media storage buckets, expands public.media_files metadata schema, and updates RLS policies.

-- 1. Create/Ensure Storage Buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('flex-movie', 'flex-movie', true, 524288000, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'video/mp4', 'video/webm', 'text/vtt']),
  ('flex-series', 'flex-series', true, 524288000, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'video/mp4', 'video/webm', 'text/vtt']),
  ('flex-people', 'flex-people', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
  ('flex-advertisements', 'flex-advertisements', true, 524288000, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'video/mp4', 'video/webm']),
  ('flex-system', 'flex-system', true, 20971520, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif']),
  ('flex-users', 'flex-users', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Ensure existing legacy buckets are public accessible for legacy reads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('flex-posters', 'flex-posters', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('flex-backdrops', 'flex-backdrops', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('flex-trailers', 'flex-trailers', true, 524288000, ARRAY['video/mp4', 'video/webm'])
ON CONFLICT (id) DO UPDATE SET
  public = true;

-- 2. Modify public.media_files table schema to support full media requirements
ALTER TABLE public.media_files DROP CONSTRAINT IF EXISTS media_files_bucket_check;
ALTER TABLE public.media_files DROP CONSTRAINT IF EXISTS media_files_content_type_check;
ALTER TABLE public.media_files DROP CONSTRAINT IF EXISTS media_files_polymorphic_ref_check;

ALTER TABLE public.media_files
  ADD COLUMN IF NOT EXISTS filename TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS folder TEXT NOT NULL DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS alt_text TEXT,
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS access_strategy TEXT NOT NULL DEFAULT 'public',
  ADD COLUMN IF NOT EXISTS public_url TEXT,
  ADD COLUMN IF NOT EXISTS duration_seconds NUMERIC(10,2);

-- Add constraints
ALTER TABLE public.media_files ADD CONSTRAINT media_files_bucket_check 
  CHECK (bucket IN ('flex-movie', 'flex-series', 'flex-people', 'flex-advertisements', 'flex-system', 'flex-users', 'flex-posters', 'flex-backdrops', 'flex-trailers'));

ALTER TABLE public.media_files ADD CONSTRAINT media_files_content_type_check 
  CHECK (content_type IN ('poster', 'backdrop', 'banner', 'thumbnail', 'profile', 'photo', 'logo', 'trailer', 'subtitle', 'ad_creative', 'promo', 'asset'));

ALTER TABLE public.media_files ADD CONSTRAINT media_files_folder_check
  CHECK (folder IN ('movie', 'series', 'people', 'advertisements', 'system', 'users'));

ALTER TABLE public.media_files ADD CONSTRAINT media_files_access_strategy_check
  CHECK (access_strategy IN ('public', 'signed'));

-- Relax polymorphic reference check to allow unassigned/standalone assets
ALTER TABLE public.media_files ADD CONSTRAINT media_files_polymorphic_ref_check 
  CHECK (num_nonnulls(movie_id, series_id, person_id) <= 1);

-- 3. Indexes for performant filtering, searching, and pagination
CREATE INDEX IF NOT EXISTS idx_media_files_folder_type ON public.media_files (folder, content_type, status);
CREATE INDEX IF NOT EXISTS idx_media_files_created_at ON public.media_files (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_files_search ON public.media_files USING gin (
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(original_name, '') || ' ' || coalesce(alt_text, ''))
);

-- 4. RLS & Storage Access Policies
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "media_files_active_read" ON public.media_files;
DROP POLICY IF EXISTS "media_files_admin_write" ON public.media_files;
DROP POLICY IF EXISTS "media_files_user_own_read" ON public.media_files;

-- Public can read all active media records
CREATE POLICY "media_files_active_read"
  ON public.media_files FOR SELECT
  TO anon, authenticated
  USING (status = 'active');

-- Admins have full read/write access
CREATE POLICY "media_files_admin_write"
  ON public.media_files FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Users can upload/read their own profile assets
CREATE POLICY "media_files_user_own_manage"
  ON public.media_files FOR ALL
  TO authenticated
  USING (created_by = auth.uid() OR public.is_admin())
  WITH CHECK (created_by = auth.uid() OR public.is_admin());

-- Storage object policies for storage.objects
DROP POLICY IF EXISTS "Flex public storage objects read" ON storage.objects;
DROP POLICY IF EXISTS "Flex storage objects admin access" ON storage.objects;
DROP POLICY IF EXISTS "Flex storage objects user own access" ON storage.objects;

-- Public read for public buckets
CREATE POLICY "Flex public storage objects read"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (
    bucket_id IN ('flex-movie', 'flex-series', 'flex-people', 'flex-advertisements', 'flex-system', 'flex-posters', 'flex-backdrops', 'flex-trailers')
  );

-- Admins full control across all flex buckets
CREATE POLICY "Flex storage objects admin access"
  ON storage.objects FOR ALL
  TO authenticated
  USING (
    bucket_id IN ('flex-movie', 'flex-series', 'flex-people', 'flex-advertisements', 'flex-system', 'flex-users', 'flex-posters', 'flex-backdrops', 'flex-trailers')
    AND public.is_admin()
  )
  WITH CHECK (
    bucket_id IN ('flex-movie', 'flex-series', 'flex-people', 'flex-advertisements', 'flex-system', 'flex-users', 'flex-posters', 'flex-backdrops', 'flex-trailers')
    AND public.is_admin()
  );

-- Users can manage their own user avatar object in flex-users
CREATE POLICY "Flex storage objects user own access"
  ON storage.objects FOR ALL
  TO authenticated
  USING (
    bucket_id = 'flex-users'
    AND (owner = auth.uid() OR public.is_admin())
  )
  WITH CHECK (
    bucket_id = 'flex-users'
    AND (owner = auth.uid() OR public.is_admin())
  );
