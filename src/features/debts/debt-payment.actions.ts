"use server";

import { revalidatePath } from "next/cache";
import { createDebtPaymentSchema } from "./debt-payment.schema";
import * as paymentService from "./debt-payment.service";

type ActionResult = { ok: true; message: string } | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

function extractFieldErrors(issues: { path: PropertyKey[]; message: string }[]) {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "form");
    if (!fieldErrors[key]) fieldErrors[key] = [];
    fieldErrors[key].push(issue.message);
  }
  return fieldErrors;
}

function revalidateAll() {
  revalidatePath("/debts");
  revalidatePath("/transactions");
  revalidatePath("/accounts");
  revalidatePath("/dashboard");
  revalidatePath("/budgets");
}

export async function createDebtPaymentAction(formData: FormData): Promise<ActionResult> {
  const raw = {
    debtId: formData.get("debtId") as string,
    accountId: formData.get("accountId") as string,
    amount: formData.get("amount") as string,
    paymentDate: formData.get("paymentDate") as string,
    description: (formData.get("description") as string) || "",
  };

  const result = createDebtPaymentSchema.safeParse(raw);
  if (!result.success) {
    return { ok: false, message: "Datos inválidos", fieldErrors: extractFieldErrors(result.error.issues) };
  }

  try {
    await paymentService.createDebtPayment({
      debtId: result.data.debtId,
      accountId: result.data.accountId,
      amountCents: result.data.amount,
      paymentDate: new Date(result.data.paymentDate),
      description: result.data.description,
    });
    revalidateAll();
    return { ok: true, message: "Pago registrado exitosamente" };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Error al registrar pago" };
  }
}

export async function deleteDebtPaymentAction(paymentId: string): Promise<ActionResult> {
  try {
    await paymentService.deleteDebtPayment(paymentId);
    revalidateAll();
    return { ok: true, message: "Pago eliminado" };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Error al eliminar pago" };
  }
}
