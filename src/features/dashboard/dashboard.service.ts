import { prisma } from "@/lib/prisma";
import { DEMO_USER_EMAIL } from "@/lib/demo-user";
import { getCurrentMonthRange, getCurrentMonth, getCurrentYear } from "@/lib/dates";
import {
  calculateAccountBalance,
  calculateMonthIncome,
  calculateMonthExpenses,
  calculateNetFlow,
  calculateBudgetPercentage,
} from "@/lib/calculations";

export async function getDashboardData() {
  const user = await prisma.user.findUnique({
    where: { email: DEMO_USER_EMAIL },
  });
  if (!user) throw new Error("Demo user not found");

  const { start, end } = getCurrentMonthRange();
  const currentMonth = getCurrentMonth();
  const currentYear = getCurrentYear();

  // Fetch all confirmed transactions for balance calculation
  const allTransactions = await prisma.transaction.findMany({
    where: { userId: user.id, status: "CONFIRMED" },
  });

  // Month transactions (all statuses for display, confirmed for calcs)
  const monthTransactions = await prisma.transaction.findMany({
    where: { userId: user.id, date: { gte: start, lte: end } },
    include: { category: true, sourceAccount: true, destinationAccount: true },
    orderBy: { date: "desc" },
  });

  const confirmedMonthTx = monthTransactions.filter((tx) => tx.status === "CONFIRMED");

  // Accounts
  const accounts = await prisma.account.findMany({
    where: { userId: user.id, isActive: true },
  });

  // Calculate total balance
  const totalBalance = accounts.reduce(
    (sum, acc) => sum + calculateAccountBalance(acc.initialBalanceCents, acc.id, allTransactions),
    0
  );

  const monthIncome = calculateMonthIncome(confirmedMonthTx);
  const monthExpenses = calculateMonthExpenses(confirmedMonthTx);
  const netFlow = calculateNetFlow(confirmedMonthTx);

  // Category breakdown for pie chart
  const expensesByCategory = new Map<string, { name: string; value: number; color: string }>();
  for (const tx of confirmedMonthTx) {
    if (tx.type !== "EXPENSE" || !tx.category) continue;
    const existing = expensesByCategory.get(tx.category.id);
    if (existing) {
      existing.value += tx.amountCents;
    } else {
      expensesByCategory.set(tx.category.id, {
        name: tx.category.name,
        value: tx.amountCents,
        color: tx.category.color,
      });
    }
  }
  const categoryData = Array.from(expensesByCategory.values()).sort((a, b) => b.value - a.value);

  // Monthly chart data (last 6 months)
  const monthlyData: { month: string; ingresos: number; gastos: number }[] = [];
  const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(currentYear, currentMonth - 1 - i, 1);
    const mStart = new Date(d.getFullYear(), d.getMonth(), 1);
    const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

    const mTx = allTransactions.filter(
      (tx) => tx.date >= mStart && tx.date <= mEnd
    );

    monthlyData.push({
      month: monthNames[d.getMonth()],
      ingresos: calculateMonthIncome(mTx),
      gastos: calculateMonthExpenses(mTx),
    });
  }

  // Recent transactions (last 5)
  const recentTransactions = monthTransactions.slice(0, 5).map((tx) => ({
    id: tx.id,
    description: tx.description ?? "Sin descripción",
    amountCents: tx.amountCents,
    type: tx.type as "INCOME" | "EXPENSE" | "TRANSFER",
    category: tx.category?.name ?? (tx.type === "TRANSFER" ? "Transferencia" : "Sin categoría"),
    date: tx.date.toISOString().split("T")[0],
  }));

  // Budget alerts
  const budgets = await prisma.budget.findMany({
    where: { userId: user.id, month: currentMonth, year: currentYear },
    include: { category: true },
  });

  const budgetAlerts = budgets
    .map((b) => {
      const spent = confirmedMonthTx
        .filter((tx) => tx.type === "EXPENSE" && tx.categoryId === b.categoryId)
        .reduce((s, tx) => s + tx.amountCents, 0);
      const pct = calculateBudgetPercentage(spent, b.limitAmountCents);
      return {
        category: b.category.name,
        limitCents: b.limitAmountCents,
        spentCents: spent,
        percentage: pct,
      };
    })
    .filter((a) => a.percentage >= 70)
    .sort((a, b) => b.percentage - a.percentage);

  return {
    totalBalance,
    monthIncome,
    monthExpenses,
    netFlow,
    monthlyData,
    categoryData,
    recentTransactions,
    budgetAlerts,
  };
}
