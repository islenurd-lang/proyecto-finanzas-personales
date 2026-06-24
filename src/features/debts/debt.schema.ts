import { z } from "zod/v4";

function parseCents(val: string, ctx: z.RefinementCtx, fieldName: string, allowZero = false) {
  const cleaned = val.replace(/[^0-9.,\-]/g, "").replace(",", ".");
  const num = parseFloat(cleaned);
  if (isNaN(num) || num < 0 || (!allowZero && num <= 0)) {
    ctx.addIssue({ code: "custom", message: allowZero ? `${fieldName} no puede ser negativo` : `${fieldName} debe ser mayor a 0` });
    return 0;
  }
  return Math.round(num * 100);
}

export const createDebtSchema = z
  .object({
    creditorName: z.string().min(2, "Mínimo 2 caracteres").max(100, "Máximo 100 caracteres"),
    originalAmount: z.string().transform((val, ctx) => parseCents(val, ctx, "Monto original")),
    currentBalance: z.string().transform((val, ctx) => parseCents(val, ctx, "Saldo pendiente", true)),
    interestRate: z.string().optional().default("").transform((val, ctx) => {
      if (!val || val.trim() === "") return null;
      const num = parseFloat(val.replace(",", "."));
      if (isNaN(num) || num < 0) {
        ctx.addIssue({ code: "custom", message: "Tasa de interés inválida" });
        return null;
      }
      if (num > 100) {
        ctx.addIssue({ code: "custom", message: "Tasa de interés no puede ser mayor a 100%" });
        return null;
      }
      return num;
    }),
    monthlyPayment: z.string().transform((val, ctx) => parseCents(val, ctx, "Cuota mensual", true)),
    dueDate: z.string().min(1, "Fecha de vencimiento requerida"),
  })
  .transform((data, ctx) => {
    if (data.currentBalance > data.originalAmount) {
      ctx.addIssue({ code: "custom", message: "Saldo pendiente no puede ser mayor al monto original", path: ["currentBalance"] });
    }
    return data;
  });

export type CreateDebtInput = z.input<typeof createDebtSchema>;
