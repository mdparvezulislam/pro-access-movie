import React from "react";
import { requireAdminAuth } from "@/features/auth/lib/auth-helpers";
import { createServerClient } from "@/lib/supabase/server";
import { ContentEditorForm } from "@/components/admin/content/ContentEditorForm";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Movie | Admin Studio | PRO ACCESS MOVIE",
};

export default async function AdminEditMoviePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminAuth("/admin/movies");
  const { id } = await params;

  const supabase = await createServerClient();
  const { data: movie } = await supabase
    .from("movies")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!movie) {
    // Check fallback demo catalog
    const { DEMO_MOVIES } = await import("@/lib/content/catalog-fallback");
    const demo = DEMO_MOVIES.find((m) => m.id === id);
    if (!demo) {
      notFound();
    }

    return (
      <div className="p-6 md:p-8">
        <ContentEditorForm
          id={demo.id}
          type="movie"
          initialData={{
            title: demo.title,
            title_bn: demo.title_bn,
            slug: demo.slug,
            status: demo.status,
            release_year: demo.release_year,
            duration_minutes: demo.duration_minutes,
            description: demo.description,
            description_bn: demo.description_bn,
            rating: demo.rating,
            media: { posterUrl: demo.posterUrl, backdropUrl: demo.backdropUrl },
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <ContentEditorForm
        id={movie.id}
        type="movie"
        initialData={{
          title: movie.title,
          title_bn: movie.title_bn,
          slug: movie.slug,
          status: movie.status,
          release_year: movie.release_year,
          duration_minutes: movie.duration_minutes,
          description: movie.description,
          description_bn: movie.description_bn,
          rating: movie.rating ? Number(movie.rating) : 7.5,
          content_rating: movie.content_rating,
          media: movie.media as Record<string, unknown>,
        }}
      />
    </div>
  );
}
