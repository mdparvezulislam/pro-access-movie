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
    const {
      name,
      title,
      description,
      type,
      media_url,
      destination_url,
      cta_text,
      placement_key,
      status,
      priority,
      start_at,
      end_at,
      frequency_cap,
      targeting,
      campaign_id,
      impression_enabled,
      click_enabled,
    } = body;

    if (start_at && end_at && new Date(start_at) > new Date(end_at)) {
      return NextResponse.json(
        { error: "End date must be after start date." },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();
    const updateFields: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updateFields.name = name.trim();
    if (title !== undefined) updateFields.title = title.trim();
    if (description !== undefined) updateFields.description = description ? description.trim() : null;
    if (type !== undefined) updateFields.type = type;
    if (media_url !== undefined) updateFields.media_url = media_url.trim();
    if (destination_url !== undefined) updateFields.destination_url = destination_url.trim();
    if (cta_text !== undefined) updateFields.cta_text = cta_text ? cta_text.trim() : "Learn More";
    if (placement_key !== undefined) updateFields.placement_key = placement_key;
    if (status !== undefined) updateFields.status = status;
    if (priority !== undefined) updateFields.priority = Number(priority);
    if (start_at !== undefined) updateFields.start_at = start_at || null;
    if (end_at !== undefined) updateFields.end_at = end_at || null;
    if (frequency_cap !== undefined) updateFields.frequency_cap = frequency_cap;
    if (targeting !== undefined) updateFields.targeting = targeting;
    if (campaign_id !== undefined) updateFields.campaign_id = campaign_id || null;
    if (impression_enabled !== undefined) updateFields.impression_enabled = Boolean(impression_enabled);
    if (click_enabled !== undefined) updateFields.click_enabled = Boolean(click_enabled);

    const { data, error } = await supabase
      .from("ad_creatives")
      .update(updateFields)
      .eq("id", id)
      .select("*, campaign:campaign_id(id, name, status)")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, advertisement: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update advertisement.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Handle DUPLICATE operation: /api/admin/advertisements/[id] with { action: 'duplicate' }
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

    const isAdmin = await checkIsAdmin(user.id);
    if (!isAdmin) return NextResponse.json({ error: "Admin access required" }, { status: 403 });

    const { id } = await params;
    const supabase = await createServerClient();

    const { data: original, error: fetchErr } = await supabase
      .from("ad_creatives")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchErr || !original) {
      return NextResponse.json({ error: "Original advertisement not found." }, { status: 404 });
    }

    // Insert duplicated record with draft status and new ID
    const { data: duplicated, error: dupErr } = await supabase
      .from("ad_creatives")
      .insert({
        name: `Copy of ${original.name || original.title}`,
        title: original.title,
        description: original.description,
        type: original.type,
        media_url: original.media_url,
        destination_url: original.destination_url,
        cta_text: original.cta_text,
        placement_key: original.placement_key,
        status: "draft",
        priority: original.priority,
        start_at: original.start_at,
        end_at: original.end_at,
        frequency_cap: original.frequency_cap,
        targeting: original.targeting,
        campaign_id: original.campaign_id,
        impression_enabled: original.impression_enabled,
        click_enabled: original.click_enabled,
        created_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (dupErr) return NextResponse.json({ error: dupErr.message }, { status: 500 });

    return NextResponse.json({ success: true, advertisement: duplicated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to duplicate advertisement.";
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

    const { error } = await supabase.from("ad_creatives").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete advertisement.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
