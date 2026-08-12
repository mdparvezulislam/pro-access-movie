import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

async function main() {
  console.log("Checking Supabase connection & PostgREST schema cache...");

  // 1. Try querying profiles table (which we know exists)
  const { data: pData, error: pError } = await supabase.from("profiles").select("id").limit(1);
  console.log("profiles query:", { ok: !pError, error: pError?.message, count: pData?.length });

  // 2. Try querying movies table
  const { data: mData, error: mError } = await supabase.from("movies").select("id").limit(1);
  console.log("movies query:", { ok: !mError, error: mError?.message, count: mData?.length });

  // 3. Check storage upload with service role key
  const testBuffer = Buffer.from("test image content");
  const testFileName = `test_${Date.now()}.txt`;
  const { data: sData, error: sError } = await supabase.storage
    .from("flex-movie")
    .upload(`test/${testFileName}`, testBuffer, {
      contentType: "text/plain",
      upsert: true,
    });

  console.log("Storage upload test to 'flex-movie':", {
    ok: !sError,
    error: sError?.message,
    path: sData?.path,
  });

  if (sData?.path) {
    // Cleanup test object
    await supabase.storage.from("flex-movie").remove([sData.path]);
    console.log("Storage test object cleaned up.");
  }
}

main().catch(console.error);
