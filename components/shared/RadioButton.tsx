"use client";

import { cn } from "@/lib/utils";

interface RadioButtonProps {
  checked: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
}

export function RadioButton({
  checked,
  disabled = false,
  onChange,
  className,
}: RadioButtonProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={cn(
        "group relative flex size-5 shrink-0 items-center justify-center rounded-full border transition-all",
        "focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_#ffd2b4]",
        // Unchecked
        !checked && !disabled && [
          "border-border-300 bg-background-500",
          "hover:border-accent hover:bg-[#fff7f2]",
        ],
        // Checked
        checked && !disabled && [
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
      {checked && (
        <span
          className={cn(
            "size-2 rounded-full transition-colors",
            disabled ? "bg-[#e8e8ea]" : "bg-[#c23d0e] group-hover:bg-accent",
          )}
        />
      )}
    </button>
  );
}
