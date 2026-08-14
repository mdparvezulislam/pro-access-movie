import { requireAdminAuth } from "@/features/auth/lib/auth-helpers";
import { AdvertisementsManager } from "@/components/admin/advertisements/AdvertisementsManager";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Advertisements Management | Admin Studio | PRO ACCESS MOVIE",
};

export const dynamic = "force-dynamic";

export default async function AdminAdvertisementsPage() {
  await requireAdminAuth("/admin/advertisements");

  return <AdvertisementsManager />;
}
