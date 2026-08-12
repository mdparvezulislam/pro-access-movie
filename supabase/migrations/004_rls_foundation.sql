-- Migration: 004_rls_foundation.sql
-- Enables Row Level Security (RLS) on profiles and user_roles, defining strict security policies and helper functions.

-- 1. Helper function: is_admin(check_user_id)
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  caller_jwt_role TEXT;
  admin_exists BOOLEAN;
BEGIN
  IF check_user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Check if JWT role is service_role
  caller_jwt_role := COALESCE(current_setting('request.jwt.claim.role', true), '');
  IF caller_jwt_role = 'service_role' THEN
    RETURN TRUE;
  END IF;

  -- Check if target user has 'admin' role in public.user_roles
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = check_user_id AND role = 'admin'
  ) INTO admin_exists;

  RETURN admin_exists;
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated, anon, service_role;

-- 2. Enable RLS on public.profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Profiles are readable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- RLS Policies for public.profiles
CREATE POLICY "Profiles are readable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 3. Enable RLS on public.user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Roles are readable by authenticated users" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins or service role can insert user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins or service role can delete user roles" ON public.user_roles;

-- RLS Policies for public.user_roles
CREATE POLICY "Roles are readable by authenticated users"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins or service role can insert user roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Only admins or service role can delete user roles"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));
