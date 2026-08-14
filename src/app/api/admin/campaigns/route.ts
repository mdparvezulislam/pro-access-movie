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
    const { data: campaigns, error } = await supabase
      .from("ad_campaigns")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    let filtered = campaigns || [];
    if (search) {
      filtered = filtered.filter((c) => c.name.toLowerCase().includes(search));
    }

    return NextResponse.json({ campaigns: filtered });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch campaigns.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

    const isAdmin = await checkIsAdmin(user.id);
    if (!isAdmin) return NextResponse.json({ error: "Admin access required" }, { status: 403 });

    const body = await request.json();
    const { name, status = "active", start_date, end_date, frequency_cap, targeting } = body;

    if (!name) {
      return NextResponse.json({ error: "Campaign name is required." }, { status: 400 });
    }

    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("ad_campaigns")
      .insert({
        name: name.trim(),
        status,
        start_date: start_date || null,
        end_date: end_date || null,
        frequency_cap: frequency_cap || {},
        targeting: targeting || {},
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, campaign: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create campaign.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
