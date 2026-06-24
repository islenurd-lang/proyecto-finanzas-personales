import { z } from "zod/v4";

export const createUserSchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres").max(100, "Máximo 100 caracteres"),
  email: z.email("Email inválido").transform((v) => v.toLowerCase().trim()),
  password: z.string().min(8, "Mínimo 8 caracteres"),
});

export type CreateUserInput = z.input<typeof createUserSchema>;
