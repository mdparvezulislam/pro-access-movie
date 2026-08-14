import { createServerClient } from "@/lib/supabase/server";

export type AdType = "banner" | "card" | "video" | "overlay" | "native" | "interstitial" | "html" | "image";
export type AdStatus = "active" | "draft" | "paused" | "archived";

export interface AdCreative {
  id: string;
  campaignId?: string;
  name?: string;
  title: string;
  description?: string;
  type: AdType;
  mediaUrl: string;
  destinationUrl: string;
  ctaText: string;
  placementKey?: string;
  status?: AdStatus;
  priority?: number;
  startAt?: string | null;
  endAt?: string | null;
  frequencyCap?: { maxPerSession?: number };
  targeting?: { devices?: string[]; contexts?: string[] };
  impressionEnabled?: boolean;
  clickEnabled?: boolean;
  impressionsCount?: number;
  clicksCount?: number;
  ctr?: number;
}

export interface AdPlacement {
  id: string;
  key: string;
  name: string;
  type: string;
  frequencyCapMinutes: number;
}

export interface AdEvaluationResult {
  creative: AdCreative | null;
  placement: AdPlacement | null;
}

const DEFAULT_DEMO_ADS: Record<string, AdCreative> = {
  home_hero_banner: {
    id: "demo-ad-1",
    name: "Default Hero Sponsor",
    title: "Stream Unlimited Bengali Hits on PRO ACCESS MOVIE",
    description: "Watch blockbuster movies and exclusive web series in HD",
    type: "banner",
    mediaUrl: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=1200",
    destinationUrl: "/login",
    ctaText: "Upgrade Now",
    placementKey: "home_hero_banner",
    status: "active",
    priority: 1,
  },
  rail_interstitial_card: {
    id: "demo-ad-2",
    name: "Native App Sponsor",
    title: "Download PRO ACCESS MOVIE App for Android & iOS",
    description: "Take your favorite movies anywhere on mobile",
    type: "card",
    mediaUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600",
    destinationUrl: "/",
    ctaText: "Get App",
    placementKey: "rail_interstitial_card",
    status: "active",
    priority: 1,
  },
  player_mid_roll: {
    id: "demo-ad-3",
    name: "Video Sponsor",
    title: "Sponsor: High-Speed Fiber Internet by Bangladesh Telecom",
    description: "Buffer-free 4K streaming for all subscribers",
    type: "video",
    mediaUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800",
    destinationUrl: "/",
    ctaText: "Check Speeds",
    placementKey: "player_mid_roll",
    status: "active",
    priority: 1,
  },
};

/**
 * Public Ad Evaluation Engine:
 * Returns the highest priority eligible ad for a given placement.
 * Filters by:
 * - status = 'active'
 * - placement_key matching placement (or unassigned)
 * - start_at <= NOW (if start_at set)
 * - end_at >= NOW (if end_at set)
 * Sorts by priority DESC.
 */
export async function evaluateAd(placementKey: string): Promise<AdEvaluationResult> {
  try {
    const supabase = await createServerClient();
    const nowIso = new Date().toISOString();

    // 1. Query placement details
    const { data: placement } = await supabase
      .from("ad_placements")
      .select("*")
      .eq("key", placementKey)
      .eq("is_active", true)
      .maybeSingle();

    // 2. Query active, scheduled ads for placement_key
    const { data: creatives } = await supabase
      .from("ad_creatives")
      .select("*")
      .order("created_at", { ascending: false });

    if (creatives && creatives.length > 0) {
      // Filter strictly by active status, schedule window, and matching placement key or fallback type
      const eligible = creatives.filter((c) => {
        // Status check
        if (c.status && c.status !== "active") return false;

        // Schedule check
        if (c.start_at && new Date(c.start_at).toISOString() > nowIso) return false;
        if (c.end_at && new Date(c.end_at).toISOString() < nowIso) return false;

        return true;
      });

      if (eligible.length > 0) {
        // Prefer exact placement_key match or placement type match
        const match =
          eligible.find((c) => c.placement_key === placementKey) ||
          eligible.find((c) => placement && c.type === placement.type) ||
          eligible[0];

        return {
          creative: {
            id: match.id,
            campaignId: match.campaign_id || undefined,
            name: match.name || match.title,
            title: match.title,
            description: match.description || undefined,
            type: (match.type as AdType) || "banner",
            mediaUrl: match.media_url,
            destinationUrl: match.destination_url,
            ctaText: match.cta_text || "Learn More",
            placementKey: match.placement_key || placementKey,
            status: (match.status as AdStatus) || "active",
            priority: match.priority ?? 1,
            startAt: match.start_at,
            endAt: match.end_at,
            impressionEnabled: match.impression_enabled ?? true,
            clickEnabled: match.click_enabled ?? true,
          },
          placement: placement
            ? {
                id: placement.id,
                key: placement.key,
                name: placement.name,
                type: placement.type,
                frequencyCapMinutes: placement.frequency_cap_minutes,
              }
            : null,
        };
      }
    }
  } catch (err) {
    console.warn(`[AdEngine] Failed to evaluate ad for '${placementKey}':`, err);
  }

  // Fallback demo ad for unconfigured placement
  const fallback = DEFAULT_DEMO_ADS[placementKey] || DEFAULT_DEMO_ADS.home_hero_banner;
  return {
    creative: fallback,
    placement: {
      id: "demo-placement-id",
      key: placementKey,
      name: "Default Placement",
      type: "banner",
      frequencyCapMinutes: 0,
    },
  };
}

/**
 * Analytics Tracking Hook:
 * Records public ad events (adImpression, adClicked, adSelected, adGateCompleted, adGateSkipped)
 */
export async function recordAdEventAction(
  placementKey: string,
  eventType: "adSelected" | "adImpression" | "adClicked" | "adGateCompleted" | "adGateSkipped",
  adId?: string
): Promise<void> {
  try {
    const supabase = await createServerClient();
    await supabase.from("ad_events").insert({
      placement_key: placementKey,
      event_type: eventType,
      ad_id: adId || null,
    });
  } catch (err) {
    console.warn("[AdEngine] Failed to record ad event:", err);
  }
}
