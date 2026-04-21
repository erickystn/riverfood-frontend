// src/schemas/userSchema.ts
import { z } from 'zod';

export const userSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  usuario: z.string().email("Insira um e-mail válido"), // No seu back, 'usuario' é o email
  senha: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

export type UserFormData = z.infer<typeof userSchema>;