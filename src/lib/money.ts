const CURRENCY_CONFIG: Record<string, { symbol: string; locale: string }> = {
  DOP: { symbol: "RD$", locale: "es-DO" },
  USD: { symbol: "$", locale: "en-US" },
  EUR: { symbol: "€", locale: "es-ES" },
};

export function formatMoney(cents: number, currency = "DOP"): string {
  const config = CURRENCY_CONFIG[currency] ?? CURRENCY_CONFIG.DOP;
  const value = cents / 100;
  return `${config.symbol} ${value.toLocaleString(config.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function centsToDecimal(cents: number): number {
  return cents / 100;
}

export function decimalToCents(decimal: number): number {
  return Math.round(decimal * 100);
}
