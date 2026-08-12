import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * Privileged Supabase Admin Client using SUPABASE_SERVICE_ROLE_KEY.
 * Protected by `import 'server-only'` to guarantee zero build leaks to browser scripts.
 */
export function getSupabaseAdminClient() {
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey || serviceRoleKey.includes("placeholder")) {
    console.warn("[SupabaseAdmin] SUPABASE_SERVICE_ROLE_KEY is missing or using placeholder value.");
  }

  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, serviceRoleKey || "", {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
