"use client";
import { useState } from "react";
import { LastUpdated } from "@/components/shared/LastUpdated";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
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
  CubeIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import type { DormantProduct } from "@/lib/dashboard/dormantProducts";
import { Pagination } from "@/components/shared/Pagination";

const PAGE_SIZE = 5;

// ─── Sub-components ───────────────────────────────────────────────────────────

function SortIndicator({ sorted }: { sorted: false | "asc" | "desc" }) {
  if (sorted === "asc")
    return <ChevronUpIcon className="size-3.5 shrink-0 text-accent" />;
  if (sorted === "desc")
    return <ChevronDownIcon className="size-3.5 shrink-0 text-accent" />;
  return <ChevronDownIcon className="size-3.5 shrink-0 text-text-300" />;
}

function ProductImage({ url }: { url: string | null }) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt="Producto"
        className="size-[70px] rounded-[10px] border border-border-100 object-cover"
      />
    );
  }
  return (
    <div className="flex size-[70px] items-center justify-center rounded-[10px] border border-border-100 bg-background-300">
      <CubeIcon className="size-5 text-text-300" />
    </div>
  );
}

function ExpiryTagBadge({ tag }: { tag: DormantProduct["expiryTag"] }) {
  if (tag === "expiring_soon") {
    return (
      <span className="rounded-md bg-warning-300/10 px-2 py-0.5 body-sm-medium text-warning-300 whitespace-nowrap">
        Próximo a Vencer
      </span>
    );
  }
  if (tag === "apt") {
    return (
      <span className="rounded-md bg-success-100 px-2 py-0.5 body-sm-medium text-success-400 whitespace-nowrap">
        Apto Consumo
      </span>
    );
  }
  return <span className="body-md-regular text-text-400">—</span>;
}

// ─── Column definitions ───────────────────────────────────────────────────────

const columnHelper = createColumnHelper<DormantProduct>();

const COLUMNS = [
  columnHelper.accessor("name", {
    id: "name",
    header: "Producto",
    cell: (info) => (
      <span className="body-md-medium text-text-400">{info.getValue()}</span>
    ),
  }),

  columnHelper.accessor("referenceLabel", {
    id: "referencia",
    header: "Referencia",
    cell: (info) => (
      <span className="heading-sm text-text-500">{info.getValue()}</span>
    ),
    size: 124,
  }),

  columnHelper.accessor("imageUrl", {
    id: "imagen",
    header: "Imagen",
    enableSorting: false,
    cell: (info) => <ProductImage url={info.getValue()} />,
    size: 100,
  }),

  columnHelper.accessor("stock", {
    id: "stock",
    header: "Stock",
    cell: (info) => (
      <span className="body-md-regular text-text-500">{info.getValue()}</span>
    ),
    size: 82,
  }),

  columnHelper.accessor("expirationDate", {
    id: "vencimiento",
    header: "Vencimiento",
    cell: (info) => (
      <span className="body-md-regular text-text-500">
        {info.getValue() ?? "—"}
      </span>
    ),
    size: 109,
  }),

  columnHelper.accessor("daysUntilExpiry", {
    id: "diasHastaVencimiento",
    header: "Días hasta Vencimiento",
    cell: (info) => {
      const days = info.getValue();
      if (days === null)
        return <span className="body-md-regular text-text-400">—</span>;
      return (
        <span className="rounded-md bg-background-200 px-2 py-0.5 body-sm-medium text-text-400">
          {days} días
        </span>
      );
    },
    size: 112,
  }),

  columnHelper.accessor("expiryTag", {
    id: "tag",
    header: "Tag",
    enableSorting: false,
    cell: (info) => <ExpiryTagBadge tag={info.getValue()} />,
    size: 128,
  }),

  columnHelper.accessor("lastSaleDate", {
    id: "ultimaVenta",
    header: "Última venta",
    cell: (info) => (
      <span className="body-md-regular text-text-400">
        {info.getValue() || "—"}
      </span>
    ),
    size: 113,
  }),

  columnHelper.accessor("dormantDays", {
    id: "diasSinMovimiento",
    header: "Días sin movimiento",
    cell: (info) => {
      const days = info.getValue();
      return (
        <div className="flex justify-between">
          <span className="body-md-regular text-text-500">
            {days === 999 ? "—" : days}
          </span>
          <SparklesIcon className="size-6 text-info-300 fill-info-300" />
        </div>
      );
    },
  }),
];

// ─── Main component ───────────────────────────────────────────────────────────

interface DormantProductsTableProps {
  data: DormantProduct[];
}

export function DormantProductsTable({ data }: DormantProductsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "name", desc: false },
  ]);

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
      <SectionHeader
        title="Productos Sin Movimiento/Por Vencer"
        description="Vendé tus productos sin movimientos con nuestras sugerencias!"
        lastUpdated={
          <>
            Última actualización el <LastUpdated />
          </>
        }
      />

      <div className="space-y-3.5 overflow-hidden">
        <div className="overflow-x-auto rounded-2xl border border-border-200 bg-background-400 shadow-lg">
          <table className="w-full border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="border-b border-border-200 bg-background-300"
                >
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      style={
                        header.column.columnDef.size
                          ? { width: header.column.columnDef.size }
                          : undefined
                      }
                      className="px-3 py-3.5 text-left"
                    >
                      {header.column.getCanSort() ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="flex cursor-pointer items-center gap-1.5 heading-sm text-text-500 transition-colors hover:text-text-500"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          <SortIndicator sorted={header.column.getIsSorted()} />
                        </button>
                      ) : (
                        <span className="heading-sm text-text-500">
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
                    <td key={cell.id} className="px-3 py-3">
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
  );
}
