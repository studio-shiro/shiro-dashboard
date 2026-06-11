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
  XMarkIcon,
} from "@heroicons/react/24/outline";
import type { WizardProduct } from "@/store/productWizard";
import { cn } from "@/lib/utils";
import { Pagination } from "@/components/shared/Pagination";
import Image from "next/image";

interface AddedProductsPanelProps {
  items: WizardProduct[];
  columnVisibility: Record<string, boolean>;
  onEdit: (item: WizardProduct) => void;
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

const COLUMN_WIDTHS: Record<string, string> = {
  product: "2fr",
  sku: "1fr",
  image: "80px",
  brand: "1.2fr",
  category: "1.2fr",
  cost: "1.1fr",
  price: "1.1fr",
  stock: "0.8fr",
  actions: "72px",
};

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

const PAGE_SIZE = 8;

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
        <div className="flex items-center gap-2 p-2.5">
          <span
            className={cn(
              "body-md-semibold truncate underline underline-offset-2",
              isEditing ? "text-text-300" : "text-text-400",
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
        <div className="p-2.5">
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
        <div className="flex items-center justify-center p-2">
          {item.image_url ? (
            <div
              className={cn(
                "size-12 overflow-hidden rounded-lg",
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
                "flex size-12 items-center justify-center rounded-lg bg-background-300",
                isEditing && "opacity-50",
              )}
            >
              <span className="body-xs-regular text-text-300">—</span>
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
        <div className="p-2.5">
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
        <div className="p-2.5">
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
        <div className="p-2.5">
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
        <div className="p-2.5">
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
        <div className="p-2.5">
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

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-hidden">
      <h2 className="heading-lg text-text-500">Productos Agregados</h2>

      {items.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-5 py-16 text-center">
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
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto pb-2">
            <div
              role="table"
              aria-label="Productos agregados"
              className="overflow-hidden rounded-xl shadow-lg"
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
                          "body-md-semibold p-2.5 text-text-400",
                          i < headerGroup.headers.length - 1 &&
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

                      {isExpanded && item.tracks_batches && (
                        <>
                          <div className="grid grid-cols-4 border-t border-border-200 bg-background-600">
                            {[
                              "Nro. Lote",
                              "EAN-13",
                              "Fecha Elaboración",
                              "Fecha Vencimiento",
                            ].map((label) => (
                              <div
                                key={label}
                                className="body-md-semibold p-2.5 text-text-400"
                              >
                                {label}
                              </div>
                            ))}
                          </div>
                          <div className="grid grid-cols-4 border-t border-border-200 bg-background-600 px-2.5 py-2">
                            <span className="body-md-regular p-0.5 text-text-500">
                              {item.lot_number || "—"}
                            </span>
                            <span className="body-md-regular p-0.5 text-text-500">
                              {item.batch_barcode || "—"}
                            </span>
                            <span className="body-md-regular p-0.5 text-text-500">
                              {item.manufacture_date || "—"}
                            </span>
                            <span className="body-md-regular p-0.5 text-text-500">
                              {item.expiration_date || "—"}
                            </span>
                          </div>
                        </>
                      )}

                      {isExpanded && !item.tracks_batches && (
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
