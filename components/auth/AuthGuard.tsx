"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { COOKIE_USER_INFO } from "@/shared/constants/auth";

/**
 * Reads the user_info cookie on the client.
 * Returns true during SSR because middleware already validated the token on the server;
 * this check only runs in the browser.
 */
function hasSession(): boolean {
  if (typeof document === "undefined") return true;
  return document.cookie.split("; ").some((row) => row.startsWith(`${COOKIE_USER_INFO}=`));
}

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Client-side authentication guard.
 *
 * Purpose: second line of defense after middleware.
 * Covers cases middleware cannot intercept:
 *   – SPA navigation (Next.js router) without a server request
 *   – Cookie expiry while the tab stays open
 *   – Manual cookie removal from DevTools
 *
 * Redirects to /login when no active session is detected, without a visible flash
 * because the server would have redirected before render.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const verified = useRef(false);

  useEffect(() => {
    if (verified.current) return;
    verified.current = true;

    if (!hasSession()) {
      router.replace("/login");
    }
  }, [router]);

  return <>{children}</>;
}
