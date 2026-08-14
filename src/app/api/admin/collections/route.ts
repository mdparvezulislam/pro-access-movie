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
    const status = searchParams.get("status");

    const supabase = await createAdminClient();
    let query = supabase.from("collections").select("*");

    let { data: collections, error } = await query.order("sort_order", { ascending: true });

    if (error && error.message.includes("sort_order")) {
      const fallbackRes = await supabase.from("collections").select("*").order("title", { ascending: true });
      collections = fallbackRes.data;
      error = fallbackRes.error;
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let result = collections || [];
    if (status && status !== "all") {
      result = result.filter((c) => c.status === status);
    }
    if (search) {
      result = result.filter(
        (c) =>
          c.title?.toLowerCase().includes(search) ||
          c.slug?.toLowerCase().includes(search) ||
          c.description?.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({ collections: result });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch collections.";
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
    const { title, slug, description, status = "published", featured = false, sort_order = 0 } = body;

    if (!title || !slug) {
      return NextResponse.json(
        { error: "Title and slug are required." },
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
      .from("collections")
      .select("id")
      .eq("slug", cleanSlug)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: `Collection with slug '${cleanSlug}' already exists.` },
        { status: 400 }
      );
    }

    const insertPayload: Record<string, unknown> = {
      title: title.trim(),
      slug: cleanSlug,
      description: description?.trim() || null,
      status,
      featured: Boolean(featured),
      sort_order: Number(sort_order),
      updated_at: new Date().toISOString(),
    };

    let { data, error } = await supabase
      .from("collections")
      .insert(insertPayload)
      .select()
      .single();

    // Fallback if any column is missing in schema cache
    while (error && error.message.includes("Could not find the") && error.message.includes("column")) {
      const match = error.message.match(/Could not find the '([^']+)' column/);
      if (match && match[1]) {
        delete insertPayload[match[1]];
        const fallbackRes = await supabase
          .from("collections")
          .insert(insertPayload)
          .select()
          .single();
        data = fallbackRes.data;
        error = fallbackRes.error;
      } else {
        break;
      }
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, collection: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create collection.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
