"use client";

import { useState } from "react";
import { XMarkIcon, ChevronRightIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { CubeIcon } from "@heroicons/react/24/outline";
import type { WizardProduct } from "@/store/productWizard";
import { cn } from "@/lib/utils";

interface ProductDetailsTableProps {
  items: WizardProduct[];
  onUpdate: (barcode: string, updates: Partial<WizardProduct>) => void;
  onDelete: (item: WizardProduct) => void;
  pageIndex: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  totalCount: number;
}

export function ProductDetailsTable({
  items,
  onUpdate,
  onDelete,
  pageIndex,
  pageCount,
  onPageChange,
  totalCount,
}: ProductDetailsTableProps) {
  const [expandedBarcodes, setExpandedBarcodes] = useState<Set<string>>(
    new Set(),
  );

  function toggleExpand(barcode: string) {
    setExpandedBarcodes((prev) => {
      const next = new Set(prev);
      if (next.has(barcode)) next.delete(barcode);
      else next.add(barcode);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-lg border border-border-300 bg-white">
        {/* Header */}
        <div className="grid grid-cols-[1fr_100px_80px_120px_120px_130px_160px_80px_40px] border-b border-border-200 bg-background-300 px-4 py-3">
          {["Producto", "SKU", "Imagen", "Marca", "Categoría", "Costo Unitario", "Precio Final Unitario", "Stock", ""].map(
            (col) => (
              <div
                key={col}
                className="body-md-semibold text-text-400 px-1"
              >
                {col}
              </div>
            ),
          )}
        </div>

        {/* Rows */}
        {items.map((item) => {
          const isExpanded = expandedBarcodes.has(item.barcode);
          return (
            <div key={item.barcode} className="border-b border-border-100 last:border-0">
              {/* Main row */}
              <div className="grid grid-cols-[1fr_100px_80px_120px_120px_130px_160px_80px_40px] items-center px-4 py-3">
                {/* Producto */}
                <div className="flex items-center gap-2 px-1">
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
                    onChange={(e) =>
                      onUpdate(item.barcode, { name: e.target.value })
                    }
                    placeholder="Nombre del producto"
                    className={cn(
                      "w-full rounded-md border border-border-200 bg-white px-2 py-1.5",
                      "body-md-regular text-text-500 focus:border-accent focus:outline-none",
                      !item.name && "border-danger-300",
                    )}
                  />
                </div>

                {/* SKU */}
                <div className="px-1">
                  <input
                    type="text"
                    value={item.reference}
                    onChange={(e) =>
                      onUpdate(item.barcode, { reference: e.target.value })
                    }
                    placeholder="-"
                    className="w-full rounded-md border border-border-200 bg-white px-2 py-1.5 body-md-regular text-text-500 focus:border-accent focus:outline-none"
                  />
                </div>

                {/* Imagen */}
                <div className="flex items-center justify-center px-1">
                  <div className="relative size-[47px] overflow-hidden rounded-lg border border-border-100 bg-background-300">
                    {item.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-0.5">
                        <CubeIcon className="size-4 text-text-300" />
                        <span className="text-[9px] text-text-300">Imagen</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Marca */}
                <div className="px-1">
                  <input
                    type="text"
                    value={item.brand_name ?? ""}
                    onChange={(e) =>
                      onUpdate(item.barcode, { brand_name: e.target.value })
                    }
                    placeholder="-"
                    className="w-full rounded-md border border-border-200 bg-white px-2 py-1.5 body-md-regular text-text-500 focus:border-accent focus:outline-none"
                  />
                </div>

                {/* Categoría */}
                <div className="px-1">
                  <input
                    type="text"
                    value={item.category_name ?? ""}
                    onChange={(e) =>
                      onUpdate(item.barcode, { category_name: e.target.value })
                    }
                    placeholder="-"
                    className="w-full rounded-md border border-border-200 bg-white px-2 py-1.5 body-md-regular text-text-500 focus:border-accent focus:outline-none"
                  />
                </div>

                {/* Costo Unitario */}
                <div className="flex items-center gap-1 px-1">
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

                {/* Precio Final */}
                <div className="flex items-center gap-1 px-1">
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

                {/* Stock */}
                <div className="px-1">
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

                {/* Delete */}
                <div className="flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => onDelete(item)}
                    className="text-text-300 transition-colors hover:text-danger-300"
                  >
                    <XMarkIcon className="size-5" />
                  </button>
                </div>
              </div>

              {/* Batch sub-row */}
              {isExpanded && item.tracks_batches && (
                <div className="grid grid-cols-[180px_180px_1fr_180px] gap-4 border-t border-border-100 bg-background-300 px-8 py-3">
                  <div className="flex flex-col gap-1">
                    <label className="body-sm-semibold text-text-400">Número de Lote</label>
                    <input
                      type="text"
                      value={item.lot_number ?? ""}
                      onChange={(e) =>
                        onUpdate(item.barcode, { lot_number: e.target.value || null })
                      }
                      className="rounded-md border border-border-200 bg-white px-2 py-1.5 body-md-regular text-text-500 focus:border-accent focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="body-sm-semibold text-text-400">EAN-13</label>
                    <input
                      type="text"
                      value={item.batch_barcode ?? ""}
                      onChange={(e) =>
                        onUpdate(item.barcode, { batch_barcode: e.target.value || null })
                      }
                      className="rounded-md border border-border-200 bg-white px-2 py-1.5 body-md-regular text-text-500 focus:border-accent focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="body-sm-semibold text-text-400">Fecha de Elaboración</label>
                    <input
                      type="date"
                      value={item.manufacture_date ?? ""}
                      onChange={(e) =>
                        onUpdate(item.barcode, { manufacture_date: e.target.value || null })
                      }
                      className="rounded-md border border-border-200 bg-white px-2 py-1.5 body-md-regular text-text-500 focus:border-accent focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="body-sm-semibold text-text-400">Fecha de Vencimiento</label>
                    <input
                      type="date"
                      value={item.expiration_date ?? ""}
                      onChange={(e) =>
                        onUpdate(item.barcode, { expiration_date: e.target.value || null })
                      }
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
