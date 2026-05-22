"use client";

import { useState, useTransition, useMemo, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type PaginationState,
} from "@tanstack/react-table";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { deleteBrandAction } from "@/actions/brands";
import type { BrandTableRow } from "@/types/database";
import { Pagination } from "@/components/shared/Pagination";
import { Tag } from "@/components/shared/Tag";

const PAGE_SIZE = 10;
const columnHelper = createColumnHelper<BrandTableRow>();

interface BrandsTableProps {
  brands: BrandTableRow[];
  originalCount: number;
  onEdit: (brand: BrandTableRow) => void;
  onAdd: () => void;
  onActionError: (message: string) => void;
  onActionSuccess: (message: string) => void;
}

export function BrandsTable({
  brands,
  originalCount,
  onEdit,
  onAdd,
  onActionError,
  onActionSuccess,
}: BrandsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "nombre", desc: false },
  ]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(
    null,
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [brands.length]);

  function handleDelete(brand: BrandTableRow) {
    setDeletingId(brand.id);
    startTransition(async () => {
      const result = await deleteBrandAction(brand.id);
      setDeletingId(null);
      setConfirmingDeleteId(null);
      if (result.error) {
        onActionError("No se pudo eliminar la marca.");
      } else {
        onActionSuccess("Marca eliminada correctamente.");
      }
    });
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor("logo_url", {
        id: "logo",
        header: "Logo",
        enableSorting: false,
        cell: ({ row }) => {
          const { logo_url, name } = row.original;
          return logo_url ? (
            <div className="size-12 overflow-hidden rounded-full border border-border-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logo_url}
                alt={name}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex size-12 items-center justify-center rounded-full border border-border-100 bg-background-300">
              <span className="body-md-semibold text-text-400">
                {name.charAt(0).toUpperCase()}
              </span>
            </div>
          );
        },
      }),

      columnHelper.accessor("name", {
        id: "nombre",
        header: "Nombre",
        enableSorting: true,
        cell: ({ getValue }) => (
          <span className="body-md-medium text-text-500">{getValue()}</span>
        ),
      }),

      columnHelper.accessor("description", {
        id: "descripcion",
        header: "Descripción",
        enableSorting: false,
        cell: ({ getValue }) => {
          const desc = getValue();
          return (
            <span className="body-md-regular text-text-400 line-clamp-2">
              {desc ?? "—"}
            </span>
          );
        },
      }),

      columnHelper.accessor("product_count", {
        id: "productos",
        header: "Productos",
        enableSorting: true,
        cell: ({ getValue }) => (
          <Tag variant="neutral">{getValue()}</Tag>
        ),
      }),

      columnHelper.display({
        id: "acciones",
        header: "",
        cell: ({ row }) => {
          const brand = row.original;
          const isConfirming = confirmingDeleteId === brand.id;
          const isDeleting = deletingId === brand.id;

          if (isConfirming) {
            return (
              <div className="flex items-center gap-3">
                {brand.product_count > 0 && (
                  <p className="max-w-[220px] body-sm-regular text-text-400">
                    Esta marca tiene {brand.product_count}{" "}
                    {brand.product_count === 1 ? "producto" : "productos"}. Al
                    eliminarla, quedarán sin marca asignada.
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(brand)}
                  disabled={isDeleting}
                  className="rounded-md bg-red-500 px-3 py-1.5 body-sm-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-50"
                >
                  {isDeleting ? "Eliminando…" : "Sí, eliminar"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingDeleteId(null)}
                  disabled={isDeleting}
                  className="rounded-md border border-border-100 px-3 py-1.5 body-sm-semibold text-text-500 transition-colors hover:bg-background-300 disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>
            );
          }

          return (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onEdit(brand)}
                className="rounded-md p-1.5 text-text-400 transition-colors hover:bg-background-300 hover:text-text-500"
                aria-label="Editar"
              >
                <PencilIcon className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDeleteId(brand.id)}
                className="rounded-md p-1.5 text-text-400 transition-colors hover:bg-red-50 hover:text-red-500"
                aria-label="Eliminar"
              >
                <TrashIcon className="size-4" />
              </button>
            </div>
          );
        },
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [confirmingDeleteId, deletingId, onEdit],
  );

  const table = useReactTable({
    data: brands,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: false,
  });

  const isEmpty = originalCount === 0;
  const isSearchEmpty = !isEmpty && brands.length === 0;
  const visibleColCount = table.getVisibleLeafColumns().length;

  return (
    <div className="overflow-hidden rounded-lg border border-border-100 bg-background-400">
      <table className="w-full border-collapse">
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

        <tbody>
          {isEmpty ? (
            <tr>
              <td colSpan={visibleColCount} className="py-16 text-center">
                <div className="mx-auto flex max-w-xs flex-col items-center gap-4">
                  <div className="flex size-12 items-center justify-center rounded-full bg-background-300">
                    <TagIcon className="size-6 text-text-300" />
                  </div>
                  <p className="body-lg-medium text-text-500">
                    Comenzá a cargar tus Marcas
                  </p>
                  <button
                    type="button"
                    onClick={onAdd}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-accent px-4 py-2.5 body-md-semibold text-white transition-colors hover:bg-accent-hover"
                  >
                    <PlusIcon className="size-4" />
                    Agregar Marca
                  </button>
                </div>
              </td>
            </tr>
          ) : isSearchEmpty ? (
            <tr>
              <td colSpan={visibleColCount} className="py-16 text-center">
                <p className="body-md-regular text-text-400">Sin Resultados</p>
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-border-100 last:border-0 hover:bg-background-300/40"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {originalCount > 0 && (
        <div className="border-t border-border-100">
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
    </div>
  );
}
