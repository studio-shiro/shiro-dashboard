import { createClient } from "@/lib/supabase/server";
import { TrendingUp, ShoppingCart, Users, AlertTriangle } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const businessId = user?.user_metadata?.business_id;

  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();

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
    0
  );
  const newCustomers = customersResult.count ?? 0;
  const lowStockCount = lowStockResult.count ?? 0;
  const totalSales = salesResult.data?.length ?? 0;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-zinc-900">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Monthly Revenue"
          value={`$${monthlyRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          icon={<TrendingUp className="h-5 w-5 text-zinc-500" />}
        />
        <StatCard
          title="Sales this month"
          value={String(totalSales)}
          icon={<ShoppingCart className="h-5 w-5 text-zinc-500" />}
        />
        <StatCard
          title="New customers"
          value={String(newCustomers)}
          icon={<Users className="h-5 w-5 text-zinc-500" />}
        />
        <StatCard
          title="Low stock alerts"
          value={String(lowStockCount)}
          icon={<AlertTriangle className="h-5 w-5 text-amber-500" />}
          alert={lowStockCount > 0}
        />
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  alert = false,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  alert?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border bg-white p-5 ${
        alert ? "border-amber-200" : "border-zinc-200"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-zinc-500">{title}</span>
        {icon}
      </div>
      <p className="text-2xl font-semibold text-zinc-900">{value}</p>
    </div>
  );
}
