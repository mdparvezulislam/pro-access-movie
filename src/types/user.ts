export type RoleCode = "user" | "editor" | "admin" | "super_admin";

export type UserRole = RoleCode | "subscriber" | "guest";

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  role: UserRole;
  subscriptionTier?: "free" | "vip" | "premium";
  preferredLanguage: "bn" | "en";
  themePreference?: "dark" | "light";
  createdAt: string;
}