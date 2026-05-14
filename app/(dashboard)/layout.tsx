import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/dashboard/sidebar";
import Header from "@/components/dashboard/header";
import { type User } from "@supabase/supabase-js";

// AUTH BYPASS — restore before production
// const mockUser = {
//   id: "dev",
//   email: "dev@local",
//   user_metadata: { role: "admin" },
// } as unknown as User;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const user = mockUser;

  // AUTH BYPASS — uncomment below and remove mockUser before production
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="flex h-screen bg-zinc-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header user={user} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
