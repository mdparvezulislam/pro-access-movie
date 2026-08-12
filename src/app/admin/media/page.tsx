import React from "react";
import { Metadata } from "next";
import { requireAdminAuth } from "@/features/auth/lib/auth-helpers";
import { MediaLibraryView } from "@/components/admin/media/MediaLibraryView";

export const metadata: Metadata = {
  title: "Media Library | Admin Studio | PRO ACCESS MOVIE",
  description: "Centralized digital asset management for movies, series, cast, ads, and platform branding.",
};

export default async function AdminMediaPage() {
  await requireAdminAuth("/admin/media");

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <MediaLibraryView />
    </div>
  );
}
