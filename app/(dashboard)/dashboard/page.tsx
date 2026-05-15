import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { PeriodFilter } from "@/components/dashboard/PeriodFilter";
import { StockAlertChart } from "@/components/dashboard/StockAlertChart";
import { TopProductsChart } from "@/components/dashboard/TopProductsChart";
import { PerformanceSection } from "@/components/dashboard/PerformanceSection";
import { SellSection } from "@/components/dashboard/SellSection";
import { CustomersSection } from "@/components/dashboard/CustomersSection";
import { DormantProductsTable } from "@/components/dashboard/DormantProductsTable";
import { PeriodComparisonSection } from "@/components/dashboard/PeriodComparisonSection";
import { createClient } from "@/lib/supabase/server";
import {
  fetchStockAlerts,
  fetchDormantProducts,
  fetchTopProducts,
} from "@/lib/dashboard/queries";
import {
  SALES_METRICS,
  CUSTOMERS_METRICS,
  PERFORMANCE_METRICS,
} from "@/lib/dashboard/period";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const businessId = user?.user_metadata?.business_id as string;

  const today = new Date();
  const startOfMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    1,
  ).toISOString();

  const [
    salesResult,
    lowStockResult,
    stockAlerts,
    dormantProducts,
    topProducts,
  ] = await Promise.all([
    supabase
      .from("sales")
      .select("total")
      .eq("business_id", businessId)
      .gte("date", startOfMonth),
    supabase
      .from("stock")
      .select("id", { count: "exact", head: true })
      .eq("business_id", businessId)
      .filter("quantity", "lte", "alert_threshold"),
    fetchStockAlerts(supabase, businessId),
    fetchDormantProducts(supabase, businessId),
    fetchTopProducts(supabase, businessId, startOfMonth),
  ]);

  const monthlyRevenue = (salesResult.data ?? []).reduce(
    (sum, s) => sum + ((s.total as number) ?? 0),
    0,
  );
  const lowStockCount = lowStockResult.count ?? 0;

  const now = new Date();
  const lastUpdated = now.toLocaleString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-body text-[28px] font-bold leading-none text-text-500">
            Dashboard
          </h1>
          <p className="font-body text-sm leading-5 text-text-400">
            Podés hacer seguimiento de tus ventas, saldo en cuenta y otras
            métricas clave.
          </p>
        </div>
        <PeriodFilter />
      </div>

      {/* Balance card — static, not affected by period filter */}
      <BalanceCard
        title="Saldo en Cuenta"
        subtitle="Total acumulado en el período seleccionado."
        lastUpdated={`Última actualización el ${lastUpdated}`}
        value={`$${monthlyRevenue.toLocaleString("es-AR", { minimumFractionDigits: 0 })}`}
        trend={1.23}
        trendLabel="1.23%"
      />

      {/* Sales section — period-aware */}
      <SellSection metricsRecord={SALES_METRICS} />

      {/* Customers section — period-aware, lowStockCount is static */}
      <CustomersSection
        metricsRecord={CUSTOMERS_METRICS}
        lowStockCount={lowStockCount}
      />

      {/* Stock alert + Top products */}
      <div className="grid grid-cols-2 gap-6">
        <StockAlertChart data={stockAlerts} />
        <TopProductsChart data={topProducts} />
      </div>

      {/* Rendimiento Comercial */}
      <PerformanceSection metricsRecord={PERFORMANCE_METRICS} />

      {/* Tabla de productos sin movimiento */}
      <DormantProductsTable data={dormantProducts} />

      {/* Comparativa de Períodos */}
      <PeriodComparisonSection metricsRecord={PERFORMANCE_METRICS} />
    </div>
  );
}
