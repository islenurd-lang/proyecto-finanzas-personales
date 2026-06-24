"use server";

import { revalidatePath } from "next/cache";
import { createBudgetSchema } from "./budget.schema";
import * as budgetService from "./budget.service";

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

export async function createBudgetAction(formData: FormData): Promise<ActionResult> {
  const raw = {
    categoryId: formData.get("categoryId") as string,
    month: formData.get("month") as string,
    year: formData.get("year") as string,
    limitAmount: formData.get("limitAmount") as string,
  };

  const result = createBudgetSchema.safeParse(raw);
  if (!result.success) {
    return { ok: false, message: "Datos inválidos", fieldErrors: extractFieldErrors(result.error.issues) };
  }

  try {
    await budgetService.createBudget({
      categoryId: result.data.categoryId,
      month: result.data.month,
      year: result.data.year,
      limitAmountCents: result.data.limitAmount,
    });
    revalidatePath("/budgets");
    revalidatePath("/dashboard");
    return { ok: true, message: "Presupuesto creado exitosamente" };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Error al crear presupuesto" };
  }
}

export async function updateBudgetAction(id: string, formData: FormData): Promise<ActionResult> {
  const raw = { limitAmount: formData.get("limitAmount") as string };

  const cleaned = raw.limitAmount.replace(/[^0-9.,\-]/g, "").replace(",", ".");
  const num = parseFloat(cleaned);
  if (isNaN(num) || num <= 0) {
    return { ok: false, message: "El monto debe ser mayor a 0", fieldErrors: { limitAmount: ["El monto debe ser mayor a 0"] } };
  }

  try {
    await budgetService.updateBudget(id, { limitAmountCents: Math.round(num * 100) });
    revalidatePath("/budgets");
    revalidatePath("/dashboard");
    return { ok: true, message: "Presupuesto actualizado" };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Error al actualizar" };
  }
}

export async function deleteBudgetAction(id: string): Promise<ActionResult> {
  try {
    await budgetService.deleteBudget(id);
    revalidatePath("/budgets");
    revalidatePath("/dashboard");
    return { ok: true, message: "Presupuesto eliminado" };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Error al eliminar" };
  }
}
