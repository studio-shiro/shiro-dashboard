"use client";

import { createColumnHelper } from "@tanstack/react-table";
import Link from "next/link";
import {
  ChevronRightIcon,
  ChevronDownIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";
import { ToggleSwitch } from "@/components/shared/ToggleSwitch";
import { RowActionsMenu } from "./RowActionsMenu";
import formatCurrency from "@/helpers/formatCurrency";
import type { ProductTableRow } from "@/types/database";

// ─── Column visibility constants ─────────────────────────────────────────────

export const FIXED_COLUMN_IDS = [
  "producto",
  "costo",
  "precio",
  "acciones",
] as const;

export const OPTIONAL_COLUMN_IDS = [
  "sku",
  "imagen",
  "marca",
  "categoria",
  "vencimientos",
  "stock",
] as const;

export const DEFAULT_COLUMN_VISIBILITY: Record<string, boolean> = {
  producto: true,
  sku: true,
  imagen: true,
  marca: true,
  categoria: true,
  vencimientos: true,
  costo: true,
  precio: true,
  stock: true,
  acciones: true,
};

// ─── Column definitions ───────────────────────────────────────────────────────

const columnHelper = createColumnHelper<ProductTableRow>();

export function buildColumns(
  localActive: Record<string, boolean>,
  pendingIds: Set<string>,
  onToggle: (product: ProductTableRow) => void,
  onDelete: (id: string) => void,
  expandedRows: Set<string>,
  onToggleExpand: (id: string) => void,
) {
  return [
    columnHelper.accessor("name", {
      id: "producto",
      header: "Producto",
      enableSorting: true,
      cell: ({ row }) => {
        const hasExpiry = row.original.batch_count > 0;
        const isExpanded = expandedRows.has(row.original.id);
        return (
          <div className="flex w-full items-center justify-between gap-1.5">
            <Link
              href={`/products/${row.original.id}`}
              className="body-md-medium text-text-500 underline underline-offset-2 transition-opacity hover:opacity-70"
            >
              {row.original.name}
            </Link>
            {hasExpiry && (
              <button
                type="button"
                onClick={() => onToggleExpand(row.original.id)}
                className="shrink-0 text-text-400 transition-colors hover:text-text-500"
              >
                {isExpanded ? (
                  <ChevronDownIcon className="size-6" />
                ) : (
                  <ChevronRightIcon className="size-6" />
                )}
              </button>
            )}
          </div>
        );
      },
    }),

    columnHelper.accessor("reference", {
      id: "sku",
      header: "SKU",
      enableSorting: false,
      cell: ({ getValue }) => (
        <span className="body-md-semibold text-text-500">{getValue()}</span>
      ),
    }),

    columnHelper.accessor("image_url", {
      id: "imagen",
      header: "Imagen",
      enableSorting: false,
      cell: ({ getValue }) => {
        const url = getValue();
        return url ? (
          <div className="h-15 w-15 overflow-hidden rounded-md border border-border-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt="Producto"
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="flex h-15 w-15 items-center justify-center rounded-md border border-border-100 bg-background-300">
            <CubeIcon className="size-5 text-text-300" />
          </div>
        );
      },
    }),

    columnHelper.accessor((row) => row.brand?.name ?? null, {
      id: "marca",
      header: "Marca",
      enableSorting: false,
      cell: ({ getValue }) => (
        <span className="body-md-regular text-text-500">
          {getValue() ?? "—"}
        </span>
      ),
    }),

    columnHelper.accessor((row) => row.category?.name ?? null, {
      id: "categoria",
      header: "Categoría",
      enableSorting: false,
      cell: ({ getValue }) => (
        <span className="body-md-regular text-text-500">
          {getValue() ?? "—"}
        </span>
      ),
    }),

    columnHelper.accessor("batch_count", {
      id: "vencimientos",
      header: "Vencimientos",
      enableSorting: false,
      cell: ({ row }) => {
        const count = row.original.batch_count;
        const isExpanded = expandedRows.has(row.original.id);
        return (
          <div className="flex w-full items-center justify-between gap-1">
            <span className="body-md-regular text-text-500">{count}</span>
            {count > 0 && (
              <button
                type="button"
                onClick={() => onToggleExpand(row.original.id)}
                className="shrink-0 text-text-400 transition-colors hover:text-text-500"
              >
                {isExpanded ? (
                  <ChevronDownIcon className="size-6" />
                ) : (
                  <ChevronRightIcon className="size-6" />
                )}
              </button>
            )}
          </div>
        );
      },
    }),

    columnHelper.accessor("cost_price", {
      id: "costo",
      header: "Costo por Unidad",
      enableSorting: false,
      cell: ({ getValue }) => (
        <span className="body-md-regular text-text-500">
          {formatCurrency(getValue())}
        </span>
      ),
    }),

    columnHelper.accessor("price", {
      id: "precio",
      header: "Precio Final por Unidad",
      enableSorting: false,
      cell: ({ getValue }) => (
        <span className="body-md-regular text-text-500">
          {formatCurrency(getValue())}
        </span>
      ),
    }),

    columnHelper.accessor((row) => row.stock?.quantity ?? null, {
      id: "stock",
      header: "Stock",
      enableSorting: false,
      cell: ({ getValue }) => {
        const qty = getValue();
        return (
          <span className="body-md-regular text-text-500">{qty ?? "—"}</span>
        );
      },
    }),

    columnHelper.display({
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => {
        const product = row.original;
        const isActive =
          product.id in localActive ? localActive[product.id] : product.active;
        const isPending = pendingIds.has(product.id);

        return (
          <div className="flex items-center gap-2">
            <ToggleSwitch
              checked={isActive}
              onChange={() => onToggle(product)}
              disabled={isPending}
            />
            <RowActionsMenu
              productId={product.id}
              onDelete={() => onDelete(product.id)}
            />
          </div>
        );
      },
    }),
  ];
}
