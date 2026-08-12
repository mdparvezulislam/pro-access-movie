import { NextRequest, NextResponse } from "next/server";
import { checkIsAdmin, getCurrentUser } from "@/features/auth/lib/auth-helpers";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  props: { params: Promise<Record<string, string>> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const isAdmin = await checkIsAdmin(user.id);
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id: seasonId } = await props.params;
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("episodes")
      .select("*")
      .eq("season_id", seasonId)
      .order("episode_number", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ episodes: data || [] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch episodes.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  props: { params: Promise<Record<string, string>> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const isAdmin = await checkIsAdmin(user.id);
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id: seasonId } = await props.params;
    const body = await request.json();
    const {
      episode_number,
      title,
      title_bn,
      description,
      duration_minutes = 45,
      air_date,
      status = "draft",
    } = body;

    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("episodes")
      .insert({
        season_id: seasonId,
        episode_number,
        title: title || `Episode ${episode_number}`,
        title_bn,
        description,
        duration_minutes,
        air_date,
        status,
        updated_at: new Date().toISOString(),
      })
      .select()
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
