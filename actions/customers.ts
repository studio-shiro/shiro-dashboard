"use server";
import { createClient } from "@/lib/supabase/server";
import { customerSchema, updateCustomerSchema } from "@/lib/validations/customers";
import { revalidatePath } from "next/cache";

export async function createCustomerAction(formData: FormData) {
  const parsed = customerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.from("customers").insert({
    ...parsed.data,
    email: parsed.data.email || null,
    business_id: user.user_metadata.business_id,
  });
  if (error) return { error: error.message };

  revalidatePath("/customers");
  return { success: true };
}

export async function updateCustomerAction(formData: FormData) {
  const parsed = updateCustomerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { id, ...data } = parsed.data;
  const { error } = await supabase
    .from("customers")
    .update(data)
    .eq("id", id)
    .eq("business_id", user.user_metadata.business_id);
  if (error) return { error: error.message };

  revalidatePath("/customers");
  return { success: true };
}

export async function deleteCustomerAction(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("customers")
    .delete()
    .eq("id", id)
    .eq("business_id", user.user_metadata.business_id);
  if (error) return { error: error.message };

  revalidatePath("/customers");
  return { success: true };
}
