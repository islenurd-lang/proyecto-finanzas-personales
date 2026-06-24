"use server";

import { revalidatePath } from "next/cache";
import { createDebtSchema } from "./debt.schema";
import * as debtService from "./debt.service";

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

export async function createDebtAction(formData: FormData): Promise<ActionResult> {
  const raw = {
    creditorName: formData.get("creditorName") as string,
    originalAmount: formData.get("originalAmount") as string,
    currentBalance: formData.get("currentBalance") as string,
    interestRate: (formData.get("interestRate") as string) || "",
    monthlyPayment: formData.get("monthlyPayment") as string,
    dueDate: formData.get("dueDate") as string,
  };

  const result = createDebtSchema.safeParse(raw);
  if (!result.success) {
    return { ok: false, message: "Datos inválidos", fieldErrors: extractFieldErrors(result.error.issues) };
  }

  try {
    await debtService.createDebt({
      creditorName: result.data.creditorName,
      originalAmountCents: result.data.originalAmount,
      currentBalanceCents: result.data.currentBalance,
      interestRate: result.data.interestRate,
      monthlyPaymentCents: result.data.monthlyPayment,
      dueDate: new Date(result.data.dueDate),
    });
    revalidatePath("/debts");
    revalidatePath("/dashboard");
    return { ok: true, message: "Deuda registrada exitosamente" };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Error al crear deuda" };
  }
}

export async function updateDebtAction(id: string, formData: FormData): Promise<ActionResult> {
  const raw = {
    creditorName: formData.get("creditorName") as string,
    originalAmount: formData.get("originalAmount") as string,
    currentBalance: formData.get("currentBalance") as string,
    interestRate: (formData.get("interestRate") as string) || "",
    monthlyPayment: formData.get("monthlyPayment") as string,
    dueDate: formData.get("dueDate") as string,
  };

  const result = createDebtSchema.safeParse(raw);
  if (!result.success) {
    return { ok: false, message: "Datos inválidos", fieldErrors: extractFieldErrors(result.error.issues) };
  }

  try {
    await debtService.updateDebt(id, {
      creditorName: result.data.creditorName,
      originalAmountCents: result.data.originalAmount,
      currentBalanceCents: result.data.currentBalance,
      interestRate: result.data.interestRate,
      monthlyPaymentCents: result.data.monthlyPayment,
      dueDate: new Date(result.data.dueDate),
    });
    revalidatePath("/debts");
    revalidatePath("/dashboard");
    return { ok: true, message: "Deuda actualizada" };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Error al actualizar" };
  }
}

export async function deleteDebtAction(id: string): Promise<ActionResult> {
  try {
    await debtService.deleteDebt(id);
    revalidatePath("/debts");
    revalidatePath("/dashboard");
    return { ok: true, message: "Deuda eliminada" };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Error al eliminar" };
  }
}
