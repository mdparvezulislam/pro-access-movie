import { NextRequest, NextResponse } from "next/server";
import { checkIsAdmin, getCurrentUser } from "@/features/auth/lib/auth-helpers";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id: seriesId } = await params;
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("seasons")
      .select("*")
      .eq("series_id", seriesId)
      .order("season_number", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ seasons: data || [] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch seasons.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id: seriesId } = await params;
    const body = await request.json();
    const { season_number, title, description, status = "draft" } = body;

    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("seasons")
      .insert({
        series_id: seriesId,
        season_number,
        title: title || `Season ${season_number}`,
        description,
        status,
        updated_at: new Date().toISOString(),
      })
      .select()
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
