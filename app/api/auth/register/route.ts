import { NextRequest, NextResponse } from "next/server";
import { javaRegister } from "@/sdk/auth";
import { setAuthCookies } from "@/shared/utils/cookies";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body?.name || !body?.email || !body?.password) {
    return NextResponse.json({ error: "name, email y password son requeridos" }, { status: 400 });
  }

  try {
    const auth = await javaRegister({
      name: body.name,
      email: body.email,
      password: body.password,
    });
    const response = NextResponse.json(
      { id: auth.id, name: auth.name, email: auth.email },
      { status: 201 },
    );
    setAuthCookies(response, auth);
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al registrar usuario";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
