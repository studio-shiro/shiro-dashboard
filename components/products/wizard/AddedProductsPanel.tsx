"use client";

import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  createColumnHelper,
  flexRender,
  type PaginationState,
} from "@tanstack/react-table";
import {
  ChevronRightIcon,
  CurrencyDollarIcon,
  PencilSquareIcon,
  PhotoIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import type { WizardProduct } from "@/store/productWizard";
import { cn } from "@/lib/utils";
import { Pagination } from "@/components/shared/Pagination";
import { DatePickerInput } from "@/components/products/wizard/DatePickerInput";
import { batchUpdates } from "@/components/products/wizard/ProductDetailsTable";
import { FormInput } from "@/components/shared/FormInput";

interface AddedProductsPanelProps {
  items: WizardProduct[];
  columnVisibility: Record<string, boolean>;
  onEdit: (item: WizardProduct) => void;
  onUpdate: (barcode: string, updates: Partial<WizardProduct>) => void;
  onDelete: (item: WizardProduct) => void;
  editingBarcode: string | null;
}

interface WizardTableMeta {
  editingBarcode: string | null;
  expandedBarcodes: Set<string>;
  onToggleExpand: (barcode: string) => void;
  onEdit: (item: WizardProduct) => void;
  onDelete: (item: WizardProduct) => void;
}

// Proportions taken from the Figma table (885px total): Producto 176,
// SKU 92, Imagen 92, Marca 103, Categoría 92, Costo 92, Precio 105,
// Stock 58, acciones 77. fr units keep them fluid at any panel width.
const COLUMN_WIDTHS: Record<string, string> = {
  product: "176fr",
  sku: "92fr",
  image: "92fr",
  brand: "103fr",
  category: "92fr",
  cost: "92fr",
  price: "105fr",
  stock: "58fr",
  actions: "77fr",
};

const COL_HEADERS: Record<string, string> = {
  product: "Producto",
  sku: "SKU",
  image: "Imagen",
  brand: "Marca",
  category: "Categoría",
  cost: "Costo Unitario",
  price: "Precio Final Unitario",
  stock: "Stock",
};

// 4 rows per page — matches Figma: the table never scrolls internally.
const PAGE_SIZE = 4;

const columnHelper = createColumnHelper<WizardProduct>();

const columns = [
  columnHelper.display({
    id: "product",
    header: () => COL_HEADERS.product,
    cell: ({ row, table }) => {
      const meta = table.options.meta as WizardTableMeta;
      const item = row.original;
      const isEditing = meta.editingBarcode === item.barcode;
      const isExpanded = meta.expandedBarcodes.has(item.barcode);
      return (
        <div className="flex items-center gap-2 p-3">
          <span
            className={cn(
              "body-md-semibold truncate underline underline-offset-2",
              isEditing ? "text-text-300" : "text-[#363636]",
            )}
          >
            {item.name || "—"}
          </span>
          <button
            type="button"
            onClick={() => meta.onToggleExpand(item.barcode)}
            className={cn(
              "shrink-0 transition-colors",
              isEditing ? "text-text-300" : "text-text-300 hover:text-text-500",
            )}
            title={isExpanded ? "Colapsar" : "Expandir"}
          >
            <ChevronRightIcon
              className={cn(
                "size-6 text-text-400 transition-transform duration-200",
                isExpanded && "rotate-90",
              )}
            />
          </button>
        </div>
      );
    },
  }),
  columnHelper.display({
    id: "sku",
    header: () => COL_HEADERS.sku,
    cell: ({ row, table }) => {
      const { editingBarcode } = table.options.meta as WizardTableMeta;
      const item = row.original;
      const isEditing = editingBarcode === item.barcode;
      return (
        <div className="p-3">
          <span
            className={cn(
              "body-md-semibold",
              isEditing ? "text-text-300" : "text-text-500",
            )}
          >
            {item.reference || "—"}
          </span>
        </div>
      );
    },
  }),
  columnHelper.display({
    id: "image",
    header: () => COL_HEADERS.image,
    cell: ({ row, table }) => {
      const { editingBarcode } = table.options.meta as WizardTableMeta;
      const item = row.original;
      const isEditing = editingBarcode === item.barcode;
      return (
        <div className="flex items-center justify-center p-3">
          {item.image_url ? (
            <div
              className={cn(
                "size-[70px] overflow-hidden rounded-[10px]",
                isEditing && "opacity-50",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image_url}
                alt={item.name}
                className="size-full object-contain"
              />
            </div>
          ) : (
            <div
              className={cn(
                "flex size-[70px] items-center justify-center rounded-[10px]",
                isEditing && "opacity-50",
              )}
            >
              <PhotoIcon className="size-16 text-border-300" />
            </div>
          )}
        </div>
      );
    },
  }),
  columnHelper.display({
    id: "brand",
    header: () => COL_HEADERS.brand,
    cell: ({ row, table }) => {
      const { editingBarcode } = table.options.meta as WizardTableMeta;
      const item = row.original;
      const isEditing = editingBarcode === item.barcode;
      return (
        <div className="p-3">
          <span
            className={cn(
              "body-md-regular",
              isEditing ? "text-text-300" : "text-text-500",
            )}
          >
            {item.brand_name || "—"}
          </span>
        </div>
      );
    },
  }),
  columnHelper.display({
    id: "category",
    header: () => COL_HEADERS.category,
    cell: ({ row, table }) => {
      const { editingBarcode } = table.options.meta as WizardTableMeta;
      const item = row.original;
      const isEditing = editingBarcode === item.barcode;
      return (
        <div className="p-3">
          <span
            className={cn(
              "body-md-regular",
              isEditing ? "text-text-300" : "text-text-500",
            )}
          >
            {item.category_name || "—"}
          </span>
        </div>
      );
    },
  }),
  columnHelper.display({
    id: "cost",
    header: () => COL_HEADERS.cost,
    cell: ({ row, table }) => {
      const { editingBarcode } = table.options.meta as WizardTableMeta;
      const item = row.original;
      const isEditing = editingBarcode === item.barcode;
      return (
        <div className="p-3">
          <span
            className={cn(
              "body-md-regular",
              isEditing ? "text-text-300" : "text-text-500",
            )}
          >
            {item.cost_price !== null
              ? `$${item.cost_price.toLocaleString("es-AR")}`
              : "—"}
          </span>
        </div>
      );
    },
  }),
  columnHelper.display({
    id: "price",
    header: () => COL_HEADERS.price,
    cell: ({ row, table }) => {
      const { editingBarcode } = table.options.meta as WizardTableMeta;
      const item = row.original;
      const isEditing = editingBarcode === item.barcode;
      return (
        <div className="p-3">
          <span
            className={cn(
              "body-md-regular",
              isEditing ? "text-text-300" : "text-text-500",
            )}
          >
            {item.price !== null
              ? `$${item.price.toLocaleString("es-AR")}`
              : "—"}
          </span>
        </div>
      );
    },
  }),
  columnHelper.display({
    id: "stock",
    header: () => COL_HEADERS.stock,
    cell: ({ row, table }) => {
      const { editingBarcode } = table.options.meta as WizardTableMeta;
      const item = row.original;
      const isEditing = editingBarcode === item.barcode;
      return (
        <div className="p-3">
          <span
            className={cn(
              "body-md-regular",
              isEditing ? "text-text-300" : "text-text-500",
            )}
          >
            {item.stock_quantity}
          </span>
        </div>
      );
    },
  }),
  columnHelper.display({
    id: "actions",
    header: () => null,
    cell: ({ row, table }) => {
      const { editingBarcode, onEdit, onDelete } = table.options
        .meta as WizardTableMeta;
      const item = row.original;
      const isEditing = editingBarcode === item.barcode;
      const isBlocked = editingBarcode !== null && !isEditing;
      return (
        <div className="flex items-center justify-center gap-2 px-2">
          <button
            type="button"
            onClick={() => onEdit(item)}
            disabled={isBlocked || isEditing}
            className={cn(
              "transition-colors",
              isBlocked || isEditing
                ? "cursor-default text-text-200"
                : "text-text-300 hover:text-accent",
            )}
            title="Editar"
          >
            <PencilSquareIcon className="size-6 text-text-400" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(item)}
            disabled={isEditing}
            className={cn(
              "transition-colors",
              isEditing
                ? "cursor-default text-text-200"
                : "text-text-300 hover:text-danger-300",
            )}
            title="Eliminar"
          >
            <XMarkIcon className="size-6 text-text-400" />
          </button>
        </div>
      );
    },
  }),
];

export function AddedProductsPanel({
  items,
  columnVisibility,
  onEdit,
  onUpdate,
  onDelete,
  editingBarcode,
}: AddedProductsPanelProps) {
  const [expandedBarcodes, setExpandedBarcodes] = useState<Set<string>>(() =>
    items.length === 1 ? new Set([items[0].barcode]) : new Set(),
  );
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });
  const [prevItemsLength, setPrevItemsLength] = useState(items.length);

  // Adjusting state during render — avoids setState-in-effect cascades
  if (prevItemsLength !== items.length) {
    setPrevItemsLength(items.length);
    if (items.length === 1 && prevItemsLength === 0) {
      setExpandedBarcodes(new Set([items[0].barcode]));
    }
    if (items.length > prevItemsLength) {
      const lastPage = Math.max(0, Math.ceil(items.length / PAGE_SIZE) - 1);
      setPagination((prev) => ({ ...prev, pageIndex: lastPage }));
    }
  }

  function toggleExpand(barcode: string) {
    setExpandedBarcodes((prev) => {
      const next = new Set(prev);
      if (next.has(barcode)) next.delete(barcode);
      else next.add(barcode);
      return next;
    });
  }

  const batchesEnabled = columnVisibility.batches !== false;

  const tanstackVisibility = {
    product: true,
    sku: columnVisibility.sku !== false,
    image: columnVisibility.image !== false,
    brand: columnVisibility.brand !== false,
    category: columnVisibility.category !== false,
    cost: columnVisibility.cost !== false,
    price: true,
    stock: columnVisibility.stock !== false,
    actions: true,
  };

  const table = useReactTable({
    data: items,
    columns,
    getRowId: (row) => row.barcode,
    state: { pagination, columnVisibility: tanstackVisibility },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    meta: {
      editingBarcode,
      expandedBarcodes,
      onToggleExpand: toggleExpand,
      onEdit,
      onDelete,
    },
  });

  const gridTemplate = table
    .getVisibleLeafColumns()
    .map((col) => COLUMN_WIDTHS[col.id])
    .join(" ");

  // Added products Table
  return (
    <div className="flex flex-col gap-5">
      <h2 className="heading-lg text-text-500">Productos Agregados</h2>

      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 px-5 py-16 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-background-300">
            <CurrencyDollarIcon className="size-8 text-border-400" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="body-md-semibold text-text-500">
              Ningún producto agregado
            </p>
            <p className="body-md-regular text-text-400">
              Completá el formulario y hacé click en &ldquo;Agregar
              Producto&rdquo; para empezar.
            </p>
          </div>
        </div>
      )}

      {items.length > 0 && (
        <div className="flex flex-col gap-3">
          <div
            role="table"
            aria-label="Productos agregados"
            className="overflow-hidden rounded-xl bg-white shadow-[0px_12px_16px_-4px_rgba(112,113,116,0.1),0px_4px_6px_-2px_rgba(112,113,116,0.05)]"
          >
            {/* Header */}
            {table.getHeaderGroups().map((headerGroup) => (
              <div key={headerGroup.id} role="rowgroup">
                <div
                  role="row"
                  className="grid border-b border-border-200 bg-background-300"
                  style={{ gridTemplateColumns: gridTemplate }}
                >
                  {headerGroup.headers.map((header, i) => (
                    <div
                      key={header.id}
                      role="columnheader"
                      className={cn(
                        "body-md-semibold flex min-h-[50px] items-center p-2 text-[#363636]",
                        // No separator before the actions column (it has no
                        // header label) — matches Figma and the scan table.
                        i < headerGroup.headers.length - 2 &&
                          "border-r border-border-200",
                      )}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Rows */}
            <div role="rowgroup">
              {table.getRowModel().rows.map((row) => {
                const item = row.original;
                const isExpanded = expandedBarcodes.has(item.barcode);
                const isRowEditing = editingBarcode === item.barcode;

                return (
                  <div
                    key={row.id}
                    className="border-b border-border-200 last:border-0"
                  >
                    <div
                      role="row"
                      className="grid items-center"
                      style={{ gridTemplateColumns: gridTemplate }}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <div role="cell" key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </div>
                      ))}
                    </div>

                    {isExpanded && batchesEnabled && (
                      <>
                        <div className="grid grid-cols-4 border-t border-border-200 bg-background-600">
                          {[
                            "Número de Lote",
                            "EAN-13",
                            "Fecha de Elaboración",
                            "Fecha de Vencimiento",
                          ].map((label) => (
                            <div
                              key={label}
                              className="body-md-semibold px-3 py-2 text-[#363636]"
                            >
                              {label}
                            </div>
                          ))}
                        </div>
                        {/* Editable inline, like the scan table. Unlike scan,
                              EAN-13 is editable here: it's manually entered. */}
                        <div className="grid grid-cols-4 border-t border-border-200 bg-background-600">
                          <div className="p-3">
                            <FormInput
                              variant="table"
                              value={item.lot_number ?? ""}
                              disabled={isRowEditing}
                              onChange={(v) =>
                                onUpdate(
                                  item.barcode,
                                  batchUpdates(item, {
                                    lot_number: v || null,
                                  }),
                                )
                              }
                              placeholder="-"
                            />
                          </div>
                          <div className="p-3">
                            <FormInput
                              variant="table"
                              value={item.batch_barcode ?? ""}
                              disabled={isRowEditing}
                              onChange={(v) =>
                                onUpdate(
                                  item.barcode,
                                  batchUpdates(item, {
                                    batch_barcode: v || null,
                                  }),
                                )
                              }
                              placeholder="-"
                            />
                          </div>
                          <div
                            className={cn(
                              "p-3",
                              isRowEditing && "pointer-events-none opacity-50",
                            )}
                          >
                            <DatePickerInput
                              value={item.manufacture_date ?? null}
                              onChange={(v) =>
                                onUpdate(
                                  item.barcode,
                                  batchUpdates(item, {
                                    manufacture_date: v,
                                  }),
                                )
                              }
                            />
                          </div>
                          <div
                            className={cn(
                              "p-3",
                              isRowEditing && "pointer-events-none opacity-50",
                            )}
                          >
                            <DatePickerInput
                              value={item.expiration_date ?? null}
                              onChange={(v) =>
                                onUpdate(
                                  item.barcode,
                                  batchUpdates(item, {
                                    expiration_date: v,
                                  }),
                                )
                              }
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {isExpanded && !batchesEnabled && (
                      <div className="border-t border-border-200 bg-background-300 px-5 py-3">
                        <p className="body-md-regular text-text-300">
                          Este producto no tiene seguimiento de lote activado.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {table.getPageCount() > 1 && (
            <Pagination
              pageIndex={table.getState().pagination.pageIndex}
              pageCount={table.getPageCount()}
              canPrevious={table.getCanPreviousPage()}
              canNext={table.getCanNextPage()}
              onPrevious={() => table.previousPage()}
              onNext={() => table.nextPage()}
              onGoTo={(p) => table.setPageIndex(p)}
            />
          )}
        </div>
      )}
    </div>
  );
}
