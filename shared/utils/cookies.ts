import { NextRequest, NextResponse } from "next/server";
import { COOKIE_MAX_AGE, COOKIE_TOKEN, COOKIE_USER_INFO } from "@/shared/constants/auth";
import type { AuthResponse, UserInfo } from "@/types/auth";

const isProduction = process.env.NODE_ENV === "production";

/**
 * Sets auth_token (httpOnly) and user_info (readable from the client) on the response.
 * Called after a successful login or register.
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
 * Clears both auth cookies. Called on logout.
 */
export function clearAuthCookies(response: NextResponse): void {
  response.cookies.delete(COOKIE_TOKEN);
  response.cookies.delete(COOKIE_USER_INFO);
}

/**
 * Reads the JWT from cookies on a NextRequest (API routes or middleware).
 * Returns null if missing.
 */
export function getTokenFromRequest(request: NextRequest): string | null {
  return request.cookies.get(COOKIE_TOKEN)?.value ?? null;
}

/**
 * Parses UserInfo from the user_info cookie on a NextRequest.
 * Returns null if missing or if JSON is invalid.
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
