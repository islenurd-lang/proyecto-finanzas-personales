import { getSavingGoals, getSavingGoalFormOptions, getSavingGoalsSummary } from "@/features/goals/goal.service";
import { formatMoney } from "@/lib/money";
import GoalsClient from "./goals-client";

export const dynamic = "force-dynamic";

export default async function GoalsPage() {
  const [goals, formOptions, summary] = await Promise.all([
    getSavingGoals(),
    getSavingGoalFormOptions(),
    getSavingGoalsSummary(),
  ]);

  const serialized = goals.map((g) => ({
    id: g.id,
    name: g.name,
    targetAmountCents: g.targetAmountCents,
    currentAmountCents: g.currentAmountCents,
    targetDate: g.targetDate?.toISOString().split("T")[0] ?? "",
    accountId: g.accountId ?? "",
    accountName: g.accountName,
    isCompleted: g.isCompleted,
    progress: g.progress,
    status: g.status,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Metas de Ahorro</h2>
        <p className="text-sm text-slate-500 mt-1">
          Define objetivos de ahorro y visualiza tu progreso.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm text-slate-500">Objetivo total</p>
          <p className="text-xl font-bold text-navy-700 mt-1">{formatMoney(summary.totalTarget)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm text-slate-500">Acumulado</p>
          <p className="text-xl font-bold text-emerald-600 mt-1">{formatMoney(summary.totalCurrent)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm text-slate-500">Progreso global</p>
          <p className="text-xl font-bold text-navy-700 mt-1">{summary.globalProgress}%</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm text-slate-500">Completadas</p>
          <p className="text-xl font-bold text-emerald-600 mt-1">{summary.completed} de {summary.total}</p>
        </div>
      </div>

      <GoalsClient
        goals={serialized}
        accounts={formOptions.accounts}
      />
    </div>
  );
}
