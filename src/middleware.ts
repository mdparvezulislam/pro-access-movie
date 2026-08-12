import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes strictly
  if (pathname.startsWith("/admin")) {
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "https://placeholder-project.supabase.co";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder.anon_key";

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    // 1. Unauthenticated -> redirect to /login with return URL
    if (authError || !user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // 2. Authenticated -> Check admin role via is_admin RPC or user_roles query
    const { data: isAdmin, error: rpcError } = await supabase.rpc("is_admin", {
      check_user_id: user.id,
    });

    let hasAdminPermission = !rpcError && Boolean(isAdmin);

    if (!hasAdminPermission) {
      // Fallback query if RPC unavailable
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      hasAdminPermission = !!roleData;
    }

    // 3. Non-admin -> redirect to homepage
    if (!hasAdminPermission) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
