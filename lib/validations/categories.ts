import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

export const updateCategorySchema = categorySchema.partial().extend({
  id: z.guid(),
});

export type CategoryInput = z.infer<typeof categorySchema>;
