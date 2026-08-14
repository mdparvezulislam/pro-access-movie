import { NextRequest, NextResponse } from "next/server";
import { checkIsAdmin, getCurrentUser } from "@/features/auth/lib/auth-helpers";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const isAdmin = await checkIsAdmin(user.id);
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const seasonId = searchParams.get("season_id");
    const search = searchParams.get("search")?.toLowerCase().trim();
    const status = searchParams.get("status");

    const supabase = await createAdminClient();
    let query = supabase
      .from("episodes")
      .select("*, season:season_id(id, season_number, series:series_id(id, title))")
      .order("created_at", { ascending: false });

    if (seasonId && seasonId !== "all") {
      query = query.eq("season_id", seasonId);
    }

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let filtered = data || [];
    if (search) {
      filtered = filtered.filter(
        (e) =>
          e.title?.toLowerCase().includes(search) ||
          e.title_bn?.toLowerCase().includes(search) ||
          e.description?.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({ episodes: filtered });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch episodes.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const isAdmin = await checkIsAdmin(user.id);
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const {
      season_id,
      episode_number,
      title,
      title_bn,
      description,
      duration_minutes = 45,
      air_date,
      status = "draft",
      media,
    } = body;

    if (!season_id || episode_number === undefined || !title) {
      return NextResponse.json(
        { error: "Season ID, Episode Number, and Title are required." },
        { status: 400 }
      );
    }

    const supabase = await createAdminClient();

    // Check duplicate episode_number in same season
    const { data: existing } = await supabase
      .from("episodes")
      .select("id")
      .eq("season_id", season_id)
      .eq("episode_number", Number(episode_number))
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: `Episode ${episode_number} already exists in this season.` },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("episodes")
      .insert({
        season_id,
        episode_number: Number(episode_number),
        title,
        title_bn: title_bn || null,
        description: description || null,
        duration_minutes: Number(duration_minutes),
        air_date: air_date || null,
        status,
        media: media || {},
        updated_at: new Date().toISOString(),
      })
      .select("*, season:season_id(id, season_number, series:series_id(id, title))")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, episode: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create episode.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
