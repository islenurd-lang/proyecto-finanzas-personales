export const APP_NAME = "FinanzApp";
export const DEFAULT_CURRENCY = "DOP";

export interface NavItem {
  href: string;
  label: string;
  icon: string;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/accounts", label: "Cuentas", icon: "🏦" },
  { href: "/transactions", label: "Transacciones", icon: "💸" },
  { href: "/categories", label: "Categorías", icon: "🏷️" },
  { href: "/budgets", label: "Presupuestos", icon: "📋" },
  { href: "/goals", label: "Metas de Ahorro", icon: "🎯" },
  { href: "/debts", label: "Deudas", icon: "📄" },
  { href: "/reports", label: "Reportes", icon: "📈" },
  { href: "/settings", label: "Configuración", icon: "⚙️" },
];

export const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/accounts": "Cuentas",
  "/transactions": "Transacciones",
  "/categories": "Categorías",
  "/budgets": "Presupuestos",
  "/goals": "Metas de Ahorro",
  "/debts": "Deudas",
  "/reports": "Reportes",
  "/settings": "Configuración",
};
