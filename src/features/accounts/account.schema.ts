import { z } from "zod/v4";

const ACCOUNT_TYPES = ["CASH", "BANK", "CREDIT_CARD", "SAVINGS", "LOAN", "CUSTOM"] as const;

export const createAccountSchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres").max(100, "Máximo 100 caracteres"),
  type: z.enum(ACCOUNT_TYPES, { message: "Tipo de cuenta inválido" }),
  initialBalance: z.string().transform((val, ctx) => {
    const cleaned = val.replace(/[^0-9.,\-]/g, "").replace(",", ".");
    const num = parseFloat(cleaned);
    if (isNaN(num)) {
      ctx.addIssue({ code: "custom", message: "Monto inválido" });
      return 0;
    }
    return Math.round(num * 100);
  }),
  currency: z.string().min(1, "Moneda requerida").default("DOP"),
});

export const updateAccountSchema = createAccountSchema.partial();

export type CreateAccountInput = z.input<typeof createAccountSchema>;
export type UpdateAccountInput = z.input<typeof updateAccountSchema>;
