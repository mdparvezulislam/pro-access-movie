import { requireAdminAuth } from "@/features/auth/lib/auth-helpers";
import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { BarChart3 } from "lucide-react";

export default async function AdminAnalyticsPage() {
  await requireAdminAuth("/admin/analytics");

  return (
    <AdminPageShell
      title="Analytics & Telemetry"
      description="Monitor playback performance, active watch sessions, top Bengali titles, and ad conversion metrics."
      icon={BarChart3}
    />
  );
}
