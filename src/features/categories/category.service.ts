import { prisma } from "@/lib/prisma";
import { getDemoUser } from "@/lib/demo-user";
import type { CategoryType } from "@/generated/prisma/client";

export async function getCategories() {
  const user = await getDemoUser();
  return prisma.category.findMany({
    where: { userId: user.id },
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });
}

export async function getCategoriesByType(type: CategoryType) {
  const user = await getDemoUser();
  return prisma.category.findMany({
    where: { userId: user.id, type },
    orderBy: { name: "asc" },
  });
}

export async function createCategory(input: {
  name: string;
  type: CategoryType;
  color: string;
  icon: string;
}) {
  const user = await getDemoUser();

  const existing = await prisma.category.findFirst({
    where: { userId: user.id, name: input.name, type: input.type },
  });
  if (existing) throw new Error("Ya existe una categoría con ese nombre y tipo");

  return prisma.category.create({
    data: { userId: user.id, ...input },
  });
}

export async function updateCategory(
  id: string,
  input: Partial<{ name: string; type: CategoryType; color: string; icon: string }>
) {
  const user = await getDemoUser();
  const category = await prisma.category.findFirst({ where: { id, userId: user.id } });
  if (!category) throw new Error("Categoría no encontrada");

  if (input.name && input.name !== category.name) {
    const dup = await prisma.category.findFirst({
      where: { userId: user.id, name: input.name, type: input.type ?? category.type, id: { not: id } },
    });
    if (dup) throw new Error("Ya existe una categoría con ese nombre y tipo");
  }

  return prisma.category.update({ where: { id }, data: input });
}

export async function toggleCategoryStatus(id: string) {
  const user = await getDemoUser();
  const category = await prisma.category.findFirst({ where: { id, userId: user.id } });
  if (!category) throw new Error("Categoría no encontrada");
  return prisma.category.update({
    where: { id },
    data: { isActive: !category.isActive },
  });
}
