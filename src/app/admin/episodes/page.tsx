import { requireAdminAuth } from "@/features/auth/lib/auth-helpers";
import { EpisodesManager } from "@/components/admin/episodes/EpisodesManager";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Episodes Management | Admin Studio | PRO ACCESS MOVIE",
};

export const dynamic = "force-dynamic";

export default async function AdminEpisodesPage() {
  await requireAdminAuth("/admin/episodes");

  return <EpisodesManager />;
}
