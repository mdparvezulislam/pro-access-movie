"use client";

const PLAYBACK_STORAGE_KEY = "flex_movie_playback_positions";

export interface PlaybackPosition {
  contentId: string;
  slug: string;
  title: string;
  type: "movie" | "series";
  positionSeconds: number;
  durationSeconds: number;
  updatedAt: string;
}

/**
 * Saves content playback position to localStorage.
 */
export function savePlaybackPosition(position: PlaybackPosition): void {
  try {
    if (typeof window === "undefined") return;

    const raw = localStorage.getItem(PLAYBACK_STORAGE_KEY);
    const map: Record<string, PlaybackPosition> = raw ? JSON.parse(raw) : {};

    map[position.contentId] = {
      ...position,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(PLAYBACK_STORAGE_KEY, JSON.stringify(map));
  } catch (err) {
    console.warn("Failed to save playback position:", err);
  }
}

/**
 * Gets saved playback position for a specific content ID.
 */
export function getPlaybackPosition(contentId: string): number {
  try {
    if (typeof window === "undefined") return 0;

    const raw = localStorage.getItem(PLAYBACK_STORAGE_KEY);
    if (!raw) return 0;

    const map: Record<string, PlaybackPosition> = JSON.parse(raw);
    const item = map[contentId];
    return item ? item.positionSeconds : 0;
  } catch (err) {
    console.warn("Failed to get playback position:", err);
    return 0;
  }
}
