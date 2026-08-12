import { requireAdminAuth } from "@/features/auth/lib/auth-helpers";
import { getPublishedMovies } from "@/lib/content/movies";
import { getPublishedSeries } from "@/lib/content/series";
import { createServerClient } from "@/lib/supabase/server";
import { AdminStudioView } from "./admin-studio-view";

export default async function AdminPage() {
  await requireAdminAuth("/admin");

  const [movies, seriesList] = await Promise.all([
    getPublishedMovies({ limit: 50 }),
    getPublishedSeries({ limit: 50 }),
  ]);

  const supabase = await createServerClient();
  const { data: mediaFiles } = await supabase
    .from("media_files")
    .select("*")
    .eq("status", "active")
    .limit(50);

  return (
    <AdminStudioView
      movies={movies}
      seriesList={seriesList}
      mediaFiles={mediaFiles || []}
    />
  );
}
