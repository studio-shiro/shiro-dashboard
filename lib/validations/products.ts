import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.coerce.number().positive("Price must be positive"),
  category_id: z.string().uuid().optional(),
  brand_id: z.string().uuid().optional(),
  active: z.coerce.boolean().default(true),
  tracks_batches: z.coerce.boolean().default(false),
});

export const updateProductSchema = productSchema.partial().extend({
  id: z.string().uuid(),
});

export type ProductInput = z.infer<typeof productSchema>;
