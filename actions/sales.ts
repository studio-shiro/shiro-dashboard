"use server";
import { createClient } from "@/lib/supabase/server";
import { saleSchema } from "@/lib/validations/sales";
import { revalidatePath } from "next/cache";

export async function createSaleAction(formData: FormData) {
  const parsed = saleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const total = parsed.data.quantity * parsed.data.unit_price;

  // Decrement stock and insert sale atomically via RPC
  const { error: stockError } = await supabase.rpc("decrement_stock", {
    p_product_id: parsed.data.product_id,
    p_quantity: parsed.data.quantity,
    p_business_id: user.user_metadata.business_id,
  });
  if (stockError) return { error: stockError.message };

  const { error } = await supabase.from("sales").insert({
    ...parsed.data,
    total,
    business_id: user.user_metadata.business_id,
  });
  if (error) return { error: error.message };

  revalidatePath("/sales");
  revalidatePath("/stock");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteSaleAction(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("sales")
    .delete()
    .eq("id", id)
    .eq("business_id", user.user_metadata.business_id);
  if (error) return { error: error.message };

  revalidatePath("/sales");
  revalidatePath("/dashboard");
  return { success: true };
}
