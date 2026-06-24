import { getDebts, getDebtsSummary } from "@/features/debts/debt.service";
import { getDebtPayments, getDebtPaymentFormOptions } from "@/features/debts/debt-payment.service";
import { formatMoney } from "@/lib/money";
import DebtsClient from "./debts-client";

export const dynamic = "force-dynamic";

export default async function DebtsPage() {
  const [debts, summary, paymentOptions] = await Promise.all([
    getDebts(),
    getDebtsSummary(),
    getDebtPaymentFormOptions(),
  ]);

  const debtsWithPayments = await Promise.all(
    debts.map(async (d) => {
      const payments = await getDebtPayments(d.id);
      return {
        id: d.id,
        creditorName: d.creditorName,
        originalAmountCents: d.originalAmountCents,
        currentBalanceCents: d.currentBalanceCents,
        interestRate: d.interestRate,
        monthlyPaymentCents: d.monthlyPaymentCents,
        dueDateStr: d.dueDateStr,
        effectiveStatus: d.effectiveStatus,
        paidCents: d.paidCents,
        progress: d.progress,
        payments: payments.map((p) => ({
          id: p.id,
          amountCents: p.amountCents,
          paymentDate: p.paymentDate.toISOString().split("T")[0],
          accountName: p.transaction?.sourceAccount?.name ?? "—",
          description: p.transaction?.description ?? "",
        })),
      };
    })
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Deudas</h2>
        <p className="text-sm text-slate-500 mt-1">
          Registra y controla tus deudas personales.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-xs text-slate-500">Deuda original</p>
          <p className="text-lg font-bold text-slate-900 mt-1">{formatMoney(summary.totalOriginal)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-xs text-slate-500">Saldo pendiente</p>
          <p className="text-lg font-bold text-rose-600 mt-1">{formatMoney(summary.totalPending)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-xs text-slate-500">Total pagado</p>
          <p className="text-lg font-bold text-emerald-600 mt-1">{formatMoney(summary.totalPaid)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-xs text-slate-500">Activas</p>
          <p className="text-lg font-bold text-navy-700 mt-1">{summary.active}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-xs text-slate-500">Vencidas</p>
          <p className={`text-lg font-bold mt-1 ${summary.overdue > 0 ? "text-rose-600" : "text-slate-400"}`}>{summary.overdue}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-xs text-slate-500">Pagadas</p>
          <p className="text-lg font-bold text-emerald-600 mt-1">{summary.paid}</p>
        </div>
      </div>

      <DebtsClient debts={debtsWithPayments} accounts={paymentOptions.accounts} />
    </div>
  );
}
