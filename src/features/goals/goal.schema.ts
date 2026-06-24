import { z } from "zod/v4";

function parseAmount(val: string, ctx: z.RefinementCtx, fieldName: string, allowZero = false) {
  const cleaned = val.replace(/[^0-9.,\-]/g, "").replace(",", ".");
  const num = parseFloat(cleaned);
  if (isNaN(num) || (!allowZero && num <= 0) || num < 0) {
    ctx.addIssue({ code: "custom", message: allowZero ? "Monto inválido" : `El ${fieldName} debe ser mayor a 0` });
    return 0;
  }
  return Math.round(num * 100);
}

export const createGoalSchema = z
  .object({
    name: z.string().min(2, "Mínimo 2 caracteres").max(100, "Máximo 100 caracteres"),
    targetAmount: z.string().transform((val, ctx) => parseAmount(val, ctx, "monto objetivo")),
    currentAmount: z.string().transform((val, ctx) => parseAmount(val, ctx, "monto acumulado", true)),
    targetDate: z.string().optional().default(""),
    accountId: z.string().optional().default(""),
  })
  .transform((data, ctx) => {
    if (data.currentAmount > data.targetAmount) {
      ctx.addIssue({ code: "custom", message: "El monto acumulado no puede ser mayor al objetivo", path: ["currentAmount"] });
    }
    return data;
  });

export type CreateGoalInput = z.input<typeof createGoalSchema>;
