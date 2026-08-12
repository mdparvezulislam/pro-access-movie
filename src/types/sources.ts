export type ContentSourceType = "movie" | "episode";

export type VideoQuality = "360p" | "480p" | "720p" | "1080p" | "4K" | "Auto";
export type DownloadQuality = "480p" | "720p" | "1080p" | "4K" | "BD-Rip" | "WEB-DL";

export interface PlaybackSource {
  id: string;
  content_type: ContentSourceType;
  content_id: string;
  source_name: string;
  url: string;
  quality: VideoQuality;
  resolution?: string | null;
  language: string;
  subtitle_url?: string | null;
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePlaybackSourceInput {
  content_type: ContentSourceType;
  content_id: string;
  source_name: string;
  url: string;
  quality?: VideoQuality;
  resolution?: string;
  language?: string;
  subtitle_url?: string;
  priority?: number;
  is_active?: boolean;
}

export interface DownloadSource {
  id: string;
  content_type: ContentSourceType;
  content_id: string;
  label: string;
  url: string;
  quality: DownloadQuality;
  resolution?: string | null;
  file_size_bytes?: number | null;
  language: string;
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateDownloadSourceInput {
  content_type: ContentSourceType;
  content_id: string;
  label: string;
  url: string;
  quality?: DownloadQuality;
  resolution?: string;
  file_size_bytes?: number;
  language?: string;
  priority?: number;
  is_active?: boolean;
}
