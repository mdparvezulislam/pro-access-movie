import { requireAdminAuth } from "@/features/auth/lib/auth-helpers";
import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { PlaySquare } from "lucide-react";

export default async function AdminPlaybackSourcesPage() {
  await requireAdminAuth("/admin/playback-sources");

  return (
    <AdminPageShell
      title="Playback Sources"
      description="Configure CDN video streaming endpoints, mirror failovers, HLS resolution streams, and download links."
      icon={PlaySquare}
      actionLabel="Add Playback Source"
    />
  );
}
