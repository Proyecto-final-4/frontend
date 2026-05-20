import { javaFetch } from "@/sdk/_http";
import { NextResponse } from "next/server";

/**
 * Proxy BFF → Java GET /auth/public-key
 * Retorna la clave pública RSA-2048 (Base64 SPKI) para que el cliente cifre credenciales.
 */
export async function GET() {
  const res = await javaFetch("/auth/public-key");

  if (!res.ok) {
    return NextResponse.json(
      { error: "No se pudo obtener la clave pública." },
      { status: 502 },
    );
  }

  const data = (await res.json()) as { publicKey: string };
  return NextResponse.json(data);
}
