-- Migration: 014_ad_system.sql
-- Creates ad_campaigns, ad_creatives, ad_placements, and ad_events tables with RLS.

-- 1. Ad Campaigns Table
CREATE TABLE IF NOT EXISTS public.ad_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  frequency_cap JSONB DEFAULT '{"maxPerSession": 3}'::jsonb,
  targeting JSONB DEFAULT '{"devices": ["all"], "userTypes": ["all"]}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Ad Creatives Table
CREATE TABLE IF NOT EXISTS public.ad_creatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('banner', 'card', 'video', 'overlay')),
  media_url TEXT NOT NULL,
  destination_url TEXT NOT NULL,
  cta_text TEXT DEFAULT 'Learn More',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Ad Placements Table
CREATE TABLE IF NOT EXISTS public.ad_placements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('banner', 'card', 'mid_roll', 'overlay')),
  frequency_cap_minutes INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Ad Events Table (Analytics)
CREATE TABLE IF NOT EXISTS public.ad_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id TEXT,
  campaign_id UUID REFERENCES public.ad_campaigns(id) ON DELETE SET NULL,
  placement_key TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('adSelected', 'adImpression', 'adClicked', 'adGateCompleted', 'adGateSkipped')),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ad_events_created ON public.ad_events (created_at DESC);

-- Enable RLS
ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_creatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public read active campaigns" ON public.ad_campaigns FOR SELECT TO anon, authenticated USING (status = 'active');
CREATE POLICY "Admin write campaigns" ON public.ad_campaigns FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Public read creatives" ON public.ad_creatives FOR SELECT TO anon, authenticated USING (TRUE);
CREATE POLICY "Admin write creatives" ON public.ad_creatives FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Public read active placements" ON public.ad_placements FOR SELECT TO anon, authenticated USING (is_active = TRUE);
CREATE POLICY "Admin write placements" ON public.ad_placements FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Public insert ad events" ON public.ad_events FOR INSERT TO anon, authenticated WITH CHECK (TRUE);
CREATE POLICY "Admin read ad events" ON public.ad_events FOR SELECT TO authenticated USING (public.is_admin());
