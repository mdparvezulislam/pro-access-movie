import { NextRequest, NextResponse } from "next/server";
import { checkIsAdmin, getCurrentUser } from "@/features/auth/lib/auth-helpers";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ type: string; id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

    const isAdmin = await checkIsAdmin(user.id);
    if (!isAdmin) return NextResponse.json({ error: "Admin access required" }, { status: 403 });

    const { type, id } = await props.params;
    if (type !== "movie" && type !== "series") {
      return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
    }

    const table = type === "movie" ? "movies" : "series";
    const supabase = await createAdminClient();

    const { data: record, error } = await supabase
      .from(table)
      .select("*")
      .eq("id", id)
      .single();

    if (error || !record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    // Fetch related categories, genres, and collections
    const categoriesTable = type === "movie" ? "movie_categories" : "series_categories";
    const genresTable = type === "movie" ? "movie_genres" : "series_genres";
    const collectionsTable = type === "movie" ? "collection_movies" : "collection_series";
    const fkCol = type === "movie" ? "movie_id" : "series_id";

    const [{ data: cats }, { data: gnrs }, { data: cols }] = await Promise.all([
      supabase.from(categoriesTable).select("category_id").eq(fkCol, id),
      supabase.from(genresTable).select("genre_id").eq(fkCol, id),
      supabase.from(collectionsTable).select("collection_id").eq(fkCol, id),
    ]);

    return NextResponse.json({
      data: {
        ...record,
        category_ids: (cats || []).map((c: { category_id: string }) => c.category_id),
        genre_ids: (gnrs || []).map((g: { genre_id: string }) => g.genre_id),
        collection_ids: (cols || []).map((c: { collection_id: string }) => c.collection_id),
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch content.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ type: string; id: string }> }
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
    if (body.tagline !== undefined) updatePayload.tagline = body.tagline;
    if (body.director !== undefined) updatePayload.director = body.director;
    if (body.cast !== undefined) updatePayload.cast = body.cast;
    if (body.trailer_url !== undefined) updatePayload.trailer_url = body.trailer_url;
    if (body.seo_title !== undefined) updatePayload.seo_title = body.seo_title;
    if (body.seo_description !== undefined) updatePayload.seo_description = body.seo_description;
    if (body.seo_keywords !== undefined) updatePayload.seo_keywords = body.seo_keywords;
    if (body.search_keywords !== undefined) updatePayload.search_keywords = body.search_keywords;
    if (body.media !== undefined) updatePayload.media = body.media;

    if (body.status === "published") {
      updatePayload.published_at = new Date().toISOString();
    }

    let { data, error } = await supabase
      .from(table)
      .update(updatePayload)
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
        const missingCol = match[1];
        delete updatePayload[missingCol];
        const fallbackRes = await supabase
          .from(table)
          .update(updatePayload)
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

    // Sync categories if category_ids provided
    if (Array.isArray(body.category_ids)) {
      const categoriesTable = type === "movie" ? "movie_categories" : "series_categories";
      const fkCol = type === "movie" ? "movie_id" : "series_id";
      await supabase.from(categoriesTable).delete().eq(fkCol, id);
      if (body.category_ids.length > 0) {
        const rows = body.category_ids.map((catId: string) => ({
          [fkCol]: id,
          category_id: catId,
        }));
        await supabase.from(categoriesTable).insert(rows);
      }
    }

    // Sync genres if genre_ids provided
    if (Array.isArray(body.genre_ids)) {
      const genresTable = type === "movie" ? "movie_genres" : "series_genres";
      const fkCol = type === "movie" ? "movie_id" : "series_id";
      await supabase.from(genresTable).delete().eq(fkCol, id);
      if (body.genre_ids.length > 0) {
        const rows = body.genre_ids.map((gId: string) => ({
          [fkCol]: id,
          genre_id: gId,
        }));
        await supabase.from(genresTable).insert(rows);
      }
    }

    // Sync collections if collection_ids provided
    if (Array.isArray(body.collection_ids)) {
      const collectionsTable = type === "movie" ? "collection_movies" : "collection_series";
      const fkCol = type === "movie" ? "movie_id" : "series_id";
      await supabase.from(collectionsTable).delete().eq(fkCol, id);
      if (body.collection_ids.length > 0) {
        const rows = body.collection_ids.map((colId: string) => ({
          [fkCol]: id,
          collection_id: colId,
        }));
        await supabase.from(collectionsTable).insert(rows);
      }
    }

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    console.error("Error updating content:", err);
    const msg = err instanceof Error ? err.message : "Failed to update content.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ type: string; id: string }> }
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

    const table = type === "movie" ? "movies" : "series";
    const supabase = await createAdminClient();

    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Error deleting content:", err);
    const msg = err instanceof Error ? err.message : "Failed to delete content.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
