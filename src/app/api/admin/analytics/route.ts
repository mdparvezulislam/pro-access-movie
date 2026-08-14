import { NextResponse } from "next/server";
import { checkIsAdmin, getCurrentUser } from "@/features/auth/lib/auth-helpers";
import { createServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

    const isAdmin = await checkIsAdmin(user.id);
    if (!isAdmin) return NextResponse.json({ error: "Admin access required" }, { status: 403 });

    const supabase = await createServerClient();

    // Query real counts from Supabase database
    const [
      { count: movieCount },
      { count: seriesCount },
      { count: episodeCount },
      { count: historyCount },
      { count: downloadCount },
      { count: adEventCount },
      { data: recentMovies },
      { data: recentSeries },
    ] = await Promise.all([
      supabase.from("movies").select("id", { count: "exact", head: true }),
      supabase.from("series").select("id", { count: "exact", head: true }),
      supabase.from("episodes").select("id", { count: "exact", head: true }),
      supabase.from("user_watch_history").select("id", { count: "exact", head: true }),
      supabase.from("download_sources").select("id", { count: "exact", head: true }),
      supabase.from("ad_events").select("id", { count: "exact", head: true }),
      supabase.from("movies").select("id, title, release_year, rating, status").order("created_at", { ascending: false }).limit(5),
      supabase.from("series").select("id, title, release_year, rating, status").order("created_at", { ascending: false }).limit(5),
    ]);

    return NextResponse.json({
      metrics: {
        totalMovies: movieCount || 0,
        totalSeries: seriesCount || 0,
        totalEpisodes: episodeCount || 0,
        totalWatchEvents: historyCount || 0,
        totalDownloadSources: downloadCount || 0,
        totalAdEvents: adEventCount || 0,
      },
      recentMovies: recentMovies || [],
      recentSeries: recentSeries || [],
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch analytics.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
