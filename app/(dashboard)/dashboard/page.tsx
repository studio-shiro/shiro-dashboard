import { Suspense } from "react";
import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { PeriodFilter } from "@/components/dashboard/PeriodFilter";
import { StockAlertChart } from "@/components/dashboard/StockAlertChart";
import { TopProductsChart } from "@/components/dashboard/TopProductsChart";
import { PerformanceSection } from "@/components/dashboard/PerformanceSection";
import { SellSection } from "@/components/dashboard/SellSection";
import { DormantProductsTable } from "@/components/dashboard/DormantProductsTable";
import { SalesPeriodTable } from "@/components/dashboard/SalesPeriodTable";
import { PeriodComparisonSection } from "@/components/dashboard/PeriodComparisonSection";
import { createClient } from "@/lib/supabase/server";
import {
  fetchStockAlerts,
  fetchDormantProducts,
  fetchTopProducts,
  fetchSalesMetrics,
  fetchCustomersMetrics,
  fetchChartData,
  fetchPurchaseFrequency,
  fetchPeriodSales,
} from "@/lib/dashboard/queries";
import { getChartConfig } from "@/lib/dashboard/period";
import { computeDateRange, getDefaultPeriod } from "@/lib/dashboard/dateRange";
import { getDefaultPeriodValues } from "@/lib/dashboard/periodComparison";
import { fetchComparisonDataAction } from "@/actions/dashboard";
import type { PeriodType, PerformanceMetrics } from "@/types/dashboard";

function formatCurrency(n: number): string {
  return `$${Math.round(n).toLocaleString("es-AR")}`;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; value?: string }>;
}) {
  const params = await searchParams;
  const defaultPeriod = getDefaultPeriod();
  const periodType = (params.type ?? defaultPeriod.type) as PeriodType;
  const periodValue = params.value ?? defaultPeriod.value;

  const range = computeDateRange(periodType, periodValue);
  const [defaultLeft, defaultRight] = getDefaultPeriodValues(periodType);
  const leftRange = computeDateRange(periodType, defaultLeft);
  const rightRange = computeDateRange(periodType, defaultRight);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const businessId = user?.user_metadata?.business_id as string;

  // All queries run in parallel — one single round-trip
  const [
    salesMetrics,
    customersMetrics,
    chartData,
    purchaseFrequency,
    stockAlerts,
    dormantProducts,
    topProducts,
    lowStockResult,
    leftChart,
    rightChart,
    leftMetrics,
    rightMetrics,
    leftFreq,
    rightFreq,
    periodSales,
  ] = await Promise.all([
    fetchSalesMetrics(
      supabase,
      businessId,
      range.startDate,
      range.endDate,
      range.prevStartDate,
      range.prevEndDate,
    ),
    fetchCustomersMetrics(
      supabase,
      businessId,
      range.startDate,
      range.endDate,
      range.prevStartDate,
      range.prevEndDate,
    ),
    fetchChartData(
      supabase,
      businessId,
      range.startDate,
      range.endDate,
      periodType,
    ),
    fetchPurchaseFrequency(
      supabase,
      businessId,
      range.startDate,
      range.endDate,
      range.prevStartDate,
      range.prevEndDate,
    ),
    fetchStockAlerts(supabase, businessId),
    fetchDormantProducts(supabase, businessId),
    fetchTopProducts(supabase, businessId, range.startDate),
    supabase
      .from("stock")
      .select("id", { count: "exact", head: true })
      .eq("business_id", businessId)
      .filter("quantity", "lte", "alert_threshold"),
    fetchChartData(
      supabase,
      businessId,
      leftRange.startDate,
      leftRange.endDate,
      periodType,
    ),
    fetchChartData(
      supabase,
      businessId,
      rightRange.startDate,
      rightRange.endDate,
      periodType,
    ),
    fetchSalesMetrics(
      supabase,
      businessId,
      leftRange.startDate,
      leftRange.endDate,
      leftRange.prevStartDate,
      leftRange.prevEndDate,
    ),
    fetchSalesMetrics(
      supabase,
      businessId,
      rightRange.startDate,
      rightRange.endDate,
      rightRange.prevStartDate,
      rightRange.prevEndDate,
    ),
    fetchPurchaseFrequency(
      supabase,
      businessId,
      leftRange.startDate,
      leftRange.endDate,
      leftRange.prevStartDate,
      leftRange.prevEndDate,
    ),
    fetchPurchaseFrequency(
      supabase,
      businessId,
      rightRange.startDate,
      rightRange.endDate,
      rightRange.prevStartDate,
      rightRange.prevEndDate,
    ),
    fetchPeriodSales(supabase, businessId, range.startDate, range.endDate),
  ]);

  const chartConfig = getChartConfig(periodType, periodValue, chartData);

  const performanceMetrics: PerformanceMetrics = {
    growth: salesMetrics.grossSalesTrend,
    averageTicket: salesMetrics.averageTicket,
    averageTicketTrend: salesMetrics.averageTicketTrend,
    purchaseFrequency,
  };

  const initialComparison = {
    left: {
      chartConfig: getChartConfig(periodType, defaultLeft, leftChart),
      grossSales: leftMetrics.grossSales,
      orders: leftMetrics.orders,
      averageTicket: leftMetrics.averageTicket,
      growth: leftMetrics.grossSalesTrend,
      purchaseFrequency: leftFreq,
    },
    right: {
      chartConfig: getChartConfig(periodType, defaultRight, rightChart),
      grossSales: rightMetrics.grossSales,
      orders: rightMetrics.orders,
      averageTicket: rightMetrics.averageTicket,
      growth: rightMetrics.grossSalesTrend,
      purchaseFrequency: rightFreq,
    },
  };

  const now = new Date();
  const lastUpdated = now.toLocaleString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-9">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-body text-[28px] font-bold leading-none text-text-500">
            Dashboard
          </h1>
          <p className="body-lg-regular text-text-400">
            Podés hacer seguimiento de tus ventas, saldo en cuenta y otras
            métricas clave.
          </p>
        </div>
        <Suspense
          fallback={<div className="h-9 w-72 animate-pulse rounded-lg" />}
        >
          <PeriodFilter />
        </Suspense>
      </div>

      <div className="grid grid-cols-2">
        <BalanceCard
          title="Ventas del Período"
          subtitle="Total de ventas brutas en el período seleccionado."
          lastUpdated={`Última actualización el ${lastUpdated}`}
          value={formatCurrency(salesMetrics.grossSales)}
          trend={salesMetrics.grossSalesTrend ?? undefined}
          trendLabel={
            salesMetrics.grossSalesTrend !== null
              ? `${Math.abs(salesMetrics.grossSalesTrend).toFixed(1)}%`
              : undefined
          }
        />
      </div>

      <SellSection metrics={salesMetrics} />

      {/* <div className=""> */}
      <StockAlertChart data={stockAlerts} />

      <div className="flex gap-9">
        <div className="flex-1 min-w-0 flex flex-col">
          <TopProductsChart data={topProducts} />
        </div>
        <div className="flex-1 min-w-0 flex flex-col">
          <SalesPeriodTable rows={periodSales} periodType={periodType} />
        </div>
      </div>
      {/* </div> */}

      <PerformanceSection
        metrics={performanceMetrics}
        chartConfig={chartConfig}
      />

      <DormantProductsTable data={dormantProducts} />

      <PeriodComparisonSection
        key={periodType}
        periodType={periodType}
        initialLeft={defaultLeft}
        initialRight={defaultRight}
        initialData={initialComparison}
        fetchComparisonData={fetchComparisonDataAction}
      />
    </div>
  );
}
