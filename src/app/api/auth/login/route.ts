import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/features/auth/auth.schema";
import { validateUserCredentials } from "@/features/auth/auth.service";
import { createSession } from "@/lib/session";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "unknown";
  const rateCheck = checkRateLimit(`login:${ip}`);

  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: `Demasiados intentos. Intenta de nuevo en ${rateCheck.retryAfterSeconds} segundos.` },
      { status: 429 }
    );
  }

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
