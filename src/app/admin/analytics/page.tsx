import { requireAdminAuth } from "@/features/auth/lib/auth-helpers";
import { AnalyticsDashboard } from "@/components/admin/analytics/AnalyticsDashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics & Telemetry | Admin Studio | PRO ACCESS MOVIE",
};

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  await requireAdminAuth("/admin/analytics");

  return <AnalyticsDashboard />;
}
