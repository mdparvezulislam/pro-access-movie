-- Migration: 016_role_helpers_and_security.sql
-- Replaces hardcoded role checks with a hierarchy-aware authorization model, tightens RLS on
-- sensitive personal tables (removing broad USING(TRUE) reads), routes content/media/playback
-- writes through the editor tier, and introduces the dedicated watch-progress table.

-- 1. Hierarchy-aware helpers -------------------------------------------------

-- is_admin(): true for members of any role at or above the admin tier (3).
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_jwt_role TEXT;
  admin_exists BOOLEAN;
BEGIN
  IF check_user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  caller_jwt_role := COALESCE(current_setting('request.jwt.claim.role', true), '');
  IF caller_jwt_role = 'service_role' THEN
    RETURN TRUE;
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON r.code = ur.role
    WHERE ur.user_id = check_user_id AND r.hierarchy_level >= 3
  ) INTO admin_exists;

  RETURN admin_exists;
END;
$$;

-- is_editor(): true for members of any role at or above the editor tier (2) OR any direct
-- user-level content/media/playback grants.
CREATE OR REPLACE FUNCTION public.is_editor(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_jwt_role TEXT;
  editing BOOLEAN;
BEGIN
  IF check_user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  caller_jwt_role := COALESCE(current_setting('request.jwt.claim.role', true), '');
  IF caller_jwt_role = 'service_role' THEN
    RETURN TRUE;
  END IF;

  SELECT (
    EXISTS (
      SELECT 1
      FROM public.user_roles ur
      JOIN public.roles r ON r.code = ur.role
      WHERE ur.user_id = check_user_id AND r.hierarchy_level >= 2
    ) OR EXISTS (
      SELECT 1
      FROM public.user_permissions up
      WHERE up.user_id = check_user_id
        AND up.permission_code IN ('content.manage', 'media.manage', 'playback.manage')
    )
  ) INTO editing;

  RETURN editing;
END;
$$;

-- has_role(check_user_id, requested_role): true when the user holds the requested role OR any
-- role above it in the hierarchy. Unknown role codes gracefully return FALSE.
CREATE OR REPLACE FUNCTION public.has_role(check_user_id UUID, requested_role TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_jwt_role TEXT;
  requested_level INTEGER;
  granted BOOLEAN;
BEGIN
  IF check_user_id IS NULL OR requested_role IS NULL OR length(trim(requested_role)) = 0 THEN
    RETURN FALSE;
  END IF;

  caller_jwt_role := COALESCE(current_setting('request.jwt.claim.role', true), '');
  IF caller_jwt_role = 'service_role' THEN
    RETURN TRUE;
  END IF;

  SELECT hierarchy_level INTO requested_level FROM public.roles WHERE code = requested_role;
  IF requested_level IS NULL THEN
    RETURN FALSE;
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON r.code = ur.role
    WHERE ur.user_id = check_user_id AND r.hierarchy_level >= requested_level
  ) INTO granted;

  RETURN granted;
END;
$$;

-- has_permission(check_user_id, permission_code): role-derived + ad-hoc grants.
CREATE OR REPLACE FUNCTION public.has_permission(check_user_id UUID, permission_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_jwt_role TEXT;
  granted BOOLEAN;
BEGIN
  IF check_user_id IS NULL OR permission_code IS NULL THEN
    RETURN FALSE;
  END IF;

  caller_jwt_role := COALESCE(current_setting('request.jwt.claim.role', true), '');
  IF caller_jwt_role = 'service_role' THEN
    RETURN TRUE;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.user_permissions up
    WHERE up.user_id = check_user_id AND up.permission_code = has_permission.permission_code
  ) OR EXISTS (
    SELECT 1
    FROM public.role_permissions rp
    JOIN public.user_roles ur ON ur.role = rp.role_code
    JOIN public.roles r ON r.code = ur.role
    WHERE ur.user_id = check_user_id
      AND rp.permission_code = has_permission.permission_code
      AND r.hierarchy_level >= 2 -- editorial+ roles only; plain users hold no permissions
    LIMIT 1
  ) INTO granted;

  RETURN granted;
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_editor(UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_permission(UUID, TEXT) TO authenticated, service_role;

-- Deprecate the old admin check RPC name by forwarding to the hierarchy-aware version.
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER SET search_path = public AS
$$ SELECT public.is_admin(auth.uid()); $$;

-- 2. Tighten RLS on sensitive personal tables ---------------------------------

-- Profiles: users may read their OWN profile or be admins; no more blanket USING(true) for all
-- authenticated users (that leaked every user's language/theme preferences).
DROP POLICY IF EXISTS "Profiles are readable by authenticated users" ON public.profiles;
CREATE POLICY "Users can read own or admin-read profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR public.is_admin());

-- user_roles: users may only see their OWN roles (never the full role table), admins see all.
DROP POLICY IF EXISTS "Roles are readable by authenticated users" ON public.user_roles;
CREATE POLICY "Users can read own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

-- user_permissions: own read only (write already admin-gated from migration 015).
DROP POLICY IF EXISTS "user_permissions_read_own" ON public.user_permissions;
CREATE POLICY "user_permissions_read_own"
  ON public.user_permissions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

-- 3. Route content/media/playback writes through the editor tier -----------------

DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN ARRAY ARRAY[
    'genres', 'categories', 'languages', 'countries', 'movies', 'series',
    'seasons', 'episodes', 'movie_genres', 'series_genres',
    'movie_categories', 'series_categories', 'people', 'cast', 'crew',
    'collections', 'collection_movies', 'media_files', 'playback_sources'
  ] LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_admin_write', t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (public.is_editor()) WITH CHECK (public.is_editor())',
      t || '_admin_write', t
    );
  END LOOP;
END
$$;

-- Playback sources policy used a different (space-separated) name; align it too.
DROP POLICY IF EXISTS "Admin write playback sources" ON public.playback_sources;
DROP POLICY IF EXISTS "Playback sources editor write" ON public.playback_sources;
CREATE POLICY "Playback sources editor write"
  ON public.playback_sources FOR ALL
  TO authenticated
  USING (public.is_editor())
  WITH CHECK (public.is_editor());

-- Keep app_settings, user_roles, user_permissions, and ad tables admin-only
-- (already enforced via public.is_admin() which is hierarchy-aware).

-- 4. Watch progress -----------------------------------------------------------
-- Dedicated resume-position snapshot, separate from the append-only watch history log.
-- Each authenticated user owns exactly one progress row per movie / episode.
CREATE TABLE IF NOT EXISTS public.user_watch_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  movie_id UUID REFERENCES public.movies(id) ON DELETE CASCADE,
  episode_id UUID REFERENCES public.episodes(id) ON DELETE CASCADE,
  progress_seconds INTEGER NOT NULL DEFAULT 0 CHECK (progress_seconds >= 0),
  duration_seconds INTEGER NOT NULL DEFAULT 0 CHECK (duration_seconds >= 0),
  playback_position_seconds INTEGER NOT NULL DEFAULT 0 CHECK (playback_position_seconds >= 0),
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  playback_state JSONB NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(playback_state) = 'object'),
  CONSTRAINT watch_progress_polymorphic_ref_check CHECK (num_nonnulls(movie_id, episode_id) = 1),
  CONSTRAINT watch_progress_user_movie_unique UNIQUE (user_id, movie_id),
  CONSTRAINT watch_progress_user_episode_unique UNIQUE (user_id, episode_id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_watch_progress_user ON public.user_watch_progress (user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_watch_progress_movie ON public.user_watch_progress (movie_id);
CREATE INDEX IF NOT EXISTS idx_watch_progress_episode ON public.user_watch_progress (episode_id);

ALTER TABLE public.user_watch_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own watch progress" ON public.user_watch_progress;
DROP POLICY IF EXISTS "Users can write own watch progress" ON public.user_watch_progress;

CREATE POLICY "Users can read own watch progress"
  ON public.user_watch_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can write own watch progress"
  ON public.user_watch_progress FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);