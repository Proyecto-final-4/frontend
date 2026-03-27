import { NextRequest, NextResponse } from "next/server";
import { COOKIE_MAX_AGE, COOKIE_TOKEN, COOKIE_USER_INFO } from "@/shared/constants/auth";
import type { AuthResponse, UserInfo } from "@/types/auth";

const isProduction = process.env.NODE_ENV === "production";

/**
 * Escribe auth_token (httpOnly) y user_info (legible desde el cliente)
 * en la respuesta. Se llama después de un login o register exitoso.
 */
export function setAuthCookies(response: NextResponse, auth: AuthResponse): void {
  const { token, id, name, email } = auth;

  response.cookies.set(COOKIE_TOKEN, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });

  response.cookies.set(COOKIE_USER_INFO, JSON.stringify({ id, name, email }), {
    httpOnly: false,
    secure: isProduction,
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

/**
 * Borra ambas cookies de autenticación. Se llama en logout.
 */
export function clearAuthCookies(response: NextResponse): void {
  response.cookies.delete(COOKIE_TOKEN);
  response.cookies.delete(COOKIE_USER_INFO);
}

/**
 * Lee el JWT desde las cookies de un NextRequest (API routes o middleware).
 * Devuelve null si no existe.
 */
export function getTokenFromRequest(request: NextRequest): string | null {
  return request.cookies.get(COOKIE_TOKEN)?.value ?? null;
}

/**
 * Parsea el objeto UserInfo desde la cookie user_info de un NextRequest.
 * Devuelve null si no existe o si el JSON es inválido.
 */
export function getUserInfoFromRequest(request: NextRequest): UserInfo | null {
  const raw = request.cookies.get(COOKIE_USER_INFO)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserInfo;
  } catch {
    return null;
  }
}
