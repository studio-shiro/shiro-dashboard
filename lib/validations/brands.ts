import { z } from "zod";

export const brandSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  logo_url: z.string().url().optional().or(z.literal("")),
});

export const updateBrandSchema = brandSchema.partial().extend({
  id: z.guid(),
});

export type BrandInput = z.infer<typeof brandSchema>;
