"use client";
import { usePeriodStore } from "@/store/periodStore";
import { getSellMetrics } from "@/lib/dashboard/period";
import { InsightCard } from "@/components/dashboard/InsightCard";

export function SellSection() {
  const { periodType } = usePeriodStore();
  const m = getSellMetrics(periodType);

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
          Ventas
        </h2>
        <p className="font-body text-xs leading-4 text-text-400">
          Última actualización el {lastUpdated}
        </p>
      </div>
      <div className="flex gap-3">
        <InsightCard
          label="Ventas Brutas"
          value={m.grossSales}
          trend={m.grossSalesTrend}
          trendLabel={`${Math.abs(m.grossSalesTrend).toFixed(2)}%`}
        />
        <InsightCard
          label="Ventas Netas"
          value={m.netSales}
          trend={m.netSalesTrend}
          trendLabel={`${Math.abs(m.netSalesTrend).toFixed(2)}%`}
        />
      </div>
      <div className="flex gap-3">
        <InsightCard
          label="Pedidos"
          value={String(m.orders)}
          unit="pedidos"
          trend={m.ordersTrend}
          trendLabel={`${Math.abs(m.ordersTrend).toFixed(2)}%`}
        />
        <InsightCard
          label="Unidades Vendidas"
          value={String(m.units)}
          unit="unidades"
          trend={m.unitsTrend}
          trendLabel={`${Math.abs(m.unitsTrend).toFixed(2)}%`}
        />
        <InsightCard
          label="Ticket Promedio"
          value={m.averageTicket}
          trend={m.averageTicketTrend}
          trendLabel={`${Math.abs(m.averageTicketTrend).toFixed(2)}%`}
        />
      </div>
    </div>
  );
}
