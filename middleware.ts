import { NextRequest, NextResponse } from "next/server";

// Define paths that should be protected
const ADMIN_PATHS = [
  "/admin/dashboard",
  "/admin/users",
  "/admin/jobs",
  "/admin/settings"
];

// Define public paths that don't need admin protection
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/admin/login",
  "/admin/forgot-password",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to public paths without any checks
  if (PUBLIC_PATHS.some(path => pathname === path) || pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  // Check if the requested path is an admin path
  const isAdminPath = ADMIN_PATHS.some(path => pathname.startsWith(path)) || 
                      (pathname.startsWith("/admin") && pathname !== "/admin/login");
  
  // If it's an admin path, check for authentication
  if (isAdminPath) {
    // Check for admin session cookie
    const adminSession = request.cookies.get("admin-session");

    // If no admin session, redirect to login
    if (!adminSession || adminSession.value === "") {
      const loginUrl = new URL("/admin/login", request.url);
      
      // Add the original URL as a parameter so we can redirect back after login
      loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
      
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}; 