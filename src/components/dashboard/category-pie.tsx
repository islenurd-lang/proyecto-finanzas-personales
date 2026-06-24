"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface CategoryPieProps {
  data: { name: string; value: number; color: string }[];
}

export default function CategoryPie({ data }: CategoryPieProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">
        Gastos por Categoría
      </h3>
      <div className="h-72 flex items-center">
        <div className="w-1/2 h-full min-h-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
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
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-1/2 space-y-2 pl-2">
          {data.map((entry, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-slate-600 truncate flex-1">
                {entry.name}
              </span>
              <span className="text-slate-800 font-medium tabular-nums">
                {((entry.value / data.reduce((s, d) => s + d.value, 0)) * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
