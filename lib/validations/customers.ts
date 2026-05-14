import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
});

export const updateCustomerSchema = customerSchema.partial().extend({
  id: z.string().uuid(),
});

export type CustomerInput = z.infer<typeof customerSchema>;
