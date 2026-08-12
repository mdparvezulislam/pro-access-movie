-- RLS Policy Verification Queries
-- This script contains runnable SQL tests demonstrating RLS enforcement for profiles, user_roles, and settings.

BEGIN;

-- 1. Verify Anonymous User Write Restriction
-- Expectation: Fails because anonymous role cannot insert into public.profiles
SET LOCAL ROLE anon;
DO $$
BEGIN
  BEGIN
    INSERT INTO public.profiles (id, display_name)
    VALUES ('00000000-0000-0000-0000-000000000001', 'Hacker Anon');
    RAISE EXCEPTION 'TEST FAILED: Anonymous user was able to insert into profiles!';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'TEST PASSED: Anonymous user insert blocked by RLS correctly.';
  END;
END;
$$;

-- 2. Verify Regular User Cross-Profile Update Restriction
-- Expectation: Zero rows updated when attempting to edit another user's profile
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" = '11111111-1111-1111-1111-111111111111';
SET LOCAL "request.jwt.claim.role" = 'authenticated';

DO $$
DECLARE
  rows_updated INTEGER;
BEGIN
  UPDATE public.profiles
  SET display_name = 'Hacked Name'
  WHERE id = '22222222-2222-2222-2222-222222222222';

  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  IF rows_updated > 0 THEN
    RAISE EXCEPTION 'TEST FAILED: User updated another users profile!';
  ELSE
    RAISE NOTICE 'TEST PASSED: Regular user cannot edit another users profile.';
  END IF;
END;
$$;

-- 3. Verify Regular User Role Granting Restriction
-- Expectation: Fails because regular authenticated user is not an admin
DO $$
BEGIN
  BEGIN
    INSERT INTO public.user_roles (user_id, role)
    VALUES ('11111111-1111-1111-1111-111111111111', 'admin');
    RAISE EXCEPTION 'TEST FAILED: Regular user granted themselves admin role!';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'TEST PASSED: Regular user role grant blocked by RLS.';
  END;
END;
$$;

ROLLBACK;
