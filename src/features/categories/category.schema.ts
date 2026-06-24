import { z } from "zod/v4";

const CATEGORY_TYPES = ["INCOME", "EXPENSE"] as const;

export const createCategorySchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres").max(50, "Máximo 50 caracteres"),
  type: z.enum(CATEGORY_TYPES, { message: "Tipo inválido" }),
  color: z.string().min(1, "Color requerido").regex(/^#[0-9A-Fa-f]{6}$/, "Color hexadecimal inválido"),
  icon: z.string().min(1, "Ícono requerido"),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryInput = z.input<typeof createCategorySchema>;
export type UpdateCategoryInput = z.input<typeof updateCategorySchema>;
