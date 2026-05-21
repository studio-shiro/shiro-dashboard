import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.coerce.number().positive("Price must be positive"),
  cost_price: z.coerce.number().nonnegative().nullable().optional(),
  category_id: z.guid().optional(),
  brand_id: z.guid().optional(),
  active: z.coerce.boolean().default(true),
  tracks_batches: z.coerce.boolean().default(false),
});

export const updateProductSchema = productSchema.partial().extend({
  id: z.guid(),
});

export type ProductInput = z.infer<typeof productSchema>;
