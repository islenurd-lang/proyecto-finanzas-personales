import type { TransactionType, DebtStatus } from "@/generated/prisma/client";

interface TransactionForCalc {
  type: TransactionType;
  amountCents: number;
  sourceAccountId: string | null;
  destinationAccountId: string | null;
  status: string;
}

export function calculateAccountBalance(
  initialBalanceCents: number,
  accountId: string,
  transactions: TransactionForCalc[]
): number {
  let balance = initialBalanceCents;

  for (const tx of transactions) {
    if (tx.status !== "CONFIRMED") continue;

    if (tx.type === "INCOME" && tx.destinationAccountId === accountId) {
      balance += tx.amountCents;
    } else if (tx.type === "EXPENSE" && tx.sourceAccountId === accountId) {
      balance -= tx.amountCents;
    } else if (tx.type === "TRANSFER") {
      if (tx.sourceAccountId === accountId) balance -= tx.amountCents;
      if (tx.destinationAccountId === accountId) balance += tx.amountCents;
    }
  }

  return balance;
}

export function calculateTotalBalance(
  accounts: { initialBalanceCents: number; id: string }[],
  transactions: TransactionForCalc[]
): number {
  return accounts.reduce(
    (sum, acc) => sum + calculateAccountBalance(acc.initialBalanceCents, acc.id, transactions),
    0
  );
}

export function calculateMonthIncome(transactions: TransactionForCalc[]): number {
  return transactions
    .filter((tx) => tx.type === "INCOME" && tx.status === "CONFIRMED")
    .reduce((sum, tx) => sum + tx.amountCents, 0);
}

export function calculateMonthExpenses(transactions: TransactionForCalc[]): number {
  return transactions
    .filter((tx) => tx.type === "EXPENSE" && tx.status === "CONFIRMED")
    .reduce((sum, tx) => sum + tx.amountCents, 0);
}

export function calculateNetFlow(transactions: TransactionForCalc[]): number {
  return calculateMonthIncome(transactions) - calculateMonthExpenses(transactions);
}

export function calculateBudgetPercentage(spentCents: number, limitCents: number): number {
  if (limitCents <= 0) return 0;
  return Math.round((spentCents / limitCents) * 100);
}

export function calculateGoalProgress(currentCents: number, targetCents: number): number {
  if (targetCents <= 0) return 0;
  return Math.min(Math.round((currentCents / targetCents) * 100), 100);
}

export function calculateDebtStatus(
  currentBalanceCents: number,
  dueDate: Date
): DebtStatus {
  if (currentBalanceCents <= 0) return "PAID";
  if (new Date() > dueDate) return "OVERDUE";
  return "ACTIVE";
}
