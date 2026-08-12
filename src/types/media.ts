import { Database } from "./supabase";

export type FlexBucket =
  | "flex-movie"
  | "flex-series"
  | "flex-people"
  | "flex-advertisements"
  | "flex-system"
  | "flex-users"
  | "flex-posters"
  | "flex-backdrops"
  | "flex-trailers";

export type MediaFolder =
  | "movie"
  | "series"
  | "people"
  | "advertisements"
  | "system"
  | "users";

export type MediaContentType =
  | "poster"
  | "backdrop"
  | "banner"
  | "thumbnail"
  | "profile"
  | "photo"
  | "logo"
  | "trailer"
  | "subtitle"
  | "ad_creative"
  | "promo"
  | "asset";

export type AccessStrategy = "public" | "signed";

export type MediaStatus = "active" | "archived" | "draft";

export type MediaFileRecord = Database["public"]["Tables"]["media_files"]["Row"] & {
  filename?: string;
  folder?: MediaFolder;
  alt_text?: string | null;
  title?: string | null;
  access_strategy?: AccessStrategy;
  public_url?: string | null;
  duration_seconds?: number | null;
};

export interface MediaFilterOptions {
  search?: string;
  folder?: MediaFolder | "all";
  contentType?: MediaContentType | "all";
  status?: MediaStatus | "all";
  page?: number;
  limit?: number;
  sortBy?: "created_at" | "title" | "size_bytes";
  sortOrder?: "asc" | "desc";
  movieId?: string;
  seriesId?: string;
  personId?: string;
}

export interface MediaListResult {
  items: MediaFileRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UploadMediaParams {
  bucket: FlexBucket;
  contentType: MediaContentType;
  folder: MediaFolder;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  durationSeconds?: number;
  title?: string;
  altText?: string;
  accessStrategy?: AccessStrategy;
  movieId?: string;
  seriesId?: string;
  personId?: string;
  userId?: string;
}

export interface UpdateMediaParams {
  title?: string;
  altText?: string;
  folder?: MediaFolder;
  contentType?: MediaContentType;
  status?: MediaStatus;
  accessStrategy?: AccessStrategy;
}

export type MediaAspectRatio = "poster" | "backdrop" | "banner" | "square" | "any";

export interface ImageVariantOptions {
  preset?: MediaAspectRatio;
  width?: number;
  height?: number;
  quality?: number;
}
