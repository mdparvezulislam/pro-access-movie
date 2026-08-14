import { requireAdminAuth } from "@/features/auth/lib/auth-helpers";
import { SettingsManager } from "@/components/admin/settings/SettingsManager";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Global Settings | Admin Studio | PRO ACCESS MOVIE",
};

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdminAuth("/admin/settings");

  return <SettingsManager />;
}
