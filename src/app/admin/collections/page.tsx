import { requireAdminAuth } from "@/features/auth/lib/auth-helpers";
import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { FolderKanban } from "lucide-react";

export default async function AdminCollectionsPage() {
  await requireAdminAuth("/admin/collections");

  return (
    <AdminPageShell
      title="Collections"
      description="Curate custom homepage rails, franchise bundles, and spotlight playlists."
      icon={FolderKanban}
      actionLabel="Create Collection"
    />
  );
}
