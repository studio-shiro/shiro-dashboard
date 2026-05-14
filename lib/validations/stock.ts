import { z } from "zod";

export const stockSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.coerce.number().int().min(0, "Quantity cannot be negative"),
  alert_threshold: z.coerce.number().int().min(0).default(5),
});

export const updateStockSchema = z.object({
  id: z.string().uuid(),
  quantity: z.coerce.number().int().min(0, "Quantity cannot be negative"),
  alert_threshold: z.coerce.number().int().min(0).optional(),
});

export type StockInput = z.infer<typeof stockSchema>;
