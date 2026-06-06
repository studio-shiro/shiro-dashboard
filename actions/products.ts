"use server";
import { createClient } from "@/lib/supabase/server";
import {
  productSchema,
  updateProductSchema,
  wizardProductSchema,
} from "@/lib/validations/products";
import type { WizardProduct } from "@/store/productWizard";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ProductTableRow, BatchForTable } from "@/types/database";

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
      product_batches(id, lot_number, quantity, expiration_date, received_at)
    `,
    )
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (error) return { error: error.message };

  const rows: ProductTableRow[] = (data ?? []).map((p) => {
    const { product_batches, stock, ...rest } = p as typeof p & {
      product_batches: {
        id: string;
        lot_number: string | null;
        quantity: number;
        expiration_date: string | null;
        received_at: string;
      }[];
      stock:
        | { quantity: number; alert_threshold: number }
        | { quantity: number; alert_threshold: number }[]
        | null;
    };

    const stockEntry = Array.isArray(stock) ? (stock[0] ?? null) : stock;

    const batches = (product_batches ?? []) as BatchForTable[];
    const batch_count = batches.filter(
      (b) => b.expiration_date !== null,
    ).length;

    return { ...rest, stock: stockEntry, batch_count, batches };
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

export async function createProductsBulkAction(
  products: WizardProduct[],
): Promise<{ created?: number; error?: string }> {
  if (!products.length) return { error: "No hay productos para crear." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const businessId: string = user.user_metadata.business_id;
  let created = 0;
  const errors: string[] = [];

  for (const item of products) {
    const parsed = wizardProductSchema.safeParse({
      name: item.name,
      reference: item.reference,
      description: item.description,
      price: item.price,
      cost_price: item.cost_price,
      category_id: item.category_id,
      brand_id: item.brand_id,
      barcode: item.barcode,
      image_url: item.image_url,
      tracks_batches: item.tracks_batches,
      stock_quantity: item.stock_quantity,
    });

    if (!parsed.success) {
      errors.push(`"${item.name || item.barcode}": datos inválidos.`);
      continue;
    }

    const { stock_quantity, reference, ...productData } = parsed.data;
    const dbBarcode = item.barcode.startsWith("manual-") ? null : item.barcode;

    const { data: newProduct, error: productError } = await supabase
      .from("products")
      .insert({
        ...productData,
        barcode: dbBarcode,
        reference: reference ?? "",
        image_url: item.image_url ?? null,
        business_id: businessId,
        active: true,
      })
      .select("id")
      .single();

    if (productError || !newProduct) {
      errors.push(`"${item.name || item.barcode}": ${productError?.message ?? "error desconocido"}.`);
      continue;
    }

    if (stock_quantity > 0) {
      await supabase.from("stock").insert({
        product_id: newProduct.id,
        business_id: businessId,
        quantity: stock_quantity,
        alert_threshold: 0,
      });
    }

    if (item.tracks_batches && (item.lot_number || item.expiration_date)) {
      await supabase.from("product_batches").insert({
        product_id: newProduct.id,
        business_id: businessId,
        lot_number: item.lot_number,
        quantity: stock_quantity,
        expiration_date: item.expiration_date,
        received_at: new Date().toISOString(),
      });
    }

    // Per CLAUDE.md: manual barcode entries enrich the global product_catalog
    if (item.source === "unknown") {
      await supabase.from("product_catalog").upsert(
        {
          barcode: item.barcode,
          name: parsed.data.name,
          description: parsed.data.description ?? null,
          image_url: parsed.data.image_url ?? null,
          brand: item.brand_name ?? null,
          category: item.category_name ?? null,
          source: "manual",
        },
        { onConflict: "barcode" },
      );
    }

    created++;
  }

  revalidatePath("/products");

  if (created === 0) {
    return { error: errors.length ? errors.join(" ") : "No se pudo crear ningún producto." };
  }

  return { created };
}
