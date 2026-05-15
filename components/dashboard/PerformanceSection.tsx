"use client";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { usePeriodStore } from "@/store/periodStore";
import { getChartConfig } from "@/lib/dashboard/period";
import { InsightCard } from "@/components/dashboard/InsightCard";
import type { PeriodType, PerformanceMetrics } from "@/types/dashboard";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const value = payload[0]?.value as number;
  return (
    <div
      style={{
        backgroundColor: "#fffffd",
        border: "1px solid #e8e8ea",
        borderRadius: 10,
        padding: "6px 12px",
        fontFamily: "Montserrat, sans-serif",
        fontSize: 12,
        color: "#212121",
        boxShadow:
          "0px 4px 12px -2px rgba(232,73,17,0.15), 0px 2px 4px -1px rgba(112,113,116,0.08)",
        whiteSpace: "nowrap" as const,
      }}
    >
      <span style={{ fontWeight: 700 }}>{value}</span> ventas netas
    </div>
  );
}

interface PerformanceSectionProps {
  metricsRecord: Record<PeriodType, PerformanceMetrics>;
}

export function PerformanceSection({ metricsRecord }: PerformanceSectionProps) {
  const { periodType, periodValue } = usePeriodStore();
  const config = getChartConfig(periodType, periodValue);
  const metrics = metricsRecord[periodType];

  const tickMap = Object.fromEntries(
    config.xAxisTicks.map((t) => [t.value, t.label]),
  );

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
          Rendimiento Comercial
        </h2>
        <div className="flex flex-col">
          <p className="font-body text-sm leading-5 text-text-400">
            Cómo está performando el negocio en el periodo seleccionado.
          </p>
          <p className="font-body text-xs leading-4 text-text-400">
            Última actualización el {lastUpdated}
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <InsightCard
          label="Crecimiento"
          value={metrics.growth}
          valueTrend={metrics.growthTrend}
        />
        <InsightCard
          label="Ticket Promedio"
          value={metrics.averageTicket}
          trend={metrics.averageTicketTrend}
          trendLabel={`${Math.abs(metrics.averageTicketTrend).toFixed(2)}%`}
        />
        <InsightCard
          label="Frecuencia de Compra"
          value={metrics.frequency}
          valueTrend={metrics.frequencyTrend}
        />
        <InsightCard
          label="Tasa de Reembolso"
          value={metrics.refund}
          valueTrend={metrics.refundTrend}
        />
      </div>

      <div className="rounded-2xl border border-border-200 bg-background-400 pb-4 pt-5 px-4 shadow-[0px_4px_8px_-2px_rgba(112,113,116,0.08),0px_2px_4px_-2px_rgba(112,113,116,0.06)]">
        <p className="mb-4 text-center font-body text-sm font-bold text-text-500">
          {config.chartTitle}
        </p>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart
            data={config.data}
            margin={{ top: 8, right: 24, left: 8, bottom: 0 }}
          >
            <defs>
              <linearGradient id="accentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#e84911" stopOpacity={0.12} />
                <stop offset="90%" stopColor="#e84911" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              vertical={false}
              stroke="#e8e8ea"
              strokeDasharray="4 4"
            />

            {config.referenceLineXValues.map((x) => (
              <ReferenceLine
                key={x}
                x={x}
                stroke="#d1d0c9"
                strokeDasharray="4 4"
                strokeWidth={1}
              />
            ))}

            <XAxis
              dataKey="x"
              ticks={config.xAxisTicks.map((t) => t.value)}
              tickFormatter={(v) => tickMap[v] ?? ""}
              axisLine={false}
              tickLine={false}
              tick={{
                fontFamily: "Montserrat",
                fontSize: 11,
                fill: "#616161",
              }}
            />

            <YAxis
              domain={config.yDomain}
              ticks={config.yTicks}
              axisLine={false}
              tickLine={false}
              tick={{
                fontFamily: "Montserrat",
                fontSize: 11,
                fill: "#616161",
              }}
              label={{
                value: config.yAxisLabel,
                angle: -90,
                position: "insideLeft",
                offset: -2,
                style: {
                  fontFamily: "Montserrat",
                  fontSize: 11,
                  fill: "#616161",
                  textAnchor: "middle",
                },
              }}
              width={60}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                stroke: "#d1d0c9",
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
            />

            <Area
              type="monotone"
              dataKey="sales"
              stroke="#e84911"
              strokeWidth={2}
              fill="url(#accentGradient)"
              dot={false}
              activeDot={{
                r: 4,
                fill: "#e84911",
                stroke: "#fffffd",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
