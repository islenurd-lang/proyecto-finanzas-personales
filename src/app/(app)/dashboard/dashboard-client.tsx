"use client";

import BalanceChart from "@/components/dashboard/balance-chart";
import CategoryPie from "@/components/dashboard/category-pie";

interface Props {
  monthlyData: { month: string; ingresos: number; gastos: number }[];
  categoryData: { name: string; value: number; color: string }[];
}

export default function DashboardCharts({ monthlyData, categoryData }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <BalanceChart data={monthlyData} />
      <CategoryPie data={categoryData} />
    </div>
  );
}
