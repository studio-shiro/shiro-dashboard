import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logoutAction } from "@/actions/auth";
import Image from "next/image";
import Button from "@/components/shared/Button";

export default async function SuperadminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  if (user.user_metadata?.role !== "superadmin") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-background-300">
      <header className="border-b border-border-200 bg-background-400">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-shiro-studio.svg"
              width={120}
              height={30}
              alt="Shiro Studio"
            />
            <span className="rounded-md bg-accent px-2 py-0.5 font-body text-xs font-medium text-white">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-body text-xs text-text-400">
              {user.email}
            </span>
            <form action={logoutAction}>
              <Button type="submit" size="xs">
                Cerrar sesión
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
