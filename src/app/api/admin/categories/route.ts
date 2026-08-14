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
    
    // Try ordering by sort_order first, fallback to name ordering if sort_order column missing in schema
    let { data: categories, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error && error.message.includes("sort_order")) {
      const fallbackRes = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });
      categories = fallbackRes.data;
      error = fallbackRes.error;
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let result = categories || [];
    if (search) {
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(search) ||
          c.slug.toLowerCase().includes(search) ||
          c.description?.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({ categories: result });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch categories.";
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
    const { name, slug, description, sort_order = 0 } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Category name and slug are required." },
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
      .from("categories")
      .select("id")
      .eq("slug", cleanSlug)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: `Category with slug '${cleanSlug}' already exists.` },
        { status: 400 }
      );
    }

    const insertPayload: Record<string, unknown> = {
      name: name.trim(),
      slug: cleanSlug,
      description: description?.trim() || null,
      sort_order: Number(sort_order),
      updated_at: new Date().toISOString(),
    };

    let { data, error } = await supabase
      .from("categories")
      .insert(insertPayload)
      .select()
      .single();

    // Fallback if sort_order column missing in schema cache
    if (error && error.message.includes("sort_order")) {
      delete insertPayload.sort_order;
      const fallbackRes = await supabase
        .from("categories")
        .insert(insertPayload)
        .select()
        .single();
      data = fallbackRes.data;
      error = fallbackRes.error;
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, category: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create category.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
