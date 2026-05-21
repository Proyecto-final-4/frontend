import { NextRequest, NextResponse } from "next/server";
import { javaResetPassword } from "@/sdk/auth";
import type { ResetPasswordRequest } from "@/types/auth";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as ResetPasswordRequest | null;

  if (!body?.token || !body?.newPassword) {
    return NextResponse.json({ error: "token and newPassword are required" }, { status: 400 });
  }

  try {
    await javaResetPassword({ token: body.token, newPassword: body.newPassword });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to reset password";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
