"use client";

import { useEffect, useRef, useState } from "react";
import { XMarkIcon, ChevronRightIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { CubeIcon, ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import type { WizardProduct } from "@/store/productWizard";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { uploadFile, buildStoragePath } from "@/lib/supabase/storage";
import { FIXED_COLUMN_IDS } from "@/components/products/ProductsColumns";

const COL_WIDTHS: Record<string, string> = {
  producto: "1fr",
  sku: "110px",
  imagen: "80px",
  marca: "130px",
  categoria: "130px",
  vencimientos: "130px",
  costo: "150px",
  precio: "200px",
  stock: "90px",
  _delete: "40px",
};

const ORDERED_COLS = [
  "producto",
  "sku",
  "imagen",
  "marca",
  "categoria",
  "vencimientos",
  "costo",
  "precio",
  "stock",
  "_delete",
];

const COL_HEADERS: Record<string, string> = {
  producto: "Producto",
  sku: "SKU",
  imagen: "Imagen",
  marca: "Marca",
  categoria: "Categoría",
  vencimientos: "Vencimientos",
  costo: "Costo Unitario",
  precio: "Precio Final Unitario",
  stock: "Stock",
  _delete: "",
};

interface ProductDetailsTableProps {
  items: WizardProduct[];
  onUpdate: (barcode: string, updates: Partial<WizardProduct>) => void;
  onDelete: (item: WizardProduct) => void;
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
  pageIndex,
  pageCount,
  onPageChange,
  totalCount,
  columnVisibility,
}: ProductDetailsTableProps) {
  const [expandedBarcodes, setExpandedBarcodes] = useState<Set<string>>(new Set());
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [uploadingBarcodes, setUploadingBarcodes] = useState<Set<string>>(new Set());
  const fileInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => {
        setBusinessId(data.user?.user_metadata?.business_id ?? null);
      });
  }, []);

  const visibleCols = ORDERED_COLS.filter((col) => {
    if (col === "_delete") return true;
    if (FIXED_COLUMN_IDS.includes(col as typeof FIXED_COLUMN_IDS[number])) return true;
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

  async function handleImageChange(barcode: string, file: File) {
    if (!businessId) return;
    setUploadingBarcodes((prev) => new Set(prev).add(barcode));
    try {
      const path = buildStoragePath("products", businessId, barcode, file);
      const url = await uploadFile(file, "product-images", path);
      if (url) onUpdate(barcode, { image_url: url });
    } finally {
      setUploadingBarcodes((prev) => {
        const next = new Set(prev);
        next.delete(barcode);
        return next;
      });
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-lg border border-border-300 bg-white">
        {/* Header */}
        <div
          className="grid border-b border-border-200 bg-background-300 px-4 py-3"
          style={{ gridTemplateColumns: gridTemplate }}
        >
          {visibleCols.map((col) => (
            <div key={col} className="body-md-semibold text-text-400 truncate px-1">
              {COL_HEADERS[col]}
            </div>
          ))}
        </div>

        {/* Rows */}
        {items.map((item) => {
          const isExpanded = expandedBarcodes.has(item.barcode);
          const isUploading = uploadingBarcodes.has(item.barcode);

          return (
            <div key={item.barcode} className="border-b border-border-100 last:border-0">
              <div
                className="grid items-center px-4 py-3"
                style={{ gridTemplateColumns: gridTemplate }}
              >
                {visibleCols.map((col) => {
                  if (col === "producto") return (
                    <div key="producto" className="flex items-center gap-2 px-1">
                      {item.tracks_batches && (
                        <button
                          type="button"
                          onClick={() => toggleExpand(item.barcode)}
                          className="shrink-0 text-text-400"
                        >
                          {isExpanded ? (
                            <ChevronDownIcon className="size-5" />
                          ) : (
                            <ChevronRightIcon className="size-5" />
                          )}
                        </button>
                      )}
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => onUpdate(item.barcode, { name: e.target.value })}
                        placeholder="Nombre del producto"
                        className={cn(
                          "w-full rounded-md border border-border-200 bg-white px-2 py-1.5",
                          "body-md-regular text-text-500 focus:border-accent focus:outline-none",
                          !item.name && "border-danger-300",
                        )}
                      />
                    </div>
                  );

                  if (col === "sku") return (
                    <div key="sku" className="px-1">
                      <input
                        type="text"
                        value={item.reference}
                        onChange={(e) => onUpdate(item.barcode, { reference: e.target.value })}
                        placeholder="-"
                        className="w-full rounded-md border border-border-200 bg-white px-2 py-1.5 body-md-regular text-text-500 focus:border-accent focus:outline-none"
                      />
                    </div>
                  );

                  if (col === "imagen") return (
                    <div key="imagen" className="flex items-center justify-center px-1">
                      <button
                        type="button"
                        onClick={() => fileInputRefs.current.get(item.barcode)?.click()}
                        disabled={isUploading || !businessId}
                        className="group relative size-[47px] overflow-hidden rounded-lg border border-border-100 bg-background-300 transition-opacity hover:opacity-80 disabled:opacity-50"
                        title="Cambiar imagen"
                      >
                        {isUploading ? (
                          <div className="flex h-full w-full items-center justify-center">
                            <span className="size-4 animate-spin rounded-full border-2 border-border-300 border-t-accent" />
                          </div>
                        ) : item.image_url ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                              <ArrowUpTrayIcon className="size-4 text-white" />
                            </div>
                          </>
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center gap-0.5">
                            <CubeIcon className="size-4 text-text-300" />
                            <span className="text-[9px] text-text-300">Imagen</span>
                          </div>
                        )}
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

                  if (col === "marca") return (
                    <div key="marca" className="px-1">
                      <input
                        type="text"
                        value={item.brand_name ?? ""}
                        onChange={(e) => onUpdate(item.barcode, { brand_name: e.target.value })}
                        placeholder="-"
                        className="w-full rounded-md border border-border-200 bg-white px-2 py-1.5 body-md-regular text-text-500 focus:border-accent focus:outline-none"
                      />
                    </div>
                  );

                  if (col === "categoria") return (
                    <div key="categoria" className="px-1">
                      <input
                        type="text"
                        value={item.category_name ?? ""}
                        onChange={(e) => onUpdate(item.barcode, { category_name: e.target.value })}
                        placeholder="-"
                        className="w-full rounded-md border border-border-200 bg-white px-2 py-1.5 body-md-regular text-text-500 focus:border-accent focus:outline-none"
                      />
                    </div>
                  );

                  if (col === "vencimientos") return (
                    <div key="vencimientos" className="flex items-center justify-center px-1">
                      <button
                        type="button"
                        onClick={() => onUpdate(item.barcode, { tracks_batches: !item.tracks_batches })}
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

                  if (col === "costo") return (
                    <div key="costo" className="flex items-center gap-1 px-1">
                      <span className="body-md-regular text-text-400">$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.cost_price ?? ""}
                        onChange={(e) =>
                          onUpdate(item.barcode, {
                            cost_price: e.target.value ? Number(e.target.value) : null,
                          })
                        }
                        placeholder="-"
                        className="w-full rounded-md border border-border-200 bg-white px-2 py-1.5 body-md-regular text-text-500 focus:border-accent focus:outline-none"
                      />
                    </div>
                  );

                  if (col === "precio") return (
                    <div key="precio" className="flex items-center gap-1 px-1">
                      <span className="body-md-regular text-text-400">$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.price ?? ""}
                        onChange={(e) =>
                          onUpdate(item.barcode, {
                            price: e.target.value ? Number(e.target.value) : null,
                          })
                        }
                        placeholder="-"
                        className={cn(
                          "w-full rounded-md border bg-white px-2 py-1.5 body-md-regular text-text-500 focus:border-accent focus:outline-none",
                          !item.price ? "border-danger-300" : "border-border-200",
                        )}
                      />
                    </div>
                  );

                  if (col === "stock") return (
                    <div key="stock" className="px-1">
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
                        className="w-full rounded-md border border-border-200 bg-white px-2 py-1.5 body-md-regular text-text-500 focus:border-accent focus:outline-none"
                      />
                    </div>
                  );

                  if (col === "_delete") return (
                    <div key="_delete" className="flex items-center justify-center">
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

              {/* Batch sub-row */}
              {isExpanded && item.tracks_batches && (
                <div className="grid grid-cols-[180px_180px_1fr_180px] gap-4 border-t border-border-100 bg-background-300 px-8 py-3">
                  <div className="flex flex-col gap-1">
                    <label className="body-sm-semibold text-text-400">Número de Lote</label>
                    <input
                      type="text"
                      value={item.lot_number ?? ""}
                      onChange={(e) => onUpdate(item.barcode, { lot_number: e.target.value || null })}
                      className="rounded-md border border-border-200 bg-white px-2 py-1.5 body-md-regular text-text-500 focus:border-accent focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="body-sm-semibold text-text-400">EAN-13</label>
                    <input
                      type="text"
                      value={item.batch_barcode ?? ""}
                      onChange={(e) => onUpdate(item.barcode, { batch_barcode: e.target.value || null })}
                      className="rounded-md border border-border-200 bg-white px-2 py-1.5 body-md-regular text-text-500 focus:border-accent focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="body-sm-semibold text-text-400">Fecha de Elaboración</label>
                    <input
                      type="date"
                      value={item.manufacture_date ?? ""}
                      onChange={(e) => onUpdate(item.barcode, { manufacture_date: e.target.value || null })}
                      className="rounded-md border border-border-200 bg-white px-2 py-1.5 body-md-regular text-text-500 focus:border-accent focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="body-sm-semibold text-text-400">Fecha de Vencimiento</label>
                    <input
                      type="date"
                      value={item.expiration_date ?? ""}
                      onChange={(e) => onUpdate(item.barcode, { expiration_date: e.target.value || null })}
                      className="rounded-md border border-border-200 bg-white px-2 py-1.5 body-md-regular text-text-500 focus:border-accent focus:outline-none"
                    />
                  </div>
                </div>
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
