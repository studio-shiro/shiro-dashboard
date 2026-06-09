"use client";

import { useEffect, useState } from "react";
import {
  CheckCircleIcon,
  ChevronRightIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  PencilSquareIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import type { WizardProduct } from "@/store/productWizard";
import type { FeedbackBannerState } from "@/components/shared/FeedbackBanner";
import { cn } from "@/lib/utils";

interface AddedProductsPanelProps {
  items: WizardProduct[];
  columnVisibility: Record<string, boolean>;
  banner: FeedbackBannerState;
  onBannerClose: () => void;
  onEdit: (item: WizardProduct) => void;
  onDelete: (item: WizardProduct) => void;
  editingBarcode: string | null;
}

const COL_HEADERS: Record<string, string> = {
  product: "Producto",
  sku: "SKU",
  image: "Imagen",
  brand: "Marca",
  category: "Categoría",
  cost: "Costo Unitario",
  price: "Precio Final",
  stock: "Stock",
};

export function AddedProductsPanel({
  items,
  columnVisibility,
  banner,
  onBannerClose,
  onEdit,
  onDelete,
  editingBarcode,
}: AddedProductsPanelProps) {
  const [expandedBarcodes, setExpandedBarcodes] = useState<Set<string>>(new Set());

  // Auto-expand the first item when it's added
  useEffect(() => {
    if (items.length === 1) {
      setExpandedBarcodes(new Set([items[0].barcode]));
    }
  }, [items.length]);

  function toggleExpand(barcode: string) {
    setExpandedBarcodes((prev) => {
      const next = new Set(prev);
      if (next.has(barcode)) next.delete(barcode);
      else next.add(barcode);
      return next;
    });
  }

  const visibleCols = [
    "product",
    ...(columnVisibility.sku !== false ? ["sku"] : []),
    ...(columnVisibility.image !== false ? ["image"] : []),
    ...(columnVisibility.brand !== false ? ["brand"] : []),
    ...(columnVisibility.category !== false ? ["category"] : []),
    ...(columnVisibility.cost !== false ? ["cost"] : []),
    "price",
    ...(columnVisibility.stock !== false ? ["stock"] : []),
  ];

  const colCount = visibleCols.length + 1; // +1 for actions
  const gridTemplate = [
    "2fr",
    ...(columnVisibility.sku !== false ? ["1fr"] : []),
    ...(columnVisibility.image !== false ? ["80px"] : []),
    ...(columnVisibility.brand !== false ? ["1.2fr"] : []),
    ...(columnVisibility.category !== false ? ["1.2fr"] : []),
    ...(columnVisibility.cost !== false ? ["1.1fr"] : []),
    "1.1fr",
    ...(columnVisibility.stock !== false ? ["0.8fr"] : []),
    "72px",
  ].join(" ");

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-hidden rounded-xl border border-border-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-200 px-5 py-4">
        <h2 className="heading-md text-text-500">Productos Agregados</h2>
        {items.length > 0 && (
          <span className="rounded-full bg-background-300 px-2.5 py-0.5 body-sm-semibold text-text-400">
            {items.length}
          </span>
        )}
      </div>

      {/* Inline feedback banner */}
      {banner && (
        <div
          className="mx-5 flex items-start gap-3 rounded-lg px-4 py-3"
          style={{
            backgroundColor: banner.type === "success" ? "#f2f6f2" : "#faf2f2",
            borderLeft: `5px solid ${banner.type === "success" ? "#006922" : "#cd2b31"}`,
          }}
        >
          {banner.type === "success" ? (
            <CheckCircleIcon
              className="mt-px size-5 shrink-0"
              style={{ color: "#006922" }}
            />
          ) : (
            <ExclamationTriangleIcon
              className="mt-px size-5 shrink-0"
              style={{ color: "#cd2b31" }}
            />
          )}
          <p
            className="flex-1 body-md-regular"
            style={{ color: banner.type === "success" ? "#006922" : "#cd2b31" }}
          >
            {banner.message}
          </p>
          <button
            type="button"
            onClick={onBannerClose}
            aria-label="Cerrar"
            style={{ color: banner.type === "success" ? "#006922" : "#cd2b31" }}
          >
            <XMarkIcon className="size-5" />
          </button>
        </div>
      )}

      {/* Empty state */}
      {items.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-5 py-16 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-background-300">
            <CurrencyDollarIcon className="size-8 text-border-400" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="body-md-semibold text-text-500">Ningún producto agregado</p>
            <p className="body-sm-regular text-text-400">
              Completá el formulario y hacé click en &ldquo;Agregar Producto&rdquo; para empezar.
            </p>
          </div>
        </div>
      )}

      {/* Product list */}
      {items.length > 0 && (
        <div className="flex-1 overflow-y-auto px-5 pb-5">
          <div className="overflow-hidden rounded-xl border border-border-300">
            {/* Table header */}
            <div
              className="grid border-b border-border-300 bg-background-300"
              style={{ gridTemplateColumns: gridTemplate }}
            >
              {visibleCols.map((col, i) => (
                <div
                  key={col}
                  className={cn(
                    "body-sm-semibold p-2.5 text-text-400",
                    i < visibleCols.length - 1 && "border-r border-border-200",
                  )}
                >
                  {COL_HEADERS[col]}
                </div>
              ))}
              {/* Actions header */}
              <div className="border-l border-border-200 p-2.5" />
            </div>

            {/* Rows */}
            {items.map((item) => {
              const isExpanded = expandedBarcodes.has(item.barcode);
              const isEditing = editingBarcode === item.barcode;

              return (
                <div
                  key={item.barcode}
                  className={cn(
                    "border-b border-border-200 last:border-0",
                    isEditing && "bg-accent/5",
                  )}
                >
                  {/* Main row */}
                  <div
                    className="grid items-center"
                    style={{ gridTemplateColumns: gridTemplate }}
                  >
                    {/* Producto */}
                    <div className="flex items-center gap-2 p-2.5">
                      <button
                        type="button"
                        onClick={() => toggleExpand(item.barcode)}
                        className="shrink-0 text-text-300 transition-colors hover:text-text-500"
                        title={isExpanded ? "Colapsar" : "Expandir"}
                      >
                        <ChevronRightIcon
                          className={cn(
                            "size-4 transition-transform duration-200",
                            isExpanded && "rotate-90",
                          )}
                        />
                      </button>
                      <span className="body-md-semibold truncate text-text-500">
                        {item.name || <span className="text-text-300">—</span>}
                      </span>
                    </div>

                    {/* SKU */}
                    {columnVisibility.sku !== false && (
                      <div className="border-l border-border-200 p-2.5">
                        <span className="body-sm-regular text-text-400">
                          {item.reference || "—"}
                        </span>
                      </div>
                    )}

                    {/* Imagen */}
                    {columnVisibility.image !== false && (
                      <div className="flex items-center justify-center border-l border-border-200 p-2">
                        {item.image_url ? (
                          <div className="size-12 overflow-hidden rounded-lg">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="size-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex size-12 items-center justify-center rounded-lg bg-background-300">
                            <span className="body-xs-regular text-text-300">—</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Marca */}
                    {columnVisibility.brand !== false && (
                      <div className="border-l border-border-200 p-2.5">
                        <span className="body-sm-regular text-text-400">
                          {item.brand_name || "—"}
                        </span>
                      </div>
                    )}

                    {/* Categoría */}
                    {columnVisibility.category !== false && (
                      <div className="border-l border-border-200 p-2.5">
                        <span className="body-sm-regular text-text-400">
                          {item.category_name || "—"}
                        </span>
                      </div>
                    )}

                    {/* Costo */}
                    {columnVisibility.cost !== false && (
                      <div className="border-l border-border-200 p-2.5">
                        <span className="body-sm-regular text-text-400">
                          {item.cost_price !== null
                            ? `$${item.cost_price.toLocaleString("es-AR")}`
                            : "—"}
                        </span>
                      </div>
                    )}

                    {/* Precio */}
                    <div className="border-l border-border-200 p-2.5">
                      <span className="body-sm-semibold text-text-500">
                        {item.price !== null
                          ? `$${item.price.toLocaleString("es-AR")}`
                          : "—"}
                      </span>
                    </div>

                    {/* Stock */}
                    {columnVisibility.stock !== false && (
                      <div className="border-l border-border-200 p-2.5">
                        <span className="body-sm-regular text-text-400">
                          {item.stock_quantity}
                        </span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-center gap-2 border-l border-border-200 px-2">
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        className="text-text-300 transition-colors hover:text-accent"
                        title="Editar"
                      >
                        <PencilSquareIcon className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(item)}
                        className="text-text-300 transition-colors hover:text-danger-300"
                        title="Eliminar"
                      >
                        <XMarkIcon className="size-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded batch info */}
                  {isExpanded && item.tracks_batches && (
                    <>
                      <div className="grid grid-cols-4 border-t border-border-200 bg-background-300">
                        {["Nro. Lote", "EAN-13", "Fecha Elaboración", "Fecha Vencimiento"].map(
                          (label) => (
                            <div key={label} className="body-sm-semibold p-2.5 text-text-400">
                              {label}
                            </div>
                          ),
                        )}
                      </div>
                      <div className="grid grid-cols-4 border-t border-border-200 bg-background-300 px-2.5 py-2">
                        <span className="body-sm-regular p-0.5 text-text-500">
                          {item.lot_number || "—"}
                        </span>
                        <span className="body-sm-regular p-0.5 text-text-500">
                          {item.batch_barcode || "—"}
                        </span>
                        <span className="body-sm-regular p-0.5 text-text-500">
                          {item.manufacture_date || "—"}
                        </span>
                        <span className="body-sm-regular p-0.5 text-text-500">
                          {item.expiration_date || "—"}
                        </span>
                      </div>
                    </>
                  )}

                  {/* Expanded non-batch info (no batch data but expandable for future) */}
                  {isExpanded && !item.tracks_batches && (
                    <div className="border-t border-border-200 bg-background-300 px-5 py-3">
                      <p className="body-sm-regular text-text-300">
                        Este producto no tiene seguimiento de lote activado.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
