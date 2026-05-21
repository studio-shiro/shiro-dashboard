import { createAdminClient } from "@/lib/supabase/admin";
import type { BusinessWithMembers } from "@/types/superadmin";
import BusinessList from "@/components/superadmin/BusinessList";
import CreateBusinessForm from "@/components/superadmin/CreateBusinessForm";

export default async function SuperadminPage() {
  const admin = createAdminClient();

  const { data } = await admin
    .from("businesses")
    .select(
      `
      id, name, currency, contact_email, contact_phone, logo_url,
      created_at, updated_at,
      business_members(id, email, full_name, role, status)
    `,
    )
    .order("created_at", { ascending: false });

  const businesses = (data as BusinessWithMembers[]) ?? [];

  const totalActive = businesses.reduce(
    (sum, b) =>
      sum + b.business_members.filter((m) => m.status === "active").length,
    0,
  );

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="font-display text-2xl font-semibold text-text-500">
          Panel de administración
        </h1>
        <p className="mt-1 body-md-regular text-text-400">
          Gestioná los negocios y sus accesos
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Negocios" value={businesses.length} />
        <StatCard label="Usuarios activos" value={totalActive} />
        <StatCard
          label="Invitaciones pendientes"
          value={businesses.reduce(
            (sum, b) =>
              sum +
              b.business_members.filter((m) => m.status === "pending").length,
            0,
          )}
        />
      </div>

      {/* Create form */}
      <section className="space-y-3">
        <h2 className="body-md-semibold text-text-500">
          Crear negocio
        </h2>
        <CreateBusinessForm />
      </section>

      {/* Business list */}
      <section className="space-y-3">
        <h2 className="body-md-semibold text-text-500">
          Negocios registrados{" "}
          <span className="font-normal text-text-400">
            ({businesses.length})
          </span>
        </h2>
        <BusinessList businesses={businesses} />
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border-200 bg-background-400 px-5 py-4">
      <p className="body-sm-regular text-text-400">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold text-text-500">
        {value}
      </p>
    </div>
  );
}
