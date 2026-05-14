"use server";
import { createClient } from "@/lib/supabase/server";
import { brandSchema, updateBrandSchema } from "@/lib/validations/brands";
import { revalidatePath } from "next/cache";

export async function createBrandAction(formData: FormData) {
  const parsed = brandSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.from("brands").insert({
    ...parsed.data,
    business_id: user.user_metadata.business_id,
  });
  if (error) return { error: error.message };

  revalidatePath("/brands");
  return { success: true };
}

export async function updateBrandAction(formData: FormData) {
  const parsed = updateBrandSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { id, ...data } = parsed.data;
  const { error } = await supabase
    .from("brands")
    .update(data)
    .eq("id", id)
    .eq("business_id", user.user_metadata.business_id);
  if (error) return { error: error.message };

  revalidatePath("/brands");
  return { success: true };
}

export async function deleteBrandAction(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("brands")
    .delete()
    .eq("id", id)
    .eq("business_id", user.user_metadata.business_id);
  if (error) return { error: error.message };

  revalidatePath("/brands");
  return { success: true };
}
