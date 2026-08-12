import "server-only";
import { createServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/features/auth/lib/auth-helpers";
import { ContentItemSummary, Movie, Series } from "@/types/content";
import { resolveMovieMediaUrls } from "@/lib/content/movies";

export async function getUserWatchlist(): Promise<ContentItemSummary[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("user_watchlist")
    .select(`
      id,
      movie_id,
      series_id,
      created_at,
      movies (*),
      series (*)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user watchlist:", error);
    return [];
  }

  const items: ContentItemSummary[] = [];

  for (const row of data || []) {
    if (row.movies) {
      const m = row.movies as unknown as Movie;
      const { posterUrl, backdropUrl } = await resolveMovieMediaUrls(m);
      items.push({
        id: m.id,
        title: m.title,
        titleBn: m.title_bn,
        slug: m.slug,
        type: "movie",
        status: m.status,
        releaseYear: m.release_year,
        durationMinutes: m.duration_minutes,
        rating: m.rating,
        posterUrl,
        backdropUrl,
      });
    } else if (row.series) {
      const s = row.series as unknown as Series;
      items.push({
        id: s.id,
        title: s.title,
        titleBn: s.title_bn,
        slug: s.slug,
        type: "series",
        status: s.status,
        releaseYear: s.release_year,
        durationMinutes: null,
        rating: s.rating,
        posterUrl: (s.media as Record<string, string>)?.posterUrl || null,
        backdropUrl: (s.media as Record<string, string>)?.backdropUrl || null,
      });
    }
  }

  return items;
}

export async function checkInWatchlist(
  contentId: string,
  contentKind: "movie" | "series"
): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  const supabase = await createServerClient();
  let query = supabase.from("user_watchlist").select("id").eq("user_id", user.id);

  if (contentKind === "movie") {
    query = query.eq("movie_id", contentId);
  } else {
    query = query.eq("series_id", contentId);
  }

  const { data } = await query.maybeSingle();
  return !!data;
}

export async function addToWatchlistAction(
  contentId: string,
  contentKind: "movie" | "series"
): Promise<{ success: boolean; message?: string }> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, message: "Authentication required to add items to My List." };
  }

  const supabase = await createServerClient();
  const insertData = {
    user_id: user.id,
    movie_id: contentKind === "movie" ? contentId : null,
    series_id: contentKind === "series" ? contentId : null,
  };

  const { error } = await supabase.from("user_watchlist").insert(insertData);

  if (error && error.code !== "23505") { // Ignore unique conflict
    console.error("Error adding to watchlist:", error);
    return { success: false, message: error.message };
  }

  return { success: true };
}

export async function removeFromWatchlistAction(
  contentId: string,
  contentKind: "movie" | "series"
): Promise<{ success: boolean; message?: string }> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, message: "Authentication required." };
  }

  const supabase = await createServerClient();
  let query = supabase.from("user_watchlist").delete().eq("user_id", user.id);

  if (contentKind === "movie") {
    query = query.eq("movie_id", contentId);
  } else {
    query = query.eq("series_id", contentId);
  }

  const { error } = await query;
  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true };
}
