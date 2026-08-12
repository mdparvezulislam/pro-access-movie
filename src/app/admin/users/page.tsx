import { requireAdminAuth } from "@/features/auth/lib/auth-helpers";
import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { Users } from "lucide-react";

export default async function AdminUsersPage() {
  await requireAdminAuth("/admin/users");

  return (
    <AdminPageShell
      title="Users & Roles"
      description="Manage registered platform users, administrator roles, and permission levels."
      icon={Users}
      actionLabel="Invite User"
    />
  );
}
