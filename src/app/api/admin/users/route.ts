import { NextRequest, NextResponse } from "next/server";
import { checkIsAdmin, getCurrentUser } from "@/features/auth/lib/auth-helpers";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

    const isAdmin = await checkIsAdmin(user.id);
    if (!isAdmin) return NextResponse.json({ error: "Admin access required" }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase().trim();

    const supabase = await createServerClient();
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("*, user_roles(role)")
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    let filtered = (profiles || []).map((p) => {
      const roles = Array.isArray(p.user_roles)
        ? p.user_roles.map((r: { role: string }) => r.role)
        : [];
      return {
        id: p.id,
        display_name: p.display_name,
        avatar_url: p.avatar_url,
        roles: roles.length > 0 ? roles : ["user"],
        created_at: p.created_at,
      };
    });

    if (search) {
      filtered = filtered.filter(
        (u) =>
          u.display_name?.toLowerCase().includes(search) ||
          u.id.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({ users: filtered });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch users.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
