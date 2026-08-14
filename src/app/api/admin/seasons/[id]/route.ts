import { NextRequest, NextResponse } from "next/server";
import { checkIsAdmin, getCurrentUser } from "@/features/auth/lib/auth-helpers";
import { createAdminClient } from "@/lib/supabase/server";

export async function PATCH(
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

    const { id } = await params;
    const body = await request.json();
    const { season_number, title, description, status, media, series_id } = body;

    const supabase = await createAdminClient();

    // Check duplicate season_number if season_number is updated
    if (season_number !== undefined && series_id) {
      const { data: existing } = await supabase
        .from("seasons")
        .select("id")
        .eq("series_id", series_id)
        .eq("season_number", Number(season_number))
        .neq("id", id)
        .maybeSingle();

      if (existing) {
        return NextResponse.json(
          { error: `Season ${season_number} already exists for this series.` },
          { status: 400 }
        );
      }
    }

    const updateFields: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (season_number !== undefined) updateFields.season_number = Number(season_number);
    if (title !== undefined) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;
    if (status !== undefined) updateFields.status = status;
    if (media !== undefined) updateFields.media = media;

    const { data, error } = await supabase
      .from("seasons")
      .update(updateFields)
      .eq("id", id)
      .select("*, series:series_id(id, title)")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, season: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update season.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
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

    const { id } = await params;
    const supabase = await createAdminClient();

    // Check if episodes exist under this season
    const { count } = await supabase
      .from("episodes")
      .select("id", { count: "exact", head: true })
      .eq("season_id", id);

    if (count && count > 0) {
      return NextResponse.json(
        { error: `Cannot delete season. It has ${count} connected episode(s). Delete episodes first.` },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("seasons").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete season.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
