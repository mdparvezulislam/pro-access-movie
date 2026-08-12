import "server-only";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";
import { ContentItemSummary } from "@/types/content";

export const searchQuerySchema = z.object({
  query: z.string().min(1).max(100),
  limit: z.number().int().min(1).max(50).default(20),
});

export type SearchQueryInput = z.infer<typeof searchQuerySchema>;

export async function searchPublishedContent(
  input: SearchQueryInput
): Promise<ContentItemSummary[]> {
  const parsed = searchQuerySchema.safeParse(input);
  if (!parsed.success) return [];

  const { query, limit } = parsed.data;
  const cleanQuery = query.trim();
  const supabase = await createServerClient();

  // Search in published movies (by title, title_bn, search_keywords, or FTS)
  const { data: movies } = await supabase
    .from("movies")
    .select("id, title, title_bn, slug, release_year, duration_minutes, rating, media, search_keywords")
    .eq("status", "published")
    .or(`title.ilike.%${cleanQuery}%,title_bn.ilike.%${cleanQuery}%,search_keywords.ilike.%${cleanQuery}%`)
    .limit(limit);

  // Search in published series
  const { data: series } = await supabase
    .from("series")
    .select("id, title, title_bn, slug, release_year, rating, media, search_keywords")
    .eq("status", "published")
    .or(`title.ilike.%${cleanQuery}%,title_bn.ilike.%${cleanQuery}%,search_keywords.ilike.%${cleanQuery}%`)
    .limit(limit);

  const movieResults: ContentItemSummary[] = (movies || []).map((m) => ({
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

  const seriesResults: ContentItemSummary[] = (series || []).map((s) => ({
    id: s.id,
    title: s.title,
    titleBn: s.title_bn,
    slug: s.slug,
    type: "series" as const,
    status: "published" as const,
    releaseYear: s.release_year,
    durationMinutes: null,
    rating: s.rating,
    posterUrl: (s.media as Record<string, string>)?.posterUrl || null,
    backdropUrl: (s.media as Record<string, string>)?.backdropUrl || null,
    searchKeywords: s.search_keywords,
  }));

  return [...movieResults, ...seriesResults].slice(0, limit);
}
