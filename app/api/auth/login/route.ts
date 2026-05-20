import { NextRequest, NextResponse } from "next/server";
import { javaLogin } from "@/sdk/auth";
import { LOGIN_ERROR_GENERIC } from "@/shared/constants/auth";
import { setAuthCookies } from "@/shared/utils/cookies";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body?.email || !body?.password) {
    return NextResponse.json({ error: "email y password son requeridos" }, { status: 400 });
  }

  try {
    const auth = await javaLogin({ email: body.email, password: body.password });
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
