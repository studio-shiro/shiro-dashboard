"use server";

import { createClient } from "@/lib/supabase/server";
import type { BarcodeResult, BusinessType } from "@/types/barcode";

const EXTERNAL_API_ELIGIBLE: BusinessType[] = [
  "kiosk",
  "supermarket",
  "pharmacy_retail",
  "bookstore",
  "electronics",
];

async function fetchOpenFoodFacts(
  barcode: string,
): Promise<Partial<BarcodeResult> | null> {
  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`,
      { next: { revalidate: 86400 } },
    );
    if (!res.ok) return null;
    const json = await res.json();
    if (json.status !== 1 || !json.product) return null;
    const p = json.product;
    return {
      name: p.product_name || p.product_name_en || undefined,
      image_url: p.image_front_url || p.image_url || undefined,
      brand: p.brands?.split(",")[0]?.trim() || undefined,
      category: p.categories?.split(",")[0]?.trim() || undefined,
      description: p.generic_name || undefined,
    };
  } catch {
    return null;
  }
}

async function fetchOpenLibrary(
  barcode: string,
): Promise<Partial<BarcodeResult> | null> {
  try {
    const res = await fetch(
      `https://openlibrary.org/api/books?bibkeys=ISBN:${barcode}&format=json&jscmd=data`,
      { next: { revalidate: 86400 } },
    );
    if (!res.ok) return null;
    const json = await res.json();
    const book = json[`ISBN:${barcode}`];
    if (!book) return null;
    return {
      name: book.title,
      image_url: book.cover?.large || book.cover?.medium || undefined,
      brand: book.publishers?.[0]?.name || undefined,
      category: "Libro",
      description: book.subtitle || undefined,
    };
  } catch {
    return null;
  }
}

async function fetchExternalApi(
  barcode: string,
  businessType: BusinessType,
): Promise<Partial<BarcodeResult> | null> {
  if (
    businessType === "kiosk" ||
    businessType === "supermarket" ||
    businessType === "pharmacy_retail"
  ) {
    return fetchOpenFoodFacts(barcode);
  }
  if (businessType === "bookstore") {
    return fetchOpenLibrary(barcode);
  }
  return null;
}

export async function lookupBarcodeAction(barcode: string): Promise<{
  data?: BarcodeResult;
  error?: string;
}> {
  const trimmed = barcode.trim();
  if (!trimmed || trimmed.length < 4) {
    return { error: "Código de barras inválido." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado." };

  const businessId: string = user.user_metadata.business_id;

  // Step 1: Check local products table
  const { data: localProduct, error: localError } = await supabase
    .from("products")
    .select("id, name, image_url, barcode, brand:brands(name), category:categories(name)")
    .eq("business_id", businessId)
    .eq("barcode", trimmed)
    .maybeSingle();

  if (localError) return { error: localError.message };

  if (localProduct) {
    const brand = Array.isArray(localProduct.brand)
      ? localProduct.brand[0]?.name
      : (localProduct.brand as { name?: string } | null)?.name;
    const category = Array.isArray(localProduct.category)
      ? localProduct.category[0]?.name
      : (localProduct.category as { name?: string } | null)?.name;

    return {
      data: {
        barcode: trimmed,
        source: "local",
        name: localProduct.name,
        image_url: localProduct.image_url ?? undefined,
        brand: brand ?? undefined,
        category: category ?? undefined,
      },
    };
  }

  // Step 2: Check global product_catalog
  const { data: catalogEntry, error: catalogError } = await supabase
    .from("product_catalog")
    .select("*")
    .eq("barcode", trimmed)
    .maybeSingle();

  if (catalogError) return { error: catalogError.message };

  if (catalogEntry) {
    return {
      data: {
        barcode: trimmed,
        source: "catalog",
        name: catalogEntry.name,
        image_url: catalogEntry.image_url ?? undefined,
        brand: catalogEntry.brand ?? undefined,
        category: catalogEntry.category ?? undefined,
        description: catalogEntry.description ?? undefined,
      },
    };
  }

  // Step 3: Try external API if business type is eligible
  const { data: business } = await supabase
    .from("businesses")
    .select("business_type")
    .eq("id", businessId)
    .maybeSingle();

  const businessType = business?.business_type as BusinessType | null;

  if (businessType && EXTERNAL_API_ELIGIBLE.includes(businessType)) {
    const external = await fetchExternalApi(trimmed, businessType);
    if (external?.name) {
      // Upsert to product_catalog for future lookups
      await supabase.from("product_catalog").upsert(
        {
          barcode: trimmed,
          name: external.name,
          description: external.description ?? null,
          image_url: external.image_url ?? null,
          brand: external.brand ?? null,
          category: external.category ?? null,
          source: "external",
        },
        { onConflict: "barcode" },
      );

      return {
        data: {
          barcode: trimmed,
          source: "external",
          name: external.name,
          image_url: external.image_url ?? undefined,
          brand: external.brand ?? undefined,
          category: external.category ?? undefined,
          description: external.description ?? undefined,
        },
      };
    }
  }

  // Step 4: Manual fallback — product not found anywhere
  return {
    data: {
      barcode: trimmed,
      source: "unknown",
    },
  };
}
