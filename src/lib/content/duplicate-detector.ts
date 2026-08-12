import "server-only";
import { createAdminClient } from "@/lib/supabase/server";
import {
  ContentType,
  ExternalIds,
  DuplicateCheckResult,
} from "@/types/import";
import { slugifyText } from "./slugify";

export async function detectDuplicateContent(
  contentType: ContentType,
  title: string,
  releaseYear: number,
  externalIds?: ExternalIds
): Promise<DuplicateCheckResult> {
  const supabase = await createAdminClient();
  const table = contentType === "movie" ? "movies" : "series";

  // 1. Check by TMDB ID
  if (externalIds?.tmdb_id) {
    const tmdbVal = String(externalIds.tmdb_id);
    const { data: tmdbMatch } = await supabase
      .from(table)
      .select("id, title, slug")
      .or(`external_ids->>tmdb_id.eq.${tmdbVal},external_ids->>tmdb_id.eq.${Number(tmdbVal)}`)
      .maybeSingle();

    if (tmdbMatch) {
      return {
        isDuplicate: true,
        existingId: tmdbMatch.id,
        existingType: contentType,
        existingTitle: tmdbMatch.title,
        existingSlug: tmdbMatch.slug,
        matchType: "external_id",
        reason: `Found existing ${contentType} "${tmdbMatch.title}" matching TMDB ID ${externalIds.tmdb_id}.`,
      };
    }
  }

  // 2. Check by IMDb ID
  if (externalIds?.imdb_id) {
    const { data: imdbMatch } = await supabase
      .from(table)
      .select("id, title, slug")
      .eq("external_ids->>imdb_id", externalIds.imdb_id)
      .maybeSingle();

    if (imdbMatch) {
      return {
        isDuplicate: true,
        existingId: imdbMatch.id,
        existingType: contentType,
        existingTitle: imdbMatch.title,
        existingSlug: imdbMatch.slug,
        matchType: "external_id",
        reason: `Found existing ${contentType} "${imdbMatch.title}" matching IMDb ID ${externalIds.imdb_id}.`,
      };
    }
  }

  // 3. Check by exact candidate slug
  const candidateSlug = releaseYear ? `${slugifyText(title)}-${releaseYear}` : slugifyText(title);
  const { data: slugMatch } = await supabase
    .from(table)
    .select("id, title, slug")
    .eq("slug", candidateSlug)
    .maybeSingle();

  if (slugMatch) {
    return {
      isDuplicate: true,
      existingId: slugMatch.id,
      existingType: contentType,
      existingTitle: slugMatch.title,
      existingSlug: slugMatch.slug,
      matchType: "slug",
      reason: `Found existing ${contentType} matching slug "${candidateSlug}".`,
    };
  }

  // 4. Check by title (case insensitive) and release year
  if (releaseYear) {
    const { data: titleMatch } = await supabase
      .from(table)
      .select("id, title, slug")
      .ilike("title", title)
      .eq("release_year", releaseYear)
      .maybeSingle();

    if (titleMatch) {
      return {
        isDuplicate: true,
        existingId: titleMatch.id,
        existingType: contentType,
        existingTitle: titleMatch.title,
        existingSlug: titleMatch.slug,
        matchType: "title_year",
        reason: `Found existing ${contentType} matching title "${title}" (${releaseYear}).`,
      };
    }
  }

  return { isDuplicate: false };
}
