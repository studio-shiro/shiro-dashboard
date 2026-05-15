"use client";
import { useState, useEffect } from "react";
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
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { usePeriodStore } from "@/store/periodStore";
import { getChartConfig } from "@/lib/dashboard/period";
import {
  getPeriodOptions,
  getDefaultPeriodValues,
  type PeriodOption,
} from "@/lib/dashboard/periodComparison";
import { InsightCard } from "@/components/dashboard/InsightCard";
import type { PeriodType, PerformanceMetrics, ChartConfig } from "@/types/dashboard";

// ─── Shared tooltip ───────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ComparisonTooltip({ active, payload, color }: any) {
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
        boxShadow: `0px 4px 12px -2px ${color}30, 0px 2px 4px -1px rgba(112,113,116,0.08)`,
        whiteSpace: "nowrap" as const,
      }}
    >
      <span style={{ fontWeight: 700 }}>{value}</span> ventas netas
    </div>
  );
}

// ─── Period dropdown ──────────────────────────────────────────────────────────

interface PeriodSelectorProps {
  options: PeriodOption[];
  value: string;
  onChange: (value: string) => void;
}

function PeriodSelector({ options, value, onChange }: PeriodSelectorProps) {
  const selected = options.find((o) => o.value === value);
  return (
    <div className="relative w-full">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full cursor-pointer appearance-none rounded-xl border border-border-200 bg-background-400 px-4 py-2.5 font-body text-sm font-bold text-text-500 focus:outline-none"
        aria-label="Seleccionar período"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {/* Visible label overlay — pointer-events-none so the select receives clicks */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-4">
        <span className="font-body text-sm font-bold text-text-500">
          {selected?.label ?? value}
        </span>
        <ChevronDownIcon className="size-4 text-text-400" />
      </div>
    </div>
  );
}

// ─── Area chart for one column ────────────────────────────────────────────────

interface ComparisonChartProps {
  config: ChartConfig;
  color: string;
}

function ComparisonChart({ config, color }: ComparisonChartProps) {
  const gradientId = `cmp-gradient-${color.replace("#", "")}`;
  const tickMap = Object.fromEntries(
    config.xAxisTicks.map((t) => [t.value, t.label]),
  );

  return (
    <div className="rounded-2xl border border-border-200 bg-background-400 pb-4 pt-5 px-4 shadow-[0px_4px_8px_-2px_rgba(112,113,116,0.08),0px_2px_4px_-2px_rgba(112,113,116,0.06)]">
      <p className="mb-4 text-center font-body text-sm font-bold text-text-500">
        {config.chartTitle}
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart
          data={config.data}
          margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.12} />
              <stop offset="90%" stopColor={color} stopOpacity={0} />
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
            tick={{ fontFamily: "Montserrat", fontSize: 11, fill: "#616161" }}
          />

          <YAxis
            domain={config.yDomain}
            ticks={config.yTicks}
            axisLine={false}
            tickLine={false}
            tick={{ fontFamily: "Montserrat", fontSize: 11, fill: "#616161" }}
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
            content={(props) => (
              <ComparisonTooltip {...props} color={color} />
            )}
            cursor={{
              stroke: "#d1d0c9",
              strokeWidth: 1,
              strokeDasharray: "4 4",
            }}
          />

          <Area
            type="monotone"
            dataKey="sales"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{
              r: 4,
              fill: color,
              stroke: "#fffffd",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Single comparison column ─────────────────────────────────────────────────

interface ComparisonColumnProps {
  metrics: PerformanceMetrics;
  chartConfig: ChartConfig;
  chartColor: string;
  options: PeriodOption[];
  selectedValue: string;
  onValueChange: (value: string) => void;
}

function ComparisonColumn({
  metrics: m,
  chartConfig,
  chartColor,
  options,
  selectedValue,
  onValueChange,
}: ComparisonColumnProps) {
  return (
    <div className="flex flex-col gap-3">
      <PeriodSelector
        options={options}
        value={selectedValue}
        onChange={onValueChange}
      />

      <div className="grid grid-cols-2 gap-3">
        <InsightCard
          label="Crecimiento"
          value={m.growth}
          valueTrend={m.growthTrend}
        />
        <InsightCard
          label="Ticket Promedio"
          value={m.averageTicket}
          trend={m.averageTicketTrend}
          trendLabel={`${Math.abs(m.averageTicketTrend).toFixed(2)}%`}
        />
        <InsightCard
          label="Frecuencia de Compra"
          value={m.frequency}
          valueTrend={m.frequencyTrend}
        />
        <InsightCard
          label="Tasa de Reembolso"
          value={m.refund}
          valueTrend={m.refundTrend}
        />
      </div>

      <ComparisonChart config={chartConfig} color={chartColor} />
    </div>
  );
}

// ─── Main section ─────────────────────────────────────────────────────────────

interface PeriodComparisonSectionProps {
  metricsRecord: Record<PeriodType, PerformanceMetrics>;
}

const LEFT_COLOR = "#e84911";
const RIGHT_COLOR = "#4963ea";

export function PeriodComparisonSection({
  metricsRecord,
}: PeriodComparisonSectionProps) {
  const { periodType } = usePeriodStore();

  const [leftValue, setLeftValue] = useState(
    () => getDefaultPeriodValues(periodType)[0],
  );
  const [rightValue, setRightValue] = useState(
    () => getDefaultPeriodValues(periodType)[1],
  );

  useEffect(() => {
    const [left, right] = getDefaultPeriodValues(periodType);
    setLeftValue(left);
    setRightValue(right);
  }, [periodType]);

  const options = getPeriodOptions(periodType);
  const metrics = metricsRecord[periodType];
  const leftConfig = getChartConfig(periodType, leftValue);
  const rightConfig = getChartConfig(periodType, rightValue);

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
          Comparativa de Períodos
        </h2>
        <div className="flex flex-col">
          <p className="font-body text-sm leading-5 text-text-400">
            Compará dos períodos.
          </p>
          <p className="font-body text-xs leading-4 text-text-400">
            Última actualización el {lastUpdated}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <ComparisonColumn
          metrics={metrics}
          chartConfig={leftConfig}
          chartColor={LEFT_COLOR}
          options={options}
          selectedValue={leftValue}
          onValueChange={setLeftValue}
        />
        <ComparisonColumn
          metrics={metrics}
          chartConfig={rightConfig}
          chartColor={RIGHT_COLOR}
          options={options}
          selectedValue={rightValue}
          onValueChange={setRightValue}
        />
      </div>
    </div>
  );
}
