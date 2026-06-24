import { z } from "zod/v4";

export const createDebtPaymentSchema = z.object({
  debtId: z.string().min(1, "Deuda requerida"),
  accountId: z.string().min(1, "Cuenta origen requerida"),
  amount: z.string().transform((val, ctx) => {
    const cleaned = val.replace(/[^0-9.,\-]/g, "").replace(",", ".");
    const num = parseFloat(cleaned);
    if (isNaN(num) || num <= 0) {
      ctx.addIssue({ code: "custom", message: "El monto debe ser mayor a 0" });
      return 0;
    }
    return Math.round(num * 100);
  }),
  paymentDate: z.string().min(1, "Fecha de pago requerida"),
  description: z.string().optional().default(""),
});

export type CreateDebtPaymentInput = z.input<typeof createDebtPaymentSchema>;
