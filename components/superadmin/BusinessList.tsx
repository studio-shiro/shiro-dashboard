import { Building2, Users } from "lucide-react";
import type { BusinessWithMembers } from "@/types/superadmin";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface Props {
  businesses: BusinessWithMembers[];
}

export default function BusinessList({ businesses }: Props) {
  if (businesses.length === 0) {
    return (
      <div className="rounded-xl border border-border-200 bg-background-400 px-6 py-12 text-center">
        <Building2 className="mx-auto mb-3 size-8 text-text-300" />
        <p className="body-md-regular text-text-400">
          Todavía no hay negocios registrados.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {businesses.map((business) => {
        const owner = business.business_members.find(
          (m) => m.role === "owner" && m.status === "active",
        );
        const pendingOwner = business.business_members.find(
          (m) => m.role === "owner" && m.status === "pending",
        );
        const activeCount = business.business_members.filter(
          (m) => m.status === "active",
        ).length;
        const pendingCount = business.business_members.filter(
          (m) => m.status === "pending",
        ).length;

        return (
          <div
            key={business.id}
            className="rounded-xl border border-border-200 bg-background-400 px-6 py-4"
          >
            <div className="flex items-start justify-between gap-4">
              {/* Left: business info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="body-md-semibold text-text-500">
                    {business.name}
                  </h3>
                  <span className="rounded-md bg-background-300 px-2 py-0.5 body-sm-regular text-text-400">
                    {business.currency}
                  </span>
                </div>

                {/* Owner */}
                <div className="mt-1">
                  {owner ? (
                    <p className="body-sm-regular text-text-400">
                      <span className="text-text-300">Dueño:</span>{" "}
                      {owner.full_name ? `${owner.full_name} — ` : ""}
                      {owner.email}
                    </p>
                  ) : pendingOwner ? (
                    <p className="body-sm-regular text-warning-400">
                      Invitación pendiente — {pendingOwner.email}
                    </p>
                  ) : (
                    <p className="body-sm-regular text-danger-300">
                      Sin dueño asignado
                    </p>
                  )}
                </div>
              </div>

              {/* Right: stats + date */}
              <div className="flex shrink-0 items-center gap-4">
                <div className="flex items-center gap-1.5 text-text-400">
                  <Users className="size-3.5" />
                  <span className="body-sm-regular">
                    {activeCount} activo{activeCount !== 1 ? "s" : ""}
                    {pendingCount > 0 && (
                      <span className="ml-1 text-warning-400">
                        · {pendingCount} pendiente
                        {pendingCount !== 1 ? "s" : ""}
                      </span>
                    )}
                  </span>
                </div>

                <span className="body-sm-regular text-text-300">
                  {formatDate(business.created_at)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
