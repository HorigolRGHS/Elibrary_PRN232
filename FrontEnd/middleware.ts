import { NextRequest, NextResponse } from "next/server";
import { decodeJwt, normalizeJwt } from "@/lib/utils";

// ======== ROUTE CONFIG ========

const protectedRoutes = [
  { path: "/dashboard", roles: ["Admin"] },
  { path: "/profile", roles: ["Admin", "Customer"] },
  { path: "/download-history", roles: ["Admin", "Customer"] },
];

const guestOnlyRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/confirm-registration",
  "/reset-password",
];

// ======== UTILITY FUNCTIONS ========

function isStaticAsset(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.match(/\.(.*)$/) !== null
  );
}

function isGuestOnlyRoute(pathname: string): boolean {
  return guestOnlyRoutes.some((path) => pathname.startsWith(path));
}

function getMatchedProtectedRoute(pathname: string) {
  return protectedRoutes.find((route) => pathname.startsWith(route.path));
}

function redirectTo(path: string, req: NextRequest): NextResponse {
  const url = new URL(path, req.url);
  return NextResponse.redirect(url);
}

// ======== MAIN MIDDLEWARE ========

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isStaticAsset(pathname)) {
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value || null;
  const decoded = token ? decodeJwt(token) : null;
  const normalized = decoded ? normalizeJwt(decoded) : null;
  const role = normalized?.role ?? "";

  const isAuthenticated = !!normalized;

  // Guest-only pages (cannot access if already logged in)
  if (isGuestOnlyRoute(pathname)) {
    if (isAuthenticated) {
      return redirectTo("/", req);
    }
    return NextResponse.next();
  }

  // Protected routes (login required)
  const matchedProtected = getMatchedProtectedRoute(pathname);
  if (matchedProtected) {
    if (!isAuthenticated) {
      return redirectTo("/login", req);
    }

    // Role-based check
    if (!matchedProtected.roles.includes(role)) {
      return redirectTo("/", req);
    }
  }

  return NextResponse.next();
}

// ======== CONFIG ========

export const config = {
  matcher: "/:path*",
};
