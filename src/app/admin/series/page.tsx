import React from "react";
import { requireAdminAuth } from "@/features/auth/lib/auth-helpers";
import { createServerClient } from "@/lib/supabase/server";
import { SeriesAdminView } from "@/components/admin/series/SeriesAdminView";
import { Tv } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "TV Series Management | Admin Studio | PRO ACCESS MOVIE",
  description: "Manage TV series, web series, seasons, and episode content.",
};

export const dynamic = "force-dynamic";

export default async function AdminSeriesPage() {
  await requireAdminAuth("/admin/series");

  const supabase = await createServerClient();
  const { data: seriesList } = await supabase
    .from("series")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="flex items-center justify-between p-6 rounded-2xl bg-surface-base border border-border shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600/10 text-purple-400 font-bold border border-purple-500/20">
            <Tv className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-text-primary tracking-tight">
              TV Series Studio Catalog
            </h1>
            <p className="text-xs text-text-muted">
              Manage TV shows, web series, seasons, episodes, and streaming sources.
            </p>
          </div>
        </div>
      </div>

      <SeriesAdminView seriesList={seriesList || []} />
    </div>
  );
}
