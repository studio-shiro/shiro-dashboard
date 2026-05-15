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

  return (
    <div className="flex h-screen gap-6 bg-background-300 p-3">
      <Sidebar />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-sm border border-border-100 bg-background-400 shadow-[0px_12px_16px_-4px_rgba(112,113,116,0.1),0px_4px_6px_-2px_rgba(112,113,116,0.05)]">
        <TopBar user={user} />
        <main className="flex-1 overflow-y-auto px-6 pb-8">{children}</main>
      </div>
    </div>
  );
}
