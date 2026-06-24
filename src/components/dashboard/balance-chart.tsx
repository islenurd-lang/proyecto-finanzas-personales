"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface BalanceChartProps {
  data: { month: string; ingresos: number; gastos: number }[];
}

export default function BalanceChart({ data }: BalanceChartProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">
        Ingresos vs Gastos
      </h3>
      <div className="h-72 min-h-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <BarChart data={data} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: "#64748B" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#64748B" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(value) =>
                `RD$ ${Number(value).toLocaleString("es-DO", {
                  minimumFractionDigits: 2,
                })}`
              }
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #E2E8F0",
                fontSize: "13px",
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: "13px", paddingTop: "8px" }}
            />
            <Bar
              dataKey="ingresos"
              name="Ingresos"
              fill="#10B981"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="gastos"
              name="Gastos"
              fill="#F43F5E"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
