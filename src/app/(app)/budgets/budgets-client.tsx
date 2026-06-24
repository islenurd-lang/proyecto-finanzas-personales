"use client";

import { useState } from "react";
import { formatMoney, centsToDecimal } from "@/lib/money";
import { BUDGET_STATUS_CONFIG, MONTHS } from "@/features/budgets/budget.types";
import type { BudgetStatus } from "@/features/budgets/budget.types";
import { createBudgetAction, updateBudgetAction, deleteBudgetAction } from "@/features/budgets/budget.actions";
import Modal from "@/components/ui/modal";
import Input from "@/components/ui/input";
import Label from "@/components/ui/label";
import Select from "@/components/ui/select";
import FormError from "@/components/ui/form-error";
import EmptyState from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

interface BudgetData {
  id: string;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  month: number;
  year: number;
  limitAmountCents: number;
  spentCents: number;
  percentage: number;
  status: BudgetStatus;
}

interface Option { id: string; name: string }

interface Props {
  budgets: BudgetData[];
  categories: Option[];
  currentMonth: number;
  currentYear: number;
}

export default function BudgetsClient({ budgets, categories, currentMonth, currentYear }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BudgetData | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function openCreate() {
    setEditing(null);
    setErrors({});
    setMessage("");
    setModalOpen(true);
  }

  function openEdit(b: BudgetData) {
    setEditing(b);
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
      ? await updateBudgetAction(editing.id, formData)
      : await createBudgetAction(formData);

    setLoading(false);
    if (result.ok) {
      setModalOpen(false);
    } else {
      setMessage(result.message);
      if ("fieldErrors" in result && result.fieldErrors) setErrors(result.fieldErrors);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este presupuesto?")) return;
    const result = await deleteBudgetAction(id);
    if (!result.ok) alert(result.message);
  }

  return (
    <>
      <div className="flex justify-end">
        <button onClick={openCreate} className="px-4 py-2 bg-navy-600 text-white text-sm font-medium rounded-lg hover:bg-navy-700 transition-colors">
          + Nuevo presupuesto
        </button>
      </div>

      {budgets.length === 0 ? (
        <EmptyState
          icon="📋"
          title="Sin presupuestos"
          description="Crea presupuestos mensuales para controlar tus gastos por categoría."
          action={
            <button onClick={openCreate} className="px-4 py-2 bg-navy-600 text-white text-sm font-medium rounded-lg hover:bg-navy-700 transition-colors">
              Crear presupuesto
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((b) => {
            const cfg = BUDGET_STATUS_CONFIG[b.status];
            return (
              <div key={b.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                      style={{ backgroundColor: b.categoryColor }}
                    >
                      {b.categoryName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{b.categoryName}</p>
                      <p className="text-xs text-slate-400">{MONTHS.find(m => m.value === b.month)?.label} {b.year}</p>
                    </div>
                  </div>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", cfg.bg)}>
                    {cfg.label}
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Consumido</span>
                    <span className="font-medium text-slate-900">
                      {formatMoney(b.spentCents)} / {formatMoney(b.limitAmountCents)}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", cfg.bar)}
                      style={{ width: `${Math.min(b.percentage, 100)}%` }}
                    />
                  </div>
                  <p className="text-right text-xs font-semibold" style={{ color: b.percentage >= 100 ? "#BE123C" : b.percentage >= 80 ? "#B45309" : "#047857" }}>
                    {b.percentage}%
                  </p>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => openEdit(b)}
                    className="flex-1 text-xs px-3 py-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(b.id)}
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
        title={editing ? "Editar presupuesto" : "Nuevo presupuesto"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {message && (
            <div className="text-sm text-rose-600 bg-rose-50 px-3 py-2 rounded-lg">{message}</div>
          )}

          {!editing && (
            <>
              <div>
                <Label htmlFor="bg-cat" required>Categoría de gasto</Label>
                <Select id="bg-cat" name="categoryId" error={errors.categoryId?.[0]}>
                  <option value="">Seleccionar categoría</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>
                <FormError message={errors.categoryId?.[0]} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="bg-month" required>Mes</Label>
                  <Select id="bg-month" name="month" defaultValue={currentMonth} error={errors.month?.[0]}>
                    {MONTHS.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </Select>
                  <FormError message={errors.month?.[0]} />
                </div>
                <div>
                  <Label htmlFor="bg-year" required>Año</Label>
                  <Input id="bg-year" name="year" type="number" defaultValue={currentYear} error={errors.year?.[0]} />
                  <FormError message={errors.year?.[0]} />
                </div>
              </div>
            </>
          )}

          <div>
            <Label htmlFor="bg-limit" required>Monto límite</Label>
            <Input
              id="bg-limit"
              name="limitAmount"
              type="text"
              inputMode="decimal"
              defaultValue={editing ? centsToDecimal(editing.limitAmountCents).toFixed(2) : ""}
              placeholder="0.00"
              error={errors.limitAmount?.[0]}
            />
            <FormError message={errors.limitAmount?.[0]} />
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
