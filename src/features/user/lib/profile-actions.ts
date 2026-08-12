"use server";

import { createServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/features/auth/lib/auth-helpers";
import { profileSchema, type ProfileInput } from "@/lib/validation/auth";

/**
 * Server Action: Updates the current user's own profile with Zod-validated input.
 * RLS guarantees the update can only ever touch the caller's own row.
 */
export async function updateProfileAction(
  input: ProfileInput
): Promise<{ success: boolean; message?: string }> {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || "Invalid profile data",
    };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { success: false, message: "Authentication required to update your profile." };
  }

  const supabase = await createServerClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: parsed.data.displayName,
      theme_preference: parsed.data.themePreference,
    })
    .eq("id", user.id);

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, message: "Profile updated successfully." };
}
