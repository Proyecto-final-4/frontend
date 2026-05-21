import { javaFetch } from "@/sdk/_http";
import type {
  AuthResponse,
  EncryptedLoginPayload,
  EncryptedRegisterPayload,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from "@/types/auth";

function throwJavaApiError(text: string, fallback: string): never {
  try {
    const body = JSON.parse(text) as { error?: string };
    throw new Error(body.error ?? text);
  } catch (e) {
    if (e instanceof Error && e.message !== text) throw e;
    throw new Error(text || fallback);
  }
}

/**
 * Calls POST /auth/login on the Java API with RSA-OAEP encrypted credentials.
 * Only use from BFF API routes (server-side).
 */
export async function javaLogin(payload: EncryptedLoginPayload): Promise<AuthResponse> {
  const res = await javaFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throwJavaApiError(await res.text(), "Failed to sign in");
  }

  return res.json() as Promise<AuthResponse>;
}

/**
 * Calls POST /auth/register on the Java API with RSA-OAEP encrypted credentials.
 * Only use from BFF API routes (server-side).
 */
export async function javaRegister(payload: EncryptedRegisterPayload): Promise<AuthResponse> {
  const res = await javaFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throwJavaApiError(await res.text(), "Failed to register user");
  }

  return res.json() as Promise<AuthResponse>;
}

/**
 * Calls POST /auth/forgot-password on the Java API (plain text — no encryption).
 * Only use from BFF API routes (server-side).
 */
export async function javaForgotPassword(payload: ForgotPasswordRequest): Promise<void> {
  const res = await javaFetch("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throwJavaApiError(await res.text(), "Failed to process request");
  }
}

/**
 * Calls POST /auth/reset-password on the Java API (plain text — no encryption).
 * Only use from BFF API routes (server-side).
 */
export async function javaResetPassword(payload: ResetPasswordRequest): Promise<void> {
  const res = await javaFetch("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throwJavaApiError(await res.text(), "Failed to reset password");
  }
}
