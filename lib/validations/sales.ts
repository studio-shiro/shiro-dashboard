import { z } from "zod";

export const saleSchema = z.object({
  product_id: z.guid(),
  customer_id: z.guid().optional(),
  quantity: z.coerce.number().int().positive("Quantity must be at least 1"),
  unit_price: z.coerce.number().positive("Price must be positive"),
  date: z.string().min(1, "Date is required"),
  notes: z.string().optional(),
  batch_id: z.guid().optional(),
});

export type SaleInput = z.infer<typeof saleSchema>;
