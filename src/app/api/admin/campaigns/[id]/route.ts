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

    const { id } = await params;
    const body = await request.json();
    const { name, status, start_date, end_date, frequency_cap, targeting } = body;

    const supabase = await createServerClient();
    const updateFields: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updateFields.name = name.trim();
    if (status !== undefined) updateFields.status = status;
    if (start_date !== undefined) updateFields.start_date = start_date || null;
    if (end_date !== undefined) updateFields.end_date = end_date || null;
    if (frequency_cap !== undefined) updateFields.frequency_cap = frequency_cap;
    if (targeting !== undefined) updateFields.targeting = targeting;

    const { data, error } = await supabase
      .from("ad_campaigns")
      .update(updateFields)
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, campaign: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update campaign.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

    const isAdmin = await checkIsAdmin(user.id);
    if (!isAdmin) return NextResponse.json({ error: "Admin access required" }, { status: 403 });

    const { id } = await params;
    const supabase = await createServerClient();

    const { error } = await supabase.from("ad_campaigns").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete campaign.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
