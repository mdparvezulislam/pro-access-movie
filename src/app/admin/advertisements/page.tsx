import { requireAdminAuth } from "@/features/auth/lib/auth-helpers";
import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { Megaphone } from "lucide-react";

export default async function AdminAdvertisementsPage() {
  await requireAdminAuth("/admin/advertisements");

  return (
    <AdminPageShell
      title="Advertisements"
      description="Manage video ads, banner creatives, interstitial cards, and click targets."
      icon={Megaphone}
      actionLabel="Create Ad Creative"
    />
  );
}
