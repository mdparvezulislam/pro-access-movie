import { createAdminClient } from "@/lib/supabase/server";

export interface PublicContentItem {
  id: string;
  type: "movie" | "series";
  title: string;
  title_bn?: string | null;
  original_title?: string | null;
  slug: string;
  overview?: string | null;
  release_year?: number | null;
  release_date?: string | null;
  duration_minutes?: number | null;
  rating?: number | null;
  vote_count?: number | null;
  content_rating?: string | null;
  poster_url: string;
  backdrop_url: string;
  logo_url?: string | null;
  trailer_url?: string | null;
  status: string;
  genres: string[];
  created_at: string;
}

export interface PublicSeriesDetail extends PublicContentItem {
  type: "series";
  seasons_count?: number;
  episodes_count?: number;
  seasons: {
    id: string;
    season_number: number;
    title?: string | null;
    description?: string | null;
    poster_url?: string | null;
    episodes: {
      id: string;
      episode_number: number;
      title: string;
      title_bn?: string | null;
      description?: string | null;
      duration_minutes?: number | null;
      air_date?: string | null;
      still_url?: string | null;
    }[];
  }[];
}

export interface PlaybackSourceItem {
  id: string;
  content_type: "movie" | "episode";
  content_id: string;
  source_name: string;
  url: string;
  quality: string;
  resolution?: string | null;
  language: string;
  subtitle_url?: string | null;
  priority: number;
}

export interface DownloadSourceItem {
  id: string;
  content_type: "movie" | "episode";
  content_id: string;
  label: string;
  url: string;
  quality: string;
  file_size_bytes?: number | null;
  language: string;
  priority: number;
}

/**
 * Normalizes movie database row to PublicContentItem.
 */
function normalizeMovieRow(row: Record<string, unknown>): PublicContentItem {
  const media = (row.media || {}) as Record<string, string>;
  return {
    id: String(row.id),
    type: "movie",
    title: String(row.title || ""),
    title_bn: row.title_bn ? String(row.title_bn) : null,
    original_title: row.original_title ? String(row.original_title) : null,
    slug: String(row.slug || ""),
    overview: row.description ? String(row.description) : null,
    release_year: row.release_year ? Number(row.release_year) : null,
    release_date: row.release_date ? String(row.release_date) : null,
    duration_minutes: row.duration_minutes ? Number(row.duration_minutes) : null,
    rating: row.rating ? Number(row.rating) : 7.5,
    vote_count: row.vote_count ? Number(row.vote_count) : 0,
    content_rating: row.content_rating ? String(row.content_rating) : "13+",
    poster_url: String(row.poster_url || media.posterUrl || "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600"),
    backdrop_url: String(row.backdrop_url || media.backdropUrl || "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=1200"),
    logo_url: row.logo_url ? String(row.logo_url) : media.logoUrl,
    trailer_url: row.trailer_url ? String(row.trailer_url) : null,
    status: String(row.status || "draft"),
    genres: (String(row.search_keywords || "")).split(",").map((s: string) => s.trim()).filter(Boolean),
    created_at: String(row.created_at || new Date().toISOString()),
  };
}

/**
 * Normalizes series database row to PublicContentItem.
 */
function normalizeSeriesRow(row: Record<string, unknown>): PublicContentItem {
  const media = (row.media || {}) as Record<string, string>;
  return {
    id: String(row.id),
    type: "series",
    title: String(row.title || ""),
    title_bn: row.title_bn ? String(row.title_bn) : null,
    original_title: row.original_title ? String(row.original_title) : null,
    slug: String(row.slug || ""),
    overview: row.description ? String(row.description) : null,
    release_year: row.release_year ? Number(row.release_year) : null,
    release_date: row.first_air_date ? String(row.first_air_date) : null,
    duration_minutes: row.duration_minutes ? Number(row.duration_minutes) : 45,
    rating: row.rating ? Number(row.rating) : 8.0,
    vote_count: row.vote_count ? Number(row.vote_count) : 0,
    content_rating: row.content_rating ? String(row.content_rating) : "13+",
    poster_url: String(row.poster_url || media.posterUrl || "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600"),
    backdrop_url: String(row.backdrop_url || media.backdropUrl || "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=1200"),
    logo_url: row.logo_url ? String(row.logo_url) : media.logoUrl,
    trailer_url: row.trailer_url ? String(row.trailer_url) : null,
    status: String(row.status || "draft"),
    genres: (String(row.search_keywords || "")).split(",").map((s: string) => s.trim()).filter(Boolean),
    created_at: String(row.created_at || new Date().toISOString()),
  };
}

/**
 * Fetches public movies listing with filtering and pagination.
 */
export async function getPublicMovies(options: {
  genre?: string;
  year?: number;
  minRating?: number;
  sort?: "latest" | "popular" | "top_rated";
  limit?: number;
  page?: number;
} = {}) {
  try {
    const supabase = await createAdminClient();
    let query = supabase.from("movies").select("*", { count: "exact" });

    if (options.minRating) {
      query = query.gte("rating", options.minRating);
    }

    if (options.year) {
      query = query.eq("release_year", options.year);
    }

    if (options.genre) {
      query = query.ilike("search_keywords", `%${options.genre}%`);
    }

    if (options.sort === "popular") {
      query = query.order("vote_count", { ascending: false });
    } else if (options.sort === "top_rated") {
      query = query.order("rating", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const limit = options.limit || 24;
    const page = options.page || 1;
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) {
      console.warn("Error fetching public movies:", error.message);
      return { items: [], total: 0, page, limit, totalPages: 0 };
    }

    const items = (data || []).map(normalizeMovieRow);
    const total = count || items.length;
    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (err) {
    console.error("Failed to fetch public movies:", err);
    return { items: [], total: 0, page: 1, limit: 24, totalPages: 0 };
  }
}

/**
 * Fetches public series listing with filtering and pagination.
 */
export async function getPublicSeries(options: {
  genre?: string;
  year?: number;
  minRating?: number;
  sort?: "latest" | "popular" | "top_rated";
  limit?: number;
  page?: number;
} = {}) {
  try {
    const supabase = await createAdminClient();
    let query = supabase.from("series").select("*", { count: "exact" });

    if (options.minRating) {
      query = query.gte("rating", options.minRating);
    }

    if (options.year) {
      query = query.eq("release_year", options.year);
    }

    if (options.genre) {
      query = query.ilike("search_keywords", `%${options.genre}%`);
    }

    if (options.sort === "popular") {
      query = query.order("vote_count", { ascending: false });
    } else if (options.sort === "top_rated") {
      query = query.order("rating", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const limit = options.limit || 24;
    const page = options.page || 1;
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) {
      console.warn("Error fetching public series:", error.message);
      return { items: [], total: 0, page, limit, totalPages: 0 };
    }

    const items = (data || []).map(normalizeSeriesRow);
    const total = count || items.length;
    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (err) {
    console.error("Failed to fetch public series:", err);
    return { items: [], total: 0, page: 1, limit: 24, totalPages: 0 };
  }
}

/**
 * Fetches a movie by slug with full metadata and sources.
 */
export async function getMovieBySlug(slug: string): Promise<{
  movie: PublicContentItem | null;
  playbackSources: PlaybackSourceItem[];
  downloadSources: DownloadSourceItem[];
  relatedMovies: PublicContentItem[];
}> {
  try {
    const supabase = await createAdminClient();
    const { data: movieRow, error } = await supabase
      .from("movies")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !movieRow) {
      return { movie: null, playbackSources: [], downloadSources: [], relatedMovies: [] };
    }

    const movie = normalizeMovieRow(movieRow);

    // Fetch playback & download sources
    const [pRes, dRes, relRes] = await Promise.all([
      supabase
        .from("playback_sources")
        .select("*")
        .eq("content_type", "movie")
        .eq("content_id", movie.id)
        .eq("is_active", true)
        .order("priority", { ascending: true }),
      supabase
        .from("download_sources")
        .select("*")
        .eq("content_type", "movie")
        .eq("content_id", movie.id)
        .eq("is_active", true)
        .order("priority", { ascending: true }),
      supabase
        .from("movies")
        .select("*")
        .neq("id", movie.id)
        .limit(6),
    ]);

    return {
      movie,
      playbackSources: (pRes.data || []) as PlaybackSourceItem[],
      downloadSources: (dRes.data || []) as DownloadSourceItem[],
      relatedMovies: (relRes.data || []).map(normalizeMovieRow),
    };
  } catch (err) {
    console.error(`Error fetching movie by slug ${slug}:`, err);
    return { movie: null, playbackSources: [], downloadSources: [], relatedMovies: [] };
  }
}

/**
 * Fetches a TV Series by slug with seasons, episodes, and sources.
 */
export async function getSeriesBySlug(slug: string): Promise<{
  series: PublicSeriesDetail | null;
  relatedSeries: PublicContentItem[];
}> {
  try {
    const supabase = await createAdminClient();
    const { data: seriesRow, error } = await supabase
      .from("series")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !seriesRow) {
      return { series: null, relatedSeries: [] };
    }

    const baseItem = normalizeSeriesRow(seriesRow);

    // Fetch seasons & episodes
    const { data: seasonsData } = await supabase
      .from("seasons")
      .select("id, season_number, title, description, poster_url")
      .eq("series_id", baseItem.id)
      .order("season_number", { ascending: true });

    const seasonsWithEpisodes = [];
    if (seasonsData && seasonsData.length > 0) {
      for (const s of seasonsData) {
        const { data: epData } = await supabase
          .from("episodes")
          .select("id, episode_number, title, title_bn, description, duration_minutes, air_date, still_url")
          .eq("season_id", s.id)
          .order("episode_number", { ascending: true });

        seasonsWithEpisodes.push({
          id: s.id,
          season_number: s.season_number,
          title: s.title,
          description: s.description,
          poster_url: s.poster_url,
          episodes: epData || [],
        });
      }
    }

    const { data: relData } = await supabase
      .from("series")
      .select("*")
      .neq("id", baseItem.id)
      .limit(6);

    const seriesDetail: PublicSeriesDetail = {
      ...baseItem,
      type: "series",
      seasons_count: seasonsWithEpisodes.length,
      episodes_count: seasonsWithEpisodes.reduce((acc, curr) => acc + curr.episodes.length, 0),
      seasons: seasonsWithEpisodes,
    };

    return {
      series: seriesDetail,
      relatedSeries: (relData || []).map(normalizeSeriesRow),
    };
  } catch (err) {
    console.error(`Error fetching series by slug ${slug}:`, err);
    return { series: null, relatedSeries: [] };
  }
}

/**
 * Global search across movies, series, and genres.
 */
export async function searchPublicContent(queryStr: string) {
  if (!queryStr || !queryStr.trim()) {
    return { movies: [], series: [] };
  }

  try {
    const supabase = await createAdminClient();
    const term = queryStr.trim();

    const [mRes, sRes] = await Promise.all([
      supabase
        .from("movies")
        .select("*")
        .or(`title.ilike.%${term}%,description.ilike.%${term}%,search_keywords.ilike.%${term}%`)
        .limit(8),
      supabase
        .from("series")
        .select("*")
        .or(`title.ilike.%${term}%,description.ilike.%${term}%,search_keywords.ilike.%${term}%`)
        .limit(8),
    ]);

    return {
      movies: (mRes.data || []).map(normalizeMovieRow),
      series: (sRes.data || []).map(normalizeSeriesRow),
    };
  } catch (err) {
    console.error("Error searching public content:", err);
    return { movies: [], series: [] };
  }
}

/**
 * Fetches structured dynamic homepage sections.
 */
export async function getHomepageSections() {
  try {
    const [moviesRes, seriesRes] = await Promise.all([
      getPublicMovies(),
      getPublicSeries(),
    ]);

    const allMovies = moviesRes.items;
    const allSeries = seriesRes.items;

    const hero = allMovies[0] || allSeries[0] || null;

    // Bengali Content Priority
    const bengaliContent = [...allMovies, ...allSeries].filter(
      (item) => Boolean(item.title_bn) || item.genres.includes("Bengali")
    );

    // Popular Items (by rating)
    const popularMovies = [...allMovies].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 10);
    const popularSeries = [...allSeries].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 10);

    // Genre Rails
    const actionContent = [...allMovies, ...allSeries].filter((item) => item.genres.includes("Action")).slice(0, 10);
    const dramaContent = [...allMovies, ...allSeries].filter((item) => item.genres.includes("Drama")).slice(0, 10);

    return {
      hero,
      bengaliContent: bengaliContent.length > 0 ? bengaliContent.slice(0, 10) : allMovies.slice(0, 6),
      popularMovies,
      popularSeries,
      latestMovies: allMovies.slice(0, 10),
      latestSeries: allSeries.slice(0, 10),
      actionContent,
      dramaContent,
    };
  } catch (err) {
    console.error("Error fetching homepage sections:", err);
    return {
      hero: null,
      bengaliContent: [],
      popularMovies: [],
      popularSeries: [],
      latestMovies: [],
      latestSeries: [],
      actionContent: [],
      dramaContent: [],
    };
  }
}
