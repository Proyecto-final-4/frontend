"use client";

import { useCallback, useState } from "react";
import { COOKIE_USER_INFO } from "@/shared/constants/auth";
import { encryptCredential, invalidatePublicKeyCache } from "@/lib/crypto";
import type { LoginPayload, RegisterPayload, UserInfo } from "@/types/auth";

function readUserInfoCookie(): UserInfo | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.split("; ").find((row) => row.startsWith(`${COOKIE_USER_INFO}=`));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match.split("=").slice(1).join("="))) as UserInfo;
  } catch {
    return null;
  }
}

interface AuthState {
  user: UserInfo | null;
  isLoading: boolean;
}

interface UseAuthReturn extends AuthState {
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>(() => ({
    user: readUserInfoCookie(),
    isLoading: false,
  }));

  const login = useCallback(async (payload: LoginPayload) => {
    let encryptedEmail: string;
    let encryptedPassword: string;

    try {
      [encryptedEmail, encryptedPassword] = await Promise.all([
        encryptCredential(payload.email),
        encryptCredential(payload.password),
      ]);
    } catch {
      invalidatePublicKeyCache();
      throw new Error("Failed to prepare credentials. Please try again.");
    }

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ encryptedEmail, encryptedPassword }),
    });

    if (!res.ok) {
      const { error } = (await res.json()) as { error?: string };
      throw new Error(error ?? "Failed to sign in");
    }

    const user = (await res.json()) as UserInfo;
    setState({ user, isLoading: false });
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    let encryptedName: string;
    let encryptedEmail: string;
    let encryptedPassword: string;

    try {
      [encryptedName, encryptedEmail, encryptedPassword] = await Promise.all([
        encryptCredential(payload.name),
        encryptCredential(payload.email),
        encryptCredential(payload.password),
      ]);
    } catch {
      invalidatePublicKeyCache();
      throw new Error("Failed to prepare credentials. Please try again.");
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ encryptedName, encryptedEmail, encryptedPassword }),
    });

    if (!res.ok) {
      const { error } = (await res.json()) as { error?: string };
      throw new Error(error ?? "Failed to register user");
    }

    const user = (await res.json()) as UserInfo;
    setState({ user, isLoading: false });
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setState({ user: null, isLoading: false });
  }, []);

  return { ...state, login, register, logout };
}
