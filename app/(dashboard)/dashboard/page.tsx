import { createClient } from "@/lib/supabase/server";
import { BalanceCard, InsightCard } from "@/components/dashboard/balanceCard";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const businessId = user?.user_metadata?.business_id;

  const today = new Date();
  const startOfMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    1,
  ).toISOString();

  const [salesResult, customersResult, lowStockResult] = await Promise.all([
    supabase
      .from("sales")
      .select("total")
      .eq("business_id", businessId)
      .gte("date", startOfMonth),
    supabase
      .from("customers")
      .select("id", { count: "exact", head: true })
      .eq("business_id", businessId)
      .gte("created_at", startOfMonth),
    supabase
      .from("stock")
      .select("id", { count: "exact", head: true })
      .eq("business_id", businessId)
      .filter("quantity", "lte", "alert_threshold"),
  ]);

  const monthlyRevenue = (salesResult.data ?? []).reduce(
    (sum, s) => sum + (s.total ?? 0),
    0,
  );
  const newCustomers = customersResult.count ?? 0;
  const lowStockCount = lowStockResult.count ?? 0;
  const totalSales = salesResult.data?.length ?? 0;

  const displayName = user?.user_metadata?.name ?? "Usuario";

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
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-body text-[28px] font-bold leading-none text-text-500">
            Bienvenido, {displayName}
          </h1>
          <p className="font-body text-sm leading-5 text-text-400">
            Aquí tenés un resumen de la actividad del negocio.
          </p>
        </div>
      </div>

      {/* Balance card */}
      <BalanceCard
        title="Saldo en Cuenta"
        subtitle="Total acumulado en el período seleccionado."
        lastUpdated={`Última actualización el ${lastUpdated}`}
        value={`$${monthlyRevenue.toLocaleString("es-AR", { minimumFractionDigits: 0 })}`}
        trend={1.23}
        trendLabel="1.23%"
      />

      {/* Sales section */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="font-body text-2xl font-bold leading-none text-text-500">
            Ventas
          </h2>
          <p className="font-body text-[10px] leading-3 text-text-400">
            Última actualización el {lastUpdated}
          </p>
        </div>

        {/* Row 1 */}
        <div className="flex gap-3">
          <InsightCard
            label="Ventas Brutas"
            value={`$${monthlyRevenue.toLocaleString("es-AR")}`}
            trend={5.23}
            trendLabel="5.23%"
          />
          <InsightCard
            label="Ventas Netas"
            value={`$${Math.round(monthlyRevenue * 0.85).toLocaleString("es-AR")}`}
            trend={5.23}
            trendLabel="5.23%"
          />
        </div>

        {/* Row 2 */}
        <div className="flex gap-3">
          <InsightCard
            label="Pedidos"
            value={String(totalSales)}
            unit="pedidos"
            trend={5.23}
            trendLabel="5.23%"
          />
          <InsightCard
            label="Unidades Vendidas"
            value={String(totalSales * 4)}
            unit="unidades"
            trend={-5.23}
            trendLabel="5.23%"
          />
          <InsightCard
            label="Ticket Promedio"
            value={
              totalSales > 0
                ? `$${Math.round(monthlyRevenue / totalSales).toLocaleString("es-AR")}`
                : "$0"
            }
            trend={-5.23}
            trendLabel="5.23%"
          />
        </div>
      </div>

      {/* Customers section */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="font-body text-2xl font-bold leading-none text-text-500">
            Clientes
          </h2>
          <p className="font-body text-[10px] leading-3 text-text-400">
            Última actualización el {lastUpdated}
          </p>
        </div>
        <div className="flex gap-3">
          <InsightCard
            label="Nuevos Clientes"
            value={String(newCustomers)}
            unit="clientes"
            trend={newCustomers > 0 ? 2.5 : undefined}
            trendLabel="2.5%"
          />
          <InsightCard
            label="Stock Bajo"
            value={String(lowStockCount)}
            unit="productos"
            trend={lowStockCount > 0 ? -lowStockCount : undefined}
            trendLabel={`${lowStockCount}`}
          />
        </div>
      </div>
    </div>
  );
}
