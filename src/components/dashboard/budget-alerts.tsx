interface BudgetAlert {
  category: string;
  limitCents: number;
  spentCents: number;
}

export default function BudgetAlerts({
  alerts,
}: {
  alerts: BudgetAlert[];
}) {
  if (alerts.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">
        Alertas de Presupuesto
      </h3>
      <div className="space-y-3">
        {alerts.map((alert, i) => {
          const pct = Math.round((alert.spentCents / alert.limitCents) * 100);
          const isExceeded = pct >= 100;
          const isWarning = pct >= 80 && pct < 100;

          return (
            <div key={i} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">
                  {alert.category}
                </span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    isExceeded
                      ? "bg-rose-100 text-rose-700"
                      : isWarning
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {pct}%
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    isExceeded
                      ? "bg-rose-500"
                      : isWarning
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
