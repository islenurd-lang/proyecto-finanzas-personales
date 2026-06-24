"use client";

import { useState } from "react";
import { formatMoney, centsToDecimal } from "@/lib/money";
import { ACCOUNT_TYPE_LABELS, ACCOUNT_TYPE_ICONS } from "@/features/accounts/account.types";
import { createAccountAction, updateAccountAction, toggleAccountStatusAction } from "@/features/accounts/account.actions";
import Modal from "@/components/ui/modal";
import Input from "@/components/ui/input";
import Label from "@/components/ui/label";
import Select from "@/components/ui/select";
import FormError from "@/components/ui/form-error";
import EmptyState from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

interface AccountWithBalance {
  id: string;
  name: string;
  type: string;
  initialBalanceCents: number;
  currency: string;
  isActive: boolean;
  calculatedBalanceCents: number;
}

export default function AccountsClient({ accounts }: { accounts: AccountWithBalance[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AccountWithBalance | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function openCreate() {
    setEditing(null);
    setErrors({});
    setMessage("");
    setModalOpen(true);
  }

  function openEdit(account: AccountWithBalance) {
    setEditing(account);
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
      ? await updateAccountAction(editing.id, formData)
      : await createAccountAction(formData);

    setLoading(false);

    if (result.ok) {
      setModalOpen(false);
    } else {
      setMessage(result.message);
      if ("fieldErrors" in result && result.fieldErrors) setErrors(result.fieldErrors);
    }
  }

  async function handleToggle(id: string) {
    await toggleAccountStatusAction(id);
  }

  if (accounts.length === 0) {
    return (
      <EmptyState
        icon="🏦"
        title="Sin cuentas"
        description="Crea tu primera cuenta para comenzar a registrar movimientos."
        action={
          <button onClick={openCreate} className="px-4 py-2 bg-navy-600 text-white text-sm font-medium rounded-lg hover:bg-navy-700 transition-colors">
            Crear cuenta
          </button>
        }
      />
    );
  }

  return (
    <>
      <div className="flex justify-end">
        <button onClick={openCreate} className="px-4 py-2 bg-navy-600 text-white text-sm font-medium rounded-lg hover:bg-navy-700 transition-colors">
          + Nueva cuenta
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((acc) => (
          <div
            key={acc.id}
            className={cn(
              "bg-white dark:bg-slate-800 rounded-xl border p-5 transition-shadow hover:shadow-md",
              acc.isActive ? "border-slate-200" : "border-slate-200 opacity-60"
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{ACCOUNT_TYPE_ICONS[acc.type] ?? "📁"}</span>
                <div>
                  <p className="font-semibold text-slate-900">{acc.name}</p>
                  <p className="text-xs text-slate-500">{ACCOUNT_TYPE_LABELS[acc.type] ?? acc.type}</p>
                </div>
              </div>
              {!acc.isActive && (
                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Inactiva</span>
              )}
            </div>

            <p className={cn(
              "text-xl font-bold mt-4 tabular-nums",
              acc.calculatedBalanceCents >= 0 ? "text-slate-900" : "text-rose-600"
            )}>
              {formatMoney(acc.calculatedBalanceCents, acc.currency)}
            </p>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => openEdit(acc)}
                className="flex-1 text-xs px-3 py-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Editar
              </button>
              <button
                onClick={() => handleToggle(acc.id)}
                className={cn(
                  "flex-1 text-xs px-3 py-1.5 rounded-lg transition-colors",
                  acc.isActive
                    ? "border border-amber-300 text-amber-700 hover:bg-amber-50"
                    : "border border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                )}
              >
                {acc.isActive ? "Inactivar" : "Activar"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Editar cuenta" : "Nueva cuenta"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {message && (
            <div className="text-sm text-rose-600 bg-rose-50 px-3 py-2 rounded-lg">{message}</div>
          )}

          <div>
            <Label htmlFor="name" required>Nombre</Label>
            <Input
              id="name"
              name="name"
              defaultValue={editing?.name}
              placeholder="Ej: Banco Popular"
              error={errors.name?.[0]}
            />
            <FormError message={errors.name?.[0]} />
          </div>

          <div>
            <Label htmlFor="type" required>Tipo</Label>
            <Select id="type" name="type" defaultValue={editing?.type ?? "BANK"} error={errors.type?.[0]}>
              {Object.entries(ACCOUNT_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </Select>
            <FormError message={errors.type?.[0]} />
          </div>

          <div>
            <Label htmlFor="initialBalance">Balance inicial</Label>
            <Input
              id="initialBalance"
              name="initialBalance"
              type="text"
              inputMode="decimal"
              defaultValue={editing ? centsToDecimal(editing.initialBalanceCents).toFixed(2) : "0.00"}
              placeholder="0.00"
              error={errors.initialBalance?.[0]}
            />
            <FormError message={errors.initialBalance?.[0]} />
          </div>

          <input type="hidden" name="currency" value="DOP" />

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="flex-1 px-4 py-2 text-sm border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm bg-navy-600 text-white font-medium rounded-lg hover:bg-navy-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Guardando..." : editing ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
