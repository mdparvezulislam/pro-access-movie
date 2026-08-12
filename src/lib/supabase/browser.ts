import { createBrowserClient as createClientSSR } from "@supabase/ssr";
import { env } from "@/lib/env";

export function createBrowserClient() {
  return createClientSSR(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export const createClient = createBrowserClient;
