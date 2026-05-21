"use client";

import { useEffect, useRef } from "react";
import { LockClosedIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { FIXED_COLUMN_IDS, OPTIONAL_COLUMN_IDS } from "./ProductsTable";

const COLUMN_LABELS: Record<string, string> = {
  producto: "Producto",
  sku: "SKU",
  imagen: "Imagen",
  marca: "Marca",
  categoria: "Categoría",
  vencimientos: "Vencimientos",
  costo: "Costo por Unidad",
  precio: "Precio Final por Unidad",
  stock: "Stock",
  acciones: "Acciones",
};

interface EditColumnsPopoverProps {
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  columnVisibility: Record<string, boolean>;
  onColumnVisibilityChange: (next: Record<string, boolean>) => void;
  onClose: () => void;
}

export function EditColumnsPopover({
  anchorRef,
  columnVisibility,
  onColumnVisibilityChange,
  onClose,
}: EditColumnsPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      const target = e.target as Node;
      if (
        popoverRef.current &&
        !popoverRef.current.contains(target) &&
        anchorRef.current &&
        !anchorRef.current.contains(target)
      ) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [anchorRef, onClose]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function toggleColumn(id: string) {
    onColumnVisibilityChange({
      ...columnVisibility,
      [id]: !columnVisibility[id],
    });
  }

  return (
    <div
      ref={popoverRef}
      role="dialog"
      aria-label="Editar columnas"
      className="absolute right-0 top-[calc(100%+8px)] z-40 min-w-[220px] overflow-hidden rounded-lg border border-border-100 bg-background-400 shadow-[0px_4px_8px_-2px_rgba(112,113,116,0.1),0px_2px_4px_-2px_rgba(112,113,116,0.06)]"
    >
      <div className="border-b border-border-100 px-4 py-3">
        <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-400">
          Columnas
        </p>
      </div>

      <ul className="py-2">
        {/* Fixed columns — always visible, locked */}
        {FIXED_COLUMN_IDS.map((id) => (
          <li
            key={id}
            className="flex items-center justify-between gap-3 px-4 py-2 opacity-50"
          >
            <span className="font-body text-sm text-text-500">
              {COLUMN_LABELS[id]}
            </span>
            <LockClosedIcon className="size-3.5 shrink-0 text-text-400" />
          </li>
        ))}

        {/* Divider */}
        <li role="separator" className="my-1 border-t border-border-100" />

        {/* Optional columns — toggleable */}
        {OPTIONAL_COLUMN_IDS.map((id) => {
          const visible = columnVisibility[id] ?? true;
          return (
            <li
              key={id}
              className="flex items-center justify-between gap-3 px-4 py-2"
            >
              <span
                className={cn(
                  "font-body text-sm",
                  visible ? "text-text-500" : "text-text-400",
                )}
              >
                {COLUMN_LABELS[id]}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={visible}
                onClick={() => toggleColumn(id)}
                className={cn(
                  "relative inline-flex h-5 w-10 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                  visible ? "bg-accent" : "bg-zinc-200",
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
                    visible ? "translate-x-5" : "translate-x-0.5",
                  )}
                />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
