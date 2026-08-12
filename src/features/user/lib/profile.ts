import "server-only";
import { createServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/features/auth/lib/auth-helpers";
import { profileSchema, type ProfileInput } from "@/lib/validation/auth";

export interface ProfileView {
  displayName: string | null;
  avatarUrl: string | null;
  languagePreference: string;
  themePreference: "dark" | "light";
  createdAt: string;
  updatedAt: string;
}

/**
 * Fetches the current user's own profile record.
 * Returns null when unauthenticated or the profile is missing.
 */
export async function getCurrentUserProfile(): Promise<ProfileView | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("display_name, avatar_url, language_preference, theme_preference, created_at, updated_at")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    displayName: data.display_name,
    avatarUrl: data.avatar_url,
    languagePreference: data.language_preference,
    themePreference: data.theme_preference,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export { updateProfileAction } from "./profile-actions";