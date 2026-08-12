import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";

export async function getCurrentSession() {
  const supabase = await createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function getCurrentUser() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Ensures user is authenticated; redirects to /login if unauthenticated.
 */
export async function requireAuth(returnUrl?: string) {
  const user = await getCurrentUser();
  if (!user) {
    const nextParam = returnUrl ? `?next=${encodeURIComponent(returnUrl)}` : "";
    redirect(`/login${nextParam}`);
  }
  return user;
}

/**
 * Checks if a user has the admin role via server-side database verification.
 */
export async function checkIsAdmin(userId: string): Promise<boolean> {
  if (!userId) return false;

  const supabase = await createServerClient();

  // Primary check: RPC function is_admin
  const { data: isRpcAdmin, error: rpcError } = await supabase.rpc("is_admin", {
    check_user_id: userId,
  });

  if (!rpcError && typeof isRpcAdmin === "boolean") {
    return isRpcAdmin;
  }

  // Fallback direct table query
  const { data: roleRecord } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();

  return !!roleRecord;
}

/**
 * Ensures caller is an authenticated admin; redirects or throws if unauthorized.
 */
export async function requireAdminAuth(returnUrl?: string) {
  const user = await requireAuth(returnUrl);
  const isAdmin = await checkIsAdmin(user.id);

  if (!isAdmin) {
    redirect("/");
  }

  return user;
}
