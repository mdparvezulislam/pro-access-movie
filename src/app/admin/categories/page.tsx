import { requireAdminAuth } from "@/features/auth/lib/auth-helpers";
import { CategoriesManager } from "@/components/admin/categories/CategoriesManager";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Categories Management | Admin Studio | PRO ACCESS MOVIE",
};

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  await requireAdminAuth("/admin/categories");

  return <CategoriesManager />;
}
