import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import type { RoleCode } from "@/types/user";

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
 * Fetches the highest-priority role a user holds directly from the database.
 * Server-side only; never trust client-supplied role claims.
 */
export async function getUserRoleCodes(userId: string): Promise<string[]> {
  if (!userId) return [];

  const supabase = await createServerClient();
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  return (data ?? []).map((row) => row.role);
}

const ROLE_HIERARCHY: Record<RoleCode, number> = {
  user: 1,
  editor: 2,
  admin: 3,
  super_admin: 4,
};

/**
 * Checks whether a user holds a role at or above the requested role's hierarchy level.
 * Uses the reduced-privilege `has_role` RPC when available, falling back to role rows.
 */
export async function hasRole(userId: string, role: RoleCode): Promise<boolean> {
  if (!userId) return false;
  if (!(role in ROLE_HIERARCHY)) return false;

  const requiredLevel = ROLE_HIERARCHY[role];
  const supabase = await createServerClient();

  const { data: hasRoleResult, error } = await supabase.rpc("has_role", {
    check_user_id: userId,
    requested_role: role,
  });

  if (!error && typeof hasRoleResult === "boolean") {
    return hasRoleResult;
  }

  const roleCodes = await getUserRoleCodes(userId);
  return roleCodes.some((code) => (ROLE_HIERARCHY[code as RoleCode] ?? 0) >= requiredLevel);
}

/**
 * Checks whether a user holds the admin tier (admin or super_admin).
 */
export async function checkIsAdmin(userId: string): Promise<boolean> {
  if (!userId) return false;

  const supabase = await createServerClient();

  const { data: isRpcAdmin, error: rpcError } = await supabase.rpc("is_admin", {
    check_user_id: userId,
  });

  if (!rpcError && typeof isRpcAdmin === "boolean") {
    return isRpcAdmin;
  }

  const roleCodes = await getUserRoleCodes(userId);
  return roleCodes.some((code) => (ROLE_HIERARCHY[code as RoleCode] ?? 0) >= ROLE_HIERARCHY.admin);
}

/**
 * Checks whether a user holds the editorial tier (editor, admin, or super_admin).
 */
export async function checkIsEditor(userId: string): Promise<boolean> {
  if (!userId) return false;

  const supabase = await createServerClient();

  const { data: isRpcEditor, error: rpcError } = await supabase.rpc("is_editor", {
    check_user_id: userId,
  });

  if (!rpcError && typeof isRpcEditor === "boolean") {
    return isRpcEditor;
  }

  return hasRole(userId, "editor");
}

/**
 * Ensures caller is an authenticated admin (admin or super_admin).
 */
export async function requireAdminAuth(returnUrl?: string) {
  const user = await requireAuth(returnUrl);
  const isAdmin = await checkIsAdmin(user.id);

  if (!isAdmin) {
    redirect("/");
  }

  return user;
}

/**
 * Ensures caller is an authenticated editor or admin (editor tier+).
 */
export async function requireEditorOrAdmin(returnUrl?: string) {
  const user = await requireAuth(returnUrl);
  const isEditor = await checkIsEditor(user.id);

  if (!isEditor) {
    redirect("/");
  }

  return user;
}

/**
 * Ensures caller holds a role at or above the requested role's hierarchy level.
 */
export async function requireRole(role: RoleCode, returnUrl?: string) {
  const user = await requireAuth(returnUrl);
  const allowed = await hasRole(user.id, role);

  if (!allowed) {
    redirect("/");
  }

  return user;
}