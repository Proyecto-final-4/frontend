import { NextRequest, NextResponse } from "next/server";
import { javaLogin } from "@/sdk/auth";
import { LOGIN_ERROR_GENERIC } from "@/shared/constants/auth";
import { setAuthCookies } from "@/shared/utils/cookies";
import type { EncryptedLoginPayload } from "@/types/auth";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as EncryptedLoginPayload | null;

  if (!body?.encryptedEmail || !body?.encryptedPassword) {
    return NextResponse.json(
      { error: "encryptedEmail y encryptedPassword son requeridos" },
      { status: 400 },
    );
  }

  try {
    const auth = await javaLogin({
      encryptedEmail: body.encryptedEmail,
      encryptedPassword: body.encryptedPassword,
    });
    const response = NextResponse.json(
      { id: auth.id, name: auth.name, email: auth.email },
      { status: 200 },
    );
    setAuthCookies(response, auth);
    return response;
  } catch {
    return NextResponse.json({ error: LOGIN_ERROR_GENERIC }, { status: 401 });
  }
}
