-- Migration: 024_ad_system_v2.sql
-- Upgrades ad_creatives table with placement, status, priority, scheduling, targeting, and control columns.

ALTER TABLE public.ad_creatives 
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS placement_key TEXT DEFAULT 'home_hero_banner',
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS start_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS end_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS frequency_cap JSONB DEFAULT '{"maxPerSession": 3}'::jsonb,
  ADD COLUMN IF NOT EXISTS targeting JSONB DEFAULT '{"devices": ["all"], "contexts": ["all"]}'::jsonb,
  ADD COLUMN IF NOT EXISTS impression_enabled BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS click_enabled BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Backfill name from title if null
UPDATE public.ad_creatives SET name = title WHERE name IS NULL;

-- Add indexes for efficient public delivery evaluation
CREATE INDEX IF NOT EXISTS idx_ad_creatives_delivery 
  ON public.ad_creatives (placement_key, status, priority DESC);

-- Ensure RLS allows public select for eligible ads while restricting updates/inserts to admins
ALTER TABLE public.ad_creatives ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read creatives" ON public.ad_creatives;
DROP POLICY IF EXISTS "Admin write creatives" ON public.ad_creatives;

CREATE POLICY "Public read creatives" ON public.ad_creatives 
  FOR SELECT TO anon, authenticated USING (TRUE);

CREATE POLICY "Admin write creatives" ON public.ad_creatives 
  FOR ALL TO authenticated 
  USING (public.is_admin()) 
  WITH CHECK (public.is_admin());
