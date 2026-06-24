import { prisma } from "./prisma";
import type { SafeUser } from "@/features/auth/auth.types";

const DEMO_USER_EMAIL = "demo@finanzas.local";

export async function getCurrentUser(): Promise<SafeUser | null> {
  // TODO: Replace with real session in Fase 9.2
  const user = await prisma.user.findUnique({
    where: { email: DEMO_USER_EMAIL },
  });
  if (!user || !user.isActive) return null;

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

export async function requireCurrentUser(): Promise<SafeUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("No autenticado");
  return user;
}

export async function requireSuperAdmin(): Promise<SafeUser> {
  const user = await requireCurrentUser();
  if (user.role !== "SUPER_ADMIN") throw new Error("No autorizado");
  return user;
}
