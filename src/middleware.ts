import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/lib/auth";

// Routes that require authentication
const protectedRoutes = [
  "/author",
  "/author/upload",
  "/author/books",
  "/author/followers",
  "/author/data",
  "/settings",
  "/settings/profile",
  "/settings/bookmarks",
  "/settings/notifications",
  "/settings/security",
  "/settings/preferences",
  "/settings/author",
];

// Routes that are public (no auth required)
const publicRoutes = [
  "/",
  "/app",
  "/app/search",
  "/app/following",
  "/app/bookmarks",
  "/app/books",
  "/auth/login",
  "/auth/signin",
  "/docs",
  "/api/books", // GET is public
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await auth();

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route) || pathname === route
  );

  // Check if the route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname.startsWith(route) || pathname === route
  );

  // If it's a protected route and user is not authenticated, redirect to login
  if (isProtectedRoute && !session?.user) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If it's an API route that requires auth
  if (pathname.startsWith("/api/") && !isPublicRoute) {
    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
  }

  // Allow all other routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
    "/api/:path*",
  ],
};
