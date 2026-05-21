import { z } from "zod";

export const batchSchema = z.object({
  product_id: z.guid(),
  lot_number: z.string().optional(),
  quantity: z.coerce.number().int().min(0, "Quantity cannot be negative"),
  expiration_date: z.string().optional(),
  notes: z.string().optional(),
});

export const updateBatchSchema = batchSchema.partial().extend({
  id: z.guid(),
});

export type BatchInput = z.infer<typeof batchSchema>;
