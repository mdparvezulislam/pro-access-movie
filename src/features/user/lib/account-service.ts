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

/**
 * Fetches watch history for the authenticated user.
 */
export async function getUserWatchHistory(limit = 20): Promise<WatchHistoryItem[]> {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const supabase = await createServerClient();
    const { data: history } = await supabase
      .from("user_history")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(limit);

    if (!history) return [];

    return history.map((item) => ({
      id: item.id,
      contentId: item.content_id,
      contentType: item.content_type || "movie",
      title: item.title || "Untitled Content",
      slug: item.slug || "",
      posterUrl: item.poster_url || "",
      progressSeconds: item.progress_seconds || 0,
      durationSeconds: item.duration_seconds || 0,
      completed: item.completed || false,
      updatedAt: item.updated_at || new Date().toISOString(),
    }));
  } catch (err) {
    console.error("Error fetching watch history:", err);
    return [];
  }
}

/**
 * Deletes an individual watch history item or clears all history for user.
 */
export async function clearUserWatchHistory(historyId?: string): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    if (!user) return false;

    const supabase = await createServerClient();
    if (historyId) {
      const { error } = await supabase
        .from("user_history")
        .delete()
        .eq("id", historyId)
        .eq("user_id", user.id);
      return !error;
    } else {
      const { error } = await supabase
        .from("user_history")
        .delete()
        .eq("user_id", user.id);
      return !error;
    }
  } catch (err) {
    console.error("Error clearing user watch history:", err);
    return false;
  }
}
