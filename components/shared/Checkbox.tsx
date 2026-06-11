"use client";

import { CheckIcon } from "@heroicons/react/24/solid";
import { cn } from "@/lib/utils";

interface CheckboxProps {
  checked: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
}

export function Checkbox({
  checked,
  indeterminate = false,
  disabled = false,
  onChange,
  className,
}: CheckboxProps) {
  const isActive = checked || indeterminate;

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : checked}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={cn(
        "group relative flex size-5 shrink-0 items-center justify-center rounded border transition-all",
        "focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_#ffd2b4]",
        // Unchecked
        !isActive && !disabled && [
          "border-border-300 bg-background-500",
          "hover:border-accent hover:bg-[#fff7f2]",
        ],
        // Checked / indeterminate
        isActive && !disabled && [
          "border-[#c23d0e] bg-background-500",
          "hover:border-accent",
        ],
        // Disabled
        disabled && [
          "cursor-not-allowed border-border-200 bg-background-500",
          "hover:border-border-200 hover:bg-background-500",
        ],
        className,
      )}
    >
      {isActive && (
        indeterminate ? (
          <span
            className={cn(
              "block h-[2px] w-[10px] rounded-full transition-colors",
              disabled ? "bg-[#e8e8ea]" : "bg-[#c23d0e] group-hover:bg-accent",
            )}
          />
        ) : (
          <CheckIcon
            className={cn(
              "size-3 transition-colors",
              disabled ? "text-[#e8e8ea]" : "text-[#c23d0e] group-hover:text-accent",
            )}
          />
        )
      )}
    </button>
  );
}
