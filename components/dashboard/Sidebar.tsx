"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { uploadFile, buildStoragePath } from "@/lib/supabase/storage";
import { updateBusinessLogoAction } from "@/actions/business";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Divider } from "@/components/shared/Divider";
import Button from "@/components/shared/Button";
import { LogoUploadModal } from "@/components/dashboard/LogoUploadModal";
import LogoShiroStudio from "@/public/logo-shiro-studio.svg";
import LogoShiroI from "@/public/logo-shiro-i.svg";
import {
  UsersIcon as UsersIconOutline,
  ShoppingCartIcon as ShoppingCartIconOutline,
  ChartBarIcon as ChartBarIconOutline,
  ArchiveBoxIcon as ArchiveBoxIconOutline,
  ChevronLeftIcon,
  ChevronRightIcon,
  BanknotesIcon as BankNotesIconOutline,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";
import {
  UsersIcon as UsersIconSolid,
  ShoppingCartIcon as ShoppingCartIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  ArchiveBoxIcon as ArchiveBoxIconSolid,
  BanknotesIcon as BankNotesIconSolid,
  PencilSquareIcon,
} from "@heroicons/react/24/solid";

const navItems = [
  {
    href: "/sales",
    label: "Operaciones",
    iconOutline: BankNotesIconOutline,
    iconSolid: BankNotesIconSolid,
  },
  {
    href: "/dashboard",
    label: "Dashboard",
    iconOutline: ChartBarIconOutline,
    iconSolid: ChartBarIconSolid,
  },
  {
    href: "/products",
    label: "Productos",
    iconOutline: ShoppingCartIconOutline,
    iconSolid: ShoppingCartIconSolid,
  },
  {
    href: "/customers",
    label: "Proveedores",
    iconOutline: UsersIconOutline,
    iconSolid: UsersIconSolid,
  },
  {
    href: "/brands",
    label: "Marcas",
    iconOutline: ArchiveBoxIconOutline,
    iconSolid: ArchiveBoxIconSolid,
  },
];

const NavItem = ({
  href,
  label,
  iconOutline: IconOutline,
  iconSolid: IconSolid,
  active,
  collapsed,
}: {
  href: string;
  label: string;
  iconOutline: React.ElementType;
  iconSolid: React.ElementType;
  active: boolean;
  collapsed: boolean;
}) => {
  const Icon = active ? IconSolid : IconOutline;

  return (
    <Button
      href={href}
      variant="link"
      className={cn(
        "relative h-11 w-full justify-start gap-2 rounded-none body-lg-regular transition-colors",
        collapsed ? "justify-center px-2" : "pl-4 pr-2.5",
        active
          ? "bg-[rgba(232,73,17,0.15)] font-semibold text-accent"
          : "font-normal text-text-400 hover:bg-[rgba(232,73,17,0.06)] hover:text-text-500",
      )}
    >
      <Icon className="size-5 shrink-0" />
      {!collapsed && <span className="flex-1 truncate leading-5">{label}</span>}
      {active && (
        <span className="absolute right-0 top-1/2 h-5.5 w-1 -translate-y-1/2 rounded-l-sm bg-accent" />
      )}
    </Button>
  );
};

export default function Sidebar({
  logoUrl,
  businessId,
}: {
  logoUrl: string | null;
  businessId: string;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string | null>(logoUrl);
  const [uploading, setUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 3 * 1024 * 1024) return;
    setPendingFile(file);
  }

  async function handleConfirmUpload() {
    if (!pendingFile) return;
    setUploading(true);
    const path = buildStoragePath(
      "businesses",
      businessId,
      businessId,
      pendingFile,
    );
    const url = await uploadFile(pendingFile, "logos", path);
    if (url) {
      setCurrentLogoUrl(url);
      await updateBusinessLogoAction(url);
    }
    setUploading(false);
    setPendingFile(null);
  }

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);

  return (
    <aside
      className={cn(
        "relative flex shrink-0 flex-col rounded-[10px] border border-border-100 bg-background-400 shadow-lg transition-[width] duration-200 ease-in-out",
        collapsed ? "w-24" : "w-56",
      )}
    >
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        aria-label={collapsed ? "Expandir sidebar" : "Contraer sidebar"}
        className="absolute -right-2.5 top-[69px] z-10 flex size-[26px] items-center justify-center rounded-full bg-warning-300 text-white shadow-sm transition-colors hover:bg-warning-400"
      >
        {collapsed ? (
          <ChevronRightIcon className="size-4" />
        ) : (
          <ChevronLeftIcon className="size-4" />
        )}
      </button>

      {/* Logo / upload zone */}
      <div className="flex flex-col items-center gap-2 px-4 pb-3 pt-5">
        {/* Hidden file input — shared by empty state and hover overlay */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />

        {currentLogoUrl ? (
          <div
            className={cn(
              "group relative shrink-0 overflow-hidden rounded-full bg-background-300 transition-[width,height] duration-200 ease-in-out",
              collapsed ? "size-16" : "size-25",
            )}
          >
            <Image
              src={currentLogoUrl}
              alt="Logo del negocio"
              fill
              className="object-contain"
              sizes={collapsed ? "64px" : "100px"}
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-full bg-black/70 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-1 text-white"
                aria-label="Actualizar logo"
              >
                <PencilSquareIcon className={cn("shrink-0", "size-6")} />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Subir logo del negocio"
            className={cn(
              "relative flex shrink-0 flex-col items-center justify-center overflow-hidden rounded-full bg-background-300 transition-[width,height] duration-200 ease-in-out hover:opacity-80",
              collapsed ? "size-16" : "size-25",
            )}
          >
            <ArrowUpTrayIcon
              className={cn(
                "shrink-0 text-text-500",
                collapsed ? "size-5" : "size-6",
              )}
            />
            {!collapsed && (
              <span className="mt-1.5 text-center font-body text-[12px] leading-4 text-text-500">
                Subir logo
              </span>
            )}
          </button>
        )}
      </div>

      {/* Logo upload modal */}
      {pendingFile && (
        <LogoUploadModal
          file={pendingFile}
          uploading={uploading}
          onConfirm={handleConfirmUpload}
          onClose={() => setPendingFile(null)}
          onNewFile={(f) => setPendingFile(f)}
        />
      )}

      <div className="px-3">
        <Divider />
      </div>

      {/* CTA Button */}
      <div className="px-3 py-4.5">
        <Button
          href="/products/new"
          variant="primary"
          size="xs"
          className={cn(
            "h-9 w-full shadow-sm",
            collapsed ? "px-2" : "gap-1.5 px-3",
          )}
        >
          <Plus className={cn("shrink-0", collapsed ? "size-4" : "size-3.5")} />
          {!collapsed && "Agregar Producto"}
        </Button>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 pt-1 pb-3">
        {navItems.map(({ href, label, iconOutline, iconSolid }) => (
          <NavItem
            key={href}
            href={href}
            label={label}
            iconOutline={iconOutline}
            iconSolid={iconSolid}
            active={isActive(href)}
            collapsed={collapsed}
          />
        ))}
      </nav>

      <div className="px-3">
        <Divider />
      </div>

      {/* Settings */}
      {/* <div className="py-3">
        <NavItem
          href="/settings"
          label="Configuración"
          iconOutline={Cog6ToothIconOutline}
          iconSolid={Cog6ToothIconSolid}
          active={pathname === "/settings"}
          collapsed={collapsed}
        />
      </div> */}

      {/* Footer branding */}
      {!collapsed ? (
        <div className="flex flex-col items-center gap-1.5 px-4 pb-3 pt-4">
          <Link href="https://www.shirostudio.co/" target="_blank">
            <LogoShiroStudio aria-label="Shiro Studio" />
          </Link>
        </div>
      ) : (
        <div className="flex justify-center items-center gap-1.5 px-4 pb-3">
          <Link href="https://www.shirostudio.co/" target="_blank">
            <LogoShiroI aria-label="Shiro Studio" />
          </Link>
        </div>
      )}
    </aside>
  );
}
