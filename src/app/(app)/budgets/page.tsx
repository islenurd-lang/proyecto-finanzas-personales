import { getBudgets, getBudgetFormOptions, getBudgetSummary } from "@/features/budgets/budget.service";
import { getCurrentMonth, getCurrentYear } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import BudgetsClient from "./budgets-client";

export const dynamic = "force-dynamic";

export default async function BudgetsPage() {
  const month = getCurrentMonth();
  const year = getCurrentYear();

  const [budgets, formOptions, summary] = await Promise.all([
    getBudgets(month, year),
    getBudgetFormOptions(),
    getBudgetSummary(month, year),
  ]);

  const serialized = budgets.map((b) => ({
    id: b.id,
    categoryId: b.categoryId,
    categoryName: b.categoryName,
    categoryColor: b.categoryColor,
    month: b.month,
    year: b.year,
    limitAmountCents: b.limitAmountCents,
    spentCents: b.spentCents,
    percentage: b.percentage,
    status: b.status,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Presupuestos</h2>
        <p className="text-sm text-slate-500 mt-1">
          Controla tus gastos mensuales con presupuestos por categoría.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm text-slate-500">Presupuestado</p>
          <p className="text-xl font-bold text-navy-700 mt-1">{formatMoney(summary.totalBudgeted)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm text-slate-500">Consumido</p>
          <p className="text-xl font-bold text-rose-600 mt-1">{formatMoney(summary.totalSpent)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm text-slate-500">Restante</p>
          <p className={`text-xl font-bold mt-1 ${summary.remaining >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
            {formatMoney(summary.remaining)}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm text-slate-500">Excedidos</p>
          <p className={`text-xl font-bold mt-1 ${summary.exceeded > 0 ? "text-rose-600" : "text-emerald-600"}`}>
            {summary.exceeded} de {summary.count}
          </p>
        </div>
      </div>

      <BudgetsClient
        budgets={serialized}
        categories={formOptions.categories}
        currentMonth={month}
        currentYear={year}
      />
    </div>
  );
}
