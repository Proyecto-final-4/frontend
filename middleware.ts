import { NextRequest, NextResponse } from "next/server";
import { AUTH_ROUTES, PROTECTED_ROUTES } from "@/shared/constants/auth";
import { getTokenFromRequest } from "@/shared/utils/cookies";

/** Devuelve true si la ruta es de autenticación (login / register). */
function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Devuelve true si la ruta requiere autenticación.
 * "/" se evalúa de forma exacta para no atrapar todas las rutas.
 */
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) =>
    route === "/" ? pathname === "/" : pathname.startsWith(route),
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = getTokenFromRequest(request);

  // Usuario autenticado en login/register → redirigir al dashboard
  if (isAuthRoute(pathname) && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Usuario sin token en ruta protegida → redirigir al login
  // Se conserva la ruta de origen en ?from= para redirigir de vuelta tras el login
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
