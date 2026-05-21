"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";

interface RowActionsMenuProps {
  productId: string;
  onDelete: () => void;
}

export function RowActionsMenu({ productId, onDelete }: RowActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex size-8 items-center justify-center rounded-md text-text-400 transition-colors hover:bg-background-300 hover:text-text-500"
        aria-label="Más opciones"
      >
        <EllipsisVerticalIcon className="size-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-9 z-30 min-w-[128px] overflow-hidden rounded-lg border border-border-200 bg-background-400 shadow-[0px_4px_8px_-2px_rgba(112,113,116,0.1),0px_2px_4px_-2px_rgba(112,113,116,0.06)]">
          <Link
            href={`/products/${productId}/edit`}
            onClick={() => setOpen(false)}
            className="flex w-full items-center px-3 py-2 font-body text-sm text-text-500 transition-colors hover:bg-background-300"
          >
            Editar
          </Link>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            className="flex w-full items-center px-3 py-2 font-body text-sm text-red-600 transition-colors hover:bg-red-50"
          >
            Eliminar
          </button>
        </div>
      )}
    </div>
  );
}
