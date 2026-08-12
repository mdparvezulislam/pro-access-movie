import "server-only";
import { createServerClient } from "@/lib/supabase/server";
import { Genre, ContentItemSummary } from "@/types/content";

export async function getGenres(): Promise<Genre[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("genres")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching genres:", error);
    return [];
  }

  return (data || []) as Genre[];
}

export async function getMoviesByGenre(
  genreSlug: string,
  limit: number = 20
): Promise<ContentItemSummary[]> {
  const supabase = await createServerClient();

  // 1. Get genre ID
  const { data: genre } = await supabase
    .from("genres")
    .select("id")
    .eq("slug", genreSlug.toLowerCase())
    .maybeSingle();

  if (!genre) return [];

  // 2. Query movie IDs for genre
  const { data: movieGenreRows } = await supabase
    .from("movie_genres")
    .select("movie_id")
    .eq("genre_id", genre.id)
    .limit(limit);

  const movieIds = (movieGenreRows || []).map((row) => row.movie_id);
  if (movieIds.length === 0) return [];

  // 3. Query movies with status = published
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
