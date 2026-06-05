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
  barcode: z.string().optional(),
});

export const updateProductSchema = productSchema.partial().extend({
  id: z.guid(),
});

export const wizardProductSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  reference: z.string().optional(),
  description: z.string().nullable().optional(),
  price: z.number().positive("El precio final es requerido"),
  cost_price: z.number().nonnegative().nullable().optional(),
  category_id: z.string().uuid().nullable().optional(),
  brand_id: z.string().uuid().nullable().optional(),
  barcode: z.string().optional(),
  image_url: z.string().nullable().optional(),
  active: z.boolean().default(true),
  tracks_batches: z.boolean().default(false),
  stock_quantity: z.number().int().nonnegative().default(0),
});

export type ProductInput = z.infer<typeof productSchema>;
export type WizardProductInput = z.infer<typeof wizardProductSchema>;
