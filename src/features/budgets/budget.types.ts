export type BudgetStatus = "NORMAL" | "WARNING" | "EXCEEDED";

export function getBudgetStatus(usagePercentage: number): BudgetStatus {
  if (usagePercentage >= 100) return "EXCEEDED";
  if (usagePercentage >= 80) return "WARNING";
  return "NORMAL";
}

export const BUDGET_STATUS_CONFIG: Record<BudgetStatus, { label: string; bg: string; bar: string }> = {
  NORMAL: { label: "Normal", bg: "bg-emerald-50 text-emerald-700", bar: "bg-emerald-500" },
  WARNING: { label: "Advertencia", bg: "bg-amber-50 text-amber-700", bar: "bg-amber-500" },
  EXCEEDED: { label: "Excedido", bg: "bg-rose-50 text-rose-700", bar: "bg-rose-500" },
};

export const MONTHS = [
  { value: 1, label: "Enero" },
  { value: 2, label: "Febrero" },
  { value: 3, label: "Marzo" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Mayo" },
  { value: 6, label: "Junio" },
  { value: 7, label: "Julio" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Septiembre" },
  { value: 10, label: "Octubre" },
  { value: 11, label: "Noviembre" },
  { value: 12, label: "Diciembre" },
];
