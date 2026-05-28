import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  StockAlertItem,
  TopProduct,
  DormantProduct,
  SellMetrics,
  CustomersMetrics,
  ChartDataPoint,
  PeriodType,
  PeriodSaleRow,
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
  const tenDaysAgo = Date.now() - 10 * 24 * 60 * 60 * 1000;
  const now = Date.now();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [productsResult, salesResult] = await Promise.all([
    supabase
      .from("products")
      .select(
        "id, reference, name, image_url, created_at, stock!inner(quantity, alert_threshold), product_batches(lot_number, expiration_date)",
      )
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

  type StockRelation =
    | { quantity: number; alert_threshold: number }
    | Array<{ quantity: number; alert_threshold: number }>;
  type BatchRelation = Array<{
    lot_number: string | null;
    expiration_date: string | null;
  }>;

  const resolveStock = (
    rel: StockRelation,
  ): { quantity: number; alertThreshold: number } => {
    const row = Array.isArray(rel) ? rel[0] : rel;
    return {
      quantity: row?.quantity ?? 0,
      alertThreshold: row?.alert_threshold ?? 0,
    };
  };

  const formatDate = (iso: string): string => {
    const d = new Date(iso);
    const day = String(d.getUTCDate()).padStart(2, "0");
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");
    return `${day}/${month}/${d.getUTCFullYear()}`;
  };

  return (productsResult.data ?? [])
    .map((p) => {
      const { quantity: qty, alertThreshold } = resolveStock(
        p.stock as StockRelation,
      );

      const batches = (p.product_batches as BatchRelation) ?? [];

      // Find nearest non-expired batch
      let daysUntilExpiry: number | null = null;
      let expirationDate: string | null = null;
      let referenceLabel = p.reference as string;

      const batchWithExpiry = batches.find((b) => b.expiration_date !== null);
      if (batchWithExpiry) {
        if (batchWithExpiry.lot_number) referenceLabel = batchWithExpiry.lot_number;
      }

      const nonExpiredBatches = batches
        .filter((b) => b.expiration_date !== null)
        .map((b) => {
          const expiry = new Date(b.expiration_date!);
          expiry.setHours(0, 0, 0, 0);
          const days = Math.ceil(
            (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
          );
          return { days, dateIso: b.expiration_date! };
        })
        .filter((b) => b.days >= 0)
        .sort((a, b) => a.days - b.days);

      if (nonExpiredBatches.length > 0) {
        daysUntilExpiry = nonExpiredBatches[0].days;
        expirationDate = formatDate(nonExpiredBatches[0].dateIso);
      }

      const expiryTag: DormantProduct["expiryTag"] =
        daysUntilExpiry !== null
          ? daysUntilExpiry <= 10
            ? "expiring_soon"
            : "apt"
          : null;

      const lastSaleDateRaw = latestSale.get(p.id as string) ?? null;
      const dormantDays = lastSaleDateRaw
        ? Math.floor((now - new Date(lastSaleDateRaw).getTime()) / 86_400_000)
        : 999;

      const lastSaleDate = lastSaleDateRaw ? formatDate(lastSaleDateRaw) : "";

      const tenDaysMs = 10 * 24 * 60 * 60 * 1000;
      const createdAt = new Date(p.created_at as string).getTime();
      const isOlderThan10Days = now - createdAt >= tenDaysMs;

      const isLowStock = qty > 0 && qty <= alertThreshold;
      const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 10;
      const isDormant =
        (lastSaleDateRaw !== null && dormantDays >= 10) ||
        (lastSaleDateRaw === null && isOlderThan10Days);

      if (!isLowStock && !isExpiringSoon && !isDormant) return null;
      if (qty === 0) return null;

      return {
        id: p.id as string,
        name: p.name as string,
        referenceLabel,
        imageUrl: (p.image_url as string | null) ?? null,
        stock: qty,
        expirationDate,
        daysUntilExpiry,
        expiryTag,
        lastSaleDate,
        dormantDays,
      } satisfies DormantProduct;
    })
    .filter((p): p is DormantProduct => p !== null)
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

export async function fetchPeriodSales(
  supabase: SupabaseClient,
  businessId: string,
  startDate: string,
  endDate: string,
): Promise<PeriodSaleRow[]> {
  const { data } = await supabase
    .from("sales")
    .select("product_id, quantity, date, products!inner(name)")
    .eq("business_id", businessId)
    .gte("date", startDate)
    .lt("date", endDate)
    .order("date", { ascending: false });

  const byProduct = new Map<
    string,
    { name: string; quantity: number; lastDate: string }
  >();

  for (const s of data ?? []) {
    const pid = s.product_id as string;
    const existing = byProduct.get(pid);
    if (existing) {
      existing.quantity += s.quantity as number;
    } else {
      byProduct.set(pid, {
        name: (s.products as unknown as { name: string }).name,
        quantity: s.quantity as number,
        lastDate: s.date as string,
      });
    }
  }

  return Array.from(byProduct.entries()).map(([productId, p]) => {
    const d = new Date(p.lastDate);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return {
      productId,
      productName: p.name,
      quantity: p.quantity,
      lastSaleDate: `${day}/${month}/${year}`,
      lastSaleTime: `${hours}:${minutes}`,
    };
  });
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
    .select("date")
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

    buckets.set(bucket, (buckets.get(bucket) ?? 0) + 1);
  }

  return Array.from(buckets.entries()).map(([x, sales]) => ({ x, sales }));
}
