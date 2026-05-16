export type PeriodType = "today" | "week" | "month" | "year";
export type ChartGranularity = "hourly" | "daily" | "weekly" | "monthly";

export interface ChartDataPoint {
  x: number;
  sales: number;
}

export interface XAxisTick {
  value: number;
  label: string;
}

export interface ChartConfig {
  granularity: ChartGranularity;
  chartTitle: string;
  yAxisLabel: string;
  yDomain: [number, number];
  yTicks: number[];
  data: ChartDataPoint[];
  xAxisTicks: XAxisTick[];
  referenceLineXValues: number[];
}

export interface PerformanceMetrics {
  growth: number | null;
  averageTicket: number;
  averageTicketTrend: number | null;
  purchaseFrequency: number | null;
}

export interface SellMetrics {
  grossSales: number;
  grossSalesTrend: number | null;
  netSales: number;
  netSalesTrend: number | null;
  orders: number;
  ordersTrend: number | null;
  units: number;
  unitsTrend: number | null;
  averageTicket: number;
  averageTicketTrend: number | null;
}

export interface CustomersMetrics {
  newCustomers: number;
  newCustomersTrend: number | null;
}

export interface StockAlertItem {
  name: string;
  quantity: number;
  threshold: number;
}

export interface TopProduct {
  name: string;
  value: number;
  color: string;
  units: number;
}

export interface DormantProduct {
  id: string;
  reference: string;
  name: string;
  category: string;
  lastSaleDate: string;
  stock: number;
  dormantDays: number;
}

export interface ComparisonSideData {
  chartConfig: ChartConfig;
  grossSales: number;
  orders: number;
  averageTicket: number;
  growth: number | null;
  purchaseFrequency: number | null;
}
