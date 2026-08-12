-- Migration: 005_settings.sql
-- Creates public.app_settings key/value store table, enables RLS, and seeds default application configuration.

CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Settings are readable by authenticated users" ON public.app_settings;
DROP POLICY IF EXISTS "Settings writable only by admins" ON public.app_settings;

CREATE POLICY "Settings are readable by authenticated users"
  ON public.app_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Settings writable only by admins"
  ON public.app_settings FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Seed default settings
INSERT INTO public.app_settings (key, value, updated_at)
VALUES
  ('app_name', '"FLEX"'::jsonb, NOW()),
  ('default_language', '"bn"'::jsonb, NOW()),
  ('default_currency', '"BDT"'::jsonb, NOW()),
  ('ad_gate', '{"enabled": false, "interstitial_interval_min": 15}'::jsonb, NOW())
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = NOW();
