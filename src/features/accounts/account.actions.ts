"use server";

import { revalidatePath } from "next/cache";
import { createAccountSchema, updateAccountSchema } from "./account.schema";
import * as accountService from "./account.service";
import type { AccountType } from "@/generated/prisma/client";

type ActionResult = { ok: true; message: string } | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

export async function createAccountAction(formData: FormData): Promise<ActionResult> {
  const raw = {
    name: formData.get("name") as string,
    type: formData.get("type") as string,
    initialBalance: formData.get("initialBalance") as string,
    currency: (formData.get("currency") as string) || "DOP",
  };

  const result = createAccountSchema.safeParse(raw);
  if (!result.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = [];
      fieldErrors[key].push(issue.message);
    }
    return { ok: false, message: "Datos inválidos", fieldErrors };
  }

  try {
    await accountService.createAccount({
      name: result.data.name,
      type: result.data.type as AccountType,
      initialBalanceCents: result.data.initialBalance,
      currency: result.data.currency,
    });
    revalidatePath("/accounts");
    revalidatePath("/dashboard");
    return { ok: true, message: "Cuenta creada exitosamente" };
  } catch {
    return { ok: false, message: "Error al crear cuenta" };
  }
}

export async function updateAccountAction(id: string, formData: FormData): Promise<ActionResult> {
  const raw = {
    name: formData.get("name") as string,
    type: formData.get("type") as string,
    initialBalance: formData.get("initialBalance") as string,
    currency: (formData.get("currency") as string) || "DOP",
  };

  const result = updateAccountSchema.safeParse(raw);
  if (!result.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = [];
      fieldErrors[key].push(issue.message);
    }
    return { ok: false, message: "Datos inválidos", fieldErrors };
  }

  try {
    const data: Record<string, unknown> = {};
    if (result.data.name) data.name = result.data.name;
    if (result.data.type) data.type = result.data.type;
    if (result.data.initialBalance !== undefined) data.initialBalanceCents = result.data.initialBalance;
    if (result.data.currency) data.currency = result.data.currency;

    await accountService.updateAccount(id, data as Parameters<typeof accountService.updateAccount>[1]);
    revalidatePath("/accounts");
    revalidatePath("/dashboard");
    return { ok: true, message: "Cuenta actualizada exitosamente" };
  } catch {
    return { ok: false, message: "Error al actualizar cuenta" };
  }
}

export async function toggleAccountStatusAction(id: string): Promise<ActionResult> {
  try {
    const account = await accountService.toggleAccountStatus(id);
    revalidatePath("/accounts");
    revalidatePath("/dashboard");
    return { ok: true, message: account.isActive ? "Cuenta activada" : "Cuenta inactivada" };
  } catch {
    return { ok: false, message: "Error al cambiar estado" };
  }
}
