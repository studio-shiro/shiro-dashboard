import { z } from "zod";

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email inválido"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const setPasswordSchema = z
  .object({
    password: z.string().min(8, "Mínimo 8 caracteres"),
    confirm_password: z.string(),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "Las contraseñas no coinciden",
    path: ["confirm_password"],
  });
