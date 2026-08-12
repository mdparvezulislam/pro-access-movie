import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing Supabase URL or Service Role Key in environment!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

async function main() {
  console.log("==========================================");
  console.log("SUPABASE INFRASTRUCTURE INSPECTION & PROVISIONING");
  console.log("Target Project URL:", supabaseUrl);
  console.log("==========================================");

  // 1. Check Storage Buckets
  console.log("\n--- 1. Storage Buckets Inspection ---");
  const { data: buckets, error: bError } = await supabase.storage.listBuckets();
  if (bError) {
    console.error("Error listing buckets:", bError.message);
  } else {
    console.log("Existing Buckets:", buckets.map((b) => b.id));
  }

  const requiredBuckets = [
    "flex-movie",
    "flex-series",
    "flex-people",
    "flex-advertisements",
    "flex-system",
    "flex-users",
    "flex-posters",
    "flex-backdrops",
  ];

  const existingBucketIds = new Set((buckets || []).map((b) => b.id));

  for (const bId of requiredBuckets) {
    if (!existingBucketIds.has(bId)) {
      console.log(`Bucket '${bId}' is missing. Creating bucket '${bId}'...`);
      const { data: newBucket, error: createError } = await supabase.storage.createBucket(bId, {
        public: true,
        fileSizeLimit: 20971520, // 20MB
      });
      if (createError) {
        console.error(`Failed to create bucket '${bId}':`, createError.message);
      } else {
        console.log(`Successfully created bucket '${bId}'!`);
      }
    } else {
      console.log(`Bucket '${bId}' exists.`);
    }
  }

  // 2. Check Database Tables
  console.log("\n--- 2. Database Tables Inspection ---");
  const tablesToCheck = [
    "profiles",
    "movies",
    "series",
    "seasons",
    "episodes",
    "genres",
    "categories",
    "languages",
    "countries",
    "movie_genres",
    "series_genres",
    "people",
    "cast",
    "crew",
    "media_files",
    "media_assets",
    "playback_sources",
    "download_sources",
    "ai_usage_logs",
  ];

  const tableStatus: Record<string, boolean> = {};

  for (const table of tablesToCheck) {
    const { error } = await supabase.from(table).select("id").limit(1);
    if (error) {
      console.log(`Table 'public.${table}' check: MISSING or ERROR -> ${error.message}`);
      tableStatus[table] = false;
    } else {
      console.log(`Table 'public.${table}' check: EXISTS`);
      tableStatus[table] = true;
    }
  }

  console.log("\nSummary Table Status:", tableStatus);
}

main().catch((err) => {
  console.error("Execution failed:", err);
  process.exit(1);
});
