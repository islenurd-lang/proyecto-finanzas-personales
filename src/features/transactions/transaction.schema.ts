import { z } from "zod/v4";

const TX_TYPES = ["INCOME", "EXPENSE", "TRANSFER"] as const;
const TX_STATUSES = ["CONFIRMED", "PENDING"] as const;

export const createTransactionSchema = z
  .object({
    type: z.enum(TX_TYPES, { message: "Tipo de transacción inválido" }),
    amount: z.string().transform((val, ctx) => {
      const cleaned = val.replace(/[^0-9.,\-]/g, "").replace(",", ".");
      const num = parseFloat(cleaned);
      if (isNaN(num) || num <= 0) {
        ctx.addIssue({ code: "custom", message: "El monto debe ser mayor a 0" });
        return 0;
      }
      return Math.round(num * 100);
    }),
    date: z.string().min(1, "Fecha requerida"),
    sourceAccountId: z.string().optional().default(""),
    destinationAccountId: z.string().optional().default(""),
    categoryId: z.string().optional().default(""),
    description: z.string().optional().default(""),
    status: z.enum(TX_STATUSES, { message: "Estado inválido" }).default("CONFIRMED"),
  })
  .transform((data, ctx) => {
    if (data.type === "INCOME") {
      if (!data.destinationAccountId) {
        ctx.addIssue({ code: "custom", message: "Cuenta destino requerida para ingresos", path: ["destinationAccountId"] });
      }
      if (!data.categoryId) {
        ctx.addIssue({ code: "custom", message: "Categoría requerida para ingresos", path: ["categoryId"] });
      }
      data.sourceAccountId = "";
    }

    if (data.type === "EXPENSE") {
      if (!data.sourceAccountId) {
        ctx.addIssue({ code: "custom", message: "Cuenta origen requerida para gastos", path: ["sourceAccountId"] });
      }
      if (!data.categoryId) {
        ctx.addIssue({ code: "custom", message: "Categoría requerida para gastos", path: ["categoryId"] });
      }
      data.destinationAccountId = "";
    }

    if (data.type === "TRANSFER") {
      if (!data.sourceAccountId) {
        ctx.addIssue({ code: "custom", message: "Cuenta origen requerida", path: ["sourceAccountId"] });
      }
      if (!data.destinationAccountId) {
        ctx.addIssue({ code: "custom", message: "Cuenta destino requerida", path: ["destinationAccountId"] });
      }
      if (data.sourceAccountId && data.sourceAccountId === data.destinationAccountId) {
        ctx.addIssue({ code: "custom", message: "Las cuentas origen y destino deben ser diferentes", path: ["destinationAccountId"] });
      }
      data.categoryId = "";
    }

    return data;
  });

export type CreateTransactionInput = z.input<typeof createTransactionSchema>;
