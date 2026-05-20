import { javaFetch } from "@/sdk/_http";
import { NextResponse } from "next/server";

/**
 * BFF proxy → Java GET /auth/public-key
 * Returns the RSA-2048 public key (Base64 SPKI) so the client can encrypt credentials.
 */
export async function GET() {
  const res = await javaFetch("/auth/public-key");

  if (!res.ok) {
    return NextResponse.json({ error: "Could not fetch the public key." }, { status: 502 });
  }

  const data = (await res.json()) as { publicKey: string };
  return NextResponse.json(data);
}
