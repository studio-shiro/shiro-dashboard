"use server";
import { createClient } from "@/lib/supabase/server";
import { computeDateRange } from "@/lib/dashboard/dateRange";
import { fetchSalesMetrics, fetchChartData, fetchPurchaseFrequency } from "@/lib/dashboard/queries";
import { getChartConfig } from "@/lib/dashboard/period";
import type { PeriodType, ComparisonSideData } from "@/types/dashboard";

export async function fetchComparisonDataAction(
  type: PeriodType,
  leftValue: string,
  rightValue: string,
): Promise<
  | { left: ComparisonSideData; right: ComparisonSideData }
  | { error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const businessId = user.user_metadata.business_id as string;
  const leftRange = computeDateRange(type, leftValue);
  const rightRange = computeDateRange(type, rightValue);

  const [leftChart, rightChart, leftMetrics, rightMetrics, leftFreq, rightFreq] =
    await Promise.all([
      fetchChartData(supabase, businessId, leftRange.startDate, leftRange.endDate, type),
      fetchChartData(supabase, businessId, rightRange.startDate, rightRange.endDate, type),
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
      fetchPurchaseFrequency(supabase, businessId, leftRange.startDate, leftRange.endDate, leftRange.prevStartDate, leftRange.prevEndDate),
      fetchPurchaseFrequency(supabase, businessId, rightRange.startDate, rightRange.endDate, rightRange.prevStartDate, rightRange.prevEndDate),
    ]);

  return {
    left: {
      chartConfig: getChartConfig(type, leftValue, leftChart),
      grossSales: leftMetrics.grossSales,
      orders: leftMetrics.orders,
      averageTicket: leftMetrics.averageTicket,
      growth: leftMetrics.grossSalesTrend,
      purchaseFrequency: leftFreq,
    },
    right: {
      chartConfig: getChartConfig(type, rightValue, rightChart),
      grossSales: rightMetrics.grossSales,
      orders: rightMetrics.orders,
      averageTicket: rightMetrics.averageTicket,
      growth: rightMetrics.grossSalesTrend,
      purchaseFrequency: rightFreq,
    },
  };
}
