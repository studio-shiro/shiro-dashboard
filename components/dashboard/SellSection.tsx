"use client";
import { InsightCard } from "@/components/dashboard/InsightCard";
import type { SellMetrics } from "@/types/dashboard";
import { LastUpdated } from "@/components/shared/LastUpdated";
import { SectionHeader } from "@/components/dashboard/SectionHeader";

function formatCurrency(n: number): string {
  return `$${Math.round(n).toLocaleString("es-AR")}`;
}

function trendLabel(n: number | null): string | undefined {
  if (n === null) return undefined;
  return `${Math.abs(n).toFixed(1)}%`;
}

interface SellSectionProps {
  metrics: SellMetrics;
}

export function SellSection({ metrics: m }: SellSectionProps) {
  return (
    <div className="flex flex-col gap-3">
      <SectionHeader
        title="Ventas"
        lastUpdated={<>Última actualización el <LastUpdated /></>}
      />
      <div className="flex gap-3">
        <InsightCard
          label="Ventas Brutas"
          value={formatCurrency(m.grossSales)}
          trend={m.grossSalesTrend ?? undefined}
          trendLabel={trendLabel(m.grossSalesTrend)}
        />
        <InsightCard
          label="Ventas Netas"
          value={formatCurrency(m.netSales)}
          trend={m.netSalesTrend ?? undefined}
          trendLabel={trendLabel(m.netSalesTrend)}
        />
      </div>
      <div className="flex gap-3">
        <InsightCard
          label="Pedidos"
          value={String(m.orders)}
          unit="pedidos"
          trend={m.ordersTrend ?? undefined}
          trendLabel={trendLabel(m.ordersTrend)}
        />
        <InsightCard
          label="Unidades Vendidas"
          value={String(m.units)}
          unit="unidades"
          trend={m.unitsTrend ?? undefined}
          trendLabel={trendLabel(m.unitsTrend)}
        />
        <InsightCard
          label="Ticket Promedio"
          value={formatCurrency(m.averageTicket)}
          trend={m.averageTicketTrend ?? undefined}
          trendLabel={trendLabel(m.averageTicketTrend)}
        />
      </div>
    </div>
  );
}
