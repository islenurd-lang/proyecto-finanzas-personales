"use server";

import { revalidatePath } from "next/cache";
import { updateSettingsSchema } from "./setting.schema";
import * as settingService from "./setting.service";

type ActionResult = { ok: true; message: string } | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

export async function updateAppSettingsAction(formData: FormData): Promise<ActionResult> {
  const raw = {
    primaryCurrency: formData.get("primaryCurrency") as string,
    dateFormat: formData.get("dateFormat") as string,
    theme: formData.get("theme") as string,
  };

  const result = updateSettingsSchema.safeParse(raw);
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
    await settingService.updateAppSettings(result.data);
    revalidatePath("/settings");
    revalidatePath("/dashboard");
    revalidatePath("/reports");
    return { ok: true, message: "Configuración guardada exitosamente" };
  } catch {
    return { ok: false, message: "Error al guardar configuración" };
  }
}
