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

  try {
    const businessId: string = user.user_metadata.business_id;
    let created = 0;
    const errors: string[] = [];

  // Pre-fetch all brands and categories so we can resolve names → IDs
  const [{ data: allBrands }, { data: allCategories }] = await Promise.all([
    supabase.from("brands").select("id, name").eq("business_id", businessId),
    supabase.from("categories").select("id, name").eq("business_id", businessId),
  ]);

  const brandMap = new Map<string, string>();
  for (const b of allBrands ?? []) brandMap.set(b.name.toLowerCase(), b.id);

  const categoryMap = new Map<string, string>();
  for (const c of allCategories ?? []) categoryMap.set(c.name.toLowerCase(), c.id);

  // Create any brands/categories that appear in the import but don't exist yet
  const newBrandNames = [
    ...new Set(
      products
        .map((p) => p.brand_name)
        .filter((n): n is string => !!n && !brandMap.has(n.toLowerCase())),
    ),
  ];
  if (newBrandNames.length) {
    const { data: created } = await supabase
      .from("brands")
      .insert(newBrandNames.map((name) => ({ name, business_id: businessId })))
      .select("id, name");
    for (const b of created ?? []) brandMap.set(b.name.toLowerCase(), b.id);
  }

  const newCategoryNames = [
    ...new Set(
      products
        .map((p) => p.category_name)
        .filter((n): n is string => !!n && !categoryMap.has(n.toLowerCase())),
    ),
  ];
  if (newCategoryNames.length) {
    const { data: created } = await supabase
      .from("categories")
      .insert(
        newCategoryNames.map((name) => ({ name, business_id: businessId })),
      )
      .select("id, name");
    for (const c of created ?? []) categoryMap.set(c.name.toLowerCase(), c.id);
  }

  for (const item of products) {
    // Resolve brand_id and category_id from names when IDs aren't already set
    const resolvedBrandId =
      item.brand_id ||
      (item.brand_name ? (brandMap.get(item.brand_name.toLowerCase()) ?? null) : null);
    const resolvedCategoryId =
      item.category_id ||
      (item.category_name ? (categoryMap.get(item.category_name.toLowerCase()) ?? null) : null);

    const parsed = wizardProductSchema.safeParse({
      name: item.name,
      reference: item.reference,
      description: item.description,
      price: item.price,
      cost_price: item.cost_price,
      category_id: resolvedCategoryId,
      brand_id: resolvedBrandId,
      barcode: item.barcode,
      image_url: item.image_url,
      tracks_batches: item.tracks_batches,
      stock_quantity: item.stock_quantity,
    });

    if (!parsed.success) {
      console.error(
        `[createProductsBulkAction] Zod validation failed for "${item.name || item.barcode}":`,
        parsed.error.issues,
      );
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
      console.error(
        `[createProductsBulkAction] DB insert failed for "${item.name || item.barcode}":`,
        productError,
      );
      errors.push(`"${item.name || item.barcode}": ${productError?.message ?? "error desconocido"}.`);
      continue;
    }

    if (stock_quantity > 0) {
      const { error: stockError } = await supabase.from("stock").insert({
        product_id: newProduct.id,
        business_id: businessId,
        quantity: stock_quantity,
        alert_threshold: 0,
      });
      if (stockError)
        console.error(
          `[createProductsBulkAction] stock insert failed for product ${newProduct.id}:`,
          stockError,
        );
    }

    if (item.tracks_batches && (item.lot_number || item.expiration_date)) {
      const { error: batchError } = await supabase.from("product_batches").insert({
        product_id: newProduct.id,
        business_id: businessId,
        lot_number: item.lot_number,
        quantity: stock_quantity,
        expiration_date: item.expiration_date,
        received_at: new Date().toISOString(),
      });
      if (batchError)
        console.error(
          `[createProductsBulkAction] product_batches insert failed for product ${newProduct.id}:`,
          batchError,
        );
    }

    // Per CLAUDE.md: manual barcode entries enrich the global product_catalog
    if (item.source === "unknown") {
      const { error: catalogError } = await supabase.from("product_catalog").upsert(
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
      if (catalogError)
        console.error(
          `[createProductsBulkAction] product_catalog upsert failed for barcode ${item.barcode}:`,
          catalogError,
        );
    }

    created++;
  }

  revalidatePath("/products");

  if (errors.length) {
    console.warn(
      `[createProductsBulkAction] ${errors.length} product(s) failed (${created} created):`,
      errors,
    );
  }

  if (created === 0) {
    return { error: errors.length ? errors.join(" ") : "No se pudo crear ningún producto." };
  }

  return { created };
  } catch (err) {
    console.error("[createProductsBulkAction] Unexpected error:", err);
    return { error: "Error inesperado al crear productos." };
  }
}
