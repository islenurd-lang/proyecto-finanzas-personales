import {
  getReportFiltersOptions,
  getReportSummary,
  getMonthlyIncomeExpense,
  getExpensesByCategory,
  getTopExpenseCategories,
  getCurrentVsPreviousMonth,
  getFilteredTransactions,
  getBalanceEvolution,
} from "@/features/reports/report.service";
import { formatMoney } from "@/lib/money";
import ReportsClient from "./reports-client";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const [filterOptions, summary, monthlyData, categoryData, topCategories, comparison, transactions, balanceEvolution] =
    await Promise.all([
      getReportFiltersOptions(),
      getReportSummary({}),
      getMonthlyIncomeExpense({}),
      getExpensesByCategory({}),
      getTopExpenseCategories({}),
      getCurrentVsPreviousMonth(),
      getFilteredTransactions({}),
      getBalanceEvolution(),
    ]);

  const serializedTx = transactions.map((tx) => ({
    id: tx.id,
    type: tx.type,
    amountCents: tx.amountCents,
    date: tx.date.toISOString().split("T")[0],
    description: tx.description ?? "",
    status: tx.status,
    sourceAccountName: tx.sourceAccount?.name ?? "",
    destinationAccountName: tx.destinationAccount?.name ?? "",
    categoryName: tx.category?.name ?? "",
    categoryColor: tx.category?.color ?? "#64748B",
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Reportes</h2>
        <p className="text-sm text-slate-500 mt-1">
          Visualiza tendencias, analiza gastos y exporta tus datos.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm text-slate-500">Ingresos</p>
          <p className="text-xl font-bold text-emerald-600 mt-1">{formatMoney(summary.income)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm text-slate-500">Gastos</p>
          <p className="text-xl font-bold text-rose-600 mt-1">{formatMoney(summary.expenses)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm text-slate-500">Flujo neto</p>
          <p className={`text-xl font-bold mt-1 ${summary.netFlow >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
            {formatMoney(summary.netFlow)}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm text-slate-500">Transacciones</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{summary.totalTransactions}</p>
        </div>
      </div>

      <ReportsClient
        monthlyData={monthlyData}
        categoryData={categoryData}
        topCategories={topCategories}
        comparison={comparison}
        transactions={serializedTx}
        accounts={filterOptions.accounts}
        categories={filterOptions.categories}
        balanceEvolution={balanceEvolution}
      />
    </div>
  );
}
