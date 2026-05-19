import { javaFetch } from "@/sdk/_http";
import type { AuthResponse, LoginPayload, RegisterPayload } from "@/types/auth";

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
 * Calls POST /auth/login on the Java API.
 * Only use from BFF API routes (server-side).
 */
export async function javaLogin(payload: LoginPayload): Promise<AuthResponse> {
  const res = await javaFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throwJavaApiError(await res.text(), "Error al iniciar sesión");
  }

  return res.json() as Promise<AuthResponse>;
}

/**
 * Calls POST /auth/register on the Java API.
 * Only use from BFF API routes (server-side).
 */
export async function javaRegister(payload: RegisterPayload): Promise<AuthResponse> {
  const res = await javaFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throwJavaApiError(await res.text(), "Error al registrar usuario");
  }

  return res.json() as Promise<AuthResponse>;
}
