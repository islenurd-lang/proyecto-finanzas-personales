interface SummaryCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  icon: React.ReactNode;
}

export default function SummaryCard({
  title,
  value,
  subtitle,
  trend,
  icon,
}: SummaryCardProps) {
  const trendColor =
    trend === "up"
      ? "text-emerald-600"
      : trend === "down"
        ? "text-rose-600"
        : "text-slate-500";

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className={`mt-1.5 text-2xl font-bold tracking-tight ${trendColor}`}>
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{subtitle}</p>
          )}
        </div>
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center text-navy-600">
          {icon}
        </div>
      </div>
    </div>
  );
}
