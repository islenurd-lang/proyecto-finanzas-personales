"use server";

import { revalidatePath } from "next/cache";
import { createUserSchema } from "./admin-user.schema";
import * as adminService from "./admin-user.service";

type ActionResult = { ok: true; message: string } | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

export async function createUserByAdminAction(formData: FormData): Promise<ActionResult> {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const result = createUserSchema.safeParse(raw);
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
    await adminService.createUserByAdmin(result.data);
    revalidatePath("/admin");
    revalidatePath("/admin/users");
    return { ok: true, message: "Usuario creado exitosamente" };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Error al crear usuario" };
  }
}

export async function toggleUserActiveAction(userId: string): Promise<ActionResult> {
  try {
    const user = await adminService.toggleUserActive(userId);
    revalidatePath("/admin");
    revalidatePath("/admin/users");
    return { ok: true, message: user.isActive ? "Usuario activado" : "Usuario desactivado" };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Error al cambiar estado" };
  }
}
