import { requireAdminAuth } from "@/features/auth/lib/auth-helpers";
import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { Sparkles } from "lucide-react";

export default async function AdminCampaignsPage() {
  await requireAdminAuth("/admin/campaigns");

  return (
    <AdminPageShell
      title="Ad Campaigns"
      description="Configure ad campaign schedules, impression caps, target placements, and priority weighting."
      icon={Sparkles}
      actionLabel="Create Campaign"
    />
  );
}
