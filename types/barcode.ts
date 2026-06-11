export type BarcodeSource = "local" | "catalog" | "external" | "unknown" | "manual";

export type BusinessType =
  | "kiosk"
  | "supermarket"
  | "pharmacy_retail"
  | "bookstore"
  | "electronics"
  | "mechanic"
  | "hardware"
  | "other";

export interface BarcodeResult {
  barcode: string;
  source: BarcodeSource;
  name?: string;
  image_url?: string;
  brand?: string;
  category?: string;
  description?: string;
}

export interface ProductCatalogEntry {
  id: string;
  barcode: string;
  name: string;
  description: string | null;
  image_url: string | null;
  brand: string | null;
  category: string | null;
  source: "manual" | "external";
  created_at: string;
  updated_at: string;
}
