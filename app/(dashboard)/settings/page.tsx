import { createClient } from "@/lib/supabase/server";
import type { BusinessMember } from "@/types/team";
import TeamSection from "@/components/settings/TeamSection";
import ChangePasswordSection from "@/components/settings/ChangePasswordSection";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const role = user?.user_metadata?.role as string | undefined;
  const isOwner = role === "owner" || role === "superadmin";

  let members: BusinessMember[] = [];
  if (isOwner) {
    const { data } = await supabase
      .from("business_members")
      .select("*")
      .order("invited_at", { ascending: false });
    members = (data as BusinessMember[]) ?? [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-body text-xl font-semibold text-text-500">
          Configuración
        </h1>
        <p className="mt-1 body-md-regular text-text-400">
          Gestioná tu equipo y la seguridad de tu cuenta
        </p>
      </div>

      {isOwner && (
        <TeamSection members={members} currentUserId={user?.id ?? ""} />
      )}

      <ChangePasswordSection />
    </div>
  );
}
