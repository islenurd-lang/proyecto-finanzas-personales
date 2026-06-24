import { prisma } from "@/lib/prisma";
import { getDemoUser } from "@/lib/demo-user";
import { calculateAccountBalance } from "@/lib/calculations";
import type { AccountType } from "@/generated/prisma/client";

export async function getAccounts() {
  const user = await getDemoUser();
  return prisma.account.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });
}

export async function getAccountById(id: string) {
  const user = await getDemoUser();
  return prisma.account.findFirst({
    where: { id, userId: user.id },
  });
}

export async function getAccountsWithCalculatedBalance() {
  const user = await getDemoUser();
  const accounts = await prisma.account.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });
  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id, status: "CONFIRMED" },
  });

  return accounts.map((acc) => ({
    ...acc,
    calculatedBalanceCents: calculateAccountBalance(
      acc.initialBalanceCents,
      acc.id,
      transactions
    ),
  }));
}

export async function createAccount(input: {
  name: string;
  type: AccountType;
  initialBalanceCents: number;
  currency: string;
}) {
  const user = await getDemoUser();
  return prisma.account.create({
    data: { userId: user.id, ...input },
  });
}

export async function updateAccount(
  id: string,
  input: Partial<{
    name: string;
    type: AccountType;
    initialBalanceCents: number;
    currency: string;
  }>
) {
  const user = await getDemoUser();
  const account = await prisma.account.findFirst({ where: { id, userId: user.id } });
  if (!account) throw new Error("Cuenta no encontrada");
  return prisma.account.update({ where: { id }, data: input });
}

export async function toggleAccountStatus(id: string) {
  const user = await getDemoUser();
  const account = await prisma.account.findFirst({ where: { id, userId: user.id } });
  if (!account) throw new Error("Cuenta no encontrada");
  return prisma.account.update({
    where: { id },
    data: { isActive: !account.isActive },
  });
}
