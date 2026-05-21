import * as XLSX from "xlsx";
import type { ProductTableRow } from "@/types/database";

type ExportColumn = {
  header: string;
  width: number;
  isCurrency?: boolean;
  getValue: (p: ProductTableRow) => string | number;
};

const EXPORT_COLUMNS: Record<string, ExportColumn> = {
  producto: {
    header: "Producto",
    width: 30,
    getValue: (p) => p.name,
  },
  sku: {
    header: "SKU",
    width: 14,
    getValue: (p) => p.reference,
  },
  imagen: {
    header: "Imagen (URL)",
    width: 40,
    getValue: (p) => p.image_url ?? "",
  },
  marca: {
    header: "Marca",
    width: 18,
    getValue: (p) => p.brand?.name ?? "",
  },
  categoria: {
    header: "Categoría",
    width: 18,
    getValue: (p) => p.category?.name ?? "",
  },
  vencimientos: {
    header: "Vencimientos",
    width: 14,
    getValue: (p) => p.batch_count,
  },
  costo: {
    header: "Costo por Unidad",
    width: 20,
    isCurrency: true,
    getValue: (p) => p.cost_price ?? "",
  },
  precio: {
    header: "Precio Final por Unidad",
    width: 24,
    isCurrency: true,
    getValue: (p) => p.price,
  },
  stock: {
    header: "Stock",
    width: 10,
    getValue: (p) => p.stock?.quantity ?? "",
  },
};

const COLUMN_ORDER = [
  "producto",
  "sku",
  "imagen",
  "marca",
  "categoria",
  "vencimientos",
  "costo",
  "precio",
  "stock",
];

export function exportProductsToExcel(
  products: ProductTableRow[],
  columnVisibility: Record<string, boolean>,
): void {
  const visibleIds = COLUMN_ORDER.filter(
    (id) => columnVisibility[id] !== false,
  );
  const columns = visibleIds.map((id) => EXPORT_COLUMNS[id]);

  const headers = columns.map((c) => c.header);
  const rows = products.map((p) => columns.map((c) => c.getValue(p)));

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  // Column widths
  ws["!cols"] = columns.map((c) => ({ wch: c.width }));

  // Freeze header row
  ws["!freeze"] = { xSplit: 0, ySplit: 1 };

  // Auto-filter over the full range
  const totalRows = rows.length + 1; // +1 for header
  const lastCol = XLSX.utils.encode_col(columns.length - 1);
  ws["!autofilter"] = { ref: `A1:${lastCol}${totalRows}` };

  // Apply currency number format to cost/price cells
  const currencyFormat = "#,##0";
  columns.forEach((col, colIdx) => {
    if (!col.isCurrency) return;
    for (let rowIdx = 1; rowIdx <= rows.length; rowIdx++) {
      const cellAddr = XLSX.utils.encode_cell({ r: rowIdx, c: colIdx });
      if (ws[cellAddr]) {
        ws[cellAddr].z = currencyFormat;
      }
    }
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Productos");
  XLSX.writeFile(wb, "productos.xlsx");
}
