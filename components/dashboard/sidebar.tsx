"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import logoShiroStudio from "@/public/logo-shiro-studio.svg";

import {
  UsersIcon as UsersIconOutline,
  ShoppingCartIcon as ShoppingCartIconOutline,
  ChartBarIcon as ChartBarIconOutline,
  ArchiveBoxIcon as ArchiveBoxIconOutline,
  TagIcon as TagIconOutline,
  Squares2X2Icon as Squares2X2IconOutline,
  Cog6ToothIcon as Cog6ToothIconOutline,
  CubeIcon as CubeIconOutline,
} from "@heroicons/react/24/outline";
import {
  UsersIcon as UsersIconSolid,
  ShoppingCartIcon as ShoppingCartIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  ArchiveBoxIcon as ArchiveBoxIconSolid,
  TagIcon as TagIconSolid,
  Squares2X2Icon as Squares2X2IconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid,
  CubeIcon as CubeIconSolid,
} from "@heroicons/react/24/solid";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    iconOutline: ChartBarIconOutline,
    iconSolid: ChartBarIconSolid,
  },
  {
    href: "/products",
    label: "Productos",
    iconOutline: CubeIconOutline,
    iconSolid: CubeIconSolid,
  },
  {
    href: "/stock",
    label: "Stock",
    iconOutline: ArchiveBoxIconOutline,
    iconSolid: ArchiveBoxIconSolid,
  },
  {
    href: "/sales",
    label: "Ventas",
    iconOutline: ShoppingCartIconOutline,
    iconSolid: ShoppingCartIconSolid,
  },
  {
    href: "/customers",
    label: "Clientes",
    iconOutline: UsersIconOutline,
    iconSolid: UsersIconSolid,
  },
  {
    href: "/brands",
    label: "Marcas",
    iconOutline: TagIconOutline,
    iconSolid: TagIconSolid,
  },
  {
    href: "/categories",
    label: "Categorías",
    iconOutline: Squares2X2IconOutline,
    iconSolid: Squares2X2IconSolid,
  },
];

// TODO: Actualizar imagen de negocio (deberia ser una img que este subida a la DB asociada al cliente para que tome esa como referencia segun cada instancia de cliente)

const NavItem = ({
  href,
  label,
  iconOutline: IconOutline,
  iconSolid: IconSolid,
  active,
}: {
  href: string;
  label: string;
  iconOutline: React.ElementType;
  iconSolid: React.ElementType;
  active: boolean;
}) => {
  const Icon = active ? IconSolid : IconOutline;

  return (
    <Link
      href={href}
      className={cn(
        "relative flex h-10 w-full items-center gap-2 pl-4 pr-2.5 body-lg-regular transition-colors",
        active
          ? "bg-[rgba(232,73,17,0.15)] font-semibold text-accent"
          : "font-normal text-text-400 hover:bg-[rgba(232,73,17,0.06)] hover:text-text-500",
      )}
    >
      <Icon className="size-5 shrink-0" />
      <span className="flex-1 truncate leading-5">{label}</span>
      {active && (
        <span className="absolute right-0 top-1/2 h-[22px] w-1 -translate-y-1/2 rounded-l-sm bg-accent" />
      )}
    </Link>
  );
};

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);

  return (
    <aside className="flex w-56 shrink-0 flex-col overflow-hidden rounded-sm border border-border-100 bg-background-400 shadow-[0px_12px_16px_-4px_rgba(112,113,116,0.1),0px_4px_6px_-2px_rgba(112,113,116,0.05)]">
      {/* Logo */}
      <div className="flex flex-col items-center gap-2 px-4 pb-3 pt-5">
        <div className="flex size-25 items-center justify-center rounded-full bg-background-300">
          <span className="font-display text-2xl font-bold text-text-500">
            SS
          </span>
        </div>
      </div>

      {/* CTA Button */}
      <div className="px-3 pb-0 pt-0">
        <Link
          href="/products/new"
          className="flex h-9 w-full items-center justify-center gap-1.5 rounded-md bg-accent px-3 body-sm-semibold text-text-100 shadow-[0px_1px_3px_0px_rgba(112,113,116,0.1),0px_1px_2px_0px_rgba(112,113,116,0.06)] transition-colors hover:bg-accent-hover active:bg-accent-selected"
        >
          <Plus className="size-3.5 shrink-0" />
          Agregar Producto
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 py-3">
        {navItems.map(({ href, label, iconOutline, iconSolid }) => (
          <NavItem
            key={href}
            href={href}
            label={label}
            iconOutline={iconOutline}
            iconSolid={iconSolid}
            active={isActive(href)}
          />
        ))}
      </nav>

      {/* Settings */}
      <div className="border-t border-border-200 py-3">
        <NavItem
          href="/settings"
          label="Configuración"
          iconOutline={Cog6ToothIconOutline}
          iconSolid={Cog6ToothIconSolid}
          active={pathname === "/settings"}
        />
      </div>

      {/* Footer branding */}
      <div className="flex flex-col items-center gap-1.5 px-4 pb-3 pt-1">
        <Link href="https://www.shirostudio.co/" target="_blank">
          <Image
            src={logoShiroStudio}
            alt="Shiro Studio"
            width={90}
            height={25}
          />
        </Link>
        <p className="text-center font-body text-[10px] leading-3 text-text-400">
          By Shiro Studio © All rights reserved
        </p>
      </div>
    </aside>
  );
}
