import { requireAdminAuth } from "@/features/auth/lib/auth-helpers";
import { PlaybackSourcesManager } from "@/components/admin/sources/PlaybackSourcesManager";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Playback Sources Management | Admin Studio | PRO ACCESS MOVIE",
};

export const dynamic = "force-dynamic";

export default async function AdminPlaybackSourcesPage() {
  await requireAdminAuth("/admin/playback-sources");

  return <PlaybackSourcesManager />;
}
