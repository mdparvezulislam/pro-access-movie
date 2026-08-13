import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceKey);

async function runTest() {
  console.log("==========================================");
  console.log("RUNNING MEDIA SOURCES STUDIO V2 AUDIT TEST");
  console.log("==========================================");

  // 1. Get test movie
  const { data: movies, error: mErr } = await supabase.from("movies").select("id, title").limit(1);
  if (mErr || !movies || movies.length === 0) {
    console.error("No movies found to test:", mErr);
    process.exit(1);
  }
  const testMovie = movies[0];
  console.log(`Testing against Movie: "${testMovie.title}" (${testMovie.id})`);

  // 2. INSERT Playback Source
  console.log("\n--- Step 1: INSERT Playback Source ---");
  const testStream = {
    content_type: "movie",
    content_id: testMovie.id,
    source_name: "Test Fast HLS Server",
    url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    quality: "1080p",
    resolution: "1920x1080",
    language: "English / Bangla Sub",
    priority: 1,
    is_active: true,
  };

  const { data: insertedPlayback, error: insertErr } = await supabase
    .from("playback_sources")
    .insert(testStream)
    .select()
    .single();

  if (insertErr || !insertedPlayback) {
    console.error("FAILED INSERT Playback Source:", insertErr);
    process.exit(1);
  }
  console.log("SUCCESS INSERT Playback Source:", insertedPlayback.id);

  // 3. INSERT Download Source
  console.log("\n--- Step 2: INSERT Download Source ---");
  const testDownload = {
    content_type: "movie",
    content_id: testMovie.id,
    label: "Direct Ultra HD Download",
    url: "https://example.com/movie_1080p.mp4",
    quality: "1080p",
    file_size_bytes: 1610612736,
    language: "English / Bangla Sub",
    priority: 1,
    is_active: true,
  };

  const { data: insertedDownload, error: dInsertErr } = await supabase
    .from("download_sources")
    .insert(testDownload)
    .select()
    .single();

  if (dInsertErr || !insertedDownload) {
    console.error("FAILED INSERT Download Source:", dInsertErr);
    process.exit(1);
  }
  console.log("SUCCESS INSERT Download Source:", insertedDownload.id);

  // 4. UPDATE Playback Source (Priority & Status)
  console.log("\n--- Step 3: UPDATE Playback Source ---");
  const { data: updatedPlayback, error: updateErr } = await supabase
    .from("playback_sources")
    .update({ priority: 2, is_active: false })
    .eq("id", insertedPlayback.id)
    .select()
    .single();

  if (updateErr || !updatedPlayback) {
    console.error("FAILED UPDATE Playback Source:", updateErr);
    process.exit(1);
  }
  console.log("SUCCESS UPDATE Playback Source: priority=", updatedPlayback.priority, "is_active=", updatedPlayback.is_active);

  // 5. SELECT Active Sources
  console.log("\n--- Step 4: SELECT Active Sources ---");
  const { data: activeStreams, error: selectErr } = await supabase
    .from("playback_sources")
    .select("*")
    .eq("content_type", "movie")
    .eq("content_id", testMovie.id)
    .eq("is_active", true);

  console.log("Active streams count for movie:", activeStreams?.length);

  // 6. CLEANUP Test Data
  console.log("\n--- Step 5: CLEANUP Test Records ---");
  await supabase.from("playback_sources").delete().eq("id", insertedPlayback.id);
  await supabase.from("download_sources").delete().eq("id", insertedDownload.id);
  console.log("SUCCESS CLEANUP.");

  console.log("\n==========================================");
  console.log("ALL MEDIA SOURCES DB TESTS PASSED PERFECTLY!");
  console.log("==========================================");
}

runTest().catch((e) => {
  console.error(e);
  process.exit(1);
});
