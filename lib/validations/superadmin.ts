import { z } from "zod";

export const createBusinessSchema = z.object({
  business_name: z.string().min(1, "El nombre del negocio es requerido"),
  currency: z.enum(["ARS", "USD", "EUR", "BRL"]),
  owner_name: z.string().min(1, "El nombre del dueño es requerido"),
  owner_email: z.string().email("Email inválido"),
});
