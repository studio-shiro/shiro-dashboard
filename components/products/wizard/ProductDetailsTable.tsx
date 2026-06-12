"use client";

import { useEffect, useRef, useState } from "react";
import {
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PhotoIcon,
  ArrowUpTrayIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import type { WizardProduct } from "@/store/productWizard";
import { cn } from "@/lib/utils";
import { FIXED_COLUMN_IDS } from "@/components/products/ProductsColumns";
import { DatePickerInput } from "@/components/products/wizard/DatePickerInput";
import { FormInput } from "@/components/shared/FormInput";

const COL_WIDTHS: Record<string, string> = {
  product: "2fr",
  sku: "1fr",
  image: "100px",
  brand: "1.3fr",
  category: "1.3fr",
  cost: "1.1fr",
  price: "1.1fr",
  stock: "1fr",
  _delete: "32px",
};

const ORDERED_COLS = [
  "product",
  "sku",
  "image",
  "brand",
  "category",
  "cost",
  "price",
  "stock",
  "_delete",
];

const COL_HEADERS: Record<string, string> = {
  product: "Producto",
  sku: "SKU",
  image: "Imagen",
  brand: "Marca",
  category: "Categoría",
  cost: "Costo Unitario",
  price: "Precio Final Unitario",
  stock: "Stock",
  _delete: "",
};


function getPageItems(current: number, count: number): (number | "ellipsis")[] {
  if (count <= 4) return Array.from({ length: count }, (_, i) => i);
  const pages = new Set<number>([0, count - 1, current - 1, current, current + 1]);
  if (current <= 2) {
    pages.add(1);
    pages.add(2);
  }
  if (current >= count - 3) {
    pages.add(count - 2);
    pages.add(count - 3);
  }
  const sorted = [...pages]
    .filter((p) => p >= 0 && p < count)
    .sort((a, b) => a - b);
  const items: (number | "ellipsis")[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) items.push("ellipsis");
    items.push(sorted[i]);
  }
  return items;
}

/**
 * There is no per-row switch for tracks_batches: it is derived from the batch
 * fields the user fills in (batch_barcode is excluded — the scan pre-fills it).
 */
export function batchUpdates(
  item: WizardProduct,
  updates: Partial<WizardProduct>,
): Partial<WizardProduct> {
  const merged = { ...item, ...updates };
  return {
    ...updates,
    tracks_batches: Boolean(
      merged.lot_number || merged.manufacture_date || merged.expiration_date,
    ),
  };
}

interface ProductDetailsTableProps {
  items: WizardProduct[];
  onUpdate: (barcode: string, updates: Partial<WizardProduct>) => void;
  onDelete: (item: WizardProduct) => void;
  onFilePicked: (barcode: string, file: File) => void;
  pageIndex: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  columnVisibility: Record<string, boolean>;
}

export function ProductDetailsTable({
  items,
  onUpdate,
  onDelete,
  onFilePicked,
  pageIndex,
  pageCount,
  onPageChange,
  columnVisibility,
}: ProductDetailsTableProps) {
  // Per Figma: the first product always starts expanded so the user discovers
  // the batch info; the rest stay collapsed until opened manually.
  const [expandedBarcodes, setExpandedBarcodes] = useState<Set<string>>(
    () => new Set(items[0] ? [items[0].barcode] : []),
  );
  const [localPreviews, setLocalPreviews] = useState<Map<string, string>>(
    new Map(),
  );
  const fileInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());
  const blobUrls = useRef<string[]>([]);

  useEffect(() => {
    return () => {
      for (const url of blobUrls.current) URL.revokeObjectURL(url);
    };
  }, []);

  const batchesEnabled = columnVisibility.batches !== false;

  const visibleCols = ORDERED_COLS.filter((col) => {
    if (col === "_delete") return true;
    if (FIXED_COLUMN_IDS.includes(col as (typeof FIXED_COLUMN_IDS)[number]))
      return true;
    return columnVisibility[col] !== false;
  });

  const gridTemplate = visibleCols.map((c) => COL_WIDTHS[c]).join(" ");

  function toggleExpand(barcode: string) {
    setExpandedBarcodes((prev) => {
      const next = new Set(prev);
      if (next.has(barcode)) next.delete(barcode);
      else next.add(barcode);
      return next;
    });
  }

  function handleImageChange(barcode: string, file: File) {
    const localUrl = URL.createObjectURL(file);
    blobUrls.current.push(localUrl);
    setLocalPreviews((prev) => new Map(prev).set(barcode, localUrl));
    onFilePicked(barcode, file);
  }

  const headerCols = visibleCols.filter((col) => col !== "_delete");

  return (
    <div className="flex flex-col gap-3">
      {/* Table */}
      <div className="overflow-hidden rounded-[10px] bg-white shadow-md">
        {/* Header — the last header (Stock) spans through the delete column,
            so there is no separator before the X (matches Figma) */}
        <div
          className="grid border-b border-border-200 bg-background-300"
          style={{ gridTemplateColumns: gridTemplate }}
        >
          {headerCols.map((col, i) => (
            <div
              key={col}
              className={cn(
                "body-md-semibold p-2 text-text-400",
                i < headerCols.length - 1 && "border-r border-border-200",
              )}
              style={
                i === headerCols.length - 1
                  ? { gridColumn: "span 2" }
                  : undefined
              }
            >
              {COL_HEADERS[col]}
            </div>
          ))}
        </div>

        {/* Rows */}
        {items.map((item) => {
          const isExpanded = expandedBarcodes.has(item.barcode);
          const previewUrl = localPreviews.get(item.barcode) ?? item.image_url;

          return (
            <div key={item.barcode}>
              {/* Main data row — no separator between data rows (matches Figma) */}
              <div
                className="grid items-center"
                style={{ gridTemplateColumns: gridTemplate }}
              >
                {visibleCols.map((col) => {
                  /* ── Producto ── */
                  if (col === "product")
                    return (
                      <div
                        key="product"
                        className="flex items-center gap-2 p-3"
                      >
                        <FormInput
                          variant="table"
                          value={item.name}
                          onChange={(v) =>
                            onUpdate(item.barcode, { name: v })
                          }
                          placeholder="Nombre del producto"
                          error={!item.name}
                        />
                        {batchesEnabled && (
                          <button
                            type="button"
                            onClick={() => toggleExpand(item.barcode)}
                            className="shrink-0 text-text-500"
                          >
                            <ChevronRightIcon
                              className={cn(
                                "size-6 transition-transform duration-200",
                                isExpanded && "rotate-90",
                              )}
                            />
                          </button>
                        )}
                      </div>
                    );

                  /* ── SKU ── */
                  if (col === "sku")
                    return (
                      <div key="sku" className="p-3">
                        <FormInput
                          variant="table"
                          value={item.reference}
                          onChange={(v) =>
                            onUpdate(item.barcode, { reference: v })
                          }
                          placeholder="-"
                        />
                      </div>
                    );

                  /* ── Imagen ── */
                  if (col === "image")
                    return (
                      <div
                        key="image"
                        className="relative flex items-center justify-center p-3"
                      >
                        {/* Photo / image + "Imagen" pill — pill is centered
                            over the image, or bottom-aligned with the
                            placeholder icon (matches Figma) */}
                        <button
                          type="button"
                          onClick={() =>
                            fileInputRefs.current.get(item.barcode)?.click()
                          }
                          className="group relative size-[70px]"
                          title="Cambiar imagen"
                        >
                          {previewUrl ? (
                            <div className="size-full overflow-hidden rounded-[10px]">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={previewUrl}
                                alt={item.name}
                                className="size-full object-contain"
                              />
                            </div>
                          ) : (
                            <PhotoIcon className="mx-auto size-16 text-text-300" />
                          )}
                          <span
                            className={cn(
                              "absolute left-1/2 flex h-[22px] w-[72px] -translate-x-1/2 items-center justify-center gap-0.5 whitespace-nowrap rounded-md border border-border-400 bg-white shadow-sm transition-colors group-hover:bg-background-300",
                              previewUrl
                                ? "top-1/2 -translate-y-1/2"
                                : "bottom-0",
                            )}
                          >
                            <ArrowUpTrayIcon className="size-3.5 text-text-500" />
                            <span className="body-sm-regular text-text-500">
                              Imagen
                            </span>
                          </span>
                        </button>

                        <input
                          ref={(el) => {
                            if (el) fileInputRefs.current.set(item.barcode, el);
                            else fileInputRefs.current.delete(item.barcode);
                          }}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageChange(item.barcode, file);
                            e.target.value = "";
                          }}
                        />
                      </div>
                    );

                  /* ── Marca ── */
                  if (col === "brand")
                    return (
                      <div key="brand" className="p-3">
                        <FormInput
                          variant="table"
                          value={item.brand_name ?? ""}
                          onChange={(v) =>
                            onUpdate(item.barcode, { brand_name: v })
                          }
                          placeholder="-"
                        />
                      </div>
                    );

                  /* ── Categoría ── */
                  if (col === "category")
                    return (
                      <div key="category" className="p-3">
                        <FormInput
                          variant="table"
                          value={item.category_name ?? ""}
                          onChange={(v) =>
                            onUpdate(item.barcode, { category_name: v })
                          }
                          placeholder="-"
                        />
                      </div>
                    );

                  /* ── Costo Unitario ── */
                  if (col === "cost")
                    return (
                      <div key="cost" className="p-3">
                        <FormInput
                          variant="table"
                          type="number"
                          value={item.cost_price ?? ""}
                          onChange={(v) =>
                            onUpdate(item.barcode, {
                              cost_price: v ? Number(v) : null,
                            })
                          }
                          placeholder="-"
                          min={0}
                          step="0.01"
                          adornStart={
                            <CurrencyDollarIcon className="size-5 shrink-0 text-text-500" />
                          }
                        />
                      </div>
                    );

                  /* ── Precio Final ── */
                  if (col === "price")
                    return (
                      <div key="price" className="p-3">
                        <FormInput
                          variant="table"
                          type="number"
                          value={item.price ?? ""}
                          onChange={(v) =>
                            onUpdate(item.barcode, {
                              price: v ? Number(v) : null,
                            })
                          }
                          placeholder="-"
                          min={0}
                          step="0.01"
                          adornStart={
                            <CurrencyDollarIcon className="size-5 shrink-0 text-text-500" />
                          }
                        />
                      </div>
                    );

                  /* ── Stock ── */
                  if (col === "stock")
                    return (
                      <div key="stock" className="p-3">
                        <FormInput
                          variant="table"
                          type="number"
                          value={item.stock_quantity}
                          onChange={(v) =>
                            onUpdate(item.barcode, {
                              stock_quantity: Number(v) || 0,
                            })
                          }
                          min={0}
                          step={1}
                        />
                      </div>
                    );

                  /* ── Delete ── */
                  if (col === "_delete")
                    return (
                      <div
                        key="_delete"
                        className="flex items-center justify-end pr-2"
                      >
                        <button
                          type="button"
                          onClick={() => onDelete(item)}
                          className="text-text-500 transition-colors hover:text-danger-300"
                        >
                          <XMarkIcon className="size-6" />
                        </button>
                      </div>
                    );

                  return null;
                })}
              </div>

              {/* Batch sub-rows — header labels + input cells (matching Figma layout) */}
              {isExpanded && batchesEnabled && (
                <>
                  {/* Sub-header row */}
                  <div className="grid grid-cols-4 border-b border-t border-border-200 bg-background-600">
                    {[
                      "Número de Lote",
                      "EAN-13",
                      "Fecha de Elaboración",
                      "Fecha de Vencimiento",
                    ].map((label, i) => (
                      <div
                        key={label}
                        className={cn(
                          "body-md-semibold p-2 text-text-400",
                          i === 0 && "pl-3",
                        )}
                      >
                        {label}
                      </div>
                    ))}
                  </div>
                  {/* Sub-data row — each cell owns its padding; inputs have Figma-exact widths */}
                  <div className="grid grid-cols-4 border-b border-border-200 bg-background-600">
                    {/* Nro de Lote — 246px input (measured from Figma) */}
                    <div className="p-3">
                      <FormInput
                        variant="table"
                        value={item.lot_number ?? ""}
                        onChange={(v) =>
                          onUpdate(
                            item.barcode,
                            batchUpdates(item, { lot_number: v || null }),
                          )
                        }
                        placeholder="-"
                        className="w-[246px]"
                      />
                    </div>
                    {/* EAN-13 — read-only text, value comes from the barcode scan */}
                    <div className="flex items-center p-3">
                      <span className="body-md-regular text-text-500">
                        {item.batch_barcode ?? ""}
                      </span>
                    </div>
                    {/* Fecha de Elaboración — 161px date picker (measured from Figma) */}
                    <div className="p-3">
                      <DatePickerInput
                        value={item.manufacture_date ?? null}
                        onChange={(v) =>
                          onUpdate(
                            item.barcode,
                            batchUpdates(item, { manufacture_date: v }),
                          )
                        }
                        className="w-[161px]"
                      />
                    </div>
                    {/* Fecha de Vencimiento — 161px date picker (measured from Figma) */}
                    <div className="p-3">
                      <DatePickerInput
                        value={item.expiration_date ?? null}
                        onChange={(v) =>
                          onUpdate(
                            item.barcode,
                            batchUpdates(item, { expiration_date: v }),
                          )
                        }
                        className="w-[161px]"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex items-center justify-center gap-1 p-2">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(0, pageIndex - 1))}
            disabled={pageIndex === 0}
            className="text-text-500 disabled:opacity-30"
          >
            <ChevronLeftIcon className="size-[22px]" />
          </button>
          {getPageItems(pageIndex, pageCount).map((page, i) =>
            page === "ellipsis" ? (
              <span
                key={`ellipsis-${i}`}
                className="flex h-[38px] w-8 items-center justify-center body-md-medium text-text-400"
              >
                ...
              </span>
            ) : (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                className={cn(
                  "flex h-[38px] items-center justify-center rounded-[4px]",
                  page === pageIndex
                    ? "w-[38px] bg-accent/15 body-md-semibold text-accent"
                    : "w-8 body-md-medium text-text-400 hover:bg-background-300",
                )}
              >
                {page + 1}
              </button>
            ),
          )}
          <button
            type="button"
            onClick={() => onPageChange(Math.min(pageCount - 1, pageIndex + 1))}
            disabled={pageIndex === pageCount - 1}
            className="text-text-500 disabled:opacity-30"
          >
            <ChevronRightIcon className="size-[22px]" />
          </button>
        </div>
      )}
    </div>
  );
}
