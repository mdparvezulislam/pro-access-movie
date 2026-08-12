import { requireAdminAuth } from "@/features/auth/lib/auth-helpers";
import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { Film } from "lucide-react";

export default async function AdminMoviesPage() {
  await requireAdminAuth("/admin/movies");

  return (
    <AdminPageShell
      title="Movies"
      description="Manage movie catalog, metadata, video streams, and posters."
      icon={Film}
      actionLabel="Add Movie"
    />
  );
}
