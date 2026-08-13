import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { checkIsAdmin, getCurrentUser } from "@/features/auth/lib/auth-helpers";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const isAdmin = await checkIsAdmin(user.id);
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { sourceType, items } = body as {
      sourceType: "playback" | "download";
      items: { id: string; priority: number }[];
    };

    if (!sourceType || !Array.isArray(items)) {
      return NextResponse.json({ error: "sourceType and items array required." }, { status: 400 });
    }

    const tableName = sourceType === "playback" ? "playback_sources" : "download_sources";
    const supabase = await createAdminClient();

    // Update each item priority in database
    for (const item of items) {
      if (item.id && typeof item.priority === "number") {
        await supabase
          .from(tableName)
          .update({ priority: item.priority, updated_at: new Date().toISOString() })
          .eq("id", item.id);
      }
    }

    revalidatePath("/watch", "layout");
    revalidatePath("/movies", "layout");
    revalidatePath("/series", "layout");
    revalidatePath("/admin", "layout");

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to reorder sources.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
