import { requireAdminAuth } from "@/features/auth/lib/auth-helpers";
import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { Grid } from "lucide-react";

export default async function AdminCategoriesPage() {
  await requireAdminAuth("/admin/categories");

  return (
    <AdminPageShell
      title="Categories"
      description="Manage top-level content classification hierarchy (Movies, Web Series, Documentaries)."
      icon={Grid}
      actionLabel="Add Category"
    />
  );
}
