import { requireAdminAuth } from "@/features/auth/lib/auth-helpers";
import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { createAdminClient } from "@/lib/supabase/server";
import { PlaySquare } from "lucide-react";
import { PlaybackSourcesPageClient } from "@/components/admin/sources/PlaybackSourcesPageClient";

export default async function AdminPlaybackSourcesPage() {
  await requireAdminAuth("/admin/playback-sources");

  const supabase = await createAdminClient();

  const [moviesRes, seriesRes] = await Promise.all([
    supabase.from("movies").select("id, title, title_bn, slug").order("created_at", { ascending: false }),
    supabase.from("series").select("id, title, title_bn, slug").order("created_at", { ascending: false }),
  ]);

  const movies = (moviesRes.data || []).map((m) => ({ ...m, type: "movie" as const }));
  const series = (seriesRes.data || []).map((s) => ({ ...s, type: "series" as const }));

  return (
    <AdminPageShell
      title="Playback Sources & Downloads Studio"
      description="Configure CDN video streaming endpoints, mirror failovers, HLS resolution streams, and high-speed download links."
      icon={PlaySquare}
    >
      <PlaybackSourcesPageClient movies={movies} series={series} />
    </AdminPageShell>
  );
}
