"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

export interface SelectOption {
  label: string;
  value: string;
}

interface FormSelectProps {
  label: string;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  value: string | null;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
}

export function FormSelect({
  label,
  required,
  disabled,
  error,
  value,
  onChange,
  options,
  placeholder = "Seleccionar...",
  className,
}: FormSelectProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const [mounted, setMounted] = useState(false);
  const fieldsetRef = useRef<HTMLFieldSetElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selectedOption = options.find((o) => o.value === value) ?? null;
  const filled = selectedOption !== null;

  useEffect(() => {
    setMounted(true);
  }, []);

  function handleOpen() {
    if (disabled) return;
    if (fieldsetRef.current) {
      const rect = fieldsetRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <fieldset
      ref={fieldsetRef}
      className={cn(
        "w-full min-w-0 rounded-[6px] border border-solid px-3 pb-2 transition-colors",
        disabled ? "cursor-not-allowed bg-[#f8f8f8]" : "bg-[#f7f7f7]",
        error
          ? "border-danger-300"
          : open
            ? "border border-[rgba(255,156,122,0.5)]"
            : filled
              ? "border-[#616161]"
              : "border-border-300",
        className,
      )}
    >
      <legend
        className={cn(
          "ml-[7px] px-1 text-[12px] font-normal leading-none",
          disabled ? "text-border-300" : "text-text-500",
        )}
      >
        {label}
        {required && <span className="ml-px text-danger-300">*</span>}
      </legend>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        disabled={disabled}
        className={cn(
          "flex w-full items-center gap-2 bg-transparent",
          disabled ? "cursor-not-allowed" : "cursor-pointer",
        )}
      >
        <span
          className={cn(
            "min-w-0 flex-1 truncate text-left text-base leading-5",
            selectedOption ? "text-text-500" : "text-text-400",
            disabled && "text-border-300",
          )}
        >
          {selectedOption?.label ?? placeholder}
        </span>
        {open ? (
          <ChevronUpIcon className="size-6 shrink-0 text-text-400" />
        ) : (
          <ChevronDownIcon className="size-6 shrink-0 text-text-400" />
        )}
      </button>

      {mounted &&
        open &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <div
              className="fixed z-50 max-h-[288px] overflow-y-auto rounded-[6px] border border-border-300 bg-[#f7f7f7] py-2 shadow-[0px_12px_16px_-4px_rgba(112,113,116,0.1),0px_4px_6px_-2px_rgba(112,113,116,0.05)]"
              style={{ top: pos.top, left: pos.left, width: pos.width }}
            >
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full px-4 py-2 text-left text-base leading-5 text-text-500 transition-colors hover:bg-background-300",
                    option.value === value && "bg-background-200",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </>,
          document.body,
        )}
    </fieldset>
  );
}
