import { prisma } from "@/lib/prisma";
import { getDemoUser } from "@/lib/demo-user";
import type { TransactionType, TransactionStatus } from "@/generated/prisma/client";

interface TransactionFilters {
  type?: TransactionType;
  status?: TransactionStatus;
  sourceAccountId?: string;
  categoryId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export async function getTransactions(filters?: TransactionFilters) {
  const user = await getDemoUser();

  const where: Record<string, unknown> = { userId: user.id };

  if (filters?.type) where.type = filters.type;
  if (filters?.status) where.status = filters.status;
  if (filters?.categoryId) where.categoryId = filters.categoryId;
  if (filters?.sourceAccountId) {
    where.OR = [
      { sourceAccountId: filters.sourceAccountId },
      { destinationAccountId: filters.sourceAccountId },
    ];
  }
  if (filters?.dateFrom || filters?.dateTo) {
    where.date = {};
    if (filters.dateFrom) (where.date as Record<string, unknown>).gte = new Date(filters.dateFrom);
    if (filters.dateTo) (where.date as Record<string, unknown>).lte = new Date(filters.dateTo + "T23:59:59.999Z");
  }

  return prisma.transaction.findMany({
    where,
    include: {
      sourceAccount: true,
      destinationAccount: true,
      category: true,
    },
    orderBy: { date: "desc" },
    take: 100,
  });
}

export async function getTransactionById(id: string) {
  const user = await getDemoUser();
  return prisma.transaction.findFirst({
    where: { id, userId: user.id },
    include: { sourceAccount: true, destinationAccount: true, category: true },
  });
}

export async function createTransaction(input: {
  type: TransactionType;
  amountCents: number;
  date: Date;
  sourceAccountId: string | null;
  destinationAccountId: string | null;
  categoryId: string | null;
  description: string;
  status: TransactionStatus;
}) {
  const user = await getDemoUser();

  if (input.sourceAccountId) {
    const acc = await prisma.account.findFirst({ where: { id: input.sourceAccountId, userId: user.id, isActive: true } });
    if (!acc) throw new Error("Cuenta origen no encontrada o inactiva");
  }
  if (input.destinationAccountId) {
    const acc = await prisma.account.findFirst({ where: { id: input.destinationAccountId, userId: user.id, isActive: true } });
    if (!acc) throw new Error("Cuenta destino no encontrada o inactiva");
  }
  if (input.categoryId) {
    const cat = await prisma.category.findFirst({ where: { id: input.categoryId, userId: user.id, isActive: true } });
    if (!cat) throw new Error("Categoría no encontrada o inactiva");
    if (input.type === "INCOME" && cat.type !== "INCOME") throw new Error("La categoría debe ser de tipo ingreso");
    if (input.type === "EXPENSE" && cat.type !== "EXPENSE") throw new Error("La categoría debe ser de tipo gasto");
  }

  return prisma.transaction.create({
    data: {
      userId: user.id,
      type: input.type,
      amountCents: input.amountCents,
      date: input.date,
      sourceAccountId: input.sourceAccountId || null,
      destinationAccountId: input.destinationAccountId || null,
      categoryId: input.categoryId || null,
      description: input.description || null,
      status: input.status,
    },
  });
}

export async function updateTransaction(
  id: string,
  input: {
    type: TransactionType;
    amountCents: number;
    date: Date;
    sourceAccountId: string | null;
    destinationAccountId: string | null;
    categoryId: string | null;
    description: string;
    status: TransactionStatus;
  }
) {
  const user = await getDemoUser();
  const existing = await prisma.transaction.findFirst({ where: { id, userId: user.id } });
  if (!existing) throw new Error("Transacción no encontrada");

  if (input.sourceAccountId) {
    const acc = await prisma.account.findFirst({ where: { id: input.sourceAccountId, userId: user.id, isActive: true } });
    if (!acc) throw new Error("Cuenta origen no encontrada o inactiva");
  }
  if (input.destinationAccountId) {
    const acc = await prisma.account.findFirst({ where: { id: input.destinationAccountId, userId: user.id, isActive: true } });
    if (!acc) throw new Error("Cuenta destino no encontrada o inactiva");
  }
  if (input.categoryId) {
    const cat = await prisma.category.findFirst({ where: { id: input.categoryId, userId: user.id, isActive: true } });
    if (!cat) throw new Error("Categoría no encontrada o inactiva");
    if (input.type === "INCOME" && cat.type !== "INCOME") throw new Error("La categoría debe ser de tipo ingreso");
    if (input.type === "EXPENSE" && cat.type !== "EXPENSE") throw new Error("La categoría debe ser de tipo gasto");
  }

  return prisma.transaction.update({
    where: { id },
    data: {
      type: input.type,
      amountCents: input.amountCents,
      date: input.date,
      sourceAccountId: input.sourceAccountId || null,
      destinationAccountId: input.destinationAccountId || null,
      categoryId: input.categoryId || null,
      description: input.description || null,
      status: input.status,
    },
  });
}

export async function deleteTransaction(id: string) {
  const user = await getDemoUser();
  const existing = await prisma.transaction.findFirst({ where: { id, userId: user.id } });
  if (!existing) throw new Error("Transacción no encontrada");

  await prisma.transactionTag.deleteMany({ where: { transactionId: id } });
  return prisma.transaction.delete({ where: { id } });
}

export async function getTransactionFormOptions() {
  const user = await getDemoUser();

  const [accounts, incomeCategories, expenseCategories] = await Promise.all([
    prisma.account.findMany({ where: { userId: user.id, isActive: true }, orderBy: { name: "asc" } }),
    prisma.category.findMany({ where: { userId: user.id, type: "INCOME", isActive: true }, orderBy: { name: "asc" } }),
    prisma.category.findMany({ where: { userId: user.id, type: "EXPENSE", isActive: true }, orderBy: { name: "asc" } }),
  ]);

  return { accounts, incomeCategories, expenseCategories };
}
