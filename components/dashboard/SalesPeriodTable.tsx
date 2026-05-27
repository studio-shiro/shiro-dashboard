"use client";

import { LastUpdated } from "@/components/shared/LastUpdated";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import type { PeriodSaleRow, PeriodType } from "@/types/dashboard";

interface SalesPeriodTableProps {
  rows: PeriodSaleRow[];
  periodType: PeriodType;
}

const PERIOD_LABELS: Record<
  PeriodType,
  { title: string; description: string }
> = {
  today: {
    title: "Ventas del Día",
    description: "Los productos que vendiste el día de hoy.",
  },
  week: {
    title: "Ventas de la Semana",
    description: "Los productos que vendiste esta semana.",
  },
  month: {
    title: "Ventas del Mes",
    description: "Los productos que vendiste este mes.",
  },
  year: {
    title: "Ventas del Año",
    description: "Los productos que vendiste este año.",
  },
};

export function SalesPeriodTable({ rows, periodType }: SalesPeriodTableProps) {
  const { title, description } = PERIOD_LABELS[periodType];

  return (
    <div className="flex flex-col gap-3">
      <SectionHeader
        title={title}
        description={description}
        lastUpdated={
          <>
            Última actualización el <LastUpdated />
          </>
        }
      />

      <div className="flex h-[290px] flex-col overflow-hidden rounded-xl bg-background-400 shadow-md">
        <table className="w-full shrink-0 border-collapse">
          <thead>
            <tr className="border-b border-border-200 bg-background-300">
              <th className="px-3 py-3 text-left body-md-semibold text-text-500">
                Producto
              </th>
              <th className="w-[109px] px-3 py-3 text-left body-md-semibold text-text-500">
                Cantidad
              </th>
              <th className="w-[144px] px-3 py-3 text-left body-md-semibold text-text-500">
                Fecha
              </th>
              <th className="w-[128px] px-3 py-3 text-left body-md-semibold text-text-500">
                Hora
              </th>
            </tr>
          </thead>
        </table>

        {rows.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="body-md-semibold text-text-400">
              Sin ventas en este período
            </p>
          </div>
        ) : (
          <div className="overflow-y-auto">
            <table className="w-full border-collapse">
              <tbody>
                {rows.map((row, i) => (
                  <tr
                    key={row.productId}
                    className={`h-12 transition-colors hover:bg-background-300 ${
                      i < rows.length - 1 ? "border-b border-border-100" : ""
                    }`}
                  >
                    <td className="px-3 body-md-medium text-text-400 truncate max-w-0 w-full">
                      {row.productName}
                    </td>
                    <td className="w-[109px] px-3 body-md-regular text-text-500">
                      {row.quantity}
                    </td>
                    <td className="w-[144px] px-3 body-md-regular text-text-500">
                      {row.lastSaleDate}
                    </td>
                    <td className="w-[128px] px-3 body-md-regular text-text-500">
                      {row.lastSaleTime}hs
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
