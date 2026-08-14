import { requireAdminAuth } from "@/features/auth/lib/auth-helpers";
import { CampaignsManager } from "@/components/admin/campaigns/CampaignsManager";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ad Campaigns Management | Admin Studio | PRO ACCESS MOVIE",
};

export const dynamic = "force-dynamic";

export default async function AdminCampaignsPage() {
  await requireAdminAuth("/admin/campaigns");

  return <CampaignsManager />;
}
