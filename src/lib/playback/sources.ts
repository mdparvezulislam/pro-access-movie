import "server-only";
import { createAdminClient } from "@/lib/supabase/server";

export interface PlaybackSource {
  id: string;
  label: string;
  quality: "1080p" | "720p" | "480p" | "360p" | "auto" | "4K";
  url: string;
  format: "hls" | "mp4" | "embed" | "other";
  providerName: string;
  priority: number;
  subtitle_url?: string | null;
}

const DEMO_FALLBACK_SOURCES: PlaybackSource[] = [
  {
    id: "demo-hls-1080p",
    label: "PRO ACCESS CDN — Full HD (1080p)",
    quality: "1080p",
    url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    format: "hls",
    providerName: "PRO ACCESS FastCDN",
    priority: 1,
  },
  {
    id: "demo-mp4-720p",
    label: "PRO ACCESS Mirror — HD (720p)",
    quality: "720p",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    format: "mp4",
    providerName: "PRO ACCESS Backup Mirror",
    priority: 2,
  },
];

export async function getPlaybackSources(
  contentType: "movie" | "series" | "episode",
  contentId: string
): Promise<PlaybackSource[]> {
  if (!contentId) return DEMO_FALLBACK_SOURCES;

  try {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from("playback_sources")
      .select("*")
      .eq("content_type", contentType)
      .eq("content_id", contentId)
      .eq("is_active", true)
      .order("priority", { ascending: true });

    if (error || !data || data.length === 0) {
      return DEMO_FALLBACK_SOURCES;
    }

    return data.map((s: Record<string, unknown>) => {
      const urlStr = String(s.url || "");
      let detectedFormat: PlaybackSource["format"] = (s.format as PlaybackSource["format"]) || "hls";
      if (!s.format) {
        if (urlStr.includes(".m3u8")) detectedFormat = "hls";
        else if (urlStr.includes(".mp4")) detectedFormat = "mp4";
        else if (urlStr.includes("<iframe") || urlStr.includes("embed")) detectedFormat = "embed";
      }

      return {
        id: String(s.id),
        label: String(s.source_name || s.label || "Streaming Server"),
        quality: (s.quality as PlaybackSource["quality"]) || "1080p",
        url: urlStr,
        format: detectedFormat,
        providerName: String(s.source_name || "Fast Server"),
        priority: Number(s.priority || 1),
        subtitle_url: (s.subtitle_url as string) || null,
      };
    });
  } catch (err) {
    console.error("Error fetching playback sources:", err);
    return DEMO_FALLBACK_SOURCES;
  }
}

export async function getPlaybackSourcesForMovie(movieId: string): Promise<PlaybackSource[]> {
  return getPlaybackSources("movie", movieId);
}

export async function getPlaybackSourcesForEpisode(episodeId: string): Promise<PlaybackSource[]> {
  return getPlaybackSources("episode", episodeId);
}
