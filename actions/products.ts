"use server";
import { createClient } from "@/lib/supabase/server";
import { productSchema, updateProductSchema } from "@/lib/validations/products";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ProductTableRow } from "@/types/database";

export async function getProductsAction(): Promise<
  { data: ProductTableRow[]; error?: never } | { data?: never; error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const businessId: string = user.user_metadata.business_id;

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      brand:brands(id, name),
      category:categories(id, name),
      stock:stock(quantity, alert_threshold),
      product_batches(expiration_date)
    `,
    )
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (error) return { error: error.message };

  const rows: ProductTableRow[] = (data ?? []).map((p) => {
    const { product_batches, stock, ...rest } = p as typeof p & {
      product_batches: { expiration_date: string | null }[];
      stock:
        | { quantity: number; alert_threshold: number }
        | { quantity: number; alert_threshold: number }[]
        | null;
    };

    const stockEntry = Array.isArray(stock) ? (stock[0] ?? null) : stock;

    const batches = (product_batches ?? []) as {
      expiration_date: string | null;
    }[];
    const batch_count = batches.filter(
      (b) => b.expiration_date !== null,
    ).length;

    return { ...rest, stock: stockEntry, batch_count };
  });

  return { data: rows };
}

export async function createProductAction(formData: FormData) {
  const parsed = productSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.from("products").insert({
    ...parsed.data,
    business_id: user.user_metadata.business_id,
  });
  if (error) return { error: error.message };

  revalidatePath("/products");
  return { success: true };
}

export async function updateProductAction(formData: FormData) {
  const parsed = updateProductSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { id, ...data } = parsed.data;
  const { error } = await supabase
    .from("products")
    .update(data)
    .eq("id", id)
    .eq("business_id", user.user_metadata.business_id);
  if (error) return { error: error.message };

  revalidatePath("/products");
  return { success: true };
}

export async function toggleProductActiveAction(id: string, active: boolean) {
  const parsed = z
    .object({ id: z.guid(), active: z.boolean() })
    .safeParse({ id, active });
  if (!parsed.success) return { error: "Invalid input" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("products")
    .update({ active: parsed.data.active })
    .eq("id", parsed.data.id)
    .eq("business_id", user.user_metadata.business_id);
  if (error) return { error: error.message };

  revalidatePath("/products");
  return { success: true };
}

export async function deleteProductAction(id: string) {
  if (!z.guid().safeParse(id).success) return { error: "Invalid input" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id)
    .eq("business_id", user.user_metadata.business_id);
  if (error) return { error: error.message };

  revalidatePath("/products");
  return { success: true };
}
