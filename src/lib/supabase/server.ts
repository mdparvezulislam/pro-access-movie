import { createServerClient as createClientSSR } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

export async function createServerClient() {
  const cookieStore = await cookies();

  return createClientSSR(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // Ignored if middleware or server actions handle cookie refresh.
          }
        },
      },
    }
  );
}

/**
 * Service Role client factory for administrative background tasks only.
 * MUST NEVER be called or imported from client components.
 */
export async function createAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error("createAdminClient must never be executed on the client side");
  }

  const cookieStore = await cookies();

  return createClientSSR(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY || "",
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignored when invoked in pure server contexts
          }
        },
      },
    }
  );
}
