import "server-only";
import { createServerClient } from "@/lib/supabase/server";
import { Database } from "@/types/supabase";

export type PlaybackSourceRecord = Database["public"]["Tables"]["playback_sources"]["Row"];

export interface PlaybackSource {
  id: string;
  label: string;
  quality: "1080p" | "720p" | "480p" | "360p" | "auto";
  url: string;
  format: "hls" | "mp4" | "embed";
  providerName: string;
  priority: number;
}

const DEMO_FALLBACK_SOURCES: PlaybackSource[] = [
  {
    id: "demo-hls-1080p",
    label: "PRO ACCESS CDN — Full HD (1080p)",
    quality: "1080p",
    url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    format: "hls",
    providerName: "PRO ACCESS FastCDN (Dhaka Edge)",
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

export async function getPlaybackSourcesForMovie(movieId: string): Promise<PlaybackSource[]> {
  if (!movieId) return DEMO_FALLBACK_SOURCES;

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("playback_sources")
    .select("*")
    .eq("movie_id", movieId)
    .eq("is_active", true)
    .order("priority", { ascending: true });

  if (error || !data || data.length === 0) {
    return DEMO_FALLBACK_SOURCES;
  }

  return data.map((s) => ({
    id: s.id,
    label: s.label,
    quality: s.quality,
    url: s.url,
    format: s.format,
    providerName: s.provider_name,
    priority: s.priority,
  }));
}

export async function getPlaybackSourcesForEpisode(episodeId: string): Promise<PlaybackSource[]> {
  if (!episodeId) return DEMO_FALLBACK_SOURCES;

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("playback_sources")
    .select("*")
    .eq("episode_id", episodeId)
    .eq("is_active", true)
    .order("priority", { ascending: true });

  if (error || !data || data.length === 0) {
    return DEMO_FALLBACK_SOURCES;
  }

  return data.map((s) => ({
    id: s.id,
    label: s.label,
    quality: s.quality,
    url: s.url,
    format: s.format,
    providerName: s.provider_name,
    priority: s.priority,
  }));
}
