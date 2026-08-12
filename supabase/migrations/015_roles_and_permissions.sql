-- Migration: 015_roles_and_permissions.sql
-- Introduces a normalized role catalog with a privilege hierarchy, a permissions catalog with
-- role/per-user grants, and a per-user theme preference on profiles.
--
-- Role hierarchy (higher level = more privileges):
--   super_admin (4) > admin (3) > editor (2) > user (1)

-- 1. Roles Catalog
CREATE TABLE IF NOT EXISTS public.roles (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  hierarchy_level INTEGER NOT NULL CHECK (hierarchy_level BETWEEN 1 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.roles (code, name, description, hierarchy_level)
VALUES
  ('user', 'User', 'Standard authenticated user with no staff privileges', 1),
  ('editor', 'Editor', 'Can manage content, media assets, and playback sources', 2),
  ('admin', 'Admin', 'Can manage users, roles, settings, and advertisements', 3),
  ('super_admin', 'Super Admin', 'Full platform control including sensitive system operations', 4)
ON CONFLICT (code) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_roles_hierarchy ON public.roles (hierarchy_level);

-- 2. Link user_roles to the roles catalog (replace ad-hoc CHECK constraint)
ALTER TABLE public.user_roles
  DROP CONSTRAINT IF EXISTS user_roles_role_check;

ALTER TABLE public.user_roles
  ALTER COLUMN role TYPE TEXT USING role::TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_roles_role_fkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE public.user_roles
      ADD CONSTRAINT user_roles_role_fkey
      FOREIGN KEY (role) REFERENCES public.roles(code) ON UPDATE CASCADE ON DELETE RESTRICT;
  END IF;
END
$$;

-- 3. Permissions Catalog
CREATE TABLE IF NOT EXISTS public.permissions (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.permissions (code, name, description)
VALUES
  ('content.manage', 'Manage Content', 'Create, edit, and publish movies, series, seasons, and episodes'),
  ('media.manage', 'Manage Media', 'Upload and manage posters, backdrops, people photos, and trailers'),
  ('playback.manage', 'Manage Playback', 'Configure playback sources and stream URLs'),
  ('users.manage', 'Manage Users', 'List and manage platform users'),
  ('roles.manage', 'Manage Roles', 'Grant and revoke user roles'),
  ('settings.manage', 'Manage Settings', 'Read and update system settings'),
  ('ads.manage', 'Manage Advertisements', 'Manage ad campaigns, creatives, and placements'),
  ('ads.view', 'View Ad Reports', 'View advertising analytics and ad events'),
  ('analytics.view', 'View Analytics', 'View platform analytics dashboards'),
  ('ai.manage', 'Manage AI Enrichment', 'Run AI-assisted content enrichment workflows')
ON CONFLICT (code) DO NOTHING;

-- 4. Role -> Permission mapping
CREATE TABLE IF NOT EXISTS public.role_permissions (
  role_code TEXT NOT NULL REFERENCES public.roles(code) ON DELETE CASCADE,
  permission_code TEXT NOT NULL REFERENCES public.permissions(code) ON DELETE CASCADE,
  PRIMARY KEY (role_code, permission_code)
);

INSERT INTO public.role_permissions (role_code, permission_code)
VALUES
  ('editor', 'content.manage'),
  ('editor', 'media.manage'),
  ('editor', 'playback.manage'),
  ('admin', 'users.manage'),
  ('admin', 'roles.manage'),
  ('admin', 'settings.manage'),
  ('admin', 'ads.manage'),
  ('admin', 'ads.view'),
  ('admin', 'analytics.view'),
  ('super_admin', 'analytics.view'),
  ('super_admin', 'ai.manage')
ON CONFLICT (role_code, permission_code) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_role_permissions_permission ON public.role_permissions (permission_code, role_code);

-- 5. Per-user permission grants (ad-hoc overrides without creating a new role)
CREATE TABLE IF NOT EXISTS public.user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_code TEXT NOT NULL REFERENCES public.permissions(code) ON DELETE CASCADE,
  granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT user_permissions_user_permission_unique UNIQUE (user_id, permission_code)
);

CREATE INDEX IF NOT EXISTS idx_user_permissions_user ON public.user_permissions (user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_permission ON public.user_permissions (permission_code, user_id);

-- Enable RLS on new tables
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- Roles/permissions metadata is non-sensitive: readable by authenticated users so the UI can build
-- role-aware screens, but never writable by them (admin write enforced via new helpers in 016).
CREATE POLICY "roles_readable" ON public.roles FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "roles_admin_write" ON public.roles FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "permissions_readable" ON public.permissions FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "permissions_admin_write" ON public.permissions FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "role_permissions_readable" ON public.role_permissions FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "role_permissions_admin_write" ON public.role_permissions FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- user_permissions holds private privilege grants: users may read their own, admins may manage all.
CREATE POLICY "user_permissions_read_own" ON public.user_permissions FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "user_permissions_admin_write" ON public.user_permissions FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 6. Profile theme preference (Phase 02 requirement: the profile stores presentation preferences only)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS theme_preference TEXT NOT NULL DEFAULT 'dark'
  CHECK (theme_preference IN ('dark', 'light'));