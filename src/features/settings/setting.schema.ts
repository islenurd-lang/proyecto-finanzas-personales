import { z } from "zod/v4";

export const updateSettingsSchema = z.object({
  primaryCurrency: z.enum(["DOP", "USD", "EUR"], { message: "Moneda inválida" }),
  dateFormat: z.enum(["dd/MM/yyyy", "MM/dd/yyyy", "yyyy-MM-dd"], { message: "Formato de fecha inválido" }),
  theme: z.enum(["LIGHT", "DARK", "SYSTEM"], { message: "Tema inválido" }),
});

export type UpdateSettingsInput = z.input<typeof updateSettingsSchema>;
