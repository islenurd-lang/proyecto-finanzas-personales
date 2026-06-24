import { prisma } from "@/lib/prisma";
import { getDemoUser } from "@/lib/demo-user";
import { calculateEffectiveStatus } from "./debt.types";

export async function getDebtPayments(debtId: string) {
  const user = await getDemoUser();
  const debt = await prisma.debt.findFirst({ where: { id: debtId, userId: user.id } });
  if (!debt) throw new Error("Deuda no encontrada");

  return prisma.debtPayment.findMany({
    where: { debtId },
    include: { transaction: { include: { sourceAccount: true } } },
    orderBy: { paymentDate: "desc" },
  });
}

export async function createDebtPayment(input: {
  debtId: string;
  accountId: string;
  amountCents: number;
  paymentDate: Date;
  description: string;
}) {
  const user = await getDemoUser();

  const debt = await prisma.debt.findFirst({ where: { id: input.debtId, userId: user.id } });
  if (!debt) throw new Error("Deuda no encontrada");
  if (debt.currentBalanceCents <= 0) throw new Error("Esta deuda ya está pagada");

  const account = await prisma.account.findFirst({
    where: { id: input.accountId, userId: user.id, isActive: true },
  });
  if (!account) throw new Error("Cuenta no encontrada o inactiva");

  if (input.amountCents > debt.currentBalanceCents) {
    throw new Error("El monto del pago no puede ser mayor al saldo pendiente");
  }

  const debtCategory = await prisma.category.findFirst({
    where: { userId: user.id, name: "Deuda", type: "EXPENSE", isActive: true },
  });
  if (!debtCategory) throw new Error("Categoría 'Deuda' no encontrada o inactiva");

  const newBalance = debt.currentBalanceCents - input.amountCents;
  const newStatus = calculateEffectiveStatus(newBalance, debt.dueDate);

  const description = input.description || `Pago deuda: ${debt.creditorName}`;

  return prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.create({
      data: {
        userId: user.id,
        type: "EXPENSE",
        amountCents: input.amountCents,
        date: input.paymentDate,
        sourceAccountId: input.accountId,
        destinationAccountId: null,
        categoryId: debtCategory.id,
        description,
        status: "CONFIRMED",
      },
    });

    const payment = await tx.debtPayment.create({
      data: {
        debtId: input.debtId,
        transactionId: transaction.id,
        amountCents: input.amountCents,
        paymentDate: input.paymentDate,
      },
    });

    await tx.debt.update({
      where: { id: input.debtId },
      data: { currentBalanceCents: newBalance, status: newStatus },
    });

    return payment;
  });
}

export async function deleteDebtPayment(paymentId: string) {
  const user = await getDemoUser();

  const payment = await prisma.debtPayment.findFirst({
    where: { id: paymentId },
    include: { debt: true },
  });
  if (!payment) throw new Error("Pago no encontrado");
  if (payment.debt.userId !== user.id) throw new Error("No autorizado");

  const newBalance = payment.debt.currentBalanceCents + payment.amountCents;
  const newStatus = calculateEffectiveStatus(newBalance, payment.debt.dueDate);

  return prisma.$transaction(async (tx) => {
    await tx.debtPayment.delete({ where: { id: paymentId } });

    if (payment.transactionId) {
      await tx.transactionTag.deleteMany({ where: { transactionId: payment.transactionId } });
      await tx.transaction.delete({ where: { id: payment.transactionId } });
    }

    await tx.debt.update({
      where: { id: payment.debtId },
      data: { currentBalanceCents: newBalance, status: newStatus },
    });
  });
}

export async function getDebtPaymentFormOptions() {
  const user = await getDemoUser();
  const accounts = await prisma.account.findMany({
    where: { userId: user.id, isActive: true },
    orderBy: { name: "asc" },
  });
  return { accounts: accounts.map((a) => ({ id: a.id, name: a.name })) };
}
