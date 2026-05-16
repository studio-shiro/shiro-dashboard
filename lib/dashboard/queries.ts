import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  StockAlertItem,
  TopProduct,
  DormantProduct,
  SellMetrics,
  CustomersMetrics,
  ChartDataPoint,
  PeriodType,
} from "@/types/dashboard";

const TOP_PRODUCT_COLORS = [
  "#3446a5",
  "#4963ea",
  "#cd2b31",
  "#ff9900",
  "#ff9c7a",
];

// ─── Trend helper ─────────────────────────────────────────────────────────────

function calcTrend(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

// ─── Period-independent queries ───────────────────────────────────────────────

export async function fetchStockAlerts(
  supabase: SupabaseClient,
  businessId: string,
): Promise<StockAlertItem[]> {
  const { data } = await supabase
    .from("stock")
    .select("quantity, alert_threshold, products!inner(name)")
    .eq("business_id", businessId);

  return (data ?? [])
    .filter((s) => (s.quantity as number) <= (s.alert_threshold as number))
    .map((s) => ({
      name: (s.products as unknown as { name: string }).name,
      quantity: s.quantity as number,
      threshold: s.alert_threshold as number,
    }));
}

export async function fetchDormantProducts(
  supabase: SupabaseClient,
  businessId: string,
): Promise<DormantProduct[]> {
  const sixMonthsAgo = new Date(
    Date.now() - 6 * 30 * 24 * 60 * 60 * 1000,
  ).toISOString();
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const now = Date.now();

  const [productsResult, salesResult] = await Promise.all([
    supabase
      .from("products")
      .select("id, reference, name, categories(name), stock!inner(quantity)")
      .eq("business_id", businessId)
      .eq("active", true),
    supabase
      .from("sales")
      .select("product_id, date")
      .eq("business_id", businessId)
      .gte("date", sixMonthsAgo)
      .order("date", { ascending: false }),
  ]);

  const latestSale = new Map<string, string>();
  for (const s of salesResult.data ?? []) {
    if (!latestSale.has(s.product_id as string)) {
      latestSale.set(s.product_id as string, s.date as string);
    }
  }

  type StockRelation = { quantity: number } | Array<{ quantity: number }>;
  type CategoryRelation = { name: string } | Array<{ name: string }> | null;

  const resolveStock = (rel: StockRelation): number => {
    if (Array.isArray(rel)) return rel[0]?.quantity ?? 0;
    return rel.quantity;
  };
  const resolveCategory = (rel: CategoryRelation): string => {
    if (!rel) return "Sin categoría";
    if (Array.isArray(rel)) return rel[0]?.name ?? "Sin categoría";
    return rel.name;
  };

  return (productsResult.data ?? [])
    .filter((p) => {
      const qty = resolveStock(p.stock as StockRelation);
      if (qty === 0) return false;
      const lastSaleDate = latestSale.get(p.id as string);
      if (!lastSaleDate) return true;
      return new Date(lastSaleDate).getTime() < thirtyDaysAgo;
    })
    .map((p) => {
      const lastSaleDate = latestSale.get(p.id as string) ?? null;
      return {
        id: p.id as string,
        reference: p.reference as string,
        name: p.name as string,
        category: resolveCategory(p.categories as CategoryRelation),
        lastSaleDate: lastSaleDate ? lastSaleDate.slice(0, 10) : "",
        stock: resolveStock(p.stock as StockRelation),
        dormantDays: lastSaleDate
          ? Math.floor((now - new Date(lastSaleDate).getTime()) / 86_400_000)
          : 999,
      };
    })
    .sort((a, b) => a.dormantDays - b.dormantDays);
}

// ─── Period-aware queries ─────────────────────────────────────────────────────

export async function fetchTopProducts(
  supabase: SupabaseClient,
  businessId: string,
  startDate: string,
): Promise<TopProduct[]> {
  const { data } = await supabase
    .from("sales")
    .select("product_id, quantity, products!inner(name)")
    .eq("business_id", businessId)
    .gte("date", startDate);

  const unitsByProduct = new Map<string, { name: string; units: number }>();
  for (const s of data ?? []) {
    const productName = (s.products as unknown as { name: string }).name;
    const productId = s.product_id as string;
    const existing = unitsByProduct.get(productId);
    if (existing) {
      existing.units += s.quantity as number;
    } else {
      unitsByProduct.set(productId, {
        name: productName,
        units: s.quantity as number,
      });
    }
  }

  const top5 = [...unitsByProduct.values()]
    .sort((a, b) => b.units - a.units)
    .slice(0, 5);

  const totalUnits = top5.reduce((sum, p) => sum + p.units, 0);

  return top5.map((p, i) => ({
    name: p.name,
    value: totalUnits > 0 ? Math.round((p.units / totalUnits) * 100) : 0,
    color: TOP_PRODUCT_COLORS[i] ?? "#aaaaaa",
    units: p.units,
  }));
}

export async function fetchSalesMetrics(
  supabase: SupabaseClient,
  businessId: string,
  startDate: string,
  endDate: string,
  prevStartDate: string,
  prevEndDate: string,
): Promise<SellMetrics> {
  const [currentResult, prevResult] = await Promise.all([
    supabase
      .from("sales")
      .select("total, quantity")
      .eq("business_id", businessId)
      .gte("date", startDate)
      .lt("date", endDate),
    supabase
      .from("sales")
      .select("total, quantity")
      .eq("business_id", businessId)
      .gte("date", prevStartDate)
      .lt("date", prevEndDate),
  ]);

  const current = currentResult.data ?? [];
  const prev = prevResult.data ?? [];

  const grossSales = current.reduce((sum, s) => sum + (s.total as number), 0);
  const orders = current.length;
  const units = current.reduce((sum, s) => sum + (s.quantity as number), 0);
  const averageTicket = orders > 0 ? grossSales / orders : 0;

  const prevGrossSales = prev.reduce((sum, s) => sum + (s.total as number), 0);
  const prevOrders = prev.length;
  const prevUnits = prev.reduce((sum, s) => sum + (s.quantity as number), 0);
  const prevAverageTicket = prevOrders > 0 ? prevGrossSales / prevOrders : 0;

  return {
    grossSales,
    grossSalesTrend: calcTrend(grossSales, prevGrossSales),
    netSales: grossSales,
    netSalesTrend: calcTrend(grossSales, prevGrossSales),
    orders,
    ordersTrend: calcTrend(orders, prevOrders),
    units,
    unitsTrend: calcTrend(units, prevUnits),
    averageTicket,
    averageTicketTrend: calcTrend(averageTicket, prevAverageTicket),
  };
}

export async function fetchCustomersMetrics(
  supabase: SupabaseClient,
  businessId: string,
  startDate: string,
  endDate: string,
  prevStartDate: string,
  prevEndDate: string,
): Promise<CustomersMetrics> {
  const [currentResult, prevResult] = await Promise.all([
    supabase
      .from("customers")
      .select("id", { count: "exact", head: true })
      .eq("business_id", businessId)
      .gte("created_at", startDate)
      .lt("created_at", endDate),
    supabase
      .from("customers")
      .select("id", { count: "exact", head: true })
      .eq("business_id", businessId)
      .gte("created_at", prevStartDate)
      .lt("created_at", prevEndDate),
  ]);

  const newCustomers = currentResult.count ?? 0;
  const prevCustomers = prevResult.count ?? 0;

  return {
    newCustomers,
    newCustomersTrend: calcTrend(newCustomers, prevCustomers),
  };
}

function calcFrequency(rows: { customer_id: string | null }[]): number | null {
  const identified = rows.filter((r) => r.customer_id !== null);
  if (identified.length === 0) return null;
  const uniqueCustomers = new Set(identified.map((r) => r.customer_id)).size;
  return uniqueCustomers > 0 ? identified.length / uniqueCustomers : null;
}

export async function fetchPurchaseFrequency(
  supabase: SupabaseClient,
  businessId: string,
  startDate: string,
  endDate: string,
  prevStartDate: string,
  prevEndDate: string,
): Promise<number | null> {
  const [currentResult, prevResult] = await Promise.all([
    supabase
      .from("sales")
      .select("customer_id")
      .eq("business_id", businessId)
      .gte("date", startDate)
      .lt("date", endDate),
    supabase
      .from("sales")
      .select("customer_id")
      .eq("business_id", businessId)
      .gte("date", prevStartDate)
      .lt("date", prevEndDate),
  ]);

  const current = calcFrequency(currentResult.data ?? []);
  const prev = calcFrequency(prevResult.data ?? []);

  return calcTrend(current ?? 0, prev ?? 0);
}

export async function fetchChartData(
  supabase: SupabaseClient,
  businessId: string,
  startDate: string,
  endDate: string,
  periodType: PeriodType,
): Promise<ChartDataPoint[]> {
  const { data } = await supabase
    .from("sales")
    .select("date, total")
    .eq("business_id", businessId)
    .gte("date", startDate)
    .lt("date", endDate);

  const buckets = new Map<number, number>();

  for (const sale of data ?? []) {
    const d = new Date(sale.date as string);
    let bucket: number;

    switch (periodType) {
      case "today":
        bucket = d.getUTCHours();
        break;
      case "week":
        // 0 = Monday … 6 = Sunday
        bucket = (d.getUTCDay() + 6) % 7;
        break;
      case "month":
        bucket = d.getUTCDate();
        break;
      case "year":
        bucket = d.getUTCMonth();
        break;
    }

    buckets.set(bucket, (buckets.get(bucket) ?? 0) + (sale.total as number));
  }

  return Array.from(buckets.entries()).map(([x, sales]) => ({ x, sales }));
}
