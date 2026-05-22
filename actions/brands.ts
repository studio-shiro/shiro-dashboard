"use server";
import { createClient } from "@/lib/supabase/server";
import { brandSchema, updateBrandSchema } from "@/lib/validations/brands";
import { revalidatePath } from "next/cache";
import type { Brand, BrandTableRow } from "@/types/database";

export async function getBrandsAction(): Promise<
  { data: BrandTableRow[] } | { error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data, error } = await supabase
    .from("brands")
    .select("*, products(count)")
    .eq("business_id", user.user_metadata.business_id)
    .order("name", { ascending: true });

  if (error) return { error: error.message };

  type BrandWithCount = Brand & { products: [{ count: number }] | null };
  const rows: BrandTableRow[] = ((data as BrandWithCount[]) ?? []).map(
    (brand) => ({
      id: brand.id,
      business_id: brand.business_id,
      name: brand.name,
      description: brand.description,
      logo_url: brand.logo_url,
      created_at: brand.created_at,
      product_count: brand.products?.[0]?.count ?? 0,
    }),
  );

  return { data: rows };
}

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
