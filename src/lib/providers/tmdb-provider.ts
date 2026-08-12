import "server-only";
import {
  ProviderType,
  ContentType,
  ProviderSearchResult,
  NormalizedMovieData,
  NormalizedSeriesData,
  NormalizedSeasonData,
  NormalizedEpisodeData,
  NormalizedCastMember,
  NormalizedCrewMember,
} from "@/types/import";
import { MetadataProvider } from "./provider-interface";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

interface TmdbCastItem {
  id: number;
  name: string;
  character?: string;
  profile_path?: string | null;
}

interface TmdbCrewItem {
  id: number;
  name: string;
  job?: string;
  department?: string;
  profile_path?: string | null;
}

interface TmdbVideoItem {
  site: string;
  type: string;
  key: string;
}

interface TmdbGenreItem {
  id: number;
  name: string;
}

interface TmdbSeasonItem {
  season_number: number;
  name?: string;
  overview?: string;
  poster_path?: string | null;
}

interface TmdbEpisodeItem {
  episode_number: number;
  name?: string;
  overview?: string;
  runtime?: number;
  air_date?: string;
  still_path?: string | null;
}

export class TmdbProvider implements MetadataProvider {
  id: ProviderType = "tmdb";
  name = "The Movie Database (TMDB)";
  description = "Global metadata provider for movies, TV series, posters, backdrops, and cast/crew.";

  private getApiKey(): string | null {
    return (
      process.env.TMDB_API_KEY ||
      process.env.NEXT_PUBLIC_TMDB_API_KEY ||
      null
    );
  }

  isConfigured(): boolean {
    const key = this.getApiKey();
    return !!key && key.trim().length > 0;
  }

  private getImageUrl(path: string | null, size: "poster" | "backdrop" | "profile" = "poster"): string | undefined {
    if (!path) return undefined;
    if (path.startsWith("http")) return path;
    const sizeStr = size === "backdrop" ? "w1280" : size === "profile" ? "w300" : "w500";
    return `${TMDB_IMAGE_BASE}/${sizeStr}${path}`;
  }

  async search(
    query: string,
    type: ContentType | "all" = "all"
  ): Promise<ProviderSearchResult[]> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error("TMDB API key is not configured. Please set TMDB_API_KEY in server environment.");
    }

    const results: ProviderSearchResult[] = [];

    const fetchEndpoint = async (endpoint: string, contentType: ContentType) => {
      const url = `${TMDB_BASE_URL}/${endpoint}?api_key=${apiKey}&query=${encodeURIComponent(
        query
      )}&include_adult=false&language=en-US`;
      
      const res = await fetch(url, { next: { revalidate: 3600 } });
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Invalid TMDB API key provided.");
        }
        return;
      }
      const data = await res.json();

      for (const item of data.results || []) {
        const title = contentType === "movie" ? item.title : item.name;
        const originalTitle = contentType === "movie" ? item.original_title : item.original_name;
        const dateStr = contentType === "movie" ? item.release_date : item.first_air_date;
        const year = dateStr ? parseInt(dateStr.substring(0, 4), 10) : undefined;

        results.push({
          external_id: `tmdb_${contentType}_${item.id}`,
          provider: "tmdb",
          type: contentType,
          tmdb_id: item.id,
          title: title || "Untitled",
          original_title: originalTitle,
          overview: item.overview || "",
          release_year: isNaN(year!) ? undefined : year,
          poster_url: this.getImageUrl(item.poster_path, "poster"),
          backdrop_url: this.getImageUrl(item.backdrop_path, "backdrop"),
          vote_average: item.vote_average ? Math.round(item.vote_average * 10) / 10 : undefined,
          vote_count: item.vote_count,
          original_language: item.original_language,
          raw_data: item,
        });
      }
    };

    if (type === "movie" || type === "all") {
      await fetchEndpoint("search/movie", "movie");
    }
    if (type === "series" || type === "all") {
      await fetchEndpoint("search/tv", "series");
    }

    return results;
  }

  async getMovieDetails(externalId: string | number): Promise<NormalizedMovieData> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error("TMDB API key is not configured.");
    }

    const tmdbId = String(externalId).replace(/^tmdb_movie_/, "");
    const url = `${TMDB_BASE_URL}/movie/${tmdbId}?api_key=${apiKey}&append_to_response=credits,videos,keywords,release_dates`;

    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) {
      throw new Error(`Failed to fetch TMDB movie details for ID ${tmdbId} (HTTP ${res.status})`);
    }

    const data = await res.json();
    const releaseYear = data.release_date ? parseInt(data.release_date.substring(0, 4), 10) : new Date().getFullYear();

    const cast: NormalizedCastMember[] = (data.credits?.cast || []).slice(0, 10).map((c: TmdbCastItem) => ({
      name: c.name,
      character: c.character,
      profile_path: this.getImageUrl(c.profile_path || null, "profile"),
      tmdb_id: c.id,
    }));

    const crew: NormalizedCrewMember[] = (data.credits?.crew || [])
      .filter((cr: TmdbCrewItem) => ["Director", "Writer", "Producer", "Executive Producer"].includes(cr.job || ""))
      .slice(0, 5)
      .map((cr: TmdbCrewItem) => ({
        name: cr.name,
        job: cr.job,
        department: cr.department,
        profile_path: this.getImageUrl(cr.profile_path || null, "profile"),
        tmdb_id: cr.id,
      }));

    const trailer = (data.videos?.results || []).find(
      (v: TmdbVideoItem) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")
    );
    const trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : undefined;

    const genres = (data.genres || []).map((g: TmdbGenreItem) => g.name);

    return {
      provider: "tmdb",
      external_id: `tmdb_movie_${data.id}`,
      external_ids: {
        tmdb_id: data.id,
        imdb_id: data.imdb_id || undefined,
      },
      title: data.title,
      original_title: data.original_title,
      slug: "",
      overview: data.overview || "",
      release_year: releaseYear,
      release_date: data.release_date,
      duration_minutes: data.runtime || 120,
      rating: data.vote_average ? Math.round(data.vote_average * 10) / 10 : 7.0,
      vote_count: data.vote_count || 0,
      original_language: data.original_language || "en",
      country: data.production_countries?.[0]?.iso_3166_1 || "US",
      trailer_url: trailerUrl,
      poster_url: this.getImageUrl(data.poster_path, "poster"),
      backdrop_url: this.getImageUrl(data.backdrop_path, "backdrop"),
      genres,
      cast,
      crew,
    };
  }

  async getSeriesDetails(externalId: string | number): Promise<NormalizedSeriesData> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error("TMDB API key is not configured.");
    }

    const tmdbId = String(externalId).replace(/^tmdb_series_/, "").replace(/^tmdb_tv_/, "");
    const url = `${TMDB_BASE_URL}/tv/${tmdbId}?api_key=${apiKey}&append_to_response=credits,videos,external_ids`;

    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) {
      throw new Error(`Failed to fetch TMDB TV series details for ID ${tmdbId} (HTTP ${res.status})`);
    }

    const data = await res.json();
    const releaseYear = data.first_air_date ? parseInt(data.first_air_date.substring(0, 4), 10) : new Date().getFullYear();

    const cast: NormalizedCastMember[] = (data.credits?.cast || []).slice(0, 10).map((c: TmdbCastItem) => ({
      name: c.name,
      character: c.character,
      profile_path: this.getImageUrl(c.profile_path || null, "profile"),
      tmdb_id: c.id,
    }));

    const crew: NormalizedCrewMember[] = (data.credits?.crew || [])
      .filter((cr: TmdbCrewItem) => ["Creator", "Executive Producer", "Director"].includes(cr.job || ""))
      .slice(0, 5)
      .map((cr: TmdbCrewItem) => ({
        name: cr.name,
        job: cr.job,
        department: cr.department,
        profile_path: this.getImageUrl(cr.profile_path || null, "profile"),
        tmdb_id: cr.id,
      }));

    const trailer = (data.videos?.results || []).find(
      (v: TmdbVideoItem) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")
    );
    const trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : undefined;

    const genres = (data.genres || []).map((g: TmdbGenreItem) => g.name);

    // Fetch season details for up to 5 seasons
    const rawSeasons = (data.seasons || []).filter((s: TmdbSeasonItem) => s.season_number > 0).slice(0, 5);
    const seasons: NormalizedSeasonData[] = await Promise.all(
      rawSeasons.map(async (s: TmdbSeasonItem) => {
        let episodes: NormalizedEpisodeData[] = [];
        try {
          const seasonUrl = `${TMDB_BASE_URL}/tv/${tmdbId}/season/${s.season_number}?api_key=${apiKey}`;
          const seasonRes = await fetch(seasonUrl, { next: { revalidate: 3600 } });
          if (seasonRes.ok) {
            const seasonData = await seasonRes.json();
            episodes = (seasonData.episodes || []).map((ep: TmdbEpisodeItem) => ({
              episode_number: ep.episode_number,
              title: ep.name || `Episode ${ep.episode_number}`,
              overview: ep.overview || "",
              duration_minutes: ep.runtime || data.episode_run_time?.[0] || 45,
              air_date: ep.air_date,
              still_url: this.getImageUrl(ep.still_path || null, "backdrop"),
            }));
          }
        } catch {
          episodes = [];
        }

        return {
          season_number: s.season_number,
          title: s.name || `Season ${s.season_number}`,
          overview: s.overview || "",
          poster_url: this.getImageUrl(s.poster_path || null, "poster"),
          episodes,
        };
      })
    );

    return {
      provider: "tmdb",
      external_id: `tmdb_series_${data.id}`,
      external_ids: {
        tmdb_id: data.id,
        imdb_id: data.external_ids?.imdb_id || undefined,
        tvdb_id: data.external_ids?.tvdb_id || undefined,
      },
      title: data.name,
      original_title: data.original_name,
      slug: "",
      overview: data.overview || "",
      release_year: releaseYear,
      first_air_date: data.first_air_date,
      rating: data.vote_average ? Math.round(data.vote_average * 10) / 10 : 8.0,
      vote_count: data.vote_count || 0,
      original_language: data.original_language || "en",
      country: data.origin_country?.[0] || "US",
      trailer_url: trailerUrl,
      poster_url: this.getImageUrl(data.poster_path, "poster"),
      backdrop_url: this.getImageUrl(data.backdrop_path, "backdrop"),
      genres,
      cast,
      crew,
      seasons,
    };
  }
}
