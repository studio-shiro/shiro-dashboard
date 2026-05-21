import { z } from "zod";

export const inviteMemberSchema = z.object({
  email: z.string().email("Email inválido"),
  full_name: z.string().min(1, "El nombre es requerido"),
  role: z.enum(["owner", "operator"]),
});

export const updateMemberRoleSchema = z.object({
  member_id: z.guid(),
  role: z.enum(["owner", "operator"]),
});

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, "Ingresá tu contraseña actual"),
    new_password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirm_password: z.string().min(1, "Confirmá tu nueva contraseña"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Las contraseñas no coinciden",
    path: ["confirm_password"],
  });
