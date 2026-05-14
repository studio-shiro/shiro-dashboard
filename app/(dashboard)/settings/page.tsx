import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.user_metadata?.role !== "admin") redirect("/dashboard");

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-zinc-900">Settings</h1>
      <p className="text-sm text-zinc-500">Business settings coming soon.</p>
    </div>
  );
}
