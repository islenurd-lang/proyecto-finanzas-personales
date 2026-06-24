import { formatMoney } from "@/lib/money";
import SummaryCard from "@/components/dashboard/summary-card";
import RecentTransactions from "@/components/dashboard/recent-transactions";
import BudgetAlerts from "@/components/dashboard/budget-alerts";
import DashboardCharts from "./dashboard-client";
import { getDashboardData } from "@/features/dashboard/dashboard.service";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getDashboardData();

  // Map transaction types for the component
  const recentTx = data.recentTransactions.map((tx) => ({
    ...tx,
    type: tx.type === "INCOME"
      ? "INGRESO" as const
      : tx.type === "EXPENSE"
        ? "GASTO" as const
        : "TRANSFERENCIA" as const,
  }));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard
          title="Balance Total"
          value={formatMoney(data.totalBalance)}
          subtitle="Todas las cuentas"
          trend="neutral"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
          }
        />
        <SummaryCard
          title="Ingresos del Mes"
          value={formatMoney(data.monthIncome)}
          subtitle="Mes actual"
          trend="up"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
            </svg>
          }
        />
        <SummaryCard
          title="Gastos del Mes"
          value={formatMoney(data.monthExpenses)}
          subtitle="Mes actual"
          trend="down"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181" />
            </svg>
          }
        />
        <SummaryCard
          title="Flujo Neto"
          value={formatMoney(data.netFlow)}
          subtitle={data.netFlow >= 0 ? "Superávit" : "Déficit"}
          trend={data.netFlow >= 0 ? "up" : "down"}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
            </svg>
          }
        />
      </div>

      {/* Charts */}
      <DashboardCharts
        monthlyData={data.monthlyData}
        categoryData={data.categoryData}
      />

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentTransactions transactions={recentTx} />
        <BudgetAlerts alerts={data.budgetAlerts} />
      </div>
    </div>
  );
}
