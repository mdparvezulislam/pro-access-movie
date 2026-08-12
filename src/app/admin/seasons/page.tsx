import { requireAdminAuth } from "@/features/auth/lib/auth-helpers";
import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { Layers } from "lucide-react";

export default async function AdminSeasonsPage() {
  await requireAdminAuth("/admin/seasons");

  return (
    <AdminPageShell
      title="Seasons"
      description="Organize series into seasons, sequence numbers, and release schedules."
      icon={Layers}
      actionLabel="Add Season"
    />
  );
}
