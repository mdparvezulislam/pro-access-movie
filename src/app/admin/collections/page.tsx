import { requireAdminAuth } from "@/features/auth/lib/auth-helpers";
import { CollectionsManager } from "@/components/admin/collections/CollectionsManager";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Collections Management | Admin Studio | PRO ACCESS MOVIE",
};

export const dynamic = "force-dynamic";

export default async function AdminCollectionsPage() {
  await requireAdminAuth("/admin/collections");

  return <CollectionsManager />;
}
