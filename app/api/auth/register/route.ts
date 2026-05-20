import { NextRequest, NextResponse } from "next/server";
import { javaRegister } from "@/sdk/auth";
import { setAuthCookies } from "@/shared/utils/cookies";
import type { EncryptedRegisterPayload } from "@/types/auth";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as EncryptedRegisterPayload | null;

  if (!body?.encryptedName || !body?.encryptedEmail || !body?.encryptedPassword) {
    return NextResponse.json(
      { error: "encryptedName, encryptedEmail, and encryptedPassword are required" },
      { status: 400 },
    );
  }

  try {
    const auth = await javaRegister({
      encryptedName: body.encryptedName,
      encryptedEmail: body.encryptedEmail,
      encryptedPassword: body.encryptedPassword,
    });
    const response = NextResponse.json(
      { id: auth.id, name: auth.name, email: auth.email },
      { status: 201 },
    );
    setAuthCookies(response, auth);
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to register user";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
