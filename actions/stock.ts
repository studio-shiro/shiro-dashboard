"use server";
import { createClient } from "@/lib/supabase/server";
import { stockSchema, updateStockSchema } from "@/lib/validations/stock";
import { revalidatePath } from "next/cache";

export async function createStockAction(formData: FormData) {
  const parsed = stockSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.from("stock").insert({
    ...parsed.data,
    business_id: user.user_metadata.business_id,
  });
  if (error) return { error: error.message };

  revalidatePath("/stock");
  return { success: true };
}

export async function updateStockAction(formData: FormData) {
  const parsed = updateStockSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { id, ...data } = parsed.data;
  const { error } = await supabase
    .from("stock")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("business_id", user.user_metadata.business_id);
  if (error) return { error: error.message };

  revalidatePath("/stock");
  revalidatePath("/dashboard");
  return { success: true };
}
