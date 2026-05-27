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
  PlusIcon,
  ArrowDownIcon,
  ArrowUpIcon,
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
import Button from "../shared/Button";

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
  const isGrowable = isEmpty || isSearchEmpty;
  const visibleColCount = table.getVisibleLeafColumns().length;

  return (
    <div className={cn("flex flex-col", isGrowable ? "flex-1" : "gap-4")}>
      {/* Table card */}
      <div
        className={cn(
          "overflow-hidden rounded-lg border border-border-100 bg-background-400 shadow-lg",
          isGrowable && "flex flex-1 flex-col",
        )}
      >
        {/* Header — always rendered inside a real <table> for consistent column alignment */}
        <table className="w-full border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-border-200 bg-background-300"
              >
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      className={cn(
                        "px-4 py-3 text-left body-md-semibold text-text-400 border-r border-border-200 last:border-r-0",
                        canSort &&
                          "cursor-pointer select-none hover:text-text-500",
                      )}
                      onClick={
                        canSort
                          ? header.column.getToggleSortingHandler()
                          : undefined
                      }
                    >
                      <div className="flex justify-between items-center gap-1">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {canSort && (
                          <span className="shrink-0 text-text-400">
                            {sorted === "asc" ? (
                              <ArrowUpIcon className="size-3.5" />
                            ) : sorted === "desc" ? (
                              <ArrowDownIcon className="size-3.5" />
                            ) : (
                              <ArrowDownIcon className="size-3.5" />
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

          {/* Body — only rendered when there are results */}
          {!isGrowable && (
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <Fragment key={row.id}>
                  <tr className="border-b border-border-100 last:border-0 hover:bg-background-600">
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
              ))}
            </tbody>
          )}
        </table>

        {/* Empty states — flex divs outside <table> so they can grow to fill remaining height */}
        {isEmpty && (
          <div className="flex flex-1 items-center justify-center px-4">
            <div className="mx-auto flex max-w-xs flex-col items-center gap-4">
              <p className="body-lg-medium text-text-500">
                Comenzá a cargar tus Productos
              </p>
              <Button href="/products/new" variant="primary" className="w-full">
                <PlusIcon className="size-5" />
                Agregar Producto
              </Button>
              <Button type="button" variant="tertiary" className="w-full">
                Importá tus Productos
              </Button>
            </div>
          </div>
        )}

        {isSearchEmpty && (
          <div className="flex flex-1 justify-center py-8">
            <p className="body-md-semibold text-text-400">Sin Resultados</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!isGrowable && (
        <Pagination
          pageIndex={table.getState().pagination.pageIndex}
          pageCount={Math.max(1, table.getPageCount())}
          canPrevious={table.getCanPreviousPage()}
          canNext={table.getCanNextPage()}
          onPrevious={() => table.previousPage()}
          onNext={() => table.nextPage()}
          onGoTo={(p) => table.setPageIndex(p)}
        />
      )}
    </div>
  );
}
