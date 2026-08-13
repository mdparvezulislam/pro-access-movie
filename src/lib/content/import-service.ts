import "server-only";
import { createAdminClient } from "@/lib/supabase/server";
import {
  NormalizedMovieData,
  NormalizedSeriesData,
  ImportOptions,
  ImportResult,
} from "@/types/import";
import { MediaFolder, MediaContentType } from "@/types/media";
import { detectDuplicateContent } from "./duplicate-detector";
import { generateUniqueSlug, slugifyText } from "./slugify";
import { uploadMediaFile } from "@/lib/media/storage";

/**
 * Validates a remote image URL to prevent SSRF vulnerabilities.
 * Blocks private IP ranges, localhost, and non-HTTP/HTTPS protocols.
 */
function validateRemoteUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
    const hostname = parsed.hostname.toLowerCase();

    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostname === "::1" ||
      hostname.startsWith("10.") ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("169.254.") ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname)
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Downloads a remote image URL and stores it using the Supabase Media Storage engine.
 * Includes SSRF validation, MIME verification, and safe fallback on storage error.
 */
export async function ingestRemoteMedia(
  url: string | undefined,
  folder: MediaFolder = "movie",
  contentType: "poster" | "backdrop" | "thumbnail" = "poster",
  title: string = "Imported Media",
  userId?: string
): Promise<{ path?: string; publicUrl?: string; status: "success" | "fallback" | "failed"; warning?: string }> {
  if (!url || !url.trim()) {
    return { status: "fallback" };
  }

  const cleanUrl = url.trim();
  if (!validateRemoteUrl(cleanUrl)) {
    return {
      publicUrl: cleanUrl,
      status: "fallback",
      warning: `URL '${cleanUrl}' failed SSRF security validation. Using remote reference directly.`,
    };
  }

  try {
    const response = await fetch(cleanUrl, {
      signal: AbortSignal.timeout(8000), // 8s timeout
    });

    if (!response.ok) {
      return {
        publicUrl: cleanUrl,
        status: "fallback",
        warning: `Remote image fetch returned HTTP ${response.status}. Using remote URL.`,
      };
    }

    const contentTypeHeader = (response.headers.get("content-type") || "").toLowerCase();
    if (contentTypeHeader && !contentTypeHeader.includes("image/")) {
      return {
        publicUrl: cleanUrl,
        status: "fallback",
        warning: `URL did not return an image content-type (${contentTypeHeader}). Using remote URL.`,
      };
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Max 15MB size check
    if (buffer.length > 15 * 1024 * 1024) {
      return {
        publicUrl: cleanUrl,
        status: "fallback",
        warning: `Image size exceeds 15MB limit (${(buffer.length / 1024 / 1024).toFixed(1)}MB). Using remote URL.`,
      };
    }

    let ext = "jpg";
    if (contentTypeHeader.includes("png")) ext = "png";
    else if (contentTypeHeader.includes("webp")) ext = "webp";
    else if (contentTypeHeader.includes("avif")) ext = "avif";
    else if (cleanUrl.includes(".png")) ext = "png";
    else if (cleanUrl.includes(".webp")) ext = "webp";

    const filename = `${contentType}_${Date.now()}.${ext}`;
    const mimeType = contentTypeHeader || `image/${ext}`;
    const bucket = folder === "series" ? "flex-series" : "flex-movie";

    const mediaRecord = await uploadMediaFile(buffer, {
      bucket,
      folder: folder as MediaFolder,
      contentType: contentType as MediaContentType,
      originalName: filename,
      mimeType,
      sizeBytes: buffer.length,
      title: `${title} - ${contentType}`,
      altText: `${title} ${contentType}`,
      accessStrategy: "public",
      userId,
    });

    return {
      path: mediaRecord.path,
      publicUrl: mediaRecord.public_url || cleanUrl,
      status: "success",
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Storage upload exception";
    console.warn(`Media ingestion fallback for ${cleanUrl}:`, errorMsg);
    return {
      publicUrl: cleanUrl,
      status: "fallback",
      warning: `Could not save image to Supabase Storage (${errorMsg}). Using remote image URL fallback.`,
    };
  }
}

/**
 * Resolves or creates genres in public.genres table and returns their UUIDs.
 */
async function resolveGenreIds(genreNames: string[]): Promise<string[]> {
  if (!genreNames || genreNames.length === 0) return [];
  const supabase = await createAdminClient();
  const genreIds: string[] = [];

  for (const name of genreNames) {
    const slug = slugifyText(name);
    if (!slug) continue;

    // Check if genre exists
    const { data: existing } = await supabase
      .from("genres")
      .select("id")
      .or(`slug.eq.${slug},name.ilike.${name}`)
      .maybeSingle();

    if (existing) {
      genreIds.push(existing.id);
    } else {
      // Insert new genre
      const { data: created, error } = await supabase
        .from("genres")
        .insert({
          name: name.trim(),
          slug,
        })
        .select("id")
        .maybeSingle();

      if (!error && created) {
        genreIds.push(created.id);
      }
    }
  }

  return genreIds;
}

/**
 * Imports a movie from normalized provider data.
 */
export async function importMovie(
  data: NormalizedMovieData,
  options: ImportOptions = {}
): Promise<ImportResult> {
  const supabase = await createAdminClient();
  const targetStatus = options.targetStatus || "draft";

  // 1. Check duplicate detection
  const dupCheck = await detectDuplicateContent(
    "movie",
    data.title,
    data.release_year,
    data.external_ids
  );

  if (dupCheck.isDuplicate && !options.overrideDuplicates && dupCheck.existingId) {
    return {
      success: false,
      id: dupCheck.existingId,
      type: "movie",
      title: data.title,
      slug: dupCheck.existingSlug || "",
      status: "draft",
      isDuplicate: true,
      message: dupCheck.reason || "Content already exists in database.",
    };
  }

  // 2. Generate clean unique slug
  const slug = await generateUniqueSlug(
    data.title,
    data.release_year,
    "movie",
    dupCheck.existingId
  );

  // 3. Store Original Remote Image URLs directly
  const posterUrl = data.poster_url || "";
  const backdropUrl = data.backdrop_url || "";
  const logoUrl = data.logo_url || "";

  const mediaObj = {
    posterUrl,
    backdropUrl,
    logoUrl,
  };

  // 4. Resolve genre IDs
  const genreIds = await resolveGenreIds(data.genres || []);

  // 5. Insert or Update Movie Record
  const moviePayload = {
    title: data.title,
    title_bn: data.title_bn || null,
    original_title: data.original_title || null,
    slug,
    status: targetStatus,
    release_year: data.release_year,
    duration_minutes: data.duration_minutes || 120,
    description: data.overview,
    description_bn: data.overview_bn || null,
    rating: data.rating,
    content_rating: data.content_rating || "13+",
    poster_url: posterUrl || null,
    backdrop_url: backdropUrl || null,
    logo_url: logoUrl || null,
    trailer_url: data.trailer_url || null,
    external_ids: (data.external_ids || {}) as Record<string, unknown>,
    media: mediaObj,
    search_keywords: (data.genres || []).join(", "),
    created_by: options.assignedBy || null,
    updated_at: new Date().toISOString(),
  };

  let movieId: string;

  if (dupCheck.isDuplicate && dupCheck.existingId) {
    // Update existing record
    const { error: updateError } = await supabase
      .from("movies")
      .update(moviePayload)
      .eq("id", dupCheck.existingId);

    if (updateError) {
      throw new Error(`Failed to update existing movie: ${updateError.message}`);
    }
    movieId = dupCheck.existingId;
  } else {
    // Insert new record
    const { data: inserted, error: insertError } = await supabase
      .from("movies")
      .insert(moviePayload)
      .select("id")
      .single();

    if (insertError || !inserted) {
      throw new Error(`Failed to insert movie: ${insertError?.message || "Unknown error"}`);
    }
    movieId = inserted.id;
  }

  // 6. Link Movie Genres
  if (genreIds.length > 0) {
    // Delete existing links for this movie
    await supabase.from("movie_genres").delete().eq("movie_id", movieId);

    const genreInserts = genreIds.map((genre_id) => ({
      movie_id: movieId,
      genre_id,
    }));
    await supabase.from("movie_genres").insert(genreInserts);
  }

  return {
    success: true,
    id: movieId,
    type: "movie",
    title: data.title,
    slug,
    status: targetStatus,
    isDuplicate: dupCheck.isDuplicate,
    mediaCount: (posterUrl ? 1 : 0) + (backdropUrl ? 1 : 0),
    message: dupCheck.isDuplicate
      ? `Updated existing movie "${data.title}" successfully.`
      : `Imported movie "${data.title}" as ${targetStatus}.`,
  };
}

/**
 * Imports a TV series with seasons & episodes from normalized provider data.
 */
export async function importSeries(
  data: NormalizedSeriesData,
  options: ImportOptions = {}
): Promise<ImportResult> {
  const supabase = await createAdminClient();
  const targetStatus = options.targetStatus || "draft";

  // 1. Check duplicate detection
  const dupCheck = await detectDuplicateContent(
    "series",
    data.title,
    data.release_year,
    data.external_ids
  );

  if (dupCheck.isDuplicate && !options.overrideDuplicates && dupCheck.existingId) {
    return {
      success: false,
      id: dupCheck.existingId,
      type: "series",
      title: data.title,
      slug: dupCheck.existingSlug || "",
      status: "draft",
      isDuplicate: true,
      message: dupCheck.reason || "Series already exists in database.",
    };
  }

  // 2. Generate clean unique slug
  const slug = await generateUniqueSlug(
    data.title,
    data.release_year,
    "series",
    dupCheck.existingId
  );

  // 3. Store Original Remote Image URLs directly
  const posterUrl = data.poster_url || "";
  const backdropUrl = data.backdrop_url || "";
  const logoUrl = data.logo_url || "";

  const mediaObj = {
    posterUrl,
    backdropUrl,
    logoUrl,
  };

  // 4. Resolve genre IDs
  const genreIds = await resolveGenreIds(data.genres || []);

  // 5. Insert or Update Series Record
  const seriesPayload = {
    title: data.title,
    title_bn: data.title_bn || null,
    original_title: data.original_title || null,
    slug,
    status: targetStatus,
    release_year: data.release_year,
    description: data.overview,
    description_bn: data.overview_bn || null,
    rating: data.rating,
    content_rating: data.content_rating || "13+",
    poster_url: posterUrl || null,
    backdrop_url: backdropUrl || null,
    logo_url: logoUrl || null,
    trailer_url: data.trailer_url || null,
    external_ids: (data.external_ids || {}) as Record<string, unknown>,
    media: mediaObj,
    search_keywords: (data.genres || []).join(", "),
    created_by: options.assignedBy || null,
    updated_at: new Date().toISOString(),
  };

  let seriesId: string;

  if (dupCheck.isDuplicate && dupCheck.existingId) {
    const { error: updateError } = await supabase
      .from("series")
      .update(seriesPayload)
      .eq("id", dupCheck.existingId);

    if (updateError) {
      throw new Error(`Failed to update existing series: ${updateError.message}`);
    }
    seriesId = dupCheck.existingId;
  } else {
    const { data: inserted, error: insertError } = await supabase
      .from("series")
      .insert(seriesPayload)
      .select("id")
      .single();

    if (insertError || !inserted) {
      throw new Error(`Failed to insert series: ${insertError?.message || "Unknown error"}`);
    }
    seriesId = inserted.id;
  }

  // 6. Link Series Genres
  if (genreIds.length > 0) {
    await supabase.from("series_genres").delete().eq("series_id", seriesId);
    const genreInserts = genreIds.map((genre_id) => ({
      series_id: seriesId,
      genre_id,
    }));
    await supabase.from("series_genres").insert(genreInserts);
  }

  // 7. Import Seasons & Episodes cleanly without duplication
  let importedSeasonsCount = 0;
  let importedEpisodesCount = 0;

  for (const s of data.seasons || []) {
    // Upsert Season
    const seasonMedia = { posterUrl: s.poster_url || posterUrl || "" };
    
    // Check if season exists
    const { data: existingSeason } = await supabase
      .from("seasons")
      .select("id")
      .eq("series_id", seriesId)
      .eq("season_number", s.season_number)
      .maybeSingle();

    let seasonId: string;

    if (existingSeason) {
      seasonId = existingSeason.id;
      await supabase
        .from("seasons")
        .update({
          title: s.title || `Season ${s.season_number}`,
          description: s.overview || null,
          media: seasonMedia,
          updated_at: new Date().toISOString(),
        })
        .eq("id", seasonId);
    } else {
      const { data: newSeason, error: seasonError } = await supabase
        .from("seasons")
        .insert({
          series_id: seriesId,
          season_number: s.season_number,
          title: s.title || `Season ${s.season_number}`,
          description: s.overview || null,
          status: targetStatus,
          media: seasonMedia,
        })
        .select("id")
        .single();

      if (seasonError || !newSeason) continue;
      seasonId = newSeason.id;
    }

    importedSeasonsCount++;

    // Upsert Episodes for this Season
    for (const ep of s.episodes || []) {
      const epMedia = { stillUrl: ep.still_url || backdropUrl || "" };

      const { data: existingEp } = await supabase
        .from("episodes")
        .select("id")
        .eq("season_id", seasonId)
        .eq("episode_number", ep.episode_number)
        .maybeSingle();

      if (existingEp) {
        await supabase
          .from("episodes")
          .update({
            title: ep.title,
            title_bn: ep.title_bn || null,
            description: ep.overview || null,
            duration_minutes: ep.duration_minutes || 45,
            air_date: ep.air_date || null,
            media: epMedia,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingEp.id);
      } else {
        await supabase.from("episodes").insert({
          season_id: seasonId,
          episode_number: ep.episode_number,
          title: ep.title,
          title_bn: ep.title_bn || null,
          description: ep.overview || null,
          duration_minutes: ep.duration_minutes || 45,
          air_date: ep.air_date || null,
          status: targetStatus,
          media: epMedia,
        });
      }

      importedEpisodesCount++;
    }
  }

  return {
    success: true,
    id: seriesId,
    type: "series",
    title: data.title,
    slug,
    status: targetStatus,
    isDuplicate: dupCheck.isDuplicate,
    importedSeasonsCount,
    importedEpisodesCount,
    message: dupCheck.isDuplicate
      ? `Updated series "${data.title}" (${importedSeasonsCount} seasons, ${importedEpisodesCount} episodes).`
      : `Imported series "${data.title}" with ${importedSeasonsCount} seasons & ${importedEpisodesCount} episodes as ${targetStatus}.`,
  };
}
