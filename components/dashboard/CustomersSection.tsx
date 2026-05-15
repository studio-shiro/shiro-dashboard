"use client";
import { usePeriodStore } from "@/store/periodStore";
import { getCustomersMetrics } from "@/lib/dashboard/period";
import { InsightCard } from "@/components/dashboard/InsightCard";

interface CustomersSectionProps {
  lowStockCount: number;
}

export function CustomersSection({ lowStockCount }: CustomersSectionProps) {
  const { periodType } = usePeriodStore();
  const m = getCustomersMetrics(periodType);

  const lastUpdated = new Date().toLocaleString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <h2 className="font-body text-2xl font-bold leading-none text-text-500">
          Clientes
        </h2>
        <p className="font-body text-xs leading-4 text-text-400">
          Última actualización el {lastUpdated}
        </p>
      </div>
      <div className="flex gap-3">
        <InsightCard
          label="Nuevos Clientes"
          value={String(m.newCustomers)}
          unit="clientes"
          trend={m.newCustomersTrend}
          trendLabel={
            m.newCustomersTrend !== undefined
              ? `${Math.abs(m.newCustomersTrend).toFixed(1)}%`
              : undefined
          }
        />
        <InsightCard
          label="Stock Bajo"
          value={String(lowStockCount)}
          unit="productos"
          trend={lowStockCount > 0 ? -lowStockCount : undefined}
          trendLabel={lowStockCount > 0 ? `${lowStockCount}` : undefined}
        />
      </div>
    </div>
  );
}
