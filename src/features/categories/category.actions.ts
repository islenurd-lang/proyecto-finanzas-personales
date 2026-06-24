"use server";

import { revalidatePath } from "next/cache";
import { createCategorySchema, updateCategorySchema } from "./category.schema";
import * as categoryService from "./category.service";
import type { CategoryType } from "@/generated/prisma/client";

type ActionResult = { ok: true; message: string } | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

export async function createCategoryAction(formData: FormData): Promise<ActionResult> {
  const raw = {
    name: formData.get("name") as string,
    type: formData.get("type") as string,
    color: formData.get("color") as string,
    icon: formData.get("icon") as string,
  };

  const result = createCategorySchema.safeParse(raw);
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
    await categoryService.createCategory(result.data as { name: string; type: CategoryType; color: string; icon: string });
    revalidatePath("/categories");
    revalidatePath("/dashboard");
    return { ok: true, message: "Categoría creada exitosamente" };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al crear categoría";
    return { ok: false, message: msg };
  }
}

export async function updateCategoryAction(id: string, formData: FormData): Promise<ActionResult> {
  const raw = {
    name: formData.get("name") as string,
    type: formData.get("type") as string,
    color: formData.get("color") as string,
    icon: formData.get("icon") as string,
  };

  const result = updateCategorySchema.safeParse(raw);
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
    await categoryService.updateCategory(id, result.data as Parameters<typeof categoryService.updateCategory>[1]);
    revalidatePath("/categories");
    revalidatePath("/dashboard");
    return { ok: true, message: "Categoría actualizada exitosamente" };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al actualizar categoría";
    return { ok: false, message: msg };
  }
}

export async function toggleCategoryStatusAction(id: string): Promise<ActionResult> {
  try {
    const cat = await categoryService.toggleCategoryStatus(id);
    revalidatePath("/categories");
    revalidatePath("/dashboard");
    return { ok: true, message: cat.isActive ? "Categoría activada" : "Categoría inactivada" };
  } catch {
    return { ok: false, message: "Error al cambiar estado" };
  }
}
