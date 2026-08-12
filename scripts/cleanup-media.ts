import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey || serviceRoleKey.includes("placeholder")) {
  console.error("❌ Error: Valid SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in .env.local.");
  process.exit(1);
}

const BUCKETS = ["flex-posters", "flex-backdrops", "flex-people", "flex-trailers"];

async function cleanupMedia() {
  console.log("🔍 Auditing Supabase Storage buckets for orphaned media objects...");

  const supabase = createClient(supabaseUrl!, serviceRoleKey!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1. Fetch active media_files paths from database
  const { data: dbRecords, error: dbError } = await supabase
    .from("media_files")
    .select("bucket, path")
    .eq("status", "active");

  if (dbError) {
    throw new Error(`Failed to query media_files: ${dbError.message}`);
  }

  const activePathsSet = new Set((dbRecords || []).map((r) => `${r.bucket}/${r.path}`));
  console.log(`📊 Found ${activePathsSet.size} active database media records.`);

  let totalOrphans = 0;

  // 2. Audit each bucket
  for (const bucket of BUCKETS) {
    const { data: fileList, error: listError } = await supabase.storage.from(bucket).list("", {
      limit: 1000,
      sortBy: { column: "name", order: "asc" },
    });

    if (listError) {
      console.warn(`⚠️ Warning: Could not list bucket '${bucket}':`, listError.message);
      continue;
    }

    const orphans = (fileList || []).filter((f) => !activePathsSet.has(`${bucket}/${f.name}`));
    totalOrphans += orphans.length;

    if (orphans.length > 0) {
      console.log(`🚨 Bucket '${bucket}': ${orphans.length} orphaned object(s) detected:`);
      orphans.forEach((o) => console.log(`   - ${bucket}/${o.name} (${o.metadata?.size || "unknown"} bytes)`));
    } else {
      console.log(`✅ Bucket '${bucket}': Clean (0 orphans).`);
    }
  }

  console.log("\n==========================================");
  console.log(`Summary Audit Complete: ${totalOrphans} total orphaned media object(s) found.`);
  console.log("Run with --delete flag in future production script to clean orphaned storage objects.");
  console.log("==========================================\n");
}

cleanupMedia().catch((err) => {
  console.error("❌ Media cleanup script failed:", err);
  process.exit(1);
});
