"use server";

import { revalidatePath } from "next/cache";
import { createGoalSchema } from "./goal.schema";
import * as goalService from "./goal.service";

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

export async function createSavingGoalAction(formData: FormData): Promise<ActionResult> {
  const raw = {
    name: formData.get("name") as string,
    targetAmount: formData.get("targetAmount") as string,
    currentAmount: (formData.get("currentAmount") as string) || "0",
    targetDate: (formData.get("targetDate") as string) || "",
    accountId: (formData.get("accountId") as string) || "",
  };

  const result = createGoalSchema.safeParse(raw);
  if (!result.success) {
    return { ok: false, message: "Datos inválidos", fieldErrors: extractFieldErrors(result.error.issues) };
  }

  try {
    await goalService.createSavingGoal({
      name: result.data.name,
      targetAmountCents: result.data.targetAmount,
      currentAmountCents: result.data.currentAmount,
      targetDate: result.data.targetDate ? new Date(result.data.targetDate) : null,
      accountId: result.data.accountId || null,
    });
    revalidatePath("/goals");
    revalidatePath("/dashboard");
    return { ok: true, message: "Meta creada exitosamente" };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Error al crear meta" };
  }
}

export async function updateSavingGoalAction(id: string, formData: FormData): Promise<ActionResult> {
  const raw = {
    name: formData.get("name") as string,
    targetAmount: formData.get("targetAmount") as string,
    currentAmount: (formData.get("currentAmount") as string) || "0",
    targetDate: (formData.get("targetDate") as string) || "",
    accountId: (formData.get("accountId") as string) || "",
  };

  const result = createGoalSchema.safeParse(raw);
  if (!result.success) {
    return { ok: false, message: "Datos inválidos", fieldErrors: extractFieldErrors(result.error.issues) };
  }

  try {
    await goalService.updateSavingGoal(id, {
      name: result.data.name,
      targetAmountCents: result.data.targetAmount,
      currentAmountCents: result.data.currentAmount,
      targetDate: result.data.targetDate ? new Date(result.data.targetDate) : null,
      accountId: result.data.accountId || null,
    });
    revalidatePath("/goals");
    revalidatePath("/dashboard");
    return { ok: true, message: "Meta actualizada" };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Error al actualizar" };
  }
}

export async function deleteSavingGoalAction(id: string): Promise<ActionResult> {
  try {
    await goalService.deleteSavingGoal(id);
    revalidatePath("/goals");
    revalidatePath("/dashboard");
    return { ok: true, message: "Meta eliminada" };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Error al eliminar" };
  }
}
