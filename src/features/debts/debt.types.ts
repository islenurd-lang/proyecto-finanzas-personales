export const DEBT_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Activa",
  PAID: "Pagada",
  OVERDUE: "Vencida",
};

export const DEBT_STATUS_CONFIG: Record<string, { label: string; bg: string; bar: string }> = {
  ACTIVE: { label: "Activa", bg: "bg-navy-50 text-navy-700", bar: "bg-navy-500" },
  PAID: { label: "Pagada", bg: "bg-emerald-50 text-emerald-700", bar: "bg-emerald-500" },
  OVERDUE: { label: "Vencida", bg: "bg-rose-50 text-rose-700", bar: "bg-rose-500" },
};

export function calculateEffectiveStatus(
  currentBalanceCents: number,
  dueDate: Date
): "ACTIVE" | "PAID" | "OVERDUE" {
  if (currentBalanceCents <= 0) return "PAID";
  if (new Date() > dueDate) return "OVERDUE";
  return "ACTIVE";
}
