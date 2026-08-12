-- Migration: 018_admin_role_setup.sql
-- Adds role column to public.profiles, updates security functions, and seeds initial admin user.

-- 1. Ensure public.profiles has role column
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'
  CHECK (role IN ('user', 'editor', 'admin', 'super_admin'));

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);

-- 2. Update is_admin function to check profiles.role AND user_roles.role
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

  SELECT (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = check_user_id AND p.role IN ('admin', 'super_admin')
    ) OR EXISTS (
      SELECT 1
      FROM public.user_roles ur
      JOIN public.roles r ON r.code = ur.role
      WHERE ur.user_id = check_user_id AND r.hierarchy_level >= 3
    )
  ) INTO admin_exists;

  RETURN admin_exists;
END;
$$;

-- 3. Update is_editor function to check profiles.role AND user_roles.role
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
      SELECT 1 FROM public.profiles p
      WHERE p.id = check_user_id AND p.role IN ('editor', 'admin', 'super_admin')
    ) OR EXISTS (
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

-- 4. Update has_role function to check profiles.role AND user_roles.role
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

  SELECT (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON r.code = p.role
      WHERE p.id = check_user_id AND r.hierarchy_level >= requested_level
    ) OR EXISTS (
      SELECT 1
      FROM public.user_roles ur
      JOIN public.roles r ON r.code = ur.role
      WHERE ur.user_id = check_user_id AND r.hierarchy_level >= requested_level
    )
  ) INTO granted;

  RETURN granted;
END;
$$;

-- 5. Assign existing Supabase Auth user ID: 11fc4f26-e5d2-4023-b7aa-0c66fdd4571c as admin
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM auth.users WHERE id = '11fc4f26-e5d2-4023-b7aa-0c66fdd4571c'::uuid) THEN
    -- Upsert profile with admin role
    INSERT INTO public.profiles (id, display_name, role, language_preference, theme_preference)
    VALUES ('11fc4f26-e5d2-4023-b7aa-0c66fdd4571c'::uuid, 'PRO ACCESS Admin', 'admin', 'en', 'dark')
    ON CONFLICT (id) DO UPDATE SET
      role = 'admin',
      updated_at = NOW();

    -- Upsert user_roles with admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES ('11fc4f26-e5d2-4023-b7aa-0c66fdd4571c'::uuid, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END
$$;
