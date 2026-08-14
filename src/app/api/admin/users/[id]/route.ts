import { NextRequest, NextResponse } from "next/server";
import { checkIsAdmin, getCurrentUser } from "@/features/auth/lib/auth-helpers";
import { createServerClient } from "@/lib/supabase/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

    const isAdmin = await checkIsAdmin(user.id);
    if (!isAdmin) return NextResponse.json({ error: "Admin access required" }, { status: 403 });

    const { id: targetUserId } = await params;
    const body = await request.json();
    const { role } = body;

    if (!role) {
      return NextResponse.json({ error: "Role parameter is required." }, { status: 400 });
    }

    const supabase = await createServerClient();

    // Check if role row exists for user
    const { data: existingRole } = await supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", targetUserId)
      .maybeSingle();

    if (existingRole) {
      const { error } = await supabase
        .from("user_roles")
        .update({ role })
        .eq("user_id", targetUserId);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: targetUserId, role });

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, role });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update user role.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
