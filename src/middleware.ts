import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// User routes that require authentication. Guests may continue browsing all public content.
const PROTECTED_USER_ROUTES = [
  "/profile",
  "/my-list",
  "/history",
  "/continue-watching",
  "/watchlist",
];

function isProtectedUserRoute(pathname: string) {
  return PROTECTED_USER_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public content is never gated in middleware.
  if (!pathname.startsWith("/admin") && !isProtectedUserRoute(pathname)) {
    return NextResponse.next();
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  if (!supabaseUrl || !supabaseAnonKey) {
    // Never silently bypass route protection because of misconfiguration.
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  // 1. Unauthenticated -> redirect to /login with return URL for a clean auth flow.
  if (authError || !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Admin routes require the admin tier (admin or super_admin).
  if (pathname.startsWith("/admin")) {
    const { data: isAdmin } = await supabase.rpc("is_admin", {
      check_user_id: user.id,
    });

    let hasAdminPermission = Boolean(isAdmin);

    if (!hasAdminPermission) {
      // Fallback: own role rows only (RLS limits this to the caller's own roles).
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .in("role", ["admin", "super_admin"])
        .maybeSingle();

      hasAdminPermission = !!roleData;
    }

    if (!hasAdminPermission) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/profile",
    "/my-list",
    "/history",
    "/continue-watching",
    "/watchlist",
  ],
};