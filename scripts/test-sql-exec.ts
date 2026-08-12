import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function testSqlExecution() {
  console.log("Testing SQL DDL execution against Supabase...");
  
  // Try Supabase SQL Query API endpoint
  const res = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": serviceKey!,
      "Authorization": `Bearer ${serviceKey}`,
    },
    body: JSON.stringify({ query: "SELECT current_database(), current_schema();" }),
  });

  console.log("RPC Status:", res.status);
  const text = await res.text();
  console.log("RPC Response:", text);
}

testSqlExecution().catch(console.error);
