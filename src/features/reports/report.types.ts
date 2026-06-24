export interface ReportFilters {
  dateFrom?: string;
  dateTo?: string;
  accountId?: string;
  categoryId?: string;
  type?: string;
  status?: string;
}

export interface MonthlyData {
  month: string;
  ingresos: number;
  gastos: number;
}

export interface CategoryBreakdown {
  name: string;
  value: number;
  color: string;
}

export interface MonthComparison {
  label: string;
  current: number;
  previous: number;
  changePercent: number;
}
