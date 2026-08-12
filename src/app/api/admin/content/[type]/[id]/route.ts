import { NextRequest, NextResponse } from "next/server";
import { checkIsAdmin, getCurrentUser } from "@/features/auth/lib/auth-helpers";
import { createAdminClient } from "@/lib/supabase/server";

export async function PATCH(
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

    const { type, id } = await props.params;
    if (type !== "movie" && type !== "series") {
      return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
    }

    const body = await request.json();
    const table = type === "movie" ? "movies" : "series";

    const supabase = await createAdminClient();
    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.title !== undefined) updatePayload.title = body.title;
    if (body.title_bn !== undefined) updatePayload.title_bn = body.title_bn;
    if (body.slug !== undefined) updatePayload.slug = body.slug;
    if (body.status !== undefined) updatePayload.status = body.status;
    if (body.release_year !== undefined) updatePayload.release_year = body.release_year;
    if (body.duration_minutes !== undefined && type === "movie") updatePayload.duration_minutes = body.duration_minutes;
    if (body.description !== undefined) updatePayload.description = body.description;
    if (body.description_bn !== undefined) updatePayload.description_bn = body.description_bn;
    if (body.rating !== undefined) updatePayload.rating = body.rating;
    if (body.content_rating !== undefined) updatePayload.content_rating = body.content_rating;
    if (body.media !== undefined) updatePayload.media = body.media;

    if (body.status === "published") {
      updatePayload.published_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from(table)
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    console.error("Error updating content:", err);
    const msg = err instanceof Error ? err.message : "Failed to update content.";
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}
