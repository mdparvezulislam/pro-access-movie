import { requireAdminAuth } from "@/features/auth/lib/auth-helpers";
import { UsersManager } from "@/components/admin/users/UsersManager";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Users & Roles Management | Admin Studio | PRO ACCESS MOVIE",
};

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  await requireAdminAuth("/admin/users");

  return <UsersManager />;
}
