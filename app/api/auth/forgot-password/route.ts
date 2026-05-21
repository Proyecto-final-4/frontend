import { NextRequest, NextResponse } from "next/server";
import { javaForgotPassword } from "@/sdk/auth";
import type { ForgotPasswordRequest } from "@/types/auth";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as ForgotPasswordRequest | null;

  if (!body?.email) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }

  try {
    await javaForgotPassword({ email: body.email });
  } catch {
    // Intentionally swallow backend errors — never reveal whether the email is registered.
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
