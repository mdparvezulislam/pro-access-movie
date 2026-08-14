import { requireAdminAuth } from "@/features/auth/lib/auth-helpers";
import { MediaLibraryManager } from "@/components/admin/media/MediaLibraryManager";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Media Assets Library | Admin Studio | PRO ACCESS MOVIE",
};

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  await requireAdminAuth("/admin/media");

  return <MediaLibraryManager />;
}
