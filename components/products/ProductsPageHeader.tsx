"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { LastUpdated } from "@/components/shared/LastUpdated";
import Button from "../shared/Button";
import { EditColumnsPopover } from "./EditColumnsPopover";

interface ProductsPageHeaderProps {
  productCount: number;
  isEmpty: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  columnVisibility: Record<string, boolean>;
  onColumnVisibilityChange: (next: Record<string, boolean>) => void;
  onDownloadSuccess: () => void;
  onDownloadError: () => void;
}

export function ProductsPageHeader({
  productCount,
  isEmpty,
  searchTerm,
  onSearchChange,
  columnVisibility,
  onColumnVisibilityChange,
  onDownloadSuccess,
  onDownloadError,
}: ProductsPageHeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isEditColumnsOpen, setIsEditColumnsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const editColumnsButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isSearchOpen) inputRef.current?.focus();
  }, [isSearchOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSearchOpen) closeSearch();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isSearchOpen]);

  function closeSearch() {
    setIsSearchOpen(false);
    onSearchChange("");
  }

  const iconButtonClass =
    "flex size-9 items-center justify-center rounded-lg border border-border-100 bg-background-400 text-text-400 transition-colors hover:bg-background-300 hover:text-text-500";

  return (
    <div className="flex items-start justify-between gap-4">
      {/* Left — title + badge + last updated */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-[28px] font-bold leading-9 text-text-500">
            Productos
          </h1>
          <span className="rounded-full border border-border-100 px-2.5 py-0.5 font-body text-xs font-medium text-text-400">
            {productCount} {productCount === 1 ? "Producto" : "Productos"}
          </span>
        </div>
        <p className="font-body text-xs text-text-400">
          Última actualización el <LastUpdated />
        </p>
      </div>

      {/* Right — action buttons */}
      <div className="flex shrink-0 items-center gap-2">
        {/* Search — collapses to icon, expands to input */}
        {isSearchOpen ? (
          <div className="flex items-center gap-2 rounded-lg border border-border-100 bg-background-400 px-3 py-2">
            <MagnifyingGlassIcon className="size-4 shrink-0 text-text-400" />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar por nombre, SKU o precio…"
              className="w-52 bg-transparent font-body text-sm text-text-500 outline-none placeholder:text-text-400"
            />
            <button
              type="button"
              onClick={closeSearch}
              className="ml-1 text-text-400 transition-colors hover:text-text-500"
              aria-label="Cerrar búsqueda"
            >
              <XMarkIcon className="size-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className={iconButtonClass}
            aria-label="Buscar"
          >
            <MagnifyingGlassIcon className="size-4" />
          </button>
        )}

        {/* Download */}
        <button
          type="button"
          onClick={() => {
            // TODO: implement Excel export — call onDownloadSuccess / onDownloadError
          }}
          className={iconButtonClass}
          aria-label="Descargar Excel"
        >
          <ArrowDownTrayIcon className="size-4" />
        </button>

        {/* Editar Tabla */}
        <div className="relative">
          <button
            ref={editColumnsButtonRef}
            type="button"
            onClick={() => setIsEditColumnsOpen((v) => !v)}
            className={cn(
              iconButtonClass,
              "w-auto px-3 font-body text-sm font-medium text-text-500",
              isEditColumnsOpen && "bg-background-300",
            )}
          >
            Editar Tabla
          </button>

          {isEditColumnsOpen && (
            <EditColumnsPopover
              anchorRef={editColumnsButtonRef}
              columnVisibility={columnVisibility}
              onColumnVisibilityChange={onColumnVisibilityChange}
              onClose={() => setIsEditColumnsOpen(false)}
            />
          )}
        </div>

        {/* Agregar Producto — only when there are products */}
        {!isEmpty && (
          <Button icon={PlusIcon}>
            <Link href="/products/new">Agregar Producto</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
