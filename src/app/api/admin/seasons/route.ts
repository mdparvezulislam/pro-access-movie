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
    const seriesId = searchParams.get("series_id");
    const search = searchParams.get("search")?.toLowerCase().trim();
    const status = searchParams.get("status");

    const supabase = await createAdminClient();
    let query = supabase
      .from("seasons")
      .select("*, series:series_id(id, title)")
      .order("created_at", { ascending: false });

    if (seriesId && seriesId !== "all") {
      query = query.eq("series_id", seriesId);
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
        (s) =>
          s.title?.toLowerCase().includes(search) ||
          s.description?.toLowerCase().includes(search) ||
          (s.series as { title?: string } | null)?.title?.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({ seasons: filtered });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch seasons.";
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
    const { series_id, season_number, title, description, status = "draft", media } = body;

    if (!series_id || season_number === undefined || season_number === null) {
      return NextResponse.json(
        { error: "Series ID and Season Number are required." },
        { status: 400 }
      );
    }

    const supabase = await createAdminClient();

    // Check for duplicate season_number in the same series
    const { data: existing } = await supabase
      .from("seasons")
      .select("id")
      .eq("series_id", series_id)
      .eq("season_number", Number(season_number))
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: `Season ${season_number} already exists for this series.` },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("seasons")
      .insert({
        series_id,
        season_number: Number(season_number),
        title: title || `Season ${season_number}`,
        description: description || null,
        status,
        media: media || {},
        updated_at: new Date().toISOString(),
      })
      .select("*, series:series_id(id, title)")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, season: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create season.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
