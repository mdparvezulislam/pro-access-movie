import { NextRequest, NextResponse } from "next/server";
import { checkIsAdmin, getCurrentUser } from "@/features/auth/lib/auth-helpers";
import { createAdminClient } from "@/lib/supabase/server";

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
    const { type, title, title_bn, release_year, status = "draft" } = body;

    if (!type || (type !== "movie" && type !== "series")) {
      return NextResponse.json({ error: "Invalid or missing content type ('movie' or 'series')." }, { status: 400 });
    }

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "Content title is required." }, { status: 400 });
    }

    // Auto-generate safe unique slug
    let baseSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!baseSlug) baseSlug = `${type}-${Date.now()}`;
    const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

    const table = type === "movie" ? "movies" : "series";
    const supabase = await createAdminClient();

    const insertPayload: Record<string, unknown> = {
      title: title.trim(),
      title_bn: title_bn?.trim() || null,
      slug,
      status,
      release_year: release_year ? Number(release_year) : new Date().getFullYear(),
      created_by: user.id,
      updated_at: new Date().toISOString(),
    };

    if (type === "movie") {
      insertPayload.duration_minutes = 120;
    }

    const { data, error } = await supabase
      .from(table)
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error(`Error creating ${type}:`, error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    console.error("Error in content creation route:", err);
    const msg = err instanceof Error ? err.message : "Failed to create content.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
