import { prisma } from "@/lib/prisma";
import { getDemoUser } from "@/lib/demo-user";
import { centsToDecimal } from "@/lib/money";
import type { ReportFilters, MonthlyData, CategoryBreakdown, MonthComparison } from "./report.types";

function buildWhere(userId: string, filters: ReportFilters) {
  const where: Record<string, unknown> = { userId };

  if (filters.type) where.type = filters.type;
  if (filters.status) where.status = filters.status;
  if (filters.categoryId) where.categoryId = filters.categoryId;
  if (filters.accountId) {
    where.OR = [
      { sourceAccountId: filters.accountId },
      { destinationAccountId: filters.accountId },
    ];
  }
  if (filters.dateFrom || filters.dateTo) {
    where.date = {};
    if (filters.dateFrom) (where.date as Record<string, unknown>).gte = new Date(filters.dateFrom);
    if (filters.dateTo) (where.date as Record<string, unknown>).lte = new Date(filters.dateTo + "T23:59:59.999Z");
  }
  return where;
}

export async function getReportFiltersOptions() {
  const user = await getDemoUser();
  const [accounts, categories] = await Promise.all([
    prisma.account.findMany({ where: { userId: user.id }, orderBy: { name: "asc" } }),
    prisma.category.findMany({ where: { userId: user.id }, orderBy: { name: "asc" } }),
  ]);
  return {
    accounts: accounts.map((a) => ({ id: a.id, name: a.name })),
    categories: categories.map((c) => ({ id: c.id, name: c.name, type: c.type })),
  };
}

export async function getFilteredTransactions(filters: ReportFilters) {
  const user = await getDemoUser();
  const where = buildWhere(user.id, filters);

  return prisma.transaction.findMany({
    where,
    include: { sourceAccount: true, destinationAccount: true, category: true },
    orderBy: { date: "desc" },
    take: 500,
  });
}

export async function getReportSummary(filters: ReportFilters) {
  const transactions = await getFilteredTransactions(filters);
  const confirmed = transactions.filter((tx) => tx.status === "CONFIRMED");

  const income = confirmed.filter((tx) => tx.type === "INCOME").reduce((s, tx) => s + tx.amountCents, 0);
  const expenses = confirmed.filter((tx) => tx.type === "EXPENSE").reduce((s, tx) => s + tx.amountCents, 0);

  return { income, expenses, netFlow: income - expenses, totalTransactions: transactions.length };
}

export async function getMonthlyIncomeExpense(filters: ReportFilters): Promise<MonthlyData[]> {
  const user = await getDemoUser();
  const now = new Date();
  const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const data: MonthlyData[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mStart = new Date(d.getFullYear(), d.getMonth(), 1);
    const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

    const where: Record<string, unknown> = {
      userId: user.id, status: "CONFIRMED",
      date: { gte: mStart, lte: mEnd },
    };
    if (filters.accountId) {
      where.OR = [{ sourceAccountId: filters.accountId }, { destinationAccountId: filters.accountId }];
    }

    const txs = await prisma.transaction.findMany({ where });
    data.push({
      month: monthNames[d.getMonth()],
      ingresos: txs.filter((tx) => tx.type === "INCOME").reduce((s, tx) => s + tx.amountCents, 0),
      gastos: txs.filter((tx) => tx.type === "EXPENSE").reduce((s, tx) => s + tx.amountCents, 0),
    });
  }
  return data;
}

export async function getExpensesByCategory(filters: ReportFilters): Promise<CategoryBreakdown[]> {
  const transactions = await getFilteredTransactions({ ...filters, type: "EXPENSE", status: "CONFIRMED" });
  const map = new Map<string, { name: string; value: number; color: string }>();

  for (const tx of transactions) {
    if (!tx.category) continue;
    const existing = map.get(tx.category.id);
    if (existing) {
      existing.value += tx.amountCents;
    } else {
      map.set(tx.category.id, { name: tx.category.name, value: tx.amountCents, color: tx.category.color });
    }
  }

  return Array.from(map.values()).sort((a, b) => b.value - a.value);
}

export async function getTopExpenseCategories(filters: ReportFilters) {
  const categories = await getExpensesByCategory(filters);
  return categories.slice(0, 5);
}

export async function getCurrentVsPreviousMonth(): Promise<MonthComparison[]> {
  const user = await getDemoUser();
  const now = new Date();

  async function getMonthTotals(month: number, year: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);
    const txs = await prisma.transaction.findMany({
      where: { userId: user.id, status: "CONFIRMED", date: { gte: start, lte: end } },
    });
    const income = txs.filter((tx) => tx.type === "INCOME").reduce((s, tx) => s + tx.amountCents, 0);
    const expenses = txs.filter((tx) => tx.type === "EXPENSE").reduce((s, tx) => s + tx.amountCents, 0);
    return { income, expenses, net: income - expenses };
  }

  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const prevDate = new Date(currentYear, currentMonth - 2, 1);
  const prevMonth = prevDate.getMonth() + 1;
  const prevYear = prevDate.getFullYear();

  const [curr, prev] = await Promise.all([
    getMonthTotals(currentMonth, currentYear),
    getMonthTotals(prevMonth, prevYear),
  ]);

  function pctChange(current: number, previous: number) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  return [
    { label: "Ingresos", current: curr.income, previous: prev.income, changePercent: pctChange(curr.income, prev.income) },
    { label: "Gastos", current: curr.expenses, previous: prev.expenses, changePercent: pctChange(curr.expenses, prev.expenses) },
    { label: "Flujo neto", current: curr.net, previous: prev.net, changePercent: pctChange(curr.net, prev.net) },
  ];
}

export async function getTransactionsForCsvExport(filters: ReportFilters) {
  const transactions = await getFilteredTransactions(filters);
  return transactions.map((tx) => ({
    fecha: tx.date.toISOString().split("T")[0],
    tipo: tx.type === "INCOME" ? "Ingreso" : tx.type === "EXPENSE" ? "Gasto" : "Transferencia",
    estado: tx.status === "CONFIRMED" ? "Confirmado" : "Pendiente",
    cuentaOrigen: tx.sourceAccount?.name ?? "",
    cuentaDestino: tx.destinationAccount?.name ?? "",
    categoria: tx.category?.name ?? "",
    descripcion: tx.description ?? "",
    monto: centsToDecimal(tx.amountCents),
    moneda: "DOP",
  }));
}

export async function getBalanceEvolution(): Promise<{ month: string; balance: number }[]> {
  const user = await getDemoUser();
  const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const now = new Date();

  const accounts = await prisma.account.findMany({ where: { userId: user.id, isActive: true } });
  const initialTotal = accounts.reduce((s, a) => s + a.initialBalanceCents, 0);

  const data: { month: string; balance: number }[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

    const txs = await prisma.transaction.findMany({
      where: { userId: user.id, status: "CONFIRMED", date: { lte: mEnd } },
    });

    let balance = initialTotal;
    for (const tx of txs) {
      if (tx.type === "INCOME") balance += tx.amountCents;
      else if (tx.type === "EXPENSE") balance -= tx.amountCents;
    }

    data.push({ month: monthNames[d.getMonth()], balance });
  }

  return data;
}
