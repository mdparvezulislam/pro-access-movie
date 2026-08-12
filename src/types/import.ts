export type ProviderType = "tmdb" | "omdb" | "demo";

export type ContentType = "movie" | "series";

export interface ExternalIds {
  tmdb_id?: number | string;
  imdb_id?: string;
  tvdb_id?: number | string;
  [key: string]: string | number | undefined;
}

export interface ProviderSearchResult {
  external_id: string; // e.g. "tmdb_550" or "demo_hawa"
  provider: ProviderType;
  type: ContentType;
  tmdb_id?: number | string;
  imdb_id?: string;
  title: string;
  title_bn?: string;
  original_title?: string;
  overview?: string;
  overview_bn?: string;
  release_year?: number;
  poster_url?: string;
  backdrop_url?: string;
  vote_average?: number;
  vote_count?: number;
  original_language?: string;
  genres?: string[];
  raw_data?: Record<string, unknown>;
}

export interface NormalizedCastMember {
  name: string;
  character?: string;
  profile_path?: string;
  tmdb_id?: number | string;
}

export interface NormalizedCrewMember {
  name: string;
  job?: string;
  department?: string;
  profile_path?: string;
  tmdb_id?: number | string;
}

export interface NormalizedEpisodeData {
  episode_number: number;
  title: string;
  title_bn?: string;
  overview?: string;
  duration_minutes?: number;
  air_date?: string;
  still_url?: string;
}

export interface NormalizedSeasonData {
  season_number: number;
  title?: string;
  overview?: string;
  poster_url?: string;
  episodes: NormalizedEpisodeData[];
}

export interface NormalizedMovieData {
  provider: ProviderType;
  external_id: string;
  external_ids: ExternalIds;
  title: string;
  title_bn?: string;
  original_title?: string;
  slug: string;
  overview: string;
  overview_bn?: string;
  release_year: number;
  release_date?: string;
  duration_minutes: number;
  rating: number;
  vote_count?: number;
  content_rating?: string;
  original_language?: string;
  country?: string;
  trailer_url?: string;
  poster_url?: string;
  backdrop_url?: string;
  logo_url?: string;
  genres: string[];
  categories?: string[];
  keywords?: string[];
  cast: NormalizedCastMember[];
  crew: NormalizedCrewMember[];
}

export interface NormalizedSeriesData {
  provider: ProviderType;
  external_id: string;
  external_ids: ExternalIds;
  title: string;
  title_bn?: string;
  original_title?: string;
  slug: string;
  overview: string;
  overview_bn?: string;
  release_year: number;
  first_air_date?: string;
  rating: number;
  vote_count?: number;
  content_rating?: string;
  original_language?: string;
  country?: string;
  poster_url?: string;
  backdrop_url?: string;
  logo_url?: string;
  trailer_url?: string;
  genres: string[];
  categories?: string[];
  keywords?: string[];
  cast: NormalizedCastMember[];
  crew: NormalizedCrewMember[];
  seasons: NormalizedSeasonData[];
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  existingId?: string;
  existingType?: ContentType;
  existingTitle?: string;
  existingSlug?: string;
  matchType?: "external_id" | "slug" | "title_year";
  reason?: string;
}

export interface ImportOptions {
  downloadMedia?: boolean;
  overrideDuplicates?: boolean;
  targetStatus?: "draft" | "review" | "published";
  assignedBy?: string;
}

export interface ImportMediaStatus {
  poster?: "success" | "fallback" | "failed";
  backdrop?: "success" | "fallback" | "failed";
  logo?: "success" | "fallback" | "failed" | "skipped";
}

export interface ImportResult {
  success: boolean;
  id: string;
  type: ContentType;
  title: string;
  slug: string;
  status: "draft" | "review" | "published";
  isDuplicate: boolean;
  importedSeasonsCount?: number;
  importedEpisodesCount?: number;
  mediaCount?: number;
  media?: ImportMediaStatus;
  warnings?: string[];
  errors?: string[];
  message?: string;
}
