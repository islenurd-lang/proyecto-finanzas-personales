import { prisma } from "@/lib/prisma";
import { verifyPassword } from "./password";
import type { SafeUser } from "./auth.types";

function toSafeUser(user: {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  preferredCurrency: string;
  dateFormat: string;
  theme: string;
}): SafeUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as SafeUser["role"],
    isActive: user.isActive,
    preferredCurrency: user.preferredCurrency,
    dateFormat: user.dateFormat,
    theme: user.theme,
  };
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export async function validateUserCredentials(
  email: string,
  password: string
): Promise<{ ok: true; user: SafeUser } | { ok: false; message: string }> {
  const user = await getUserByEmail(email);

  if (!user) return { ok: false, message: "Credenciales inválidas" };
  if (!user.isActive) return { ok: false, message: "Cuenta desactivada" };
  if (!user.passwordHash) return { ok: false, message: "Cuenta no configurada" };

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return { ok: false, message: "Credenciales inválidas" };

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  return { ok: true, user: toSafeUser(user) };
}
