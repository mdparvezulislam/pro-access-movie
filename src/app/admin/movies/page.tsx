import React from "react";
import { requireAdminAuth } from "@/features/auth/lib/auth-helpers";
import { createServerClient } from "@/lib/supabase/server";
import { MoviesAdminView } from "@/components/admin/movies/MoviesAdminView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Movies Catalog | Admin Studio | PRO ACCESS MOVIE",
  description: "Manage movies catalog, metadata imports, posters, and publishing status.",
};

export default async function AdminMoviesPage() {
  await requireAdminAuth("/admin/movies");

  const supabase = await createServerClient();
  const { data: movies } = await supabase
    .from("movies")
    .select("id, title, title_bn, slug, status, release_year, duration_minutes, rating, media")
    .order("created_at", { ascending: false });

  let movieList = movies || [];

  // Fallback to DEMO_MOVIES if database is clean
  if (movieList.length === 0) {
    const { DEMO_MOVIES } = await import("@/lib/content/catalog-fallback");
    movieList = DEMO_MOVIES.map((m) => ({
      id: m.id,
      title: m.title,
      title_bn: m.title_bn,
      slug: m.slug,
      status: m.status,
      release_year: m.release_year,
      duration_minutes: m.duration_minutes,
      rating: m.rating,
      media: { posterUrl: m.posterUrl, backdropUrl: m.backdropUrl },
    }));
  }

  return (
    <div className="p-6 md:p-8">
      <MoviesAdminView movies={movieList} />
    </div>
  );
}
