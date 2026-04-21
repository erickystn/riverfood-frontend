import { z } from 'zod';

export const productSchema = z.object({
  nome: z.string()
    .min(4, "O nome deve ter no mínimo 4 caracteres")
    .max(60, "O nome deve ter no máximo 60 caracteres"),
  descricao: z.string()
    .min(10, "A descrição deve ter no mínimo 10 caracteres")
    .max(255, "A descrição deve ter no máximo 255 caracteres"),
  preco: z.coerce.number()
    .min(0, "O preço não pode ser negativo"),
  categoria_id: z.coerce.number()
    .min(1, "Selecione uma categoria válida"),
  tagsPreparo: z.array(z.string())
    .min(3, "Você precisa selecionar pelo menos 3 tags para calcular o HealthScore"),
  imgUrl: z.string().url("Insira uma URL válida").optional().or(z.literal('')),
});

// TIPO DE ENTRADA (O que o formulário "acha" que tem antes de validar)
export type ProductFormInput = z.input<typeof productSchema>;

// TIPO DE SAÍDA (O que o seu NestJS vai receber, com números certinhos)
export type ProductFormOutput = z.output<typeof productSchema>;