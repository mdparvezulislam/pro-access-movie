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
    const { title, slug, description, status, featured, sort_order } = body;

    const supabase = await createAdminClient();

    let cleanSlug = undefined;
    if (slug) {
      cleanSlug = slug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      const { data: existing } = await supabase
        .from("collections")
        .select("id")
        .eq("slug", cleanSlug)
        .neq("id", id)
        .maybeSingle();

      if (existing) {
        return NextResponse.json(
          { error: `Collection with slug '${cleanSlug}' already exists.` },
          { status: 400 }
        );
      }
    }

    const updateFields: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (title !== undefined) updateFields.title = title.trim();
    if (cleanSlug !== undefined) updateFields.slug = cleanSlug;
    if (description !== undefined) updateFields.description = description ? description.trim() : null;
    if (status !== undefined) updateFields.status = status;
    if (featured !== undefined) updateFields.featured = Boolean(featured);
    if (sort_order !== undefined) updateFields.sort_order = Number(sort_order);

    let { data, error } = await supabase
      .from("collections")
      .update(updateFields)
      .eq("id", id)
      .select()
      .single();

    // Recursive fallback if any column is missing in schema cache
    let attempts = 0;
    while (
      error &&
      attempts < 10 &&
      error.message &&
      (error.message.includes("Could not find the") || error.message.includes("schema cache"))
    ) {
      attempts++;
      const match = error.message.match(/Could not find the '([^']+)' column/);
      if (match && match[1]) {
        delete updateFields[match[1]];
        const fallbackRes = await supabase
          .from("collections")
          .update(updateFields)
          .eq("id", id)
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
    const msg = err instanceof Error ? err.message : "Failed to update collection.";
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

    const { error } = await supabase.from("collections").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete collection.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
