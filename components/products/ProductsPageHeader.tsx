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
import { Tag } from "../shared/Tag";

interface ProductsPageHeaderProps {
  productCount: number;
  isEmpty: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  columnVisibility: Record<string, boolean>;
  onColumnVisibilityChange: (next: Record<string, boolean>) => void;
  onDownload: () => void;
  isDownloading?: boolean;
}

export function ProductsPageHeader({
  productCount,
  isEmpty,
  searchTerm,
  onSearchChange,
  columnVisibility,
  onColumnVisibilityChange,
  onDownload,
  isDownloading = false,
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

  return (
    <div className="flex items-start justify-between gap-4">
      {/* Left — title + badge + last updated */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <h1 className="heading-2xl text-text-500">Productos</h1>
          <Tag variant="neutral">
            {productCount} {productCount === 1 ? "Producto" : "Productos"}
          </Tag>
        </div>
        <p className="body-sm-regular text-text-400">
          Última actualización el <LastUpdated />
        </p>
      </div>

      {/* Right — action buttons */}
      <div className="flex shrink-0 items-center gap-2">
        {/* Search — collapses to icon, expands to input */}
        {isSearchOpen ? (
          <div className="group flex items-center gap-2 rounded-lg border border-border-400 bg-background-400 px-3 py-2 transition-colors focus-within:border-accent-hover">
            <MagnifyingGlassIcon className="size-4 shrink-0 text-text-400 transition-colors group-focus-within:text-accent-hover" />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar por nombre, SKU o precio…"
              className="w-2xl bg-transparent body-md-regular text-text-500 outline-none placeholder:text-text-400"
            />
            <button
              type="button"
              onClick={closeSearch}
              className="ml-1 text-text-400 transition-colors hover:text-accent-hover group-focus-within:text-accent-hover cursor-pointer"
              aria-label="Cerrar búsqueda"
            >
              <XMarkIcon className="size-5" />
            </button>
          </div>
        ) : (
          <Button
            onClick={() => setIsSearchOpen(true)}
            variant="tertiary"
            aria-label="Buscar"
          >
            <MagnifyingGlassIcon className="size-4" />
          </Button>
        )}

        {/* Download */}
        <Button
          onClick={onDownload}
          disabled={isDownloading}
          variant="tertiary"
          aria-label="Descargar Excel"
        >
          <ArrowDownTrayIcon className="size-4" />
        </Button>

        {/* Editar Tabla */}
        <div className="relative">
          <Button
            ref={editColumnsButtonRef}
            type="button"
            variant="tertiary"
            size="xs"
            onClick={() => setIsEditColumnsOpen((v) => !v)}
            className={cn(isEditColumnsOpen && "bg-background-300")}
          >
            Editar Tabla
          </Button>

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
