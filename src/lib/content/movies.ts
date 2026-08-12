import "server-only";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";
import { Movie, ContentItemSummary } from "@/types/content";

export const paginationSchema = z.object({
  limit: z.number().int().min(1).max(50).default(20),
  offset: z.number().int().min(0).default(0),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

export async function getPublishedMovies(
  pagination?: PaginationInput
): Promise<Movie[]> {
  const { limit, offset } = paginationSchema.parse(pagination || {});
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("movies")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Error fetching published movies:", error);
    return [];
  }

  return (data || []) as Movie[];
}

export async function getMovieBySlug(slug: string): Promise<Movie | null> {
  if (!slug) return null;
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("movies")
    .select("*")
    .eq("slug", slug.toLowerCase())
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error(`Error fetching movie with slug '${slug}':`, error);
    return null;
  }

  return (data as Movie) || null;
}

export async function getRelatedMovies(
  movieId: string,
  limit: number = 6
): Promise<ContentItemSummary[]> {
  const supabase = await createServerClient();

  // 1. Get genre IDs for current movie
  const { data: genreData } = await supabase
    .from("movie_genres")
    .select("genre_id")
    .eq("movie_id", movieId);

  const genreIds = (genreData || []).map((g) => g.genre_id);

  if (genreIds.length === 0) {
    // Fallback: fetch recent published movies excluding current
    const { data: fallbackMovies } = await supabase
      .from("movies")
      .select("id, title, title_bn, slug, release_year, duration_minutes, rating, media, search_keywords")
      .eq("status", "published")
      .neq("id", movieId)
      .limit(limit);

    return (fallbackMovies || []).map((m) => ({
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

  // 2. Query movies matching same genres
  const { data: matchedMovieIds } = await supabase
    .from("movie_genres")
    .select("movie_id")
    .in("genre_id", genreIds)
    .neq("movie_id", movieId)
    .limit(limit * 2);

  const targetIds = Array.from(new Set((matchedMovieIds || []).map((m) => m.movie_id))).slice(0, limit);

  if (targetIds.length === 0) return [];

  const { data: related } = await supabase
    .from("movies")
    .select("id, title, title_bn, slug, release_year, duration_minutes, rating, media, search_keywords")
    .in("id", targetIds)
    .eq("status", "published");

  return (related || []).map((m) => ({
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
