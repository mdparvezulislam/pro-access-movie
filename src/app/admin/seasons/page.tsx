import { requireAdminAuth } from "@/features/auth/lib/auth-helpers";
import { SeasonsManager } from "@/components/admin/seasons/SeasonsManager";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Seasons Management | Admin Studio | PRO ACCESS MOVIE",
};

export const dynamic = "force-dynamic";

export default async function AdminSeasonsPage() {
  await requireAdminAuth("/admin/seasons");

  return <SeasonsManager />;
}
