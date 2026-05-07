import { NextRequest, NextResponse } from "next/server";
import { AUTH_ROUTES, PROTECTED_ROUTES } from "@/shared/constants/auth";
import { getTokenFromRequest } from "@/shared/utils/cookies";

/** Returns true if the route is an auth route (login / register). */
function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Returns true if the route requires authentication.
 * "/" is matched exactly to avoid catching all routes.
 */
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) =>
    route === "/" ? pathname === "/" : pathname.startsWith(route),
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = getTokenFromRequest(request);

  // Authenticated user on login/register → redirect to dashboard
  if (isAuthRoute(pathname) && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Unauthenticated user on protected route → redirect to login
  // Preserve the original path in ?from= to redirect back after login
  if (isProtectedRoute(pathname) && !token) {
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set("from", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
