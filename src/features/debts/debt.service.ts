import { prisma } from "@/lib/prisma";
import { getDemoUser } from "@/lib/demo-user";
import { calculateEffectiveStatus } from "./debt.types";

export async function getDebts() {
  const user = await getDemoUser();
  const debts = await prisma.debt.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return debts.map((d) => {
    const effectiveStatus = calculateEffectiveStatus(d.currentBalanceCents, d.dueDate);
    const paidCents = d.originalAmountCents - d.currentBalanceCents;
    const progress = d.originalAmountCents > 0 ? Math.round((paidCents / d.originalAmountCents) * 100) : 0;
    return {
      ...d,
      effectiveStatus,
      paidCents,
      progress,
      dueDate: d.dueDate,
      dueDateStr: d.dueDate.toISOString().split("T")[0],
    };
  });
}

export async function getDebtById(id: string) {
  const user = await getDemoUser();
  return prisma.debt.findFirst({ where: { id, userId: user.id } });
}

export async function createDebt(input: {
  creditorName: string;
  originalAmountCents: number;
  currentBalanceCents: number;
  interestRate: number | null;
  monthlyPaymentCents: number;
  dueDate: Date;
}) {
  const user = await getDemoUser();
  const status = calculateEffectiveStatus(input.currentBalanceCents, input.dueDate);

  return prisma.debt.create({
    data: {
      userId: user.id,
      creditorName: input.creditorName,
      originalAmountCents: input.originalAmountCents,
      currentBalanceCents: input.currentBalanceCents,
      interestRate: input.interestRate,
      monthlyPaymentCents: input.monthlyPaymentCents,
      dueDate: input.dueDate,
      status,
    },
  });
}

export async function updateDebt(
  id: string,
  input: {
    creditorName: string;
    originalAmountCents: number;
    currentBalanceCents: number;
    interestRate: number | null;
    monthlyPaymentCents: number;
    dueDate: Date;
  }
) {
  const user = await getDemoUser();
  const debt = await prisma.debt.findFirst({ where: { id, userId: user.id } });
  if (!debt) throw new Error("Deuda no encontrada");

  const status = calculateEffectiveStatus(input.currentBalanceCents, input.dueDate);

  return prisma.debt.update({
    where: { id },
    data: {
      creditorName: input.creditorName,
      originalAmountCents: input.originalAmountCents,
      currentBalanceCents: input.currentBalanceCents,
      interestRate: input.interestRate,
      monthlyPaymentCents: input.monthlyPaymentCents,
      dueDate: input.dueDate,
      status,
    },
  });
}

export async function deleteDebt(id: string) {
  const user = await getDemoUser();
  const debt = await prisma.debt.findFirst({ where: { id, userId: user.id } });
  if (!debt) throw new Error("Deuda no encontrada");

  const payments = await prisma.debtPayment.count({ where: { debtId: id } });
  if (payments > 0) throw new Error("No se puede eliminar una deuda con pagos registrados");

  return prisma.debt.delete({ where: { id } });
}

export async function getDebtsSummary() {
  const debts = await getDebts();
  const totalOriginal = debts.reduce((s, d) => s + d.originalAmountCents, 0);
  const totalPending = debts.reduce((s, d) => s + d.currentBalanceCents, 0);
  const totalPaid = totalOriginal - totalPending;
  const active = debts.filter((d) => d.effectiveStatus === "ACTIVE").length;
  const overdue = debts.filter((d) => d.effectiveStatus === "OVERDUE").length;
  const paid = debts.filter((d) => d.effectiveStatus === "PAID").length;

  return { totalOriginal, totalPending, totalPaid, active, overdue, paid, total: debts.length };
}
