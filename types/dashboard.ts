export type PeriodType = "today" | "week" | "month" | "year";
export type ChartGranularity = "hourly" | "daily" | "weekly" | "monthly";

export interface PeriodState {
  periodType: PeriodType;
  periodValue: string;
}

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
  growth: string;
  growthTrend: "positive" | "negative";
  averageTicket: string;
  averageTicketTrend: number;
  frequency: string;
  frequencyTrend: "positive" | "negative";
  refund: string;
  refundTrend: "positive" | "negative";
}

export interface SellMetrics {
  grossSales: string;
  grossSalesTrend: number;
  netSales: string;
  netSalesTrend: number;
  orders: number;
  ordersTrend: number;
  units: number;
  unitsTrend: number;
  averageTicket: string;
  averageTicketTrend: number;
}

export interface CustomersMetrics {
  newCustomers: number;
  newCustomersTrend?: number;
}
