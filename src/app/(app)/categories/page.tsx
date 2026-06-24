import { getCategories } from "@/features/categories/category.service";
import CategoriesClient from "./categories-client";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await getCategories();

  const incomeCategories = categories.filter((c) => c.type === "INCOME");
  const expenseCategories = categories.filter((c) => c.type === "EXPENSE");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Categorías</h2>
        <p className="text-sm text-slate-500 mt-1">
          Organiza tus transacciones con categorías de ingresos y gastos.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm text-slate-500">Total categorías</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{categories.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm text-slate-500">Ingresos</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{incomeCategories.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm text-slate-500">Gastos</p>
          <p className="text-2xl font-bold text-rose-600 mt-1">{expenseCategories.length}</p>
        </div>
      </div>

      <CategoriesClient
        incomeCategories={JSON.parse(JSON.stringify(incomeCategories))}
        expenseCategories={JSON.parse(JSON.stringify(expenseCategories))}
      />
    </div>
  );
}
