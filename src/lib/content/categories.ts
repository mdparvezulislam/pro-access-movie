import "server-only";
import { createServerClient } from "@/lib/supabase/server";
import { Category, ContentItemSummary } from "@/types/content";

export async function getCategories(): Promise<Category[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  return (data || []) as Category[];
}

export async function getCategoryContent(
  categorySlug: string,
  limit: number = 20
): Promise<ContentItemSummary[]> {
  const supabase = await createServerClient();

  const { data: category } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", categorySlug.toLowerCase())
    .maybeSingle();

  if (!category) return [];

  const { data: catRows } = await supabase
    .from("movie_categories")
    .select("movie_id")
    .eq("category_id", category.id)
    .limit(limit);

  const movieIds = (catRows || []).map((r) => r.movie_id);
  if (movieIds.length === 0) return [];

  const { data: movies } = await supabase
    .from("movies")
    .select("id, title, title_bn, slug, release_year, duration_minutes, rating, media, search_keywords")
    .in("id", movieIds)
    .eq("status", "published");

  return (movies || []).map((m) => ({
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
}
