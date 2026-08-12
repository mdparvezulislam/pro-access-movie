import { requireAdminAuth } from "@/features/auth/lib/auth-helpers";
import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { Settings } from "lucide-react";

export default async function AdminSettingsPage() {
  await requireAdminAuth("/admin/settings");

  return (
    <AdminPageShell
      title="Application Settings"
      description="Configure platform defaults, OpenRouter API keys, Supabase storage buckets, and global feature flags."
      icon={Settings}
      actionLabel="Save Changes"
    />
  );
}
