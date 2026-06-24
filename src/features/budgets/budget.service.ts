import { prisma } from "@/lib/prisma";
import { getDemoUser } from "@/lib/demo-user";
import { calculateBudgetPercentage } from "@/lib/calculations";
import { getBudgetStatus } from "./budget.types";

async function getSpentForBudget(userId: string, categoryId: string, month: number, year: number): Promise<number> {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);

  const result = await prisma.transaction.aggregate({
    where: {
      userId,
      type: "EXPENSE",
      status: "CONFIRMED",
      categoryId,
      date: { gte: start, lte: end },
    },
    _sum: { amountCents: true },
  });

  return result._sum.amountCents ?? 0;
}

export async function getBudgets(month: number, year: number) {
  const user = await getDemoUser();

  const budgets = await prisma.budget.findMany({
    where: { userId: user.id, month, year },
    include: { category: true },
    orderBy: { category: { name: "asc" } },
  });

  const enriched = await Promise.all(
    budgets.map(async (b) => {
      const spentCents = await getSpentForBudget(user.id, b.categoryId, month, year);
      const percentage = calculateBudgetPercentage(spentCents, b.limitAmountCents);
      return {
        ...b,
        spentCents,
        percentage,
        status: getBudgetStatus(percentage),
        categoryName: b.category.name,
        categoryColor: b.category.color,
      };
    })
  );

  return enriched;
}

export async function getBudgetById(id: string) {
  const user = await getDemoUser();
  return prisma.budget.findFirst({
    where: { id, userId: user.id },
    include: { category: true },
  });
}

export async function createBudget(input: {
  categoryId: string;
  month: number;
  year: number;
  limitAmountCents: number;
}) {
  const user = await getDemoUser();

  const cat = await prisma.category.findFirst({
    where: { id: input.categoryId, userId: user.id, isActive: true, type: "EXPENSE" },
  });
  if (!cat) throw new Error("Categoría no encontrada, inactiva o no es de tipo gasto");

  const existing = await prisma.budget.findFirst({
    where: { userId: user.id, categoryId: input.categoryId, month: input.month, year: input.year },
  });
  if (existing) throw new Error("Ya existe un presupuesto para esta categoría en este mes/año");

  return prisma.budget.create({
    data: {
      userId: user.id,
      categoryId: input.categoryId,
      month: input.month,
      year: input.year,
      limitAmountCents: input.limitAmountCents,
    },
  });
}

export async function updateBudget(id: string, input: { limitAmountCents: number }) {
  const user = await getDemoUser();
  const budget = await prisma.budget.findFirst({ where: { id, userId: user.id } });
  if (!budget) throw new Error("Presupuesto no encontrado");

  return prisma.budget.update({
    where: { id },
    data: { limitAmountCents: input.limitAmountCents },
  });
}

export async function deleteBudget(id: string) {
  const user = await getDemoUser();
  const budget = await prisma.budget.findFirst({ where: { id, userId: user.id } });
  if (!budget) throw new Error("Presupuesto no encontrado");

  return prisma.budget.delete({ where: { id } });
}

export async function getBudgetFormOptions() {
  const user = await getDemoUser();
  const categories = await prisma.category.findMany({
    where: { userId: user.id, type: "EXPENSE", isActive: true },
    orderBy: { name: "asc" },
  });
  return { categories: categories.map((c) => ({ id: c.id, name: c.name })) };
}

export async function getBudgetSummary(month: number, year: number) {
  const budgets = await getBudgets(month, year);

  const totalBudgeted = budgets.reduce((s, b) => s + b.limitAmountCents, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spentCents, 0);
  const exceeded = budgets.filter((b) => b.status === "EXCEEDED").length;

  return { totalBudgeted, totalSpent, remaining: totalBudgeted - totalSpent, exceeded, count: budgets.length };
}
