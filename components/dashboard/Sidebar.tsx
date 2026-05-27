"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Divider } from "@/components/shared/Divider";
import Button from "@/components/shared/Button";
import logoShiroStudio from "@/public/logo-shiro-studio.svg";
import logoShiroI from "@/public/logo-shiro-i.svg";

import {
  UsersIcon as UsersIconOutline,
  ShoppingCartIcon as ShoppingCartIconOutline,
  ChartBarIcon as ChartBarIconOutline,
  ArchiveBoxIcon as ArchiveBoxIconOutline,
  TagIcon as TagIconOutline,
  Squares2X2Icon as Squares2X2IconOutline,
  Cog6ToothIcon as Cog6ToothIconOutline,
  CubeIcon as CubeIconOutline,
  ChevronLeftIcon,
  ChevronRightIcon,
  BanknotesIcon as BankNotesIconOutline,
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
  BanknotesIcon as BankNotesIconSolid,
} from "@heroicons/react/24/solid";

const navItems = [
  // {
  //   href: "/stock",
  //   label: "Stock",
  //   iconOutline: ArchiveBoxIconOutline,
  //   iconSolid: ArchiveBoxIconSolid,
  // },
  {
    href: "/sales",
    label: "Operaciones",
    iconOutline: BankNotesIconOutline,
    // iconOutline: ShoppingCartIconOutline
    iconSolid: BankNotesIconSolid,
    // iconSolid: ShoppingCartIconSolid,
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
    // iconOutline: CubeIconOutline,
    // iconSolid: CubeIconSolid,
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
    // iconOutline: TagIconOutline,
    // iconSolid: TagIconSolid,
  },
  // {
  //   href: "/customers",
  //   label: "Clientes",
  //   iconOutline: UsersIconOutline,
  //   iconSolid: UsersIconSolid,
  // },
  // {
  //   href: "/categories",
  //   label: "Categorías",
  //   iconOutline: Squares2X2IconOutline,
  //   iconSolid: Squares2X2IconSolid,
  // },
];

// TODO: Actualizar imagen de negocio (deberia ser una img que este subida a la DB asociada al cliente para que tome esa como referencia segun cada instancia de cliente)

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
        <span className="absolute right-0 top-1/2 h-[22px] w-1 -translate-y-1/2 rounded-l-sm bg-accent" />
      )}
    </Button>
  );
};

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

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

      {/* Logo */}
      <div className="flex flex-col items-center gap-2 px-4 pb-3 pt-5">
        <div
          className={cn(
            "flex items-center justify-center rounded-full bg-background-300 transition-[width,height] duration-200 ease-in-out",
            collapsed ? "size-16" : "size-25",
          )}
        >
          <span
            className={cn(
              "font-display font-bold text-text-500 transition-[font-size] duration-200",
              collapsed ? "text-base" : "text-2xl",
            )}
          >
            SS
          </span>
        </div>
      </div>

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
            <Image
              src={logoShiroStudio}
              alt="Shiro Studio"
              width={collapsed ? 24 : 90}
              height={collapsed ? 24 : 25}
            />
          </Link>
          {/* {!collapsed && (
            <p className="text-center font-body text-[10px] leading-3 text-text-400">
              By Shiro Studio © All rights reserved
            </p>
          )} */}
        </div>
      ) : (
        <div className="flex justify-center items-center gap-1.5 px-4 pb-3">
          <Link href="https://www.shirostudio.co/" target="_blank">
            <Image src={logoShiroI} alt="Shiro Studio" height={24} />
          </Link>
        </div>
      )}
    </aside>
  );
}
