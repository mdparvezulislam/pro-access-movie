import { requireAdminAuth } from "@/features/auth/lib/auth-helpers";
import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { Tag } from "lucide-react";

export default async function AdminGenresPage() {
  await requireAdminAuth("/admin/genres");

  return (
    <AdminPageShell
      title="Genres"
      description="Manage movie and TV show genres (Action, Drama, Thriller, Romance, Comedy, Sci-Fi)."
      icon={Tag}
      actionLabel="Create Genre"
    />
  );
}
