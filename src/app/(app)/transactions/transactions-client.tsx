"use client";

import { useState } from "react";
import { formatMoney, centsToDecimal } from "@/lib/money";
import {
  TRANSACTION_TYPE_LABELS,
  TRANSACTION_STATUS_LABELS,
  TRANSACTION_TYPE_BG,
  TRANSACTION_STATUS_BG,
  TRANSACTION_TYPE_COLORS,
} from "@/features/transactions/transaction.types";
import {
  createTransactionAction,
  updateTransactionAction,
  deleteTransactionAction,
} from "@/features/transactions/transaction.actions";
import Modal from "@/components/ui/modal";
import Input from "@/components/ui/input";
import Label from "@/components/ui/label";
import Select from "@/components/ui/select";
import FormError from "@/components/ui/form-error";
import EmptyState from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

interface TxData {
  id: string;
  type: string;
  amountCents: number;
  date: string;
  description: string;
  status: string;
  sourceAccountId: string;
  destinationAccountId: string;
  categoryId: string;
  sourceAccountName: string;
  destinationAccountName: string;
  categoryName: string;
  categoryColor: string;
}

interface Option {
  id: string;
  name: string;
}

interface Props {
  transactions: TxData[];
  accounts: Option[];
  incomeCategories: Option[];
  expenseCategories: Option[];
}

export default function TransactionsClient({
  transactions,
  accounts,
  incomeCategories,
  expenseCategories,
}: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TxData | null>(null);
  const [txType, setTxType] = useState<string>("EXPENSE");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const filtered = transactions.filter((tx) => {
    if (filterType && tx.type !== filterType) return false;
    if (filterStatus && tx.status !== filterStatus) return false;
    return true;
  });

  function openCreate() {
    setEditing(null);
    setTxType("EXPENSE");
    setErrors({});
    setMessage("");
    setModalOpen(true);
  }

  function openEdit(tx: TxData) {
    setEditing(tx);
    setTxType(tx.type);
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
      ? await updateTransactionAction(editing.id, formData)
      : await createTransactionAction(formData);

    setLoading(false);

    if (result.ok) {
      setModalOpen(false);
    } else {
      setMessage(result.message);
      if ("fieldErrors" in result && result.fieldErrors) setErrors(result.fieldErrors);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta transacción? Esta acción no se puede deshacer.")) return;
    const result = await deleteTransactionAction(id);
    if (!result.ok) alert(result.message);
  }

  const categories = txType === "INCOME" ? incomeCategories : expenseCategories;
  const today = new Date().toISOString().split("T")[0];

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Select
          className="w-auto"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">Todos los tipos</option>
          <option value="INCOME">Ingresos</option>
          <option value="EXPENSE">Gastos</option>
          <option value="TRANSFER">Transferencias</option>
        </Select>
        <Select
          className="w-auto"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="CONFIRMED">Confirmados</option>
          <option value="PENDING">Pendientes</option>
        </Select>
        <div className="flex-1" />
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-navy-600 text-white text-sm font-medium rounded-lg hover:bg-navy-700 transition-colors"
        >
          + Nueva transacción
        </button>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="💸"
          title="Sin transacciones"
          description="Crea tu primera transacción para comenzar."
          action={
            <button
              onClick={openCreate}
              className="px-4 py-2 bg-navy-600 text-white text-sm font-medium rounded-lg hover:bg-navy-700 transition-colors"
            >
              Crear transacción
            </button>
          }
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((tx) => (
            <div
              key={tx.id}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                {/* Color dot */}
                <div
                  className="w-2.5 h-10 rounded-full flex-shrink-0"
                  style={{ backgroundColor: tx.categoryColor }}
                />
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-slate-900 truncate">
                      {tx.description || TRANSACTION_TYPE_LABELS[tx.type]}
                    </p>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", TRANSACTION_TYPE_BG[tx.type])}>
                      {TRANSACTION_TYPE_LABELS[tx.type]}
                    </span>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", TRANSACTION_STATUS_BG[tx.status])}>
                      {TRANSACTION_STATUS_LABELS[tx.status]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 flex-wrap">
                    <span>{tx.date}</span>
                    {tx.categoryName && <span>· {tx.categoryName}</span>}
                    {tx.type === "INCOME" && tx.destinationAccountName && (
                      <span>· → {tx.destinationAccountName}</span>
                    )}
                    {tx.type === "EXPENSE" && tx.sourceAccountName && (
                      <span>· {tx.sourceAccountName}</span>
                    )}
                    {tx.type === "TRANSFER" && (
                      <span>· {tx.sourceAccountName} → {tx.destinationAccountName}</span>
                    )}
                  </div>
                </div>
                {/* Amount */}
                <div className="text-right flex-shrink-0">
                  <p className={cn("text-base font-bold tabular-nums", TRANSACTION_TYPE_COLORS[tx.type])}>
                    {tx.type === "INCOME" ? "+" : tx.type === "EXPENSE" ? "-" : ""}
                    {formatMoney(tx.amountCents)}
                  </p>
                </div>
                {/* Actions */}
                <div className="flex flex-col gap-1 flex-shrink-0">
                  <button
                    onClick={() => openEdit(tx)}
                    className="text-xs px-2 py-1 border border-slate-300 rounded text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(tx.id)}
                    className="text-xs px-2 py-1 border border-rose-300 rounded text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Editar transacción" : "Nueva transacción"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {message && (
            <div className="text-sm text-rose-600 bg-rose-50 px-3 py-2 rounded-lg">{message}</div>
          )}

          {/* Type */}
          <div>
            <Label required>Tipo</Label>
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
              {(["EXPENSE", "INCOME", "TRANSFER"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTxType(t)}
                  className={cn(
                    "flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    txType === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  {TRANSACTION_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
            <input type="hidden" name="type" value={txType} />
            <FormError message={errors.type?.[0]} />
          </div>

          {/* Amount */}
          <div>
            <Label htmlFor="tx-amount" required>Monto</Label>
            <Input
              id="tx-amount"
              name="amount"
              type="text"
              inputMode="decimal"
              defaultValue={editing ? centsToDecimal(editing.amountCents).toFixed(2) : ""}
              placeholder="0.00"
              error={errors.amount?.[0]}
            />
            <FormError message={errors.amount?.[0]} />
          </div>

          {/* Date */}
          <div>
            <Label htmlFor="tx-date" required>Fecha</Label>
            <Input
              id="tx-date"
              name="date"
              type="date"
              defaultValue={editing?.date ?? today}
              error={errors.date?.[0]}
            />
            <FormError message={errors.date?.[0]} />
          </div>

          {/* Source Account */}
          {(txType === "EXPENSE" || txType === "TRANSFER") && (
            <div>
              <Label htmlFor="tx-source" required>Cuenta origen</Label>
              <Select
                id="tx-source"
                name="sourceAccountId"
                defaultValue={editing?.sourceAccountId ?? ""}
                error={errors.sourceAccountId?.[0]}
              >
                <option value="">Seleccionar cuenta</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </Select>
              <FormError message={errors.sourceAccountId?.[0]} />
            </div>
          )}

          {/* Destination Account */}
          {(txType === "INCOME" || txType === "TRANSFER") && (
            <div>
              <Label htmlFor="tx-dest" required>Cuenta destino</Label>
              <Select
                id="tx-dest"
                name="destinationAccountId"
                defaultValue={editing?.destinationAccountId ?? ""}
                error={errors.destinationAccountId?.[0]}
              >
                <option value="">Seleccionar cuenta</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </Select>
              <FormError message={errors.destinationAccountId?.[0]} />
            </div>
          )}

          {/* Category */}
          {txType !== "TRANSFER" && (
            <div>
              <Label htmlFor="tx-category" required>Categoría</Label>
              <Select
                id="tx-category"
                name="categoryId"
                defaultValue={editing?.categoryId ?? ""}
                error={errors.categoryId?.[0]}
              >
                <option value="">Seleccionar categoría</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
              <FormError message={errors.categoryId?.[0]} />
            </div>
          )}

          {/* Description */}
          <div>
            <Label htmlFor="tx-desc">Descripción</Label>
            <Input
              id="tx-desc"
              name="description"
              defaultValue={editing?.description ?? ""}
              placeholder="Opcional"
            />
          </div>

          {/* Status */}
          <div>
            <Label htmlFor="tx-status" required>Estado</Label>
            <Select id="tx-status" name="status" defaultValue={editing?.status ?? "CONFIRMED"}>
              <option value="CONFIRMED">Confirmado</option>
              <option value="PENDING">Pendiente</option>
            </Select>
          </div>

          {/* Actions */}
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
