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
    const search = searchParams.get("search")?.toLowerCase().trim();

    const supabase = await createAdminClient();
    const { data: genres, error } = await supabase
      .from("genres")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let result = genres || [];
    if (search) {
      result = result.filter(
        (g) =>
          g.name.toLowerCase().includes(search) ||
          g.name_bn?.toLowerCase().includes(search) ||
          g.slug.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({ genres: result });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch genres.";
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
    const { name, name_bn, slug, description } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Genre name and slug are required." },
        { status: 400 }
      );
    }

    const cleanSlug = slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const supabase = await createAdminClient();

    // Check duplicate slug
    const { data: existing } = await supabase
      .from("genres")
      .select("id")
      .eq("slug", cleanSlug)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: `Genre with slug '${cleanSlug}' already exists.` },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("genres")
      .insert({
        name: name.trim(),
        name_bn: name_bn?.trim() || null,
        slug: cleanSlug,
        description: description?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, genre: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create genre.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
