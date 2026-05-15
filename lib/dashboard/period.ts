import type {
  PeriodType,
  ChartConfig,
  ChartDataPoint,
  XAxisTick,
  PerformanceMetrics,
  SellMetrics,
  CustomersMetrics,
} from "@/types/dashboard";

// ─── Dummy data seeds per granularity ────────────────────────────────────────

const MONTHLY_DATA: number[] = [
  35,
  28,
  42,
  38,
  45,
  55,
  50, // Week 1
  40,
  35,
  28,
  45,
  52,
  58,
  48, // Week 2
  62,
  68,
  70,
  85,
  72,
  65,
  55, // Week 3
  48,
  35,
  50,
  62,
  68,
  60,
  15, // Week 4 (month end drop)
];

const WEEKLY_DATA: number[] = [45, 52, 38, 61, 70, 85, 48];

// Every 2 hours: 00, 02, 04, 06, 08, 10, 12, 14, 16, 18, 20, 22
const HOURLY_DATA: number[] = [0, 2, 5, 12, 22, 35, 48, 55, 52, 40, 30, 18];

const YEARLY_DATA: number[] = [
  2800, 3200, 3800, 4200, 3600, 4800, 5200, 4900, 4400, 3800, 4200, 3600,
];

// ─── Performance metrics per period ──────────────────────────────────────────

const PERFORMANCE_METRICS: Record<PeriodType, PerformanceMetrics> = {
  today: {
    growth: "+5%",
    growthTrend: "positive",
    averageTicket: "$3.850",
    averageTicketTrend: 2.1,
    frequency: "+1.2%",
    frequencyTrend: "positive",
    refund: "-0.5%",
    refundTrend: "negative",
  },
  week: {
    growth: "+8%",
    growthTrend: "positive",
    averageTicket: "$4.120",
    averageTicketTrend: -1.5,
    frequency: "+2.3%",
    frequencyTrend: "positive",
    refund: "-1.1%",
    refundTrend: "negative",
  },
  month: {
    growth: "+12%",
    growthTrend: "positive",
    averageTicket: "$4.520",
    averageTicketTrend: -5.23,
    frequency: "+3.8%",
    frequencyTrend: "positive",
    refund: "-2.1%",
    refundTrend: "negative",
  },
  year: {
    growth: "+24%",
    growthTrend: "positive",
    averageTicket: "$4.890",
    averageTicketTrend: 8.4,
    frequency: "+7.2%",
    frequencyTrend: "positive",
    refund: "-3.8%",
    refundTrend: "negative",
  },
};

// ─── Chart config builders ────────────────────────────────────────────────────

function buildMonthlyConfig(periodValue: string): ChartConfig {
  const [year, month] = periodValue.split("-").map(Number);
  const monthName = new Date(year, month - 1, 1).toLocaleDateString("es-AR", {
    month: "long",
  });
  const capitalizedMonth =
    monthName.charAt(0).toUpperCase() + monthName.slice(1);

  const data: ChartDataPoint[] = MONTHLY_DATA.map((sales, i) => ({
    x: i + 1,
    sales,
  }));

  // Label at midpoint of each 7-day block
  const xAxisTicks: XAxisTick[] = [4, 11, 18, 25].map((x, i) => ({
    value: x,
    label: `Semana ${i + 1}`,
  }));

  return {
    granularity: "weekly",
    chartTitle: `Mes de ${capitalizedMonth}`,
    yAxisLabel: "Ventas Netas",
    yDomain: [0, 100],
    yTicks: [0, 20, 40, 60, 80, 100],
    data,
    xAxisTicks,
    referenceLineXValues: [7.5, 14.5, 21.5],
  };
}

function buildWeeklyConfig(): ChartConfig {
  const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const data: ChartDataPoint[] = WEEKLY_DATA.map((sales, i) => ({
    x: i,
    sales,
  }));
  const xAxisTicks: XAxisTick[] = DAY_LABELS.map((label, i) => ({
    value: i,
    label,
  }));

  return {
    granularity: "daily",
    chartTitle: "Esta semana",
    yAxisLabel: "Ventas Netas",
    yDomain: [0, 100],
    yTicks: [0, 20, 40, 60, 80, 100],
    data,
    xAxisTicks,
    referenceLineXValues: [4.5], // weekend boundary
  };
}

function buildDailyConfig(): ChartConfig {
  const data: ChartDataPoint[] = HOURLY_DATA.map((sales, i) => ({
    x: i * 2,
    sales,
  }));
  const xAxisTicks: XAxisTick[] = [0, 6, 12, 18].map((hour) => ({
    value: hour,
    label: `${String(hour).padStart(2, "0")}hs`,
  }));

  return {
    granularity: "hourly",
    chartTitle: "Hoy",
    yAxisLabel: "Ventas Netas",
    yDomain: [0, 70],
    yTicks: [0, 20, 40, 60],
    data,
    xAxisTicks,
    referenceLineXValues: [6, 12, 18],
  };
}

function buildYearlyConfig(periodValue: string): ChartConfig {
  const MONTH_LABELS = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];
  const year = periodValue;
  const data: ChartDataPoint[] = YEARLY_DATA.map((sales, i) => ({
    x: i,
    sales,
  }));
  const xAxisTicks: XAxisTick[] = MONTH_LABELS.map((label, i) => ({
    value: i,
    label,
  }));

  return {
    granularity: "monthly",
    chartTitle: `Año ${year}`,
    yAxisLabel: "Ventas Netas",
    yDomain: [0, 6000],
    yTicks: [0, 1500, 3000, 4500, 6000],
    data,
    xAxisTicks,
    referenceLineXValues: [2.5, 5.5, 8.5], // quarter boundaries
  };
}

// ─── Sales & Customers dummy metrics ─────────────────────────────────────────

const SALES_METRICS: Record<PeriodType, SellMetrics> = {
  today: {
    grossSales: "$18.450",
    grossSalesTrend: 3.2,
    netSales: "$15.682",
    netSalesTrend: 3.2,
    orders: 24,
    ordersTrend: -1.5,
    units: 87,
    unitsTrend: 2.8,
    averageTicket: "$769",
    averageTicketTrend: 4.7,
  },
  week: {
    grossSales: "$124.300",
    grossSalesTrend: 8.1,
    netSales: "$105.655",
    netSalesTrend: 8.1,
    orders: 163,
    ordersTrend: 5.4,
    units: 591,
    unitsTrend: 6.2,
    averageTicket: "$762",
    averageTicketTrend: 2.5,
  },
  month: {
    grossSales: "$487.200",
    grossSalesTrend: 5.23,
    netSales: "$414.120",
    netSalesTrend: 5.23,
    orders: 642,
    ordersTrend: 5.23,
    units: 2568,
    unitsTrend: -5.23,
    averageTicket: "$758",
    averageTicketTrend: -5.23,
  },
  year: {
    grossSales: "$5.846.400",
    grossSalesTrend: 18.4,
    netSales: "$4.969.440",
    netSalesTrend: 18.4,
    orders: 7704,
    ordersTrend: 12.7,
    units: 30816,
    unitsTrend: 15.3,
    averageTicket: "$759",
    averageTicketTrend: 5.0,
  },
};

const CUSTOMERS_METRICS: Record<PeriodType, CustomersMetrics> = {
  today: { newCustomers: 3, newCustomersTrend: 50 },
  week: { newCustomers: 18, newCustomersTrend: 12.5 },
  month: { newCustomers: 74, newCustomersTrend: 2.5 },
  year: { newCustomers: 612, newCustomersTrend: 24.1 },
};

// ─── Public API ───────────────────────────────────────────────────────────────

export function getChartConfig(
  periodType: PeriodType,
  periodValue: string,
): ChartConfig {
  switch (periodType) {
    case "today":
      return buildDailyConfig();
    case "week":
      return buildWeeklyConfig();
    case "month":
      return buildMonthlyConfig(periodValue);
    case "year":
      return buildYearlyConfig(periodValue);
  }
}

export function getPerformanceMetrics(
  periodType: PeriodType,
): PerformanceMetrics {
  return PERFORMANCE_METRICS[periodType];
}

export function getSellMetrics(periodType: PeriodType): SellMetrics {
  return SALES_METRICS[periodType];
}

export function getCustomersMetrics(periodType: PeriodType): CustomersMetrics {
  return CUSTOMERS_METRICS[periodType];
}
