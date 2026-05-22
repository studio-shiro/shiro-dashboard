"use client";

import { useTransition, useState, useEffect, Fragment } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type SortingState,
  type ColumnVisibility,
  type PaginationState,
} from "@tanstack/react-table";
import Link from "next/link";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import {
  toggleProductActiveAction,
  deleteProductAction,
} from "@/actions/products";
import type { ProductTableRow } from "@/types/database";
import { Pagination } from "@/components/shared/Pagination";

import { BatchesSubTable } from "./BatchesSubTable";
import { buildColumns } from "./ProductsColumns";

export {
  FIXED_COLUMN_IDS,
  OPTIONAL_COLUMN_IDS,
  DEFAULT_COLUMN_VISIBILITY,
} from "./ProductsColumns";

interface ProductsTableProps {
  products: ProductTableRow[];
  originalCount: number;
  columnVisibility: Record<string, boolean>;
  onColumnVisibilityChange: (v: Record<string, boolean>) => void;
  onActionError: (message: string) => void;
}

const PAGE_SIZE = 10;

export function ProductsTable({
  products,
  originalCount,
  columnVisibility,
  onColumnVisibilityChange,
  onActionError,
}: ProductsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "producto", desc: false },
  ]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });
  const [localActive, setLocalActive] = useState<Record<string, boolean>>({});
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [, startTransition] = useTransition();

  // Reset to page 0 when filtered results change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [products.length]);

  function handleToggleExpand(id: string) {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const columns = buildColumns(
    localActive,
    pendingIds,
    handleToggle,
    handleDelete,
    expandedRows,
    handleToggleExpand,
  );

  const table = useReactTable({
    data: products,
    columns,
    state: { sorting, pagination, columnVisibility },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onColumnVisibilityChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(columnVisibility) : updater;
      onColumnVisibilityChange(next as Record<string, boolean>);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: false,
  });

  function handleToggle(product: ProductTableRow) {
    const currentActive =
      product.id in localActive ? localActive[product.id] : product.active;
    const newActive = !currentActive;

    console.log("Toggling product", product.id, "to", newActive);

    setLocalActive((prev) => ({ ...prev, [product.id]: newActive }));
    setPendingIds((prev) => new Set(prev).add(product.id));

    startTransition(async () => {
      const result = await toggleProductActiveAction(product.id, newActive);
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
      if (result.error) {
        setLocalActive((prev) => ({ ...prev, [product.id]: currentActive }));
        onActionError(
          typeof result.error === "string"
            ? result.error
            : "No se pudo cambiar el estado del producto.",
        );
      }
    });
  }

  function handleDelete(id: string) {
    if (!window.confirm("¿Estás seguro de que querés eliminar este producto?"))
      return;
    startTransition(async () => {
      const result = await deleteProductAction(id);
      if (result.error) onActionError("No se pudo eliminar el producto.");
    });
  }

  const isEmpty = originalCount === 0;
  const isSearchEmpty = !isEmpty && products.length === 0;
  const visibleColCount = table.getVisibleLeafColumns().length;

  return (
    <Fragment>
      <div className="overflow-hidden rounded-lg border border-border-100 bg-background-400 shadow-xl">
        <table className="w-full border-collapse shadow-lg">
          {/* Header */}
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-border-100 bg-background-300"
              >
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      className={cn(
                        "px-4 py-3 text-left body-sm-medium text-text-400",
                        canSort &&
                          "cursor-pointer select-none hover:text-text-500",
                      )}
                      onClick={
                        canSort
                          ? header.column.getToggleSortingHandler()
                          : undefined
                      }
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {canSort && (
                          <span className="shrink-0 text-text-300">
                            {sorted === "asc" ? (
                              <ChevronUpIcon className="size-3.5" />
                            ) : sorted === "desc" ? (
                              <ChevronDownIcon className="size-3.5" />
                            ) : (
                              <ChevronDownIcon className="size-3.5 opacity-40" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          {/* Body */}
          <tbody>
            {isEmpty ? (
              <tr>
                <td colSpan={visibleColCount} className="py-16 text-center">
                  <div className="mx-auto flex max-w-xs flex-col items-center gap-4">
                    <p className="body-lg-medium text-text-500">
                      Comenzá a cargar tus Productos
                    </p>
                    <Link
                      href="/products/new"
                      className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-accent px-4 py-2.5 body-md-semibold text-white transition-colors hover:bg-accent-hover"
                    >
                      <PlusIcon className="size-4" />
                      Agregar Producto
                    </Link>
                    <button
                      type="button"
                      className="w-full rounded-lg border border-border-100 px-4 py-2.5 body-md-regular text-text-500 transition-colors hover:bg-background-300"
                    >
                      Importá tus Productos
                    </button>
                  </div>
                </td>
              </tr>
            ) : isSearchEmpty ? (
              <tr>
                <td colSpan={visibleColCount} className="py-16 text-center">
                  <p className="body-md-regular text-text-400">
                    Sin Resultados
                  </p>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <Fragment key={row.id}>
                  <tr className="border-b border-border-100 last:border-0 hover:bg-background-300/40">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-4">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                  {expandedRows.has(row.original.id) &&
                    row.original.batch_count > 0 && (
                      <tr>
                        <td colSpan={visibleColCount} className="p-0">
                          <BatchesSubTable batches={row.original.batches} />
                        </td>
                      </tr>
                    )}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination — always visible when there are products */}
      {originalCount > 0 && (
        <div className="">
          <Pagination
            pageIndex={table.getState().pagination.pageIndex}
            pageCount={Math.max(1, table.getPageCount())}
            canPrevious={table.getCanPreviousPage()}
            canNext={table.getCanNextPage()}
            onPrevious={() => table.previousPage()}
            onNext={() => table.nextPage()}
            onGoTo={(p) => table.setPageIndex(p)}
          />
        </div>
      )}
    </Fragment>
  );
}
