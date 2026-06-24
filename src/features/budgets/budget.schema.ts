import { z } from "zod/v4";

export const createBudgetSchema = z.object({
  categoryId: z.string().min(1, "Categoría requerida"),
  month: z.coerce.number().int().min(1, "Mes inválido").max(12, "Mes inválido"),
  year: z.coerce.number().int().min(2000, "Año inválido").max(2100, "Año inválido"),
  limitAmount: z.string().transform((val, ctx) => {
    const cleaned = val.replace(/[^0-9.,\-]/g, "").replace(",", ".");
    const num = parseFloat(cleaned);
    if (isNaN(num) || num <= 0) {
      ctx.addIssue({ code: "custom", message: "El monto debe ser mayor a 0" });
      return 0;
    }
    return Math.round(num * 100);
  }),
});

export type CreateBudgetInput = z.input<typeof createBudgetSchema>;
