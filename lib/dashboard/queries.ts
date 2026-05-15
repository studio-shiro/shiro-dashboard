import type { SupabaseClient } from "@supabase/supabase-js";
import type { StockAlertItem, TopProduct } from "@/types/dashboard";
import type { DormantProduct } from "@/lib/dashboard/dormantProducts";

const TOP_PRODUCT_COLORS = [
  "#3446a5",
  "#4963ea",
  "#cd2b31",
  "#ff9900",
  "#ff9c7a",
];

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

  // Most recent sale date per product
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

export async function fetchTopProducts(
  supabase: SupabaseClient,
  businessId: string,
  startOfMonth: string,
): Promise<TopProduct[]> {
  const { data } = await supabase
    .from("sales")
    .select("product_id, quantity, products!inner(name)")
    .eq("business_id", businessId)
    .gte("date", startOfMonth);

  const unitsByProduct = new Map<string, { name: string; units: number }>();
  for (const s of data ?? []) {
    const productName = (s.products as unknown as { name: string }).name;
    const productId = s.product_id as string;
    const existing = unitsByProduct.get(productId);
    if (existing) {
      existing.units += s.quantity as number;
    } else {
      unitsByProduct.set(productId, { name: productName, units: s.quantity as number });
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
