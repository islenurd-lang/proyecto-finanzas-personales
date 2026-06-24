import { formatMoney } from "@/lib/money";

interface RecentTransaction {
  id: string;
  description: string;
  amountCents: number;
  type: "INGRESO" | "GASTO" | "TRANSFERENCIA";
  category: string;
  date: string;
}

export default function RecentTransactions({
  transactions,
}: {
  transactions: RecentTransaction[];
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">
        Últimos Movimientos
      </h3>
      {transactions.length === 0 ? (
        <p className="text-sm text-slate-400 dark:text-slate-500 py-8 text-center">
          No hay movimientos registrados
        </p>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                  {tx.description}
                </p>
                <p className="text-xs text-slate-400">
                  {tx.category} · {tx.date}
                </p>
              </div>
              <span
                className={`text-sm font-semibold tabular-nums ${
                  tx.type === "INGRESO"
                    ? "text-emerald-600"
                    : tx.type === "GASTO"
                      ? "text-rose-600"
                      : "text-navy-600"
                }`}
              >
                {tx.type === "INGRESO" ? "+" : tx.type === "GASTO" ? "-" : ""}
                {formatMoney(tx.amountCents)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
