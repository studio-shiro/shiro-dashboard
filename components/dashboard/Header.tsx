"use client";
import { useState, useTransition } from "react";
// import { Bell, ChevronDown, User, LogOut } from "lucide-react";
import {
  BellAlertIcon,
  ChevronDownIcon,
  UserIcon,
  ArrowLeftStartOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/actions/auth";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const PAGE_LABELS: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/products": "Productos",
  "/stock": "Stock",
  "/sales": "Ventas",
  "/customers": "Clientes",
  "/brands": "Marcas",
  "/categories": "Categorías",
  "/settings": "Configuración",
};

function getBreadcrumb(pathname: string): string {
  const match = Object.entries(PAGE_LABELS).find(
    ([key]) => pathname === key || pathname.startsWith(key + "/"),
  );
  return match?.[1] ?? "Dashboard";
}

interface TopBarProps {
  user: SupabaseUser;
}

export default function TopBar({ user: supabaseUser }: TopBarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const breadcrumb = getBreadcrumb(pathname);
  const displayName =
    supabaseUser.user_metadata?.name ?? supabaseUser.email ?? "Usuario";
  const roleLabels: Record<string, string> = {
    superadmin: "Super Admin",
    owner: "Dueño",
    operator: "Operador",
  };
  const role = roleLabels[supabaseUser.user_metadata?.role] ?? "Operador";

  function handleLogout() {
    startTransition(() => logoutAction());
  }

  return (
    <div className="flex shrink-0 items-center justify-between px-6 pb-9 pt-5">
      {/* Breadcrumb */}
      <span className="body-lg-regular text-text-400">{breadcrumb}</span>

      {/* Right section */}
      <div className="flex items-center gap-4">
        {/* Notification bell */}
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-full text-text-400 transition-colors hover:bg-background-300 hover:text-text-500"
          aria-label="Notificaciones"
        >
          <BellAlertIcon className="size-6" />
        </button>

        {/* User dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2.5"
          >
            <div className="flex size-[34px] shrink-0 items-center justify-center rounded-full border border-accent-selected bg-background-300">
              <UserIcon className="size-5 text-text-400" />
            </div>
            <div className="flex w-28 flex-col items-start overflow-hidden">
              <span className="w-full truncate body-md-semibold text-text-500">
                {displayName}
              </span>
              <span className="w-full truncate body-sm-regular text-text-400">
                {role}
              </span>
            </div>
            <ChevronDownIcon className="size-[15px] text-text-400" />
          </button>

          {open && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setOpen(false)}
              />
              <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-lg border border-border-200 bg-background-400 shadow-md">
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={pending}
                  className="flex w-full items-center gap-2 px-4 py-2.5 body-md-regular text-text-400 transition-colors hover:bg-background-300 hover:text-text-500 disabled:opacity-50"
                >
                  <ArrowLeftStartOnRectangleIcon className="size-4" />
                  Cerrar sesión
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
