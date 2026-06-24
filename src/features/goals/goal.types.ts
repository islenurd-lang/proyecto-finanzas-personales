export type GoalStatus = "IN_PROGRESS" | "COMPLETED" | "NEAR_DUE" | "OVERDUE";

export function getGoalStatus(
  isCompleted: boolean,
  targetDate: Date | null,
): GoalStatus {
  if (isCompleted) return "COMPLETED";
  if (targetDate) {
    const now = new Date();
    if (now > targetDate) return "OVERDUE";
    const daysLeft = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 30) return "NEAR_DUE";
  }
  return "IN_PROGRESS";
}

export const GOAL_STATUS_CONFIG: Record<GoalStatus, { label: string; bg: string }> = {
  IN_PROGRESS: { label: "En progreso", bg: "bg-navy-50 text-navy-700" },
  COMPLETED: { label: "Completada", bg: "bg-emerald-50 text-emerald-700" },
  NEAR_DUE: { label: "Próxima a vencer", bg: "bg-amber-50 text-amber-700" },
  OVERDUE: { label: "Vencida", bg: "bg-rose-50 text-rose-700" },
};
