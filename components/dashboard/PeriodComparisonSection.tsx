"use client";
import { useState, useTransition } from "react";
import { LastUpdated } from "@/components/shared/LastUpdated";
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
import { getPeriodOptions, type PeriodOption } from "@/lib/dashboard/periodComparison";
import { InsightCard } from "@/components/dashboard/InsightCard";
import type {
  PeriodType,
  ComparisonSideData,
  ChartConfig,
} from "@/types/dashboard";
import type { fetchComparisonDataAction } from "@/actions/dashboard";

function formatCurrency(n: number): string {
  return `$${Math.round(n).toLocaleString("es-AR")}`;
}

function formatPct(n: number): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────

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
      <span style={{ fontWeight: 700 }}>{formatCurrency(value)}</span> en ventas
    </div>
  );
}

// ─── Period dropdown ──────────────────────────────────────────────────────────

interface PeriodSelectorProps {
  options: PeriodOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

function PeriodSelector({ options, value, onChange, disabled }: PeriodSelectorProps) {
  const selected = options.find((o) => o.value === value);
  return (
    <div className="relative w-full">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full cursor-pointer appearance-none rounded-xl border border-border-200 bg-background-400 px-4 py-2.5 heading-sm text-text-500 focus:outline-none disabled:opacity-50"
        aria-label="Seleccionar período"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-4">
        <span className="heading-sm text-text-500">
          {selected?.label ?? value}
        </span>
        <ChevronDownIcon className="size-4 text-text-400" />
      </div>
    </div>
  );
}

// ─── Chart ────────────────────────────────────────────────────────────────────

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
      <p className="mb-4 text-center heading-sm text-text-500">
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

          <CartesianGrid vertical={false} stroke="#e8e8ea" strokeDasharray="4 4" />

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
            tickFormatter={(v) => `$${(v as number).toLocaleString("es-AR")}`}
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
            width={70}
          />

          <Tooltip
            content={(props) => <ComparisonTooltip {...props} color={color} />}
            cursor={{ stroke: "#d1d0c9", strokeWidth: 1, strokeDasharray: "4 4" }}
          />

          <Area
            type="monotone"
            dataKey="sales"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{ r: 4, fill: color, stroke: "#fffffd", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Single column ────────────────────────────────────────────────────────────

interface ComparisonColumnProps {
  data: ComparisonSideData;
  color: string;
  options: PeriodOption[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  isPending: boolean;
}

function ComparisonColumn({
  data: d,
  color,
  options,
  selectedValue,
  onValueChange,
  isPending,
}: ComparisonColumnProps) {
  const growthTrend =
    d.growth !== null ? (d.growth >= 0 ? "positive" : "negative") : undefined;

  return (
    <div className={`flex flex-col gap-3 transition-opacity ${isPending ? "opacity-60" : ""}`}>
      <PeriodSelector
        options={options}
        value={selectedValue}
        onChange={onValueChange}
        disabled={isPending}
      />

      <div className="grid grid-cols-2 gap-3">
        <InsightCard
          label="Crecimiento"
          value={d.growth !== null ? formatPct(d.growth) : "--"}
          valueTrend={growthTrend}
        />
        <InsightCard
          label="Ticket Promedio"
          value={formatCurrency(d.averageTicket)}
        />
        <InsightCard
          label="Frecuencia de Compra"
          value={d.purchaseFrequency !== null ? formatPct(d.purchaseFrequency) : "--"}
          valueTrend={
            d.purchaseFrequency !== null
              ? d.purchaseFrequency >= 0
                ? "positive"
                : "negative"
              : undefined
          }
        />
        <InsightCard label="Tasa de Reembolso" value="--" />
      </div>

      <ComparisonChart config={d.chartConfig} color={color} />
    </div>
  );
}

// ─── Main section ─────────────────────────────────────────────────────────────

const LEFT_COLOR = "#e84911";
const RIGHT_COLOR = "#4963ea";

interface PeriodComparisonSectionProps {
  periodType: PeriodType;
  initialLeft: string;
  initialRight: string;
  initialData: { left: ComparisonSideData; right: ComparisonSideData };
  fetchComparisonData: typeof fetchComparisonDataAction;
}

export function PeriodComparisonSection({
  periodType,
  initialLeft,
  initialRight,
  initialData,
  fetchComparisonData,
}: PeriodComparisonSectionProps) {
  const [leftValue, setLeftValue] = useState(initialLeft);
  const [rightValue, setRightValue] = useState(initialRight);
  const [data, setData] = useState(initialData);
  const [isPending, startTransition] = useTransition();

  const options = getPeriodOptions(periodType);

  function handleLeftChange(newLeft: string) {
    setLeftValue(newLeft);
    startTransition(async () => {
      const result = await fetchComparisonData(periodType, newLeft, rightValue);
      if (!("error" in result)) setData(result);
    });
  }

  function handleRightChange(newRight: string) {
    setRightValue(newRight);
    startTransition(async () => {
      const result = await fetchComparisonData(periodType, leftValue, newRight);
      if (!("error" in result)) setData(result);
    });
  }


  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <h2 className="font-body text-2xl font-bold leading-none text-text-500">
          Comparativa de Períodos
        </h2>
        <div className="flex flex-col">
          <p className="body-md-regular text-text-400">
            Compará dos períodos del mismo tipo.
          </p>
          <p className="body-sm-regular text-text-400">
            Última actualización el <LastUpdated />
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <ComparisonColumn
          data={data.left}
          color={LEFT_COLOR}
          options={options}
          selectedValue={leftValue}
          onValueChange={handleLeftChange}
          isPending={isPending}
        />
        <ComparisonColumn
          data={data.right}
          color={RIGHT_COLOR}
          options={options}
          selectedValue={rightValue}
          onValueChange={handleRightChange}
          isPending={isPending}
        />
      </div>
    </div>
  );
}
