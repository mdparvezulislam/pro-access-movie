import { createServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/features/auth/lib/auth-helpers";

export interface UserAccountProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: string;
  createdAt: string;
  preferences: {
    autoplayNextEpisode: boolean;
    defaultQuality: string;
    preferredLanguage: string;
  };
}

export interface WatchHistoryItem {
  id: string;
  contentId: string;
  contentType: "movie" | "series";
  title: string;
  slug: string;
  posterUrl: string;
  progressSeconds: number;
  durationSeconds: number;
  completed: boolean;
  updatedAt: string;
}

/**
 * Fetches user account details, profile, and preferences.
 */
export async function getUserAccountDetails(): Promise<UserAccountProfile | null> {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const supabase = await createServerClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    return {
      id: user.id,
      email: user.email || "",
      displayName: profile?.display_name || user.email?.split("@")[0] || "User",
      avatarUrl: profile?.avatar_url || undefined,
      role: profile?.role || "user",
      createdAt: user.created_at || new Date().toISOString(),
      preferences: {
        autoplayNextEpisode: profile?.autoplay_next_episode ?? true,
        defaultQuality: profile?.default_quality || "HD",
        preferredLanguage: profile?.preferred_language || "bn",
      },
    };
  } catch (err) {
    console.error("Error fetching user account details:", err);
    return null;
  }
}

/**
 * Updates user profile details in Supabase PostgreSQL.
 */
export async function updateUserProfile(payload: {
  displayName?: string;
  avatarUrl?: string;
  autoplayNextEpisode?: boolean;
  defaultQuality?: string;
  preferredLanguage?: string;
}): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    if (!user) return false;

    const supabase = await createServerClient();
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (payload.displayName !== undefined) updateData.display_name = payload.displayName;
    if (payload.avatarUrl !== undefined) updateData.avatar_url = payload.avatarUrl;
    if (payload.autoplayNextEpisode !== undefined) updateData.autoplay_next_episode = payload.autoplayNextEpisode;
    if (payload.defaultQuality !== undefined) updateData.default_quality = payload.defaultQuality;
    if (payload.preferredLanguage !== undefined) updateData.preferred_language = payload.preferredLanguage;

    const { error } = await supabase.from("profiles").update(updateData).eq("id", user.id);
    return !error;
  } catch (err) {
    console.error("Error updating user profile:", err);
    return false;
  }
}

import { getUserWatchHistory as getCanonicalWatchHistory, clearWatchHistoryAction } from "./history";

/**
 * Fetches watch history for the authenticated user using the canonical history service.
 */
export async function getUserWatchHistory(limit = 20): Promise<WatchHistoryItem[]> {
  try {
    const canonicalItems = await getCanonicalWatchHistory();
    return canonicalItems.slice(0, limit).map((item) => ({
      id: item.id,
      contentId: item.id,
      contentType: item.type,
      title: item.title,
      slug: item.slug,
      posterUrl: item.posterUrl || "",
      progressSeconds: item.progressSeconds,
      durationSeconds: item.durationSeconds,
      completed: item.completed,
      updatedAt: item.updatedAt,
    }));
  } catch (err) {
    console.error("Error fetching watch history:", err);
    return [];
  }
}

/**
 * Deletes watch history for user using canonical history action.
 */
export async function clearUserWatchHistory(_historyId?: string): Promise<boolean> {
  try {
    const res = await clearWatchHistoryAction();
    return res.success;
  } catch (err) {
    console.error("Error clearing user watch history:", err);
    return false;
  }
}
