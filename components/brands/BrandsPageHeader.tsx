"use client";

import { useState, useRef, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { LastUpdated } from "@/components/shared/LastUpdated";
import Button from "@/components/shared/Button";
import { Tag } from "@/components/shared/Tag";

interface BrandsPageHeaderProps {
  brandCount: number;
  isEmpty: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onAdd: () => void;
}

export function BrandsPageHeader({
  brandCount,
  isEmpty,
  searchTerm,
  onSearchChange,
  onAdd,
}: BrandsPageHeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) inputRef.current?.focus();
  }, [isSearchOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSearchOpen) closeSearch();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSearchOpen]);

  function closeSearch() {
    setIsSearchOpen(false);
    onSearchChange("");
  }

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <h1 className="heading-2xl text-text-500">Marcas</h1>
          <Tag variant="neutral">
            {brandCount} {brandCount === 1 ? "Marca" : "Marcas"}
          </Tag>
        </div>
        <p className="body-sm-regular text-text-400">
          Última actualización el <LastUpdated />
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {isSearchOpen ? (
          <div className="group flex items-center gap-2 rounded-lg border border-border-100 bg-background-400 px-3 py-2 transition-colors focus-within:border-accent-hover">
            <MagnifyingGlassIcon className="size-4 shrink-0 text-text-400 transition-colors group-focus-within:text-accent-hover" />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar por nombre o descripción…"
              className="w-52 bg-transparent body-md-regular text-text-500 outline-none placeholder:text-text-400"
            />
            <button
              type="button"
              onClick={closeSearch}
              className="ml-1 text-text-400 transition-colors hover:text-text-500 group-focus-within:text-accent-hover"
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
            <MagnifyingGlassIcon className="size-5" />
          </Button>
        )}

        {!isEmpty && (
          <Button icon={PlusIcon} onClick={onAdd}>
            Agregar Marca
          </Button>
        )}
      </div>
    </div>
  );
}
