import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/Header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: business } = await supabase
    .from("businesses")
    .select("logo_url")
    .eq("id", user.user_metadata.business_id)
    .single();

  return (
    <div className="flex h-screen gap-5 bg-background-400 pt-3 pl-3.5 pr-5 pb-7.5">
      <Sidebar
        logoUrl={business?.logo_url ?? null}
        businessId={user.user_metadata.business_id as string}
      />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <TopBar user={user} />
        <main className="flex-1 overflow-y-auto px-6 pb-8">{children}</main>
      </div>
    </div>
  );
}
