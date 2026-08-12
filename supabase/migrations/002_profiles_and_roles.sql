-- Migration: 002_profiles_and_roles.sql
-- Creates public.profiles and public.user_roles tables, along with administrative role management functions.

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  language_preference TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. User Roles Table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'moderator')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- 3. Function to grant admin role
CREATE OR REPLACE FUNCTION public.make_admin(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  caller_role TEXT;
  is_caller_admin BOOLEAN;
BEGIN
  -- Get current caller JWT role
  caller_role := COALESCE(current_setting('request.jwt.claim.role', true), '');
  
  -- Check if caller is service_role OR existing admin in user_roles
  IF caller_role = 'service_role' THEN
    is_caller_admin := TRUE;
  ELSE
    SELECT EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    ) INTO is_caller_admin;
  END IF;

  IF NOT is_caller_admin THEN
    RAISE EXCEPTION 'Access denied: Only existing admins or service_role can invoke make_admin()';
  END IF;

  -- Insert admin role if not already present
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

-- Grant execution permission to authenticated users and service_role (function internally enforces admin check)
GRANT EXECUTE ON FUNCTION public.make_admin(UUID) TO authenticated, service_role;
