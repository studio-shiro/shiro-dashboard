import * as XLSX from "xlsx";
import type { WizardProduct } from "@/store/productWizard";
import { PRODUCTS_COL_VISIBILITY_KEY } from "@/components/products/ProductsColumns";

const DEFAULT_VISIBILITY: Record<string, boolean> = {
  product: true,
  sku: true,
  image: true,
  brand: true,
  category: true,
  batches: true,
  cost: true,
  price: true,
  stock: true,
};

type ColDef = {
  header: string;
  field: keyof WizardProduct;
  colId: string;
  required: boolean;
};

const ALL_COLUMNS: ColDef[] = [
  { header: "Nombre", field: "name", colId: "product", required: true },
  { header: "Imagen (URL)", field: "image_url", colId: "image", required: false },
  { header: "SKU", field: "reference", colId: "sku", required: false },
  { header: "Marca", field: "brand_name", colId: "brand", required: false },
  {
    header: "Categoría",
    field: "category_name",
    colId: "category",
    required: false,
  },
  {
    header: "Costo Unitario",
    field: "cost_price",
    colId: "cost",
    required: false,
  },
  {
    header: "Precio Final Unitario",
    field: "price",
    colId: "price",
    required: true,
  },
  { header: "Stock", field: "stock_quantity", colId: "stock", required: false },
  {
    header: "Vencimientos (SI/NO)",
    field: "tracks_batches",
    colId: "batches",
    required: false,
  },
];

function getVisibleColumns(): ColDef[] {
  let visibility = DEFAULT_VISIBILITY;
  try {
    const stored = localStorage.getItem(PRODUCTS_COL_VISIBILITY_KEY);
    if (stored) visibility = JSON.parse(stored) as Record<string, boolean>;
  } catch {}
  return ALL_COLUMNS.filter((c) => c.required || visibility[c.colId] !== false);
}

const EXAMPLE_VALUES: Record<string, string[]> = {
  Nombre: ["Ejemplo Producto 1", "Ejemplo Producto 2"],
  "Imagen (URL)": ["https://ejemplo.com/imagen1.jpg", ""],
  SKU: ["SKU-001", "SKU-002"],
  Marca: ["Marca A", "Marca B"],
  Categoría: ["Categoría A", "Categoría B"],
  "Costo Unitario": ["1000", ""],
  "Precio Final Unitario": ["2500", "1500"],
  Stock: ["50", "30"],
  "Vencimientos (SI/NO)": ["NO", "NO"],
};

export function downloadTemplate(): void {
  const cols = getVisibleColumns();
  const headers = cols.map((c) => c.header);
  const row1 = headers.map((h) => EXAMPLE_VALUES[h]?.[0] ?? "");
  const row2 = headers.map((h) => EXAMPLE_VALUES[h]?.[1] ?? "");

  const ws = XLSX.utils.aoa_to_sheet([headers, row1, row2]);

  // Bold header row
  const range = XLSX.utils.decode_range(ws["!ref"] ?? "A1");
  for (let c = range.s.c; c <= range.e.c; c++) {
    const ref = XLSX.utils.encode_cell({ r: 0, c });
    if (ws[ref]) ws[ref].s = { font: { bold: true } };
  }

  // Auto column width
  ws["!cols"] = headers.map((h) => ({ wch: Math.max(h.length + 4, 16) }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Productos");
  XLSX.writeFile(wb, "plantilla-productos.xlsx");
}

export async function parseExcelFile(file: File): Promise<WizardProduct[]> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];

  if (!ws) throw new Error("El archivo no contiene hojas de datos.");

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, {
    defval: "",
  });

  if (rows.length === 0) throw new Error("El archivo no contiene productos.");

  // Validate required columns exist
  const firstRow = rows[0];
  for (const col of ALL_COLUMNS.filter((c) => c.required)) {
    if (!(col.header in firstRow)) {
      throw new Error(`Columna requerida no encontrada: "${col.header}".`);
    }
  }

  return rows.map(
    (row): WizardProduct => ({
      barcode: `excel-${crypto.randomUUID()}`,
      source: "unknown",
      name: String(row["Nombre"] ?? "").trim(),
      reference: String(row["SKU"] ?? "").trim(),
      image_url: toUrl(row["Imagen (URL)"]),
      brand_id: null,
      brand_name: String(row["Marca"] ?? "").trim() || null,
      category_id: null,
      category_name: String(row["Categoría"] ?? "").trim() || null,
      description: null,
      price: toNum(row["Precio Final Unitario"]),
      cost_price: toNum(row["Costo Unitario"]),
      stock_quantity: toInt(row["Stock"]),
      tracks_batches:
        String(row["Vencimientos (SI/NO)"] ?? "")
          .trim()
          .toUpperCase() === "SI",
      lot_number: null,
      batch_barcode: null,
      manufacture_date: null,
      expiration_date: null,
    }),
  );
}

function toUrl(v: unknown): string | null {
  const s = String(v ?? "").trim();
  return s.startsWith("http://") || s.startsWith("https://") ? s : null;
}

function toNum(v: unknown): number | null {
  const n = parseFloat(String(v ?? "").replace(",", "."));
  return isNaN(n) ? null : n;
}

function toInt(v: unknown): number {
  const n = parseInt(String(v ?? "0"), 10);
  return isNaN(n) ? 0 : Math.max(0, n);
}
