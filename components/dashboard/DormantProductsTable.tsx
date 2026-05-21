"use client";
import { useState } from "react";
import { LastUpdated } from "@/components/shared/LastUpdated";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import {
  ChevronUpIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import type { DormantProduct } from "@/lib/dashboard/dormantProducts";
import { Pagination } from "@/components/shared/Pagination";

const PAGE_SIZE = 5;

// ─── Cell sub-components ──────────────────────────────────────────────────────

const AVATAR_COLORS = ["#3446a5", "#cd2b31", "#b46c00", "#4963ea", "#009530"];

function ProductAvatar({ name }: { name: string }) {
  const color = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
  return (
    <div className="flex size-14 shrink-0 items-center justify-center rounded-lg border border-border-200 bg-background-300">
      <span style={{ color }} className="font-body text-xl font-bold">
        {name.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}

function SortIndicator({ sorted }: { sorted: false | "asc" | "desc" }) {
  if (sorted === "asc")
    return <ChevronUpIcon className="size-3.5 shrink-0 text-accent" />;
  if (sorted === "desc")
    return <ChevronDownIcon className="size-3.5 shrink-0 text-accent" />;
  return <ChevronDownIcon className="size-3.5 shrink-0 text-text-300" />;
}

// ─── Column definitions ───────────────────────────────────────────────────────

const columnHelper = createColumnHelper<DormantProduct>();

const COLUMNS = [
  columnHelper.accessor("reference", {
    header: "N° Referencia",
    cell: (info) => (
      <span className="font-body text-sm font-bold text-text-500">
        {info.getValue()}
      </span>
    ),
    size: 150,
  }),
  columnHelper.display({
    id: "avatar",
    header: "Producto",
    enableSorting: false,
    cell: (info) => <ProductAvatar name={info.row.original.name} />,
    size: 90,
  }),
  columnHelper.accessor("name", {
    header: "Nombre",
    cell: (info) => (
      <span className="font-body text-sm text-text-400">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor("category", {
    header: "Categoría",
    cell: (info) => (
      <span className="font-body text-sm text-text-400">{info.getValue()}</span>
    ),
    size: 130,
  }),
  columnHelper.accessor("lastSaleDate", {
    header: "Última venta",
    sortingFn: "datetime",
    cell: (info) => {
      const d = new Date(info.getValue());
      const day = d.getDate();
      const month = d
        .toLocaleDateString("es-AR", { month: "long" })
        .replace(/^\w/, (c) => c.toUpperCase());
      return (
        <span className="font-body text-sm text-text-400">
          {day} de {month} {d.getFullYear()}
        </span>
      );
    },
    size: 160,
  }),
  columnHelper.accessor("stock", {
    header: "Stock",
    cell: (info) => (
      <span className="font-body text-sm text-text-400">
        {info.getValue()} unidades
      </span>
    ),
    size: 130,
  }),
  columnHelper.accessor("dormantDays", {
    header: "Sin movimiento",
    cell: (info) => (
      <span className="font-body text-sm text-text-400">
        {info.getValue()} días
      </span>
    ),
    size: 150,
  }),
];

// ─── Main component ───────────────────────────────────────────────────────────

interface DormantProductsTableProps {
  data: DormantProduct[];
}

export function DormantProductsTable({ data }: DormantProductsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns: COLUMNS,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: PAGE_SIZE },
    },
  });

  return (
    <div className="flex flex-col gap-3">
      {/* Section header */}
      <div className="flex flex-col gap-0.5">
        <h2 className="font-body text-2xl font-bold leading-none text-text-500">
          Productos Sin Movimiento
        </h2>
        <p className="font-body text-xs leading-4 text-text-400">
          Última actualización el <LastUpdated />
        </p>
      </div>

      {/* Table card */}
      <div className="overflow-hidden rounded-2xl border border-border-200 bg-background-400 shadow-[0px_4px_8px_-2px_rgba(112,113,116,0.08),0px_2px_4px_-2px_rgba(112,113,116,0.06)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="border-b border-border-200 bg-background-300"
                >
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      style={{ width: header.column.columnDef.size }}
                      className="px-5 py-3.5 text-left"
                    >
                      {header.column.getCanSort() ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="flex cursor-pointer items-center gap-1.5 font-body text-sm font-bold leading-5 text-text-500 transition-colors hover:text-text-500"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          <SortIndicator sorted={header.column.getIsSorted()} />
                        </button>
                      ) : (
                        <span className="font-body text-sm font-bold leading-5 text-text-500">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row, i) => (
                <tr
                  key={row.id}
                  className={`transition-colors hover:bg-background-300 ${
                    i < table.getRowModel().rows.length - 1
                      ? "border-b border-border-200"
                      : ""
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-5 py-4">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="border-t border-border-200">
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
      </div>
    </div>
  );
}
