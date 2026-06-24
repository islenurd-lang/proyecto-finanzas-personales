"use client";

import { useState } from "react";
import { formatMoney, centsToDecimal } from "@/lib/money";
import { DEBT_STATUS_CONFIG } from "@/features/debts/debt.types";
import { createDebtAction, updateDebtAction, deleteDebtAction } from "@/features/debts/debt.actions";
import { createDebtPaymentAction, deleteDebtPaymentAction } from "@/features/debts/debt-payment.actions";
import Modal from "@/components/ui/modal";
import Input from "@/components/ui/input";
import Label from "@/components/ui/label";
import Select from "@/components/ui/select";
import FormError from "@/components/ui/form-error";
import EmptyState from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

interface PaymentData {
  id: string;
  amountCents: number;
  paymentDate: string;
  accountName: string;
  description: string;
}

interface DebtData {
  id: string;
  creditorName: string;
  originalAmountCents: number;
  currentBalanceCents: number;
  interestRate: number | null;
  monthlyPaymentCents: number;
  dueDateStr: string;
  effectiveStatus: string;
  paidCents: number;
  progress: number;
  payments: PaymentData[];
}

interface Option { id: string; name: string }

export default function DebtsClient({ debts, accounts }: { debts: DebtData[]; accounts: Option[] }) {
  const [debtModalOpen, setDebtModalOpen] = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<DebtData | null>(null);
  const [payingDebt, setPayingDebt] = useState<DebtData | null>(null);
  const [expandedDebt, setExpandedDebt] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function openCreateDebt() { setEditingDebt(null); setErrors({}); setMessage(""); setDebtModalOpen(true); }
  function openEditDebt(d: DebtData) { setEditingDebt(d); setErrors({}); setMessage(""); setDebtModalOpen(true); }
  function openPay(d: DebtData) { setPayingDebt(d); setErrors({}); setMessage(""); setPayModalOpen(true); }

  async function handleDebtSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true); setErrors({}); setMessage("");
    const fd = new FormData(e.currentTarget);
    const result = editingDebt ? await updateDebtAction(editingDebt.id, fd) : await createDebtAction(fd);
    setLoading(false);
    if (result.ok) { setDebtModalOpen(false); } else { setMessage(result.message); if ("fieldErrors" in result && result.fieldErrors) setErrors(result.fieldErrors); }
  }

  async function handlePaySubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true); setErrors({}); setMessage("");
    const fd = new FormData(e.currentTarget);
    const result = await createDebtPaymentAction(fd);
    setLoading(false);
    if (result.ok) { setPayModalOpen(false); } else { setMessage(result.message); if ("fieldErrors" in result && result.fieldErrors) setErrors(result.fieldErrors); }
  }

  async function handleDeleteDebt(id: string) {
    if (!confirm("¿Eliminar esta deuda?")) return;
    const result = await deleteDebtAction(id);
    if (!result.ok) alert(result.message);
  }

  async function handleDeletePayment(paymentId: string) {
    if (!confirm("¿Eliminar este pago? Se revertirá el saldo y la transacción asociada.")) return;
    const result = await deleteDebtPaymentAction(paymentId);
    if (!result.ok) alert(result.message);
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <>
      <div className="flex justify-end">
        <button onClick={openCreateDebt} className="px-4 py-2 bg-navy-600 text-white text-sm font-medium rounded-lg hover:bg-navy-700 transition-colors">
          + Nueva deuda
        </button>
      </div>

      {debts.length === 0 ? (
        <EmptyState icon="📄" title="Sin deudas registradas" description="Registra tus deudas para llevar un control." action={<button onClick={openCreateDebt} className="px-4 py-2 bg-navy-600 text-white text-sm font-medium rounded-lg hover:bg-navy-700 transition-colors">Registrar deuda</button>} />
      ) : (
        <div className="space-y-4">
          {debts.map((d) => {
            const cfg = DEBT_STATUS_CONFIG[d.effectiveStatus] ?? DEBT_STATUS_CONFIG.ACTIVE;
            const isExpanded = expandedDebt === d.id;
            return (
              <div key={d.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{d.creditorName}</p>
                      <p className="text-xs text-slate-400 mt-0.5">Vence: {d.dueDateStr}</p>
                    </div>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", cfg.bg)}>{cfg.label}</span>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Pagado</span>
                      <span className="font-medium text-slate-900 tabular-nums">{formatMoney(d.paidCents)} / {formatMoney(d.originalAmountCents)}</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all", cfg.bar)} style={{ width: `${Math.min(d.progress, 100)}%` }} />
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Pendiente: {formatMoney(d.currentBalanceCents)}</span>
                      <span className="font-semibold" style={{ color: d.progress >= 100 ? "#047857" : "#1E3A5F" }}>{d.progress}%</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
                    <span>Cuota: {formatMoney(d.monthlyPaymentCents)}</span>
                    {d.interestRate !== null && <span>Tasa: {d.interestRate}%</span>}
                  </div>

                  <div className="flex gap-2 mt-4">
                    {d.effectiveStatus !== "PAID" && (
                      <button onClick={() => openPay(d)} className="flex-1 text-xs px-3 py-1.5 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-700 hover:bg-emerald-100 transition-colors font-medium">
                        Registrar pago
                      </button>
                    )}
                    <button onClick={() => openEditDebt(d)} className="flex-1 text-xs px-3 py-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">Editar</button>
                    <button onClick={() => handleDeleteDebt(d.id)} className="flex-1 text-xs px-3 py-1.5 border border-rose-300 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors">Eliminar</button>
                    {d.payments.length > 0 && (
                      <button onClick={() => setExpandedDebt(isExpanded ? null : d.id)} className="text-xs px-3 py-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
                        {isExpanded ? "Ocultar" : `Pagos (${d.payments.length})`}
                      </button>
                    )}
                  </div>
                </div>

                {isExpanded && d.payments.length > 0 && (
                  <div className="border-t border-slate-100 px-5 py-3 bg-slate-50 rounded-b-xl">
                    <p className="text-xs font-semibold text-slate-600 mb-2">Historial de pagos</p>
                    <div className="space-y-2">
                      {d.payments.map((p) => (
                        <div key={p.id} className="flex items-center justify-between text-sm">
                          <div>
                            <span className="font-medium text-slate-800">{formatMoney(p.amountCents)}</span>
                            <span className="text-xs text-slate-400 ml-2">{p.paymentDate} · {p.accountName}</span>
                            {p.description && <span className="text-xs text-slate-400 ml-1">· {p.description}</span>}
                          </div>
                          <button onClick={() => handleDeletePayment(p.id)} className="text-xs px-2 py-1 border border-rose-300 rounded text-rose-600 hover:bg-rose-50 transition-colors">
                            Eliminar
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Debt Create/Edit Modal */}
      <Modal open={debtModalOpen} onClose={() => setDebtModalOpen(false)} title={editingDebt ? "Editar deuda" : "Nueva deuda"}>
        <form onSubmit={handleDebtSubmit} className="space-y-4">
          {message && <div className="text-sm text-rose-600 bg-rose-50 px-3 py-2 rounded-lg">{message}</div>}
          <div>
            <Label htmlFor="dt-name" required>Acreedor</Label>
            <Input id="dt-name" name="creditorName" defaultValue={editingDebt?.creditorName} placeholder="Ej: Banco Popular" error={errors.creditorName?.[0]} />
            <FormError message={errors.creditorName?.[0]} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="dt-original" required>Monto original</Label>
              <Input id="dt-original" name="originalAmount" type="text" inputMode="decimal" defaultValue={editingDebt ? centsToDecimal(editingDebt.originalAmountCents).toFixed(2) : ""} placeholder="0.00" error={errors.originalAmount?.[0]} />
              <FormError message={errors.originalAmount?.[0]} />
            </div>
            <div>
              <Label htmlFor="dt-balance" required>Saldo pendiente</Label>
              <Input id="dt-balance" name="currentBalance" type="text" inputMode="decimal" defaultValue={editingDebt ? centsToDecimal(editingDebt.currentBalanceCents).toFixed(2) : ""} placeholder="0.00" error={errors.currentBalance?.[0]} />
              <FormError message={errors.currentBalance?.[0]} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="dt-rate">Tasa de interés (%)</Label>
              <Input id="dt-rate" name="interestRate" type="text" inputMode="decimal" defaultValue={editingDebt?.interestRate?.toString() ?? ""} placeholder="Ej: 18" error={errors.interestRate?.[0]} />
              <FormError message={errors.interestRate?.[0]} />
            </div>
            <div>
              <Label htmlFor="dt-monthly" required>Cuota mensual</Label>
              <Input id="dt-monthly" name="monthlyPayment" type="text" inputMode="decimal" defaultValue={editingDebt ? centsToDecimal(editingDebt.monthlyPaymentCents).toFixed(2) : ""} placeholder="0.00" error={errors.monthlyPayment?.[0]} />
              <FormError message={errors.monthlyPayment?.[0]} />
            </div>
          </div>
          <div>
            <Label htmlFor="dt-due" required>Fecha de vencimiento</Label>
            <Input id="dt-due" name="dueDate" type="date" defaultValue={editingDebt?.dueDateStr ?? ""} error={errors.dueDate?.[0]} />
            <FormError message={errors.dueDate?.[0]} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setDebtModalOpen(false)} className="flex-1 px-4 py-2 text-sm border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 text-sm bg-navy-600 text-white font-medium rounded-lg hover:bg-navy-700 disabled:opacity-50 transition-colors">{loading ? "Guardando..." : editingDebt ? "Actualizar" : "Registrar"}</button>
          </div>
        </form>
      </Modal>

      {/* Payment Modal */}
      <Modal open={payModalOpen} onClose={() => setPayModalOpen(false)} title={`Pago: ${payingDebt?.creditorName ?? ""}`}>
        <form onSubmit={handlePaySubmit} className="space-y-4">
          {message && <div className="text-sm text-rose-600 bg-rose-50 px-3 py-2 rounded-lg">{message}</div>}
          <input type="hidden" name="debtId" value={payingDebt?.id ?? ""} />

          <div className="bg-slate-50 rounded-lg p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Saldo pendiente</span>
              <span className="font-bold text-slate-900">{payingDebt ? formatMoney(payingDebt.currentBalanceCents) : "—"}</span>
            </div>
          </div>

          <div>
            <Label htmlFor="pay-account" required>Cuenta origen</Label>
            <Select id="pay-account" name="accountId" error={errors.accountId?.[0]}>
              <option value="">Seleccionar cuenta</option>
              {accounts.map((a) => (<option key={a.id} value={a.id}>{a.name}</option>))}
            </Select>
            <FormError message={errors.accountId?.[0]} />
          </div>

          <div>
            <Label htmlFor="pay-amount" required>Monto del pago</Label>
            <Input id="pay-amount" name="amount" type="text" inputMode="decimal" placeholder="0.00" error={errors.amount?.[0]} />
            {payingDebt && <p className="text-xs text-slate-400 mt-1">Máximo: {formatMoney(payingDebt.currentBalanceCents)}</p>}
            <FormError message={errors.amount?.[0]} />
          </div>

          <div>
            <Label htmlFor="pay-date" required>Fecha de pago</Label>
            <Input id="pay-date" name="paymentDate" type="date" defaultValue={today} error={errors.paymentDate?.[0]} />
            <FormError message={errors.paymentDate?.[0]} />
          </div>

          <div>
            <Label htmlFor="pay-desc">Descripción</Label>
            <Input id="pay-desc" name="description" placeholder="Opcional" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setPayModalOpen(false)} className="flex-1 px-4 py-2 text-sm border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 text-sm bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors">{loading ? "Procesando..." : "Registrar pago"}</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
