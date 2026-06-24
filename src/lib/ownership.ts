import { prisma } from "./prisma";

export async function assertAccountBelongsToUser(accountId: string, userId: string) {
  const account = await prisma.account.findFirst({ where: { id: accountId, userId } });
  if (!account) throw new Error("Cuenta no encontrada o no autorizada");
  return account;
}

export async function assertCategoryBelongsToUser(categoryId: string, userId: string) {
  const category = await prisma.category.findFirst({ where: { id: categoryId, userId } });
  if (!category) throw new Error("Categoría no encontrada o no autorizada");
  return category;
}

export async function assertTransactionBelongsToUser(transactionId: string, userId: string) {
  const transaction = await prisma.transaction.findFirst({ where: { id: transactionId, userId } });
  if (!transaction) throw new Error("Transacción no encontrada o no autorizada");
  return transaction;
}

export async function assertDebtBelongsToUser(debtId: string, userId: string) {
  const debt = await prisma.debt.findFirst({ where: { id: debtId, userId } });
  if (!debt) throw new Error("Deuda no encontrada o no autorizada");
  return debt;
}
