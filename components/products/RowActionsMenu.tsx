"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";

interface BaseAction {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  variant?: "default" | "danger";
}

type RowAction =
  | (BaseAction & { href: string; onClick?: never })
  | (BaseAction & { onClick: () => void; href?: never });

interface RowActionsMenuProps {
  actions: RowAction[];
}

export function RowActionsMenu({ actions }: RowActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const itemClass = (variant?: "default" | "danger") =>
    `flex w-full items-center whitespace-nowrap gap-2 px-4 py-2 body-lg-regular transition-colors ${
      variant === "danger"
        ? "text-red-600 bg-danger-100"
        : "text-text-500 hover:bg-background-300"
    }`;

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
        <div className="absolute right-0 top-9 z-30 min-w-[224px] overflow-hidden rounded-lg border border-border-200 bg-background-400 shadow-lg divide-y divide-border-100">
          {actions.map((action) => {
            const Icon = action.icon;
            if (action.href) {
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  onClick={() => setOpen(false)}
                  className={itemClass(action.variant)}
                >
                  <Icon className="size-4 shrink-0" />
                  {action.label}
                </Link>
              );
            }
            return (
              <button
                key={action.label}
                type="button"
                onClick={() => {
                  setOpen(false);
                  action.onClick?.();
                }}
                className={itemClass(action.variant)}
              >
                <Icon className="size-4 shrink-0" />
                {action.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
