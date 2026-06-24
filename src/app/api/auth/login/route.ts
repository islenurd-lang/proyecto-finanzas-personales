import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/features/auth/auth.schema";
import { validateUserCredentials } from "@/features/auth/auth.service";
import { createSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const result = await validateUserCredentials(parsed.data.email, parsed.data.password);

  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: 401 });
  }

  const { user } = result;
  await createSession({ userId: user.id, email: user.email, role: user.role });

  return NextResponse.json({ ok: true, user: { name: user.name, email: user.email, role: user.role } });
}
