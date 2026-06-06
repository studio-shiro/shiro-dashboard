"use client";

import { CheckIcon } from "@heroicons/react/24/solid";
import { cn } from "@/lib/utils";

interface CheckCircleProps {
  checked: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
}

export function CheckCircle({
  checked,
  disabled = false,
  onChange,
  className,
}: CheckCircleProps) {
  return (
    <button
      type="button"
      role="checkbox"
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
          "border-[#c23d0e] bg-[#c23d0e]",
          "hover:border-accent hover:bg-accent",
        ],
        // Disabled unchecked
        !checked && disabled && [
          "cursor-not-allowed border-border-200 bg-background-500",
        ],
        // Disabled checked
        checked && disabled && [
          "cursor-not-allowed border-[#e8e8ea] bg-[#e8e8ea]",
        ],
        className,
      )}
    >
      {checked && (
        <CheckIcon className="size-3 text-white" />
      )}
    </button>
  );
}
