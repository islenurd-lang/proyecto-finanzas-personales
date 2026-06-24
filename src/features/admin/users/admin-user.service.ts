import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/current-user";
import { hashPassword } from "@/features/auth/password";
import type { AdminUserView } from "./admin-user.types";

export async function getAdminUsers(): Promise<AdminUserView[]> {
  await requireSuperAdmin();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });

  return users.map((u) => ({
    ...u,
    lastLoginAt: u.lastLoginAt?.toISOString().split("T")[0] ?? null,
    createdAt: u.createdAt.toISOString().split("T")[0],
  }));
}

export async function createUserByAdmin(input: {
  name: string;
  email: string;
  password: string;
}) {
  const admin = await requireSuperAdmin();
  if (!admin) throw new Error("No autorizado");

  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new Error("Ya existe un usuario con ese email");

  const passwordHash = await hashPassword(input.password);

  return prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      role: "USER",
      isActive: true,
    },
  });
}

export async function toggleUserActive(userId: string) {
  const admin = await requireSuperAdmin();

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("Usuario no encontrado");

  if (user.id === admin.id) throw new Error("No puedes desactivar tu propia cuenta");

  if (user.role === "SUPER_ADMIN" && user.isActive) {
    const activeAdmins = await prisma.user.count({
      where: { role: "SUPER_ADMIN", isActive: true },
    });
    if (activeAdmins <= 1) throw new Error("No se puede desactivar el último administrador activo");
  }

  return prisma.user.update({
    where: { id: userId },
    data: { isActive: !user.isActive },
  });
}

export async function getUserAdminStats() {
  await requireSuperAdmin();

  const [total, active, inactive, users] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.user.count({ where: { isActive: false } }),
    prisma.user.count({ where: { role: "USER" } }),
  ]);

  return { total, active, inactive, users };
}
