"use server";
import { createClient } from "@/lib/supabase/server";
import { batchSchema, updateBatchSchema } from "@/lib/validations/batches";
import { revalidatePath } from "next/cache";

export async function createBatchAction(formData: FormData) {
  const parsed = batchSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.from("product_batches").insert({
    ...parsed.data,
    business_id: user.user_metadata.business_id,
  });
  if (error) return { error: error.message };

  revalidatePath("/products");
  revalidatePath("/stock");
  return { success: true };
}

export async function updateBatchAction(formData: FormData) {
  const parsed = updateBatchSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { id, ...data } = parsed.data;
  const { error } = await supabase
    .from("product_batches")
    .update(data)
    .eq("id", id)
    .eq("business_id", user.user_metadata.business_id);
  if (error) return { error: error.message };

  revalidatePath("/products");
  revalidatePath("/stock");
  return { success: true };
}

export async function deleteBatchAction(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("product_batches")
    .delete()
    .eq("id", id)
    .eq("business_id", user.user_metadata.business_id);
  if (error) return { error: error.message };

  revalidatePath("/products");
  revalidatePath("/stock");
  return { success: true };
}
