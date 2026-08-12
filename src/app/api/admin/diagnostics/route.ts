import { NextResponse } from "next/server";
import { checkIsAdmin, getCurrentUser } from "@/features/auth/lib/auth-helpers";
import { createAdminClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const isAdmin = await checkIsAdmin(user.id);
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const supabase = await createAdminClient();

    // 1. Table Diagnostics
    const requiredTables = [
      "movies",
      "series",
      "seasons",
      "episodes",
      "genres",
      "media_files",
      "playback_sources",
      "download_sources",
      "profiles",
    ];

    const tableResults: Record<string, { status: "ok" | "error"; count?: number; error?: string }> = {};

    for (const table of requiredTables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select("*", { count: "exact", head: true });

        if (error) {
          tableResults[table] = { status: "error", error: error.message };
        } else {
          tableResults[table] = { status: "ok", count: count || 0 };
        }
      } catch (err: unknown) {
        tableResults[table] = {
          status: "error",
          error: err instanceof Error ? err.message : "Query error",
        };
      }
    }

    // 2. Storage Bucket Diagnostics
    const requiredBuckets = ["flex-movie", "flex-series", "flex-people", "flex-system"];
    const bucketResults: Record<string, { status: "ok" | "error"; error?: string }> = {};

    try {
      const { data: buckets, error: bError } = await supabase.storage.listBuckets();
      if (bError) {
        requiredBuckets.forEach((b) => {
          bucketResults[b] = { status: "error", error: bError.message };
        });
      } else {
        const existingBucketIds = new Set((buckets || []).map((b) => b.id));
        requiredBuckets.forEach((b) => {
          if (existingBucketIds.has(b)) {
            bucketResults[b] = { status: "ok" };
          } else {
            bucketResults[b] = { status: "error", error: `Bucket '${b}' does not exist.` };
          }
        });
      }
    } catch (err: unknown) {
      requiredBuckets.forEach((b) => {
        bucketResults[b] = {
          status: "error",
          error: err instanceof Error ? err.message : "Bucket check failed",
        };
      });
    }

    // 3. Environment Variables Checks
    const envStatus = {
      NEXT_PUBLIC_SUPABASE_URL: !!env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!(env.SUPABASE_SERVICE_ROLE_KEY && env.SUPABASE_SERVICE_ROLE_KEY.trim().length > 0),
      TMDB_API_KEY: !!(process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY),
      OPENROUTER_API_KEY: !!(process.env.OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY),
    };

    const overallOk =
      Object.values(tableResults).every((t) => t.status === "ok") &&
      Object.values(bucketResults).every((b) => b.status === "ok") &&
      envStatus.NEXT_PUBLIC_SUPABASE_URL &&
      envStatus.SUPABASE_SERVICE_ROLE_KEY;

    return NextResponse.json({
      status: overallOk ? "healthy" : "degraded",
      tables: tableResults,
      buckets: bucketResults,
      environment: envStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Diagnostics execution failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
