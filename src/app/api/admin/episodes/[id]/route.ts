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
    const {
      season_id,
      episode_number,
      title,
      title_bn,
      description,
      duration_minutes,
      air_date,
      status,
      media,
    } = body;

    const supabase = await createAdminClient();

    // Check duplicate episode number if updated
    if (episode_number !== undefined && season_id) {
      const { data: existing } = await supabase
        .from("episodes")
        .select("id")
        .eq("season_id", season_id)
        .eq("episode_number", Number(episode_number))
        .neq("id", id)
        .maybeSingle();

      if (existing) {
        return NextResponse.json(
          { error: `Episode ${episode_number} already exists in this season.` },
          { status: 400 }
        );
      }
    }

    const updateFields: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (episode_number !== undefined) updateFields.episode_number = Number(episode_number);
    if (title !== undefined) updateFields.title = title;
    if (title_bn !== undefined) updateFields.title_bn = title_bn;
    if (description !== undefined) updateFields.description = description;
    if (duration_minutes !== undefined) updateFields.duration_minutes = Number(duration_minutes);
    if (air_date !== undefined) updateFields.air_date = air_date;
    if (status !== undefined) updateFields.status = status;
    if (media !== undefined) updateFields.media = media;

    const { data, error } = await supabase
      .from("episodes")
      .update(updateFields)
      .eq("id", id)
      .select("*, season:season_id(id, season_number, series:series_id(id, title))")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, episode: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update episode.";
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

    // Clean up attached media sources
    await Promise.all([
      supabase.from("playback_sources").delete().eq("episode_id", id),
      supabase.from("download_sources").delete().eq("episode_id", id),
    ]);

    const { error } = await supabase.from("episodes").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete episode.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
