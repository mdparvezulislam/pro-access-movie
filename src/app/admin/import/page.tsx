import React from "react";
import { Metadata } from "next";
import { requireAdminAuth } from "@/features/auth/lib/auth-helpers";
import { ImportStudioView } from "@/components/admin/import/ImportStudioView";

export const metadata: Metadata = {
  title: "Import Studio | Admin | PRO ACCESS MOVIE",
  description: "Metadata & Content Import Engine for PRO ACCESS MOVIE.",
};

export default async function AdminImportPage() {
  await requireAdminAuth("/admin/import");

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <ImportStudioView />
    </div>
  );
}
