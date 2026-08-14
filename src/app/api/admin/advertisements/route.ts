import { NextRequest, NextResponse } from "next/server";
import { checkIsAdmin, getCurrentUser } from "@/features/auth/lib/auth-helpers";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

    const isAdmin = await checkIsAdmin(user.id);
    if (!isAdmin) return NextResponse.json({ error: "Admin access required" }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase().trim();
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const placement = searchParams.get("placement");

    const supabase = await createServerClient();
    let query = supabase
      .from("ad_creatives")
      .select("*, campaign:campaign_id(id, name, status)")
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false });

    if (status && status !== "all") query = query.eq("status", status);
    if (type && type !== "all") query = query.eq("type", type);
    if (placement && placement !== "all") query = query.eq("placement_key", placement);

    const { data: ads, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    let filtered = ads || [];
    if (search) {
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(search) ||
          (a.name && a.name.toLowerCase().includes(search)) ||
          a.destination_url.toLowerCase().includes(search)
      );
    }

    // Query analytics metrics from ad_events table
    const { data: events } = await supabase.from("ad_events").select("ad_id, event_type");
    const metricsMap: Record<string, { impressions: number; clicks: number }> = {};

    (events || []).forEach((ev) => {
      if (ev.ad_id) {
        if (!metricsMap[ev.ad_id]) {
          metricsMap[ev.ad_id] = { impressions: 0, clicks: 0 };
        }
        if (ev.event_type === "adImpression") {
          metricsMap[ev.ad_id].impressions += 1;
        } else if (ev.event_type === "adClicked") {
          metricsMap[ev.ad_id].clicks += 1;
        }
      }
    });

    const enrichedAds = filtered.map((ad) => {
      const stats = metricsMap[ad.id] || { impressions: 0, clicks: 0 };
      const ctr = stats.impressions > 0 ? (stats.clicks / stats.impressions) * 100 : 0;
      return {
        ...ad,
        impressions_count: stats.impressions,
        clicks_count: stats.clicks,
        ctr: Number(ctr.toFixed(1)),
      };
    });

    return NextResponse.json({ advertisements: enrichedAds });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch advertisements.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

    const isAdmin = await checkIsAdmin(user.id);
    if (!isAdmin) return NextResponse.json({ error: "Admin access required" }, { status: 403 });

    const body = await request.json();
    const {
      name,
      title,
      description,
      type = "banner",
      media_url,
      destination_url,
      cta_text = "Learn More",
      placement_key = "home_hero_banner",
      status = "active",
      priority = 1,
      start_at,
      end_at,
      frequency_cap,
      targeting,
      campaign_id,
      impression_enabled = true,
      click_enabled = true,
    } = body;

    if (!title || !media_url || !destination_url) {
      return NextResponse.json(
        { error: "Title, media URL, and destination URL are required." },
        { status: 400 }
      );
    }

    if (start_at && end_at && new Date(start_at) > new Date(end_at)) {
      return NextResponse.json(
        { error: "End date must be after start date." },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("ad_creatives")
      .insert({
        name: name ? name.trim() : title.trim(),
        title: title.trim(),
        description: description ? description.trim() : null,
        type,
        media_url: media_url.trim(),
        destination_url: destination_url.trim(),
        cta_text: cta_text ? cta_text.trim() : "Learn More",
        placement_key,
        status,
        priority: Number(priority) || 1,
        start_at: start_at || null,
        end_at: end_at || null,
        frequency_cap: frequency_cap || { maxPerSession: 3 },
        targeting: targeting || { devices: ["all"], contexts: ["all"] },
        campaign_id: campaign_id || null,
        impression_enabled: Boolean(impression_enabled),
        click_enabled: Boolean(click_enabled),
        created_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .select("*, campaign:campaign_id(id, name, status)")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, advertisement: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create advertisement.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
