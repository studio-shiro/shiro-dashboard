import { z } from "zod";

export const saleSchema = z.object({
  product_id: z.string().uuid(),
  customer_id: z.string().uuid().optional(),
  quantity: z.coerce.number().int().positive("Quantity must be at least 1"),
  unit_price: z.coerce.number().positive("Price must be positive"),
  date: z.string().min(1, "Date is required"),
  notes: z.string().optional(),
});

export type SaleInput = z.infer<typeof saleSchema>;
