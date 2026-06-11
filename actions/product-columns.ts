"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { PRODUCT_COLUMNS, COLUMN_MAP } from "@/lib/product-column-registry";
import { getEnabledColumns, toVisibilityMap } from "@/lib/product-columns";

export async function getProductColumnsAction(): Promise<Record<string, boolean>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Object.fromEntries(PRODUCT_COLUMNS.map(c => [c.key, c.defaultEnabled]));

  const businessId: string = user.user_metadata?.business_id;
  const columns = await getEnabledColumns(businessId);
  return toVisibilityMap(columns);
}

const saveSchema = z.object({
  enabledKeys: z
    .array(z.string())
    .refine(keys => keys.every(k => k in COLUMN_MAP), {
      message: "Clave de columna inválida",
    })
    .refine(
      keys => PRODUCT_COLUMNS.filter(c => c.required).every(c => keys.includes(c.key)),
      { message: "Las columnas requeridas no pueden desactivarse" },
    ),
});

export async function saveProductColumnsAction(
  enabledKeys: string[],
): Promise<{ error?: string }> {
  const parsed = saveSchema.safeParse({ enabledKeys });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const businessId: string = user.user_metadata?.business_id;

  const rows = PRODUCT_COLUMNS.map((col, i) => ({
    business_id: businessId,
    column_key: col.key,
    enabled: parsed.data.enabledKeys.includes(col.key),
    sort_order: i,
  }));

  const { error } = await supabase
    .from("business_product_columns")
    .upsert(rows, { onConflict: "business_id,column_key" });

  if (error) return { error: error.message };

  revalidatePath("/products");
  return {};
}
