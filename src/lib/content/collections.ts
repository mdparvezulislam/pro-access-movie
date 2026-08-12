import "server-only";
import { createServerClient } from "@/lib/supabase/server";
import { Collection, ContentItemSummary } from "@/types/content";

export async function getFeaturedCollections(): Promise<Collection[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .eq("status", "published")
    .eq("featured", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching featured collections:", error);
    return [];
  }

  return (data || []) as Collection[];
}

export async function getCollectionBySlug(slug: string): Promise<{
  collection: Collection | null;
  items: ContentItemSummary[];
}> {
  if (!slug) return { collection: null, items: [] };
  const supabase = await createServerClient();

  const { data: collection } = await supabase
    .from("collections")
    .select("*")
    .eq("slug", slug.toLowerCase())
    .eq("status", "published")
    .maybeSingle();

  if (!collection) return { collection: null, items: [] };

  const { data: colMovies } = await supabase
    .from("collection_movies")
    .select("movie_id")
    .eq("collection_id", collection.id)
    .order("sort_order", { ascending: true });

  const movieIds = (colMovies || []).map((m) => m.movie_id);
  if (movieIds.length === 0) {
    return { collection: collection as Collection, items: [] };
  }

  const { data: movies } = await supabase
    .from("movies")
    .select("id, title, title_bn, slug, release_year, duration_minutes, rating, media, search_keywords")
    .in("id", movieIds)
    .eq("status", "published");

  const items: ContentItemSummary[] = (movies || []).map((m) => ({
    id: m.id,
    title: m.title,
    titleBn: m.title_bn,
    slug: m.slug,
    type: "movie" as const,
    status: "published" as const,
    releaseYear: m.release_year,
    durationMinutes: m.duration_minutes,
    rating: m.rating,
    posterUrl: (m.media as Record<string, string>)?.posterUrl || null,
    backdropUrl: (m.media as Record<string, string>)?.backdropUrl || null,
    searchKeywords: m.search_keywords,
  }));

  return {
    collection: collection as Collection,
    items,
  };
}
