import { requireAdminAuth } from "@/features/auth/lib/auth-helpers";
import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { Tv } from "lucide-react";

export default async function AdminSeriesPage() {
  await requireAdminAuth("/admin/series");

  return (
    <AdminPageShell
      title="TV Series"
      description="Manage TV shows, web series, Bengali drama series, and show structure."
      icon={Tv}
      actionLabel="Create Series"
    />
  );
}
