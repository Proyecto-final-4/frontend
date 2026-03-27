import { NextRequest, NextResponse } from 'next/server'
import { AUTH_ROUTES } from '@/shared/constants/auth'
import { getTokenFromRequest } from '@/shared/utils/cookies'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = getTokenFromRequest(request)
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route))

  // Usuario autenticado intentando acceder a login/register → redirigir al dashboard
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Usuario sin token intentando acceder al dashboard → redirigir al login
  if (!isAuthRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
