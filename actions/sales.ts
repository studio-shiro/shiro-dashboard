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

  const { batch_id, ...saleData } = parsed.data;
  const total = saleData.quantity * saleData.unit_price;

  // Decrement aggregate stock
  const { error: stockError } = await supabase.rpc("decrement_stock", {
    p_product_id: saleData.product_id,
    p_quantity: saleData.quantity,
    p_business_id: user.user_metadata.business_id,
  });
  if (stockError) return { error: stockError.message };

  // If this sale is tied to a specific batch, decrement its quantity too
  if (batch_id) {
    const { data: batch, error: fetchErr } = await supabase
      .from("product_batches")
      .select("quantity")
      .eq("id", batch_id)
      .eq("business_id", user.user_metadata.business_id)
      .single();

    if (fetchErr || !batch) return { error: "Batch not found" };

    const newQty = (batch.quantity as number) - saleData.quantity;
    if (newQty < 0) return { error: "Insufficient batch quantity" };

    const { error: batchUpdateError } = await supabase
      .from("product_batches")
      .update({ quantity: newQty })
      .eq("id", batch_id)
      .eq("business_id", user.user_metadata.business_id);

    if (batchUpdateError) return { error: batchUpdateError.message };
  }

  const { error } = await supabase.from("sales").insert({
    ...saleData,
    batch_id: batch_id ?? null,
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

  // Fetch before deleting so we can restore stock
  const { data: sale, error: fetchErr } = await supabase
    .from("sales")
    .select("product_id, quantity, batch_id")
    .eq("id", id)
    .eq("business_id", user.user_metadata.business_id)
    .single();

  if (fetchErr || !sale) return { error: "Sale not found" };

  const { error } = await supabase
    .from("sales")
    .delete()
    .eq("id", id)
    .eq("business_id", user.user_metadata.business_id);
  if (error) return { error: error.message };

  // Restore aggregate stock
  const { error: stockError } = await supabase.rpc("increment_stock", {
    p_product_id: sale.product_id,
    p_quantity: sale.quantity,
    p_business_id: user.user_metadata.business_id,
  });
  if (stockError) return { error: stockError.message };

  // Restore batch quantity if the sale was tied to one
  if (sale.batch_id) {
    const { data: batch, error: batchFetchErr } = await supabase
      .from("product_batches")
      .select("quantity")
      .eq("id", sale.batch_id)
      .eq("business_id", user.user_metadata.business_id)
      .single();

    if (!batchFetchErr && batch) {
      await supabase
        .from("product_batches")
        .update({ quantity: (batch.quantity as number) + (sale.quantity as number) })
        .eq("id", sale.batch_id)
        .eq("business_id", user.user_metadata.business_id);
    }
  }

  revalidatePath("/sales");
  revalidatePath("/stock");
  revalidatePath("/dashboard");
  return { success: true };
}
