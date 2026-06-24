import { z } from "zod/v4";

export const loginSchema = z.object({
  email: z.email("Email inválido"),
  password: z.string().min(1, "Contraseña requerida"),
});

export type LoginInput = z.input<typeof loginSchema>;
