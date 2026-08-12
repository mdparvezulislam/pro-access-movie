import "server-only";
import { createServerClient } from "@/lib/supabase/server";
import { Series, Season, Episode } from "@/types/content";
import { paginationSchema } from "./movies";

export async function getPublishedSeries(
  pagination?: { limit?: number; offset?: number }
): Promise<Series[]> {
  const { limit, offset } = paginationSchema.parse(pagination || {});
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("series")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error || !data || data.length === 0) {
    const { DEMO_SERIES } = await import("./catalog-fallback");
    return DEMO_SERIES.slice(offset, offset + limit);
  }

  return (data || []) as Series[];
}

export async function getSeriesBySlug(slug: string): Promise<Series | null> {
  if (!slug) return null;
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("series")
    .select("*")
    .eq("slug", slug.toLowerCase())
    .eq("status", "published")
    .maybeSingle();

  if (error || !data) {
    const { DEMO_SERIES } = await import("./catalog-fallback");
    const match = DEMO_SERIES.find((s) => s.slug === slug.toLowerCase() || s.id === slug);
    return match || DEMO_SERIES[0];
  }

  return (data as Series) || null;
}

export async function getSeriesSeasonsAndEpisodes(seriesId: string): Promise<{
  seasons: Season[];
  episodes: Episode[];
}> {
  const supabase = await createServerClient();

  // 1. Fetch seasons
  const { data: seasonsData } = await supabase
    .from("seasons")
    .select("*")
    .eq("series_id", seriesId)
    .eq("status", "published")
    .order("season_number", { ascending: true });

  const seasons = (seasonsData || []) as Season[];
  if (seasons.length === 0) {
    return { seasons: [], episodes: [] };
  }

  const seasonIds = seasons.map((s) => s.id);

  // 2. Fetch episodes for seasons
  const { data: episodesData } = await supabase
    .from("episodes")
    .select("*")
    .in("season_id", seasonIds)
    .eq("status", "published")
    .order("episode_number", { ascending: true });

  return {
    seasons,
    episodes: (episodesData || []) as Episode[],
  };
}
