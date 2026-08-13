import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { checkIsAdmin, getCurrentUser } from "@/features/auth/lib/auth-helpers";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const isAdmin = await checkIsAdmin(user.id);
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const contentType = searchParams.get("content_type");
    const contentId = searchParams.get("content_id");

    if (!contentType || !contentId) {
      return NextResponse.json(
        { error: "content_type and content_id query params required." },
        { status: 400 }
      );
    }

    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from("download_sources")
      .select("*")
      .eq("content_type", contentType)
      .eq("content_id", contentId)
      .order("priority", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ sources: data || [] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch download sources.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

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
    const {
      content_type,
      content_id,
      label,
      url,
      quality = "1080p",
      file_type = "mp4",
      file_size_bytes = 0,
      language = "English",
      priority = 1,
      is_active = true,
    } = body;

    if (!content_type || !content_id || !label || !url) {
      return NextResponse.json(
        { error: "content_type, content_id, label, and url are required." },
        { status: 400 }
      );
    }

    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid download URL structure." }, { status: 400 });
    }

    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from("download_sources")
      .insert({
        content_type,
        content_id,
        label,
        url,
        quality,
        file_type,
        file_size_bytes,
        language,
        priority,
        is_active,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath("/watch", "layout");
    revalidatePath("/movies", "layout");
    revalidatePath("/series", "layout");
    revalidatePath("/admin", "layout");

    return NextResponse.json({ success: true, source: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create download source.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
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
    const { id, ...updateFields } = body;

    if (!id) {
      return NextResponse.json({ error: "Source ID is required for update." }, { status: 400 });
    }

    if (updateFields.url) {
      try {
        new URL(updateFields.url);
      } catch {
        return NextResponse.json({ error: "Invalid download URL structure." }, { status: 400 });
      }
    }

    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from("download_sources")
      .update({
        ...updateFields,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath("/watch", "layout");
    revalidatePath("/movies", "layout");
    revalidatePath("/series", "layout");
    revalidatePath("/admin", "layout");

    return NextResponse.json({ success: true, source: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update download source.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const isAdmin = await checkIsAdmin(user.id);
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Download source ID required." }, { status: 400 });
    }

    const supabase = await createAdminClient();
    const { error } = await supabase.from("download_sources").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath("/watch", "layout");
    revalidatePath("/movies", "layout");
    revalidatePath("/series", "layout");
    revalidatePath("/admin", "layout");

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete download source.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
