import type {
  PeriodType,
  ChartConfig,
  ChartDataPoint,
  XAxisTick,
} from "@/types/dashboard";

// ─── Y-axis helpers ───────────────────────────────────────────────────────────

function buildYAxis(data: ChartDataPoint[]): {
  yDomain: [number, number];
  yTicks: number[];
} {
  const max = Math.max(...data.map((d) => d.sales), 0);
  if (max === 0) return { yDomain: [0, 100], yTicks: [0, 25, 50, 75, 100] };

  // Round up to a "nice" ceiling with ~5 ticks
  const rawCeil = max * 1.25;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawCeil)));
  const niceCeil = Math.ceil(rawCeil / magnitude) * magnitude;
  const step = niceCeil / 4;

  return {
    yDomain: [0, niceCeil],
    yTicks: [0, step, step * 2, step * 3, niceCeil],
  };
}

// ─── Chart config builders ────────────────────────────────────────────────────

function buildDailyConfig(periodValue: string, raw: ChartDataPoint[]): ChartConfig {
  // Bucket by hour (0-23), fill gaps with 0
  const byHour = new Map(raw.map((d) => [d.x, d.sales]));
  const data: ChartDataPoint[] = Array.from({ length: 24 }, (_, i) => ({
    x: i,
    sales: byHour.get(i) ?? 0,
  }));

  const xAxisTicks: XAxisTick[] = [0, 6, 12, 18].map((h) => ({
    value: h,
    label: `${String(h).padStart(2, "0")}hs`,
  }));

  const date = new Date(`${periodValue}T12:00:00.000Z`);
  const label = date.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return {
    granularity: "hourly",
    chartTitle: label.charAt(0).toUpperCase() + label.slice(1),
    yAxisLabel: "Ventas",
    ...buildYAxis(data),
    data,
    xAxisTicks,
    referenceLineXValues: [6, 12, 18],
  };
}

function buildWeeklyConfig(periodValue: string, raw: ChartDataPoint[]): ChartConfig {
  const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const byDay = new Map(raw.map((d) => [d.x, d.sales]));
  const data: ChartDataPoint[] = Array.from({ length: 7 }, (_, i) => ({
    x: i,
    sales: byDay.get(i) ?? 0,
  }));

  const xAxisTicks: XAxisTick[] = DAY_LABELS.map((label, i) => ({
    value: i,
    label,
  }));

  // Build label from the Monday date
  const start = new Date(`${periodValue}T12:00:00.000Z`);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 6);
  const fmt = (d: Date) =>
    d.toLocaleDateString("es-AR", { day: "numeric", month: "short" });

  return {
    granularity: "daily",
    chartTitle: `${fmt(start)} — ${fmt(end)}`,
    yAxisLabel: "Ventas",
    ...buildYAxis(data),
    data,
    xAxisTicks,
    referenceLineXValues: [4.5],
  };
}

function buildMonthlyConfig(periodValue: string, raw: ChartDataPoint[]): ChartConfig {
  const [year, month] = periodValue.split("-").map(Number);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  const byDay = new Map(raw.map((d) => [d.x, d.sales]));
  const data: ChartDataPoint[] = Array.from({ length: daysInMonth }, (_, i) => ({
    x: i + 1,
    sales: byDay.get(i + 1) ?? 0,
  }));

  // Week-midpoint ticks
  const xAxisTicks: XAxisTick[] = [4, 11, 18, 25]
    .filter((x) => x <= daysInMonth)
    .map((x, i) => ({ value: x, label: `Semana ${i + 1}` }));

  // Use local constructor (not UTC) so toLocaleDateString sees the correct month
  // regardless of the server's timezone offset.
  const monthName = new Date(year, month - 1, 1).toLocaleDateString(
    "es-AR",
    { month: "long", year: "numeric" },
  );

  return {
    granularity: "weekly",
    chartTitle: monthName.charAt(0).toUpperCase() + monthName.slice(1),
    yAxisLabel: "Ventas",
    ...buildYAxis(data),
    data,
    xAxisTicks,
    referenceLineXValues: [7.5, 14.5, 21.5].filter((x) => x < daysInMonth),
  };
}

function buildYearlyConfig(periodValue: string, raw: ChartDataPoint[]): ChartConfig {
  const MONTH_LABELS = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
  ];

  const byMonth = new Map(raw.map((d) => [d.x, d.sales]));
  const data: ChartDataPoint[] = Array.from({ length: 12 }, (_, i) => ({
    x: i,
    sales: byMonth.get(i) ?? 0,
  }));

  const xAxisTicks: XAxisTick[] = MONTH_LABELS.map((label, i) => ({
    value: i,
    label,
  }));

  return {
    granularity: "monthly",
    chartTitle: `Año ${periodValue}`,
    yAxisLabel: "Ventas",
    ...buildYAxis(data),
    data,
    xAxisTicks,
    referenceLineXValues: [2.5, 5.5, 8.5],
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function getChartConfig(
  periodType: PeriodType,
  periodValue: string,
  data: ChartDataPoint[],
): ChartConfig {
  switch (periodType) {
    case "today":
      return buildDailyConfig(periodValue, data);
    case "week":
      return buildWeeklyConfig(periodValue, data);
    case "month":
      return buildMonthlyConfig(periodValue, data);
    case "year":
      return buildYearlyConfig(periodValue, data);
  }
}
