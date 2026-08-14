export type ContentSourceType = "movie" | "series" | "episode";

export type VideoQuality = "360p" | "480p" | "720p" | "1080p" | "4K" | "Auto";
export type DownloadQuality = "360p" | "480p" | "720p" | "1080p" | "4K" | "BD-Rip" | "WEB-DL" | "Auto";
export type StreamFormat = "hls" | "mp4" | "embed" | "other";
export type DownloadFileType = "mp4" | "mkv" | "zip" | "other";

export interface PlaybackSource {
  id: string;
  content_type: ContentSourceType;
  content_id: string;
  source_name: string;
  label?: string;
  url: string;
  format?: StreamFormat;
  quality: VideoQuality;
  resolution?: string | null;
  language: string;
  subtitle_url?: string | null;
  notes?: string | null;
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePlaybackSourceInput {
  content_type: ContentSourceType;
  content_id: string;
  source_name: string;
  label?: string;
  url: string;
  format?: StreamFormat;
  quality?: VideoQuality;
  resolution?: string;
  language?: string;
  subtitle_url?: string | null;
  notes?: string | null;
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
  file_type?: DownloadFileType;
  resolution?: string | null;
  file_size_bytes?: number | null;
  size_bytes?: number | null;
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
  file_type?: DownloadFileType;
  resolution?: string;
  file_size_bytes?: number;
  size_bytes?: number;
  language?: string;
  priority?: number;
  is_active?: boolean;
}
