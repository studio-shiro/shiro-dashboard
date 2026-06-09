"use client";

import { createColumnHelper } from "@tanstack/react-table";
import Link from "next/link";
import {
  ChevronRightIcon,
  CubeIcon,
  PencilIcon,
  PlusCircleIcon,
  DocumentDuplicateIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { FlagIcon, ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import { ToggleSwitch } from "@/components/shared/ToggleSwitch";
import { cn } from "@/lib/utils";
import { RowActionsMenu } from "./RowActionsMenu";
import formatCurrency from "@/helpers/formatCurrency";
import type { ProductTableRow } from "@/types/database";

// ─── Column visibility constants ─────────────────────────────────────────────

export const PRODUCTS_COL_VISIBILITY_KEY = "shiro-products-column-visibility";

export const FIXED_COLUMN_IDS = [
  "product",
  "cost",
  "price",
  "actions",
] as const;

export const OPTIONAL_COLUMN_IDS = [
  "sku",
  "image",
  "brand",
  "category",
  "batches",
  "stock",
] as const;

export const DEFAULT_COLUMN_VISIBILITY: Record<string, boolean> = {
  product: true,
  sku: true,
  image: true,
  brand: true,
  category: true,
  batches: true,
  cost: true,
  price: true,
  stock: true,
  actions: true,
};

// ─── Column definitions ───────────────────────────────────────────────────────

const columnHelper = createColumnHelper<ProductTableRow>();

export function buildColumns(
  localActive: Record<string, boolean>,
  pendingIds: Set<string>,
  onToggle: (product: ProductTableRow) => void,
  onDelete: (id: string) => void,
  onDuplicate: (id: string) => void,
  expandedRows: Set<string>,
  onToggleExpand: (id: string) => void,
  columnVisibility: Record<string, boolean>,
) {
  return [
    columnHelper.accessor("name", {
      id: "product",
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
      id: "image",
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
      id: "brand",
      header: "Marca",
      enableSorting: false,
      cell: ({ getValue }) => (
        <span className="body-md-regular text-text-500">
          {getValue() ?? "—"}
        </span>
      ),
    }),

    columnHelper.accessor((row) => row.category?.name ?? null, {
      id: "category",
      header: "Categoría",
      enableSorting: false,
      cell: ({ getValue }) => (
        <span className="body-md-regular text-text-500">
          {getValue() ?? "—"}
        </span>
      ),
    }),

    columnHelper.accessor("batch_count", {
      id: "batches",
      header: "Vencimientos",
      enableSorting: false,
      cell: ({ row }) => {
        const count = row.original.batch_count;
        const isExpanded = expandedRows.has(row.original.id);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let hasExpired = false;
        let hasExpiringSoon = false;

        for (const batch of row.original.batches) {
          if (!batch.expiration_date) continue;
          const expiry = new Date(batch.expiration_date);
          expiry.setHours(0, 0, 0, 0);
          const days = Math.ceil(
            (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
          );
          if (days < 0) {
            hasExpired = true;
            break;
          } else if (days <= 30) {
            hasExpiringSoon = true;
          }
        }

        return (
          <div className="flex w-full items-center justify-between gap-1">
            <div className="flex items-center gap-1.5">
              {hasExpired && (
                <FlagIcon className="w-5 h-auto shrink-0 text-danger-300" />
              )}
              {!hasExpired && hasExpiringSoon && (
                <ExclamationTriangleIcon className="w-5 h-auto shrink-0 text-warning-300" />
              )}
              <span className="body-md-regular text-text-500">{count}</span>
            </div>
            {count > 0 && (
              <button
                type="button"
                onClick={() => onToggleExpand(row.original.id)}
                className="shrink-0 text-text-400 transition-colors hover:text-text-500"
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
      },
    }),

    columnHelper.accessor("cost_price", {
      id: "cost",
      header: "Costo por Unidad",
      enableSorting: false,
      cell: ({ getValue }) => (
        <span className="body-md-regular text-text-500">
          {formatCurrency(getValue())}
        </span>
      ),
    }),

    columnHelper.accessor("price", {
      id: "price",
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
      cell: ({ getValue }) => (
        <span className="body-md-regular text-text-500">
          {getValue() ?? "—"}
        </span>
      ),
    }),

    columnHelper.display({
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const product = row.original;
        const isActive =
          product.id in localActive ? localActive[product.id] : product.active;
        const isPending = pendingIds.has(product.id);
        const showBatch = columnVisibility.batches !== false;

        return (
          <div className="flex items-center gap-2">
            <ToggleSwitch
              checked={isActive}
              onChange={() => onToggle(product)}
              disabled={isPending}
            />
            <RowActionsMenu
              actions={[
                {
                  label: "Editar Producto",
                  icon: PencilIcon,
                  href: `/products/${product.id}/edit`,
                },
                ...(showBatch
                  ? [
                      {
                        label: "Agregar Lote",
                        icon: PlusCircleIcon,
                        href: `/products/${product.id}/batches/new`,
                      } as const,
                    ]
                  : []),
                {
                  label: "Duplicar Producto",
                  icon: DocumentDuplicateIcon,
                  onClick: () => onDuplicate(product.id),
                },
                {
                  label: "Eliminar Producto",
                  icon: TrashIcon,
                  variant: "danger" as const,
                  onClick: () => onDelete(product.id),
                },
              ]}
            />
          </div>
        );
      },
    }),
  ];
}
