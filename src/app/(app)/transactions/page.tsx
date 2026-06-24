import { getTransactions, getTransactionFormOptions } from "@/features/transactions/transaction.service";
import { formatMoney } from "@/lib/money";
import { getCurrentMonthRange } from "@/lib/dates";
import TransactionsClient from "./transactions-client";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const [transactions, formOptions] = await Promise.all([
    getTransactions(),
    getTransactionFormOptions(),
  ]);

  const { start, end } = getCurrentMonthRange();
  const monthTx = transactions.filter(
    (tx) => tx.date >= start && tx.date <= end && tx.status === "CONFIRMED"
  );

  const monthIncome = monthTx
    .filter((tx) => tx.type === "INCOME")
    .reduce((s, tx) => s + tx.amountCents, 0);
  const monthExpenses = monthTx
    .filter((tx) => tx.type === "EXPENSE")
    .reduce((s, tx) => s + tx.amountCents, 0);

  const serialized = transactions.map((tx) => ({
    id: tx.id,
    type: tx.type,
    amountCents: tx.amountCents,
    date: tx.date.toISOString().split("T")[0],
    description: tx.description ?? "",
    status: tx.status,
    sourceAccountId: tx.sourceAccountId ?? "",
    destinationAccountId: tx.destinationAccountId ?? "",
    categoryId: tx.categoryId ?? "",
    sourceAccountName: tx.sourceAccount?.name ?? "",
    destinationAccountName: tx.destinationAccount?.name ?? "",
    categoryName: tx.category?.name ?? "",
    categoryColor: tx.category?.color ?? "#64748B",
  }));

  const accounts = formOptions.accounts.map((a) => ({ id: a.id, name: a.name }));
  const incomeCategories = formOptions.incomeCategories.map((c) => ({ id: c.id, name: c.name }));
  const expenseCategories = formOptions.expenseCategories.map((c) => ({ id: c.id, name: c.name }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Transacciones</h2>
        <p className="text-sm text-slate-500 mt-1">
          Registra y gestiona ingresos, gastos y transferencias.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm text-slate-500">Ingresos del mes</p>
          <p className="text-xl font-bold text-emerald-600 mt-1">{formatMoney(monthIncome)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm text-slate-500">Gastos del mes</p>
          <p className="text-xl font-bold text-rose-600 mt-1">{formatMoney(monthExpenses)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm text-slate-500">Flujo neto</p>
          <p className={`text-xl font-bold mt-1 ${monthIncome - monthExpenses >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
            {formatMoney(monthIncome - monthExpenses)}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm text-slate-500">Movimientos</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{transactions.length}</p>
        </div>
      </div>

      <TransactionsClient
        transactions={serialized}
        accounts={accounts}
        incomeCategories={incomeCategories}
        expenseCategories={expenseCategories}
      />
    </div>
  );
}
