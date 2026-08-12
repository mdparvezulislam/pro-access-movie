import { requireAdminAuth } from "@/features/auth/lib/auth-helpers";
import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { ListVideo } from "lucide-react";

export default async function AdminEpisodesPage() {
  await requireAdminAuth("/admin/episodes");

  return (
    <AdminPageShell
      title="Episodes"
      description="Manage individual episodes, durations, playback sources, and subtitles."
      icon={ListVideo}
      actionLabel="Add Episode"
    />
  );
}
