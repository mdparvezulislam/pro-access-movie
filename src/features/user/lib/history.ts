import "server-only";
import { createServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/features/auth/lib/auth-helpers";
import { ContentItemSummary, Movie, ContentStatus } from "@/types/content";
import { resolveMovieMediaUrls } from "@/lib/content/movies";

export interface WatchHistoryItem extends ContentItemSummary {
  progressSeconds: number;
  durationSeconds: number;
  completed: boolean;
  updatedAt: string;
}

export async function getUserWatchHistory(): Promise<WatchHistoryItem[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("user_watch_history")
    .select(`
      id,
      progress_seconds,
      duration_seconds,
      completed,
      updated_at,
      movie_id,
      episode_id,
      movies (*),
      episodes (
        id,
        title,
        title_bn,
        season_id,
        seasons (
          series (*)
        )
      )
    `)
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching watch history:", error);
    return [];
  }

  const items: WatchHistoryItem[] = [];

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
        progressSeconds: row.progress_seconds,
        durationSeconds: row.duration_seconds,
        completed: row.completed,
        updatedAt: row.updated_at,
      });
    } else if (row.episodes) {
      const ep = row.episodes as unknown as Record<string, unknown>;
      const seasons = ep.seasons as Record<string, unknown> | undefined;
      const series = seasons?.series as Record<string, unknown> | undefined;
      if (series && typeof series.title === "string") {
        items.push({
          id: String(ep.id),
          title: `${series.title}: ${ep.title}`,
          titleBn: (ep.title_bn as string) || (series.title_bn as string) || null,
          slug: String(series.slug),
          type: "series",
          status: (series.status as ContentStatus) || "published",
          releaseYear: (series.release_year as number) || null,
          durationMinutes: null,
          rating: (series.rating as number) || null,
          posterUrl: ((series.media as Record<string, string>)?.posterUrl) || null,
          backdropUrl: ((series.media as Record<string, string>)?.backdropUrl) || null,
          progressSeconds: row.progress_seconds,
          durationSeconds: row.duration_seconds,
          completed: row.completed,
          updatedAt: row.updated_at,
        });
      }
    }
  }

  return items;
}

export async function getContinueWatching(): Promise<WatchHistoryItem[]> {
  const history = await getUserWatchHistory();
  // Filter items where progress > 30s and not completed
  return history.filter((item) => item.progressSeconds > 30 && !item.completed).slice(0, 10);
}

export async function updateWatchProgressAction(
  contentId: string,
  contentKind: "movie" | "episode",
  progressSeconds: number,
  durationSeconds: number
): Promise<{ success: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { success: false };

  const supabase = await createServerClient();
  const completed = durationSeconds > 0 && progressSeconds >= durationSeconds * 0.9;

  const upsertData = {
    user_id: user.id,
    movie_id: contentKind === "movie" ? contentId : null,
    episode_id: contentKind === "episode" ? contentId : null,
    progress_seconds: Math.floor(progressSeconds),
    duration_seconds: Math.floor(durationSeconds),
    completed,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("user_watch_history")
    .upsert(upsertData, {
      onConflict: contentKind === "movie" ? "user_id,movie_id" : "user_id,episode_id",
    });

  if (error) {
    console.error("Error updating watch progress:", error);
    return { success: false };
  }

  return { success: true };
}

export async function clearWatchHistoryAction(): Promise<{ success: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { success: false };

  const supabase = await createServerClient();
  const { error } = await supabase.from("user_watch_history").delete().eq("user_id", user.id);

  if (error) {
    console.error("Error clearing watch history:", error);
    return { success: false };
  }

  return { success: true };
}
