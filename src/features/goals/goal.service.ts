import { prisma } from "@/lib/prisma";
import { getDemoUser } from "@/lib/demo-user";
import { calculateGoalProgress } from "@/lib/calculations";
import { getGoalStatus } from "./goal.types";

export async function getSavingGoals() {
  const user = await getDemoUser();
  const goals = await prisma.savingGoal.findMany({
    where: { userId: user.id },
    include: { account: true },
    orderBy: { createdAt: "desc" },
  });

  return goals.map((g) => ({
    ...g,
    progress: calculateGoalProgress(g.currentAmountCents, g.targetAmountCents),
    status: getGoalStatus(g.isCompleted, g.targetDate),
    accountName: g.account?.name ?? null,
  }));
}

export async function getSavingGoalById(id: string) {
  const user = await getDemoUser();
  return prisma.savingGoal.findFirst({
    where: { id, userId: user.id },
    include: { account: true },
  });
}

export async function createSavingGoal(input: {
  name: string;
  targetAmountCents: number;
  currentAmountCents: number;
  targetDate: Date | null;
  accountId: string | null;
}) {
  const user = await getDemoUser();

  if (input.accountId) {
    const acc = await prisma.account.findFirst({ where: { id: input.accountId, userId: user.id, isActive: true } });
    if (!acc) throw new Error("Cuenta no encontrada o inactiva");
  }

  const isCompleted = input.currentAmountCents >= input.targetAmountCents;

  return prisma.savingGoal.create({
    data: {
      userId: user.id,
      name: input.name,
      targetAmountCents: input.targetAmountCents,
      currentAmountCents: input.currentAmountCents,
      targetDate: input.targetDate,
      accountId: input.accountId || null,
      isCompleted,
    },
  });
}

export async function updateSavingGoal(
  id: string,
  input: {
    name: string;
    targetAmountCents: number;
    currentAmountCents: number;
    targetDate: Date | null;
    accountId: string | null;
  }
) {
  const user = await getDemoUser();
  const goal = await prisma.savingGoal.findFirst({ where: { id, userId: user.id } });
  if (!goal) throw new Error("Meta no encontrada");

  if (input.accountId) {
    const acc = await prisma.account.findFirst({ where: { id: input.accountId, userId: user.id, isActive: true } });
    if (!acc) throw new Error("Cuenta no encontrada o inactiva");
  }

  const isCompleted = input.currentAmountCents >= input.targetAmountCents;

  return prisma.savingGoal.update({
    where: { id },
    data: {
      name: input.name,
      targetAmountCents: input.targetAmountCents,
      currentAmountCents: input.currentAmountCents,
      targetDate: input.targetDate,
      accountId: input.accountId || null,
      isCompleted,
    },
  });
}

export async function deleteSavingGoal(id: string) {
  const user = await getDemoUser();
  const goal = await prisma.savingGoal.findFirst({ where: { id, userId: user.id } });
  if (!goal) throw new Error("Meta no encontrada");
  return prisma.savingGoal.delete({ where: { id } });
}

export async function getSavingGoalFormOptions() {
  const user = await getDemoUser();
  const accounts = await prisma.account.findMany({
    where: { userId: user.id, isActive: true },
    orderBy: { name: "asc" },
  });
  return { accounts: accounts.map((a) => ({ id: a.id, name: a.name })) };
}

export async function getSavingGoalsSummary() {
  const goals = await getSavingGoals();
  const totalTarget = goals.reduce((s, g) => s + g.targetAmountCents, 0);
  const totalCurrent = goals.reduce((s, g) => s + g.currentAmountCents, 0);
  const completed = goals.filter((g) => g.isCompleted).length;
  const globalProgress = totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0;

  return { totalTarget, totalCurrent, globalProgress, completed, total: goals.length };
}
