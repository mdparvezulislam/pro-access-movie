import "server-only";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";
import { Movie, ContentItemSummary } from "@/types/content";
import { getSignedMediaUrl } from "@/lib/media/storage";

export const paginationSchema = z.object({
  limit: z.number().int().min(1).max(50).default(20),
  offset: z.number().int().min(0).default(0),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

export async function resolveMovieMediaUrls(movie: Movie): Promise<{
  posterUrl: string;
  backdropUrl: string;
}> {
  const mediaObj = (movie.media as Record<string, string>) || {};
  const rawMovie = movie as unknown as Record<string, string>;
  const rawPoster = rawMovie.poster_url || mediaObj.posterUrl || mediaObj.posterPath || null;
  const rawBackdrop = rawMovie.backdrop_url || mediaObj.backdropUrl || mediaObj.backdropPath || null;

  let posterUrl = "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600";
  let backdropUrl = "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=1200";

  if (rawPoster) {
    if (rawPoster.startsWith("http://") || rawPoster.startsWith("https://")) {
      posterUrl = rawPoster;
    } else {
      posterUrl = await getSignedMediaUrl(rawPoster, "flex-posters", 3600, "poster");
    }
  }

  if (rawBackdrop) {
    if (rawBackdrop.startsWith("http://") || rawBackdrop.startsWith("https://")) {
      backdropUrl = rawBackdrop;
    } else {
      backdropUrl = await getSignedMediaUrl(rawBackdrop, "flex-backdrops", 3600, "backdrop");
    }
  }

  return { posterUrl, backdropUrl };
}

export async function getPublishedMovies(
  pagination?: { limit?: number; offset?: number }
): Promise<(Movie & { posterUrl: string; backdropUrl: string })[]> {
  const { limit, offset } = paginationSchema.parse(pagination || {});
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("movies")
    .select("*")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error || !data || data.length === 0) {
    const { DEMO_MOVIES } = await import("./catalog-fallback");
    return DEMO_MOVIES.slice(offset, offset + limit);
  }

  const movies = (data || []) as Movie[];

  const resolved = await Promise.all(
    movies.map(async (m) => {
      const urls = await resolveMovieMediaUrls(m);
      return { ...m, ...urls };
    })
  );

  return resolved;
}

export async function getMovieBySlug(slug: string): Promise<(Movie & { posterUrl: string; backdropUrl: string }) | null> {
  if (!slug) return null;
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("movies")
    .select("*")
    .eq("slug", slug.toLowerCase())
    .maybeSingle();

  if (error || !data) {
    const { DEMO_MOVIES } = await import("./catalog-fallback");
    const match = DEMO_MOVIES.find((m) => m.slug === slug.toLowerCase() || m.id === slug);
    return match || DEMO_MOVIES[0];
  }

  const movie = data as Movie;
  const urls = await resolveMovieMediaUrls(movie);
  return { ...movie, ...urls };
}

export async function getRelatedMovies(
  movieId: string,
  limit: number = 6
): Promise<ContentItemSummary[]> {
  const supabase = await createServerClient();

  const { data: genreData } = await supabase
    .from("movie_genres")
    .select("genre_id")
    .eq("movie_id", movieId);

  const genreIds = (genreData || []).map((g) => g.genre_id);

  let movies: Movie[] = [];

  if (genreIds.length > 0) {
    const { data: matchedMovieIds } = await supabase
      .from("movie_genres")
      .select("movie_id")
      .in("genre_id", genreIds)
      .neq("movie_id", movieId)
      .limit(limit * 2);

    const targetIds = Array.from(new Set((matchedMovieIds || []).map((m) => m.movie_id))).slice(0, limit);

    if (targetIds.length > 0) {
      const { data: matchedMovies } = await supabase
        .from("movies")
        .select("*")
        .in("id", targetIds)
        .eq("status", "published");
      movies = (matchedMovies || []) as Movie[];
    }
  }

  if (movies.length === 0) {
    const { data: fallbackMovies } = await supabase
      .from("movies")
      .select("*")
      .eq("status", "published")
      .neq("id", movieId)
      .limit(limit);
    movies = (fallbackMovies || []) as Movie[];
  }

  const summaries = await Promise.all(
    movies.map(async (m) => {
      const { posterUrl, backdropUrl } = await resolveMovieMediaUrls(m);
      return {
        id: m.id,
        title: m.title,
        titleBn: m.title_bn,
        slug: m.slug,
        type: "movie" as const,
        status: "published" as const,
        releaseYear: m.release_year,
        durationMinutes: m.duration_minutes,
        rating: m.rating,
        posterUrl,
        backdropUrl,
        searchKeywords: m.search_keywords,
      };
    })
  );

  return summaries;
}
