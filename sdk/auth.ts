import { javaFetch } from "@/sdk/_http";
import type { AuthResponse, LoginPayload, RegisterPayload } from "@/types/auth";

/**
 * Llama a POST /auth/login en la API Java.
 * Solo usar desde API routes del BFF (server-side).
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
 * Llama a POST /auth/register en la API Java.
 * Solo usar desde API routes del BFF (server-side).
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
