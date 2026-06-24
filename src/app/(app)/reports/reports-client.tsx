"use client";

import { useState } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from "recharts";
import { formatMoney } from "@/lib/money";
import {
  TRANSACTION_TYPE_LABELS, TRANSACTION_TYPE_BG,
  TRANSACTION_STATUS_BG, TRANSACTION_STATUS_LABELS,
  TRANSACTION_TYPE_COLORS,
} from "@/features/transactions/transaction.types";
import Select from "@/components/ui/select";
import Input from "@/components/ui/input";
import Label from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { MonthlyData, CategoryBreakdown, MonthComparison } from "@/features/reports/report.types";

interface TxData {
  id: string; type: string; amountCents: number; date: string;
  description: string; status: string;
  sourceAccountName: string; destinationAccountName: string;
  categoryName: string; categoryColor: string;
}

interface Option { id: string; name: string; type?: string }

interface Props {
  monthlyData: MonthlyData[];
  categoryData: CategoryBreakdown[];
  topCategories: CategoryBreakdown[];
  comparison: MonthComparison[];
  transactions: TxData[];
  accounts: Option[];
  categories: Option[];
  balanceEvolution: { month: string; balance: number }[];
}

export default function ReportsClient({
  monthlyData, categoryData, topCategories, comparison,
  transactions, accounts, categories, balanceEvolution,
}: Props) {
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterAccount, setFilterAccount] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filtered = transactions.filter((tx) => {
    if (filterType && tx.type !== filterType) return false;
    if (filterStatus && tx.status !== filterStatus) return false;
    if (filterCategory && tx.categoryName !== categories.find(c => c.id === filterCategory)?.name) return false;
    if (filterAccount) {
      const accName = accounts.find(a => a.id === filterAccount)?.name;
      if (tx.sourceAccountName !== accName && tx.destinationAccountName !== accName) return false;
    }
    if (dateFrom && tx.date < dateFrom) return false;
    if (dateTo && tx.date > dateTo) return false;
    return true;
  });

  function clearFilters() {
    setFilterType(""); setFilterStatus(""); setFilterAccount("");
    setFilterCategory(""); setDateFrom(""); setDateTo("");
  }

  function exportCsv() {
    const params = new URLSearchParams();
    if (filterType) params.set("type", filterType);
    if (filterStatus) params.set("status", filterStatus);
    if (filterAccount) params.set("accountId", filterAccount);
    if (filterCategory) params.set("categoryId", filterCategory);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    window.open(`/api/export/transactions?${params.toString()}`, "_blank");
  }

  return (
    <>
      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div>
            <Label className="text-xs">Desde</Label>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Hasta</Label>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Tipo</Label>
            <Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="">Todos</option>
              <option value="INCOME">Ingresos</option>
              <option value="EXPENSE">Gastos</option>
              <option value="TRANSFER">Transferencias</option>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Estado</Label>
            <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">Todos</option>
              <option value="CONFIRMED">Confirmados</option>
              <option value="PENDING">Pendientes</option>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Cuenta</Label>
            <Select value={filterAccount} onChange={(e) => setFilterAccount(e.target.value)}>
              <option value="">Todas</option>
              {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </Select>
          </div>
          <div>
            <Label className="text-xs">Categoría</Label>
            <Select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="">Todas</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <button onClick={clearFilters} className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
            Limpiar filtros
          </button>
          <button onClick={exportCsv} className="px-3 py-1.5 text-xs bg-navy-600 text-white rounded-lg hover:bg-navy-700 transition-colors">
            Exportar CSV
          </button>
          <span className="text-xs text-slate-400 self-center ml-auto">{filtered.length} transacciones</span>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Income vs Expenses */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Ingresos vs Gastos por Mes</h3>
          <div className="h-72 min-h-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={monthlyData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => `RD$ ${Number(value).toLocaleString("es-DO", { minimumFractionDigits: 2 })}`} contentStyle={{ borderRadius: "8px", border: "1px solid #E2E8F0", fontSize: "13px" }} />
                <Legend wrapperStyle={{ fontSize: "13px" }} />
                <Bar dataKey="ingresos" name="Ingresos" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="gastos" name="Gastos" fill="#F43F5E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expenses by Category */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Gastos por Categoría</h3>
          <div className="h-72 flex items-center min-h-0">
            <div className="w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value">
                    {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(value) => `RD$ ${Number(value).toLocaleString("es-DO", { minimumFractionDigits: 2 })}`} contentStyle={{ borderRadius: "8px", border: "1px solid #E2E8F0", fontSize: "13px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 space-y-2 pl-2">
              {categoryData.slice(0, 6).map((entry, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                  <span className="text-slate-600 truncate flex-1">{entry.name}</span>
                  <span className="text-slate-800 font-medium tabular-nums text-xs">{formatMoney(entry.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Balance Evolution */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Evolución del Balance</h3>
        <div className="h-72 min-h-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <LineChart data={balanceEvolution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value) => `RD$ ${Number(value).toLocaleString("es-DO", { minimumFractionDigits: 2 })}`} contentStyle={{ borderRadius: "8px", border: "1px solid #E2E8F0", fontSize: "13px" }} />
              <Line type="monotone" dataKey="balance" name="Balance" stroke="#3B82F6" strokeWidth={2.5} dot={{ fill: "#3B82F6", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comparison + Top Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Month Comparison */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Mes Actual vs Anterior</h3>
          <div className="space-y-4">
            {comparison.map((c) => (
              <div key={c.label} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700">{c.label}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-slate-400">Anterior: {formatMoney(c.previous)}</span>
                    <span className="text-xs text-slate-400">→</span>
                    <span className="text-sm font-semibold text-slate-900">{formatMoney(c.current)}</span>
                  </div>
                </div>
                <span className={cn(
                  "text-xs font-bold px-2 py-1 rounded-full",
                  c.label === "Gastos"
                    ? (c.changePercent > 0 ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700")
                    : (c.changePercent >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700")
                )}>
                  {c.changePercent >= 0 ? "+" : ""}{c.changePercent}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Top Categorías de Gasto</h3>
          <div className="space-y-3">
            {topCategories.map((cat, i) => {
              const maxVal = topCategories[0]?.value ?? 1;
              const pct = Math.round((cat.value / maxVal) * 100);
              return (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-700 font-medium">{cat.name}</span>
                    <span className="text-slate-900 font-semibold tabular-nums">{formatMoney(cat.value)}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: cat.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Transacciones ({filtered.length})</h3>
        {filtered.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">No hay transacciones con los filtros seleccionados</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filtered.map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                <div className="w-2 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: tx.categoryColor }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{tx.description || TRANSACTION_TYPE_LABELS[tx.type]}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
                    <span>{tx.date}</span>
                    {tx.categoryName && <span>· {tx.categoryName}</span>}
                    <span className={cn("px-1.5 py-0.5 rounded-full text-[10px] font-medium", TRANSACTION_TYPE_BG[tx.type])}>{TRANSACTION_TYPE_LABELS[tx.type]}</span>
                    <span className={cn("px-1.5 py-0.5 rounded-full text-[10px] font-medium", TRANSACTION_STATUS_BG[tx.status])}>{TRANSACTION_STATUS_LABELS[tx.status]}</span>
                  </div>
                </div>
                <span className={cn("text-sm font-bold tabular-nums", TRANSACTION_TYPE_COLORS[tx.type])}>
                  {tx.type === "INCOME" ? "+" : tx.type === "EXPENSE" ? "-" : ""}{formatMoney(tx.amountCents)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
