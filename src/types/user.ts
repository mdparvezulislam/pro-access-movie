export type UserRole = "admin" | "subscriber" | "guest";

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  role: UserRole;
  subscriptionTier?: "free" | "vip" | "premium";
  preferredLanguage: "bn" | "en";
  createdAt: string;
}
