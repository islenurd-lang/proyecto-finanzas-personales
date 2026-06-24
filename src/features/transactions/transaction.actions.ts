"use server";

import { revalidatePath } from "next/cache";
import { createTransactionSchema } from "./transaction.schema";
import * as txService from "./transaction.service";
import type { TransactionType, TransactionStatus } from "@/generated/prisma/client";

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
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  revalidatePath("/accounts");
}

export async function createTransactionAction(formData: FormData): Promise<ActionResult> {
  const raw = {
    type: formData.get("type") as string,
    amount: formData.get("amount") as string,
    date: formData.get("date") as string,
    sourceAccountId: (formData.get("sourceAccountId") as string) || "",
    destinationAccountId: (formData.get("destinationAccountId") as string) || "",
    categoryId: (formData.get("categoryId") as string) || "",
    description: (formData.get("description") as string) || "",
    status: (formData.get("status") as string) || "CONFIRMED",
  };

  const result = createTransactionSchema.safeParse(raw);
  if (!result.success) {
    return { ok: false, message: "Datos inválidos", fieldErrors: extractFieldErrors(result.error.issues) };
  }

  try {
    await txService.createTransaction({
      type: result.data.type as TransactionType,
      amountCents: result.data.amount,
      date: new Date(result.data.date),
      sourceAccountId: result.data.sourceAccountId || null,
      destinationAccountId: result.data.destinationAccountId || null,
      categoryId: result.data.categoryId || null,
      description: result.data.description,
      status: result.data.status as TransactionStatus,
    });
    revalidateAll();
    return { ok: true, message: "Transacción creada exitosamente" };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Error al crear transacción" };
  }
}

export async function updateTransactionAction(id: string, formData: FormData): Promise<ActionResult> {
  const raw = {
    type: formData.get("type") as string,
    amount: formData.get("amount") as string,
    date: formData.get("date") as string,
    sourceAccountId: (formData.get("sourceAccountId") as string) || "",
    destinationAccountId: (formData.get("destinationAccountId") as string) || "",
    categoryId: (formData.get("categoryId") as string) || "",
    description: (formData.get("description") as string) || "",
    status: (formData.get("status") as string) || "CONFIRMED",
  };

  const result = createTransactionSchema.safeParse(raw);
  if (!result.success) {
    return { ok: false, message: "Datos inválidos", fieldErrors: extractFieldErrors(result.error.issues) };
  }

  try {
    await txService.updateTransaction(id, {
      type: result.data.type as TransactionType,
      amountCents: result.data.amount,
      date: new Date(result.data.date),
      sourceAccountId: result.data.sourceAccountId || null,
      destinationAccountId: result.data.destinationAccountId || null,
      categoryId: result.data.categoryId || null,
      description: result.data.description,
      status: result.data.status as TransactionStatus,
    });
    revalidateAll();
    return { ok: true, message: "Transacción actualizada exitosamente" };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Error al actualizar" };
  }
}

export async function deleteTransactionAction(id: string): Promise<ActionResult> {
  try {
    await txService.deleteTransaction(id);
    revalidateAll();
    return { ok: true, message: "Transacción eliminada" };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Error al eliminar" };
  }
}
