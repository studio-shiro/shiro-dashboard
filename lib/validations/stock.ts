import { z } from "zod";

export const stockSchema = z.object({
  product_id: z.guid(),
  quantity: z.coerce.number().int().min(0, "Quantity cannot be negative"),
  alert_threshold: z.coerce.number().int().min(0).default(5),
});

export const updateStockSchema = z.object({
  id: z.guid(),
  quantity: z.coerce.number().int().min(0, "Quantity cannot be negative"),
  alert_threshold: z.coerce.number().int().min(0).optional(),
});

export type StockInput = z.infer<typeof stockSchema>;
