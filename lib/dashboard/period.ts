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
    yAxisLabel: "Ventas netas",
    ...buildYAxis(data),
    data,
    xAxisTicks,
    referenceLineXValues: [6, 12, 18],
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

  const xAxisTicks: XAxisTick[] = [4, 11, 18, 25]
    .filter((x) => x <= daysInMonth)
    .map((x, i) => ({ value: x, label: `Semana ${i + 1}` }));

  const monthName = new Date(year, month - 1, 1).toLocaleDateString(
    "es-AR",
    { month: "long", year: "numeric" },
  );

  return {
    granularity: "weekly",
    chartTitle: monthName.charAt(0).toUpperCase() + monthName.slice(1),
    yAxisLabel: "Ventas netas",
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
    yAxisLabel: "Ventas netas",
    ...buildYAxis(data),
    data,
    xAxisTicks,
    referenceLineXValues: [2.5, 5.5, 8.5],
  };
}

function buildCustomConfig(periodValue: string, raw: ChartDataPoint[]): ChartConfig {
  const [fromStr, toStr] = periodValue.split("_");
  const from = new Date(`${fromStr}T00:00:00.000Z`);
  const to = new Date(`${toStr}T00:00:00.000Z`);
  const days = Math.round((to.getTime() - from.getTime()) / 86_400_000) + 1;

  if (days <= 1) {
    return buildDailyConfig(fromStr, raw);
  }

  if (days <= 31) {
    // Daily buckets: x = day-of-month (or relative day index for multi-month ranges)
    const byDay = new Map(raw.map((d) => [d.x, d.sales]));
    const data: ChartDataPoint[] = Array.from({ length: days }, (_, i) => {
      const d = new Date(from);
      d.setUTCDate(d.getUTCDate() + i);
      return { x: d.getUTCDate(), sales: byDay.get(d.getUTCDate()) ?? 0 };
    });

    const xAxisTicks: XAxisTick[] = data
      .filter((_, i) => i % Math.ceil(days / 5) === 0)
      .map((d) => ({ value: d.x, label: String(d.x) }));

    const fmt = (d: Date) =>
      d.toLocaleDateString("es-AR", { day: "numeric", month: "short" });

    return {
      granularity: "daily",
      chartTitle: `${fmt(from)} – ${fmt(to)}`,
      yAxisLabel: "Ventas netas",
      ...buildYAxis(data),
      data,
      xAxisTicks,
      referenceLineXValues: [],
    };
  }

  // 32+ days: monthly buckets
  const byMonth = new Map(raw.map((d) => [d.x, d.sales]));
  const MONTH_LABELS = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
  ];

  const months: { x: number; sales: number }[] = [];
  const cur = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), 1));
  const last = new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), 1));
  while (cur <= last) {
    months.push({ x: cur.getUTCMonth(), sales: byMonth.get(cur.getUTCMonth()) ?? 0 });
    cur.setUTCMonth(cur.getUTCMonth() + 1);
  }

  const xAxisTicks: XAxisTick[] = months.map((m) => ({
    value: m.x,
    label: MONTH_LABELS[m.x],
  }));

  const fmt = (d: Date) =>
    d.toLocaleDateString("es-AR", { day: "numeric", month: "short" });

  return {
    granularity: "monthly",
    chartTitle: `${fmt(from)} – ${fmt(to)}`,
    yAxisLabel: "Ventas netas",
    ...buildYAxis(months),
    data: months,
    xAxisTicks,
    referenceLineXValues: [],
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
    case "month":
      return buildMonthlyConfig(periodValue, data);
    case "year":
      return buildYearlyConfig(periodValue, data);
    case "custom":
      return buildCustomConfig(periodValue, data);
  }
}
