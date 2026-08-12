import React from "react";
import { notFound } from "next/navigation";
import { requireAdminAuth } from "@/features/auth/lib/auth-helpers";
import { createServerClient } from "@/lib/supabase/server";
import { SeriesEditorForm } from "@/components/admin/series/SeriesEditorForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Series | Admin Studio | PRO ACCESS MOVIE",
  description: "TV Series, Season, and Episode management workspace.",
};

export default async function AdminEditSeriesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminAuth("/admin/series");
  const { id } = await params;

  const supabase = await createServerClient();
  const { data: series, error } = await supabase
    .from("series")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !series) {
    notFound();
  }

  return (
    <div className="p-6 md:p-8">
      <SeriesEditorForm
        id={series.id}
        initialData={{
          title: series.title,
          title_bn: series.title_bn,
          slug: series.slug,
          status: series.status,
          release_year: series.release_year,
          description: series.description,
          description_bn: series.description_bn,
          rating: series.rating ? Number(series.rating) : 8.0,
          content_rating: series.content_rating,
          media: series.media as Record<string, unknown>,
        }}
      />
    </div>
  );
}
