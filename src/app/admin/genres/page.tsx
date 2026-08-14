import { requireAdminAuth } from "@/features/auth/lib/auth-helpers";
import { GenresManager } from "@/components/admin/genres/GenresManager";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Genres Management | Admin Studio | PRO ACCESS MOVIE",
};

export const dynamic = "force-dynamic";

export default async function AdminGenresPage() {
  await requireAdminAuth("/admin/genres");

  return <GenresManager />;
}
