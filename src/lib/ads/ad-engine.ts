import { createServerClient } from "@/lib/supabase/server";

export interface AdCampaign {
  id: string;
  name: string;
  status: "active" | "paused" | "completed";
  startDate?: string;
  endDate?: string;
  frequencyCap?: { maxPerSession?: number };
}

export interface AdCreative {
  id: string;
  campaignId?: string;
  title: string;
  type: "banner" | "card" | "video" | "overlay";
  mediaUrl: string;
  destinationUrl: string;
  ctaText: string;
}

export interface AdPlacement {
  id: string;
  key: string;
  name: string;
  type: "banner" | "card" | "mid_roll" | "overlay";
  frequencyCapMinutes: number;
}

export interface AdEvaluationResult {
  creative: AdCreative | null;
  placement: AdPlacement | null;
}

const DEFAULT_DEMO_ADS: Record<string, AdCreative> = {
  home_hero_banner: {
    id: "demo-ad-1",
    title: "Stream Unlimited Bengali Hits on FLEX Premium",
    type: "banner",
    mediaUrl: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=1200",
    destinationUrl: "/login",
    ctaText: "Upgrade Now",
  },
  rail_interstitial_card: {
    id: "demo-ad-2",
    title: "Download FLEX Mobile App for Android & iOS",
    type: "card",
    mediaUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600",
    destinationUrl: "/",
    ctaText: "Get App",
  },
  player_mid_roll: {
    id: "demo-ad-3",
    title: "Sponsor: High-Speed Fiber Internet by Bangladesh Telecom",
    type: "video",
    mediaUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800",
    destinationUrl: "/",
    ctaText: "Check Speeds",
  },
};

export async function evaluateAd(placementKey: string): Promise<AdEvaluationResult> {
  try {
    const supabase = await createServerClient();

    // 1. Query placement
    const { data: placement } = await supabase
      .from("ad_placements")
      .select("*")
      .eq("key", placementKey)
      .eq("is_active", true)
      .maybeSingle();

    // 2. Query creatives
    const { data: creatives } = await supabase
      .from("ad_creatives")
      .select("*")
      .order("created_at", { ascending: false });

    if (creatives && creatives.length > 0) {
      const match = creatives.find((c) => c.type === placement?.type) || creatives[0];
      return {
        creative: {
          id: match.id,
          campaignId: match.campaign_id || undefined,
          title: match.title,
          type: match.type as "banner" | "card" | "video" | "overlay",
          mediaUrl: match.media_url,
          destinationUrl: match.destination_url,
          ctaText: match.cta_text || "Learn More",
        },
        placement: placement ? {
          id: placement.id,
          key: placement.key,
          name: placement.name,
          type: placement.type as "banner" | "card" | "mid_roll" | "overlay",
          frequencyCapMinutes: placement.frequency_cap_minutes,
        } : null,
      };
    }
  } catch (err) {
    console.warn(`[AdEngine] Failed to evaluate ad for '${placementKey}':`, err);
  }

  // Fallback demo ad
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
