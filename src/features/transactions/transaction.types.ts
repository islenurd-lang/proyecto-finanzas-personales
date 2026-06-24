export const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  INCOME: "Ingreso",
  EXPENSE: "Gasto",
  TRANSFER: "Transferencia",
};

export const TRANSACTION_STATUS_LABELS: Record<string, string> = {
  CONFIRMED: "Confirmado",
  PENDING: "Pendiente",
};

export const TRANSACTION_TYPE_COLORS: Record<string, string> = {
  INCOME: "text-emerald-600",
  EXPENSE: "text-rose-600",
  TRANSFER: "text-navy-600",
};

export const TRANSACTION_TYPE_BG: Record<string, string> = {
  INCOME: "bg-emerald-50 text-emerald-700",
  EXPENSE: "bg-rose-50 text-rose-700",
  TRANSFER: "bg-navy-50 text-navy-700",
};

export const TRANSACTION_STATUS_BG: Record<string, string> = {
  CONFIRMED: "bg-emerald-50 text-emerald-700",
  PENDING: "bg-amber-50 text-amber-700",
};
