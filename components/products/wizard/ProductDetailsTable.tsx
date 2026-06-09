"use client";

import { useEffect, useRef, useState } from "react";
import {
  XMarkIcon,
  ChevronRightIcon,
  PhotoIcon,
  ArrowUpTrayIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import type { WizardProduct } from "@/store/productWizard";
import { cn } from "@/lib/utils";
import { FIXED_COLUMN_IDS } from "@/components/products/ProductsColumns";
import { DatePickerInput } from "@/components/products/wizard/DatePickerInput";

const COL_WIDTHS: Record<string, string> = {
  product: "2fr",
  sku: "1fr",
  image: "100px",
  brand: "1.3fr",
  category: "1.3fr",
  batches: "1fr",
  cost: "1.1fr",
  price: "1.1fr",
  stock: "1fr",
  _delete: "40px",
};

const ORDERED_COLS = [
  "product",
  "sku",
  "image",
  "brand",
  "category",
  "batches",
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
  batches: "Vencimientos",
  cost: "Costo Unitario",
  price: "Precio Final Unitario",
  stock: "Stock",
  _delete: "",
};

const inputCls =
  "w-full h-[30px] rounded-md border border-border-400 bg-white px-2 body-md-regular text-text-500 shadow-sm focus:border-accent focus:outline-none";

interface ProductDetailsTableProps {
  items: WizardProduct[];
  onUpdate: (barcode: string, updates: Partial<WizardProduct>) => void;
  onDelete: (item: WizardProduct) => void;
  onFilePicked: (barcode: string, file: File) => void;
  pageIndex: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  totalCount: number;
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
  totalCount,
  columnVisibility,
}: ProductDetailsTableProps) {
  const [expandedBarcodes, setExpandedBarcodes] = useState<Set<string>>(
    new Set(),
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

  return (
    <div className="flex flex-col gap-4">
      {/* Table */}
      <div className="overflow-hidden rounded-xl bg-white shadow-lg">
        {/* Header — outer border matches Figma _Actions container */}
        <div
          className="grid border border-border-300 bg-background-300"
          style={{ gridTemplateColumns: gridTemplate }}
        >
          {visibleCols.map((col, i) => (
            <div
              key={col}
              className={cn(
                "body-md-semibold p-2 text-text-400",
                i < visibleCols.length - 1 && "border-r border-border-200",
              )}
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
            <div
              key={item.barcode}
              className="border-b border-border-100 last:border-0"
            >
              {/* Main data row */}
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
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) =>
                            onUpdate(item.barcode, { name: e.target.value })
                          }
                          placeholder="Nombre del producto"
                          className={cn(
                            inputCls,
                            !item.name && "border-danger-300",
                          )}
                        />
                        {item.tracks_batches && (
                          <button
                            type="button"
                            onClick={() => toggleExpand(item.barcode)}
                            className="shrink-0 text-text-400 transition-colors hover:text-text-500"
                          >
                            <ChevronRightIcon
                              className={cn(
                                "size-5 transition-transform duration-200",
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
                        <input
                          type="text"
                          value={item.reference}
                          onChange={(e) =>
                            onUpdate(item.barcode, {
                              reference: e.target.value,
                            })
                          }
                          placeholder="-"
                          className={inputCls}
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
                        {/* Photo icon — clickable */}
                        <button
                          type="button"
                          onClick={() =>
                            fileInputRefs.current.get(item.barcode)?.click()
                          }
                          className="group relative size-16"
                          title="Cambiar imagen"
                        >
                          {previewUrl ? (
                            <div className="size-full overflow-hidden rounded-md">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={previewUrl}
                                alt={item.name}
                                className="size-full object-cover"
                              />
                              <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                                <ArrowUpTrayIcon className="size-4 text-white" />
                              </div>
                            </div>
                          ) : (
                            <PhotoIcon className="size-full text-text-300" />
                          )}
                        </button>

                        {/* "Imagen" upload button — absolute below icon, matches Figma */}
                        {!previewUrl && (
                          <button
                            type="button"
                            onClick={() =>
                              fileInputRefs.current.get(item.barcode)?.click()
                            }
                            className="absolute bottom-2 flex h-[22px] items-center gap-0.5 overflow-hidden rounded-md border border-border-400 bg-white px-2 shadow-sm"
                          >
                            <ArrowUpTrayIcon className="size-3 text-text-500" />
                            <span className="body-sm-regular text-text-500">
                              Imagen
                            </span>
                          </button>
                        )}

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
                        <input
                          type="text"
                          value={item.brand_name ?? ""}
                          onChange={(e) =>
                            onUpdate(item.barcode, {
                              brand_name: e.target.value,
                            })
                          }
                          placeholder="-"
                          className={inputCls}
                        />
                      </div>
                    );

                  /* ── Categoría ── */
                  if (col === "category")
                    return (
                      <div key="category" className="p-3">
                        <input
                          type="text"
                          value={item.category_name ?? ""}
                          onChange={(e) =>
                            onUpdate(item.barcode, {
                              category_name: e.target.value,
                            })
                          }
                          placeholder="-"
                          className={inputCls}
                        />
                      </div>
                    );

                  /* ── Vencimientos (toggle) ── */
                  if (col === "batches")
                    return (
                      <div
                        key="batches"
                        className="flex items-center justify-center p-3"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            onUpdate(item.barcode, {
                              tracks_batches: !item.tracks_batches,
                            })
                          }
                          className={cn(
                            "relative h-5 w-9 rounded-full transition-colors",
                            item.tracks_batches ? "bg-accent" : "bg-border-300",
                          )}
                        >
                          <span
                            className={cn(
                              "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
                              item.tracks_batches ? "left-[18px]" : "left-0.5",
                            )}
                          />
                        </button>
                      </div>
                    );

                  /* ── Costo Unitario ── */
                  if (col === "cost")
                    return (
                      <div key="cost" className="p-3">
                        <div className="flex h-[30px] w-full items-center overflow-hidden rounded-md border border-border-400 bg-white pl-1 pr-2 shadow-sm focus-within:border-accent">
                          <CurrencyDollarIcon className="size-5 shrink-0 text-text-400" />
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.cost_price ?? ""}
                            onChange={(e) =>
                              onUpdate(item.barcode, {
                                cost_price: e.target.value
                                  ? Number(e.target.value)
                                  : null,
                              })
                            }
                            placeholder="-"
                            className="w-full bg-transparent body-md-regular text-text-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    );

                  /* ── Precio Final ── */
                  if (col === "price")
                    return (
                      <div key="price" className="p-3">
                        <div className="flex h-[30px] w-full items-center overflow-hidden rounded-md border border-border-400 bg-white pl-1 pr-2 shadow-sm focus-within:border-accent">
                          <CurrencyDollarIcon className="size-5 shrink-0 text-text-400" />
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.price ?? ""}
                            onChange={(e) =>
                              onUpdate(item.barcode, {
                                price: e.target.value
                                  ? Number(e.target.value)
                                  : null,
                              })
                            }
                            placeholder="-"
                            className="w-full bg-transparent body-md-regular text-text-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    );

                  /* ── Stock ── */
                  if (col === "stock")
                    return (
                      <div key="stock" className="p-3">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={item.stock_quantity}
                          onChange={(e) =>
                            onUpdate(item.barcode, {
                              stock_quantity: Number(e.target.value) || 0,
                            })
                          }
                          className={inputCls}
                        />
                      </div>
                    );

                  /* ── Delete ── */
                  if (col === "_delete")
                    return (
                      <div
                        key="_delete"
                        className="flex items-center justify-center pr-2"
                      >
                        <button
                          type="button"
                          onClick={() => onDelete(item)}
                          className="text-text-300 transition-colors hover:text-danger-300"
                        >
                          <XMarkIcon className="size-5" />
                        </button>
                      </div>
                    );

                  return null;
                })}
              </div>

              {/* Batch sub-rows — header labels + input cells (matching Figma layout) */}
              {isExpanded && item.tracks_batches && (
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
                          "body-md-semibold p-2 pl-3 text-text-400",
                        )}
                      >
                        {label}
                      </div>
                    ))}
                  </div>
                  {/* Sub-data row */}
                  <div className="grid grid-cols-4 gap-3 border-b border-border-200 bg-background-600 px-3 py-3">
                    <input
                      type="text"
                      value={item.lot_number ?? ""}
                      onChange={(e) =>
                        onUpdate(item.barcode, {
                          lot_number: e.target.value || null,
                        })
                      }
                      placeholder="-"
                      className={inputCls}
                    />
                    <input
                      type="text"
                      value={item.batch_barcode ?? ""}
                      onChange={(e) =>
                        onUpdate(item.barcode, {
                          batch_barcode: e.target.value || null,
                        })
                      }
                      placeholder="-"
                      className={inputCls}
                    />
                    <DatePickerInput
                      value={item.manufacture_date ?? null}
                      onChange={(v) =>
                        onUpdate(item.barcode, { manufacture_date: v })
                      }
                    />
                    <DatePickerInput
                      value={item.expiration_date ?? null}
                      onChange={(v) =>
                        onUpdate(item.barcode, { expiration_date: v })
                      }
                    />
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(0, pageIndex - 1))}
            disabled={pageIndex === 0}
            className="rounded px-2 py-1 body-sm-regular text-text-400 hover:text-text-500 disabled:opacity-50"
          >
            ‹
          </button>
          {Array.from({ length: pageCount }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onPageChange(i)}
              className={cn(
                "size-7 rounded-md body-sm-semibold",
                i === pageIndex
                  ? "bg-accent text-white"
                  : "text-text-400 hover:bg-background-300",
              )}
            >
              {i + 1}
            </button>
          ))}
          <span className="body-sm-regular text-text-400">...</span>
          <button
            type="button"
            onClick={() => onPageChange(Math.min(pageCount - 1, pageIndex + 1))}
            disabled={pageIndex === pageCount - 1}
            className="rounded px-2 py-1 body-sm-regular text-text-400 hover:text-text-500 disabled:opacity-50"
          >
            ›
          </button>
          <span className="body-sm-regular text-text-400">
            de {totalCount} productos
          </span>
        </div>
      )}
    </div>
  );
}
