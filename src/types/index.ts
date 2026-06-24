export type TransactionType = "INGRESO" | "GASTO" | "TRANSFERENCIA";
export type TransactionStatus = "CONFIRMADO" | "PENDIENTE";

export interface MockTransaction {
  id: string;
  description: string;
  amountCents: number;
  type: TransactionType;
  category: string;
  date: string;
}

export interface MockMetric {
  title: string;
  valueCents: number;
  subtitle?: string;
  trend: "up" | "down" | "neutral";
}

export interface BudgetAlert {
  category: string;
  limitCents: number;
  spentCents: number;
}
