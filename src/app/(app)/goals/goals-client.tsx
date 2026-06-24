"use client";

import { useState } from "react";
import { formatMoney, centsToDecimal } from "@/lib/money";
import { GOAL_STATUS_CONFIG } from "@/features/goals/goal.types";
import type { GoalStatus } from "@/features/goals/goal.types";
import { createSavingGoalAction, updateSavingGoalAction, deleteSavingGoalAction } from "@/features/goals/goal.actions";
import Modal from "@/components/ui/modal";
import Input from "@/components/ui/input";
import Label from "@/components/ui/label";
import Select from "@/components/ui/select";
import FormError from "@/components/ui/form-error";
import EmptyState from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

interface GoalData {
  id: string;
  name: string;
  targetAmountCents: number;
  currentAmountCents: number;
  targetDate: string;
  accountId: string;
  accountName: string | null;
  isCompleted: boolean;
  progress: number;
  status: GoalStatus;
}

interface Option { id: string; name: string }

export default function GoalsClient({ goals, accounts }: { goals: GoalData[]; accounts: Option[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<GoalData | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function openCreate() {
    setEditing(null);
    setErrors({});
    setMessage("");
    setModalOpen(true);
  }

  function openEdit(g: GoalData) {
    setEditing(g);
    setErrors({});
    setMessage("");
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setMessage("");

    const formData = new FormData(e.currentTarget);
    const result = editing
      ? await updateSavingGoalAction(editing.id, formData)
      : await createSavingGoalAction(formData);

    setLoading(false);
    if (result.ok) {
      setModalOpen(false);
    } else {
      setMessage(result.message);
      if ("fieldErrors" in result && result.fieldErrors) setErrors(result.fieldErrors);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta meta de ahorro?")) return;
    const result = await deleteSavingGoalAction(id);
    if (!result.ok) alert(result.message);
  }

  return (
    <>
      <div className="flex justify-end">
        <button onClick={openCreate} className="px-4 py-2 bg-navy-600 text-white text-sm font-medium rounded-lg hover:bg-navy-700 transition-colors">
          + Nueva meta
        </button>
      </div>

      {goals.length === 0 ? (
        <EmptyState
          icon="🎯"
          title="Sin metas de ahorro"
          description="Crea metas para visualizar tu progreso hacia tus objetivos financieros."
          action={
            <button onClick={openCreate} className="px-4 py-2 bg-navy-600 text-white text-sm font-medium rounded-lg hover:bg-navy-700 transition-colors">
              Crear meta
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((g) => {
            const cfg = GOAL_STATUS_CONFIG[g.status];
            return (
              <div key={g.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{g.name}</p>
                    {g.accountName && (
                      <p className="text-xs text-slate-400 mt-0.5">{g.accountName}</p>
                    )}
                  </div>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", cfg.bg)}>
                    {cfg.label}
                  </span>
                </div>

                {/* Progress circle */}
                <div className="flex items-center gap-4 mt-4">
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                      <circle cx="32" cy="32" r="28" fill="none" stroke="#E2E8F0" strokeWidth="6" />
                      <circle
                        cx="32" cy="32" r="28" fill="none"
                        stroke={g.isCompleted ? "#10B981" : g.status === "OVERDUE" ? "#F43F5E" : "#3B82F6"}
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={`${(g.progress / 100) * 175.93} 175.93`}
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-700">
                      {g.progress}%
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-500">Acumulado</p>
                    <p className="text-lg font-bold text-slate-900 tabular-nums">
                      {formatMoney(g.currentAmountCents)}
                    </p>
                    <p className="text-xs text-slate-400">
                      de {formatMoney(g.targetAmountCents)}
                    </p>
                  </div>
                </div>

                {g.targetDate && (
                  <p className="text-xs text-slate-400 mt-3">
                    Fecha objetivo: {g.targetDate}
                  </p>
                )}

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => openEdit(g)}
                    className="flex-1 text-xs px-3 py-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(g.id)}
                    className="flex-1 text-xs px-3 py-1.5 border border-rose-300 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Editar meta" : "Nueva meta"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {message && (
            <div className="text-sm text-rose-600 bg-rose-50 px-3 py-2 rounded-lg">{message}</div>
          )}

          <div>
            <Label htmlFor="gl-name" required>Nombre</Label>
            <Input id="gl-name" name="name" defaultValue={editing?.name} placeholder="Ej: Fondo de emergencia" error={errors.name?.[0]} />
            <FormError message={errors.name?.[0]} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="gl-target" required>Monto objetivo</Label>
              <Input
                id="gl-target" name="targetAmount" type="text" inputMode="decimal"
                defaultValue={editing ? centsToDecimal(editing.targetAmountCents).toFixed(2) : ""}
                placeholder="0.00" error={errors.targetAmount?.[0]}
              />
              <FormError message={errors.targetAmount?.[0]} />
            </div>
            <div>
              <Label htmlFor="gl-current">Monto acumulado</Label>
              <Input
                id="gl-current" name="currentAmount" type="text" inputMode="decimal"
                defaultValue={editing ? centsToDecimal(editing.currentAmountCents).toFixed(2) : "0.00"}
                placeholder="0.00" error={errors.currentAmount?.[0]}
              />
              <FormError message={errors.currentAmount?.[0]} />
            </div>
          </div>

          <div>
            <Label htmlFor="gl-date">Fecha objetivo</Label>
            <Input id="gl-date" name="targetDate" type="date" defaultValue={editing?.targetDate ?? ""} />
          </div>

          <div>
            <Label htmlFor="gl-account">Cuenta asociada</Label>
            <Select id="gl-account" name="accountId" defaultValue={editing?.accountId ?? ""}>
              <option value="">Sin cuenta asociada</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </Select>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 px-4 py-2 text-sm border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 text-sm bg-navy-600 text-white font-medium rounded-lg hover:bg-navy-700 disabled:opacity-50 transition-colors">
              {loading ? "Guardando..." : editing ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
