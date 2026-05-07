import { javaFetch } from "@/sdk/_http";
import type { AuthResponse, LoginPayload, RegisterPayload } from "@/types/auth";

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
    const error = await res.text();
    throw new Error(error || "Error al iniciar sesión");
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
    const error = await res.text();
    throw new Error(error || "Error al registrar usuario");
  }

  return res.json() as Promise<AuthResponse>;
}
