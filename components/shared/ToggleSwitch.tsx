"use client";

import { cn } from "@/lib/utils";

interface ToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}

export function ToggleSwitch({
  checked,
  onChange,
  disabled,
}: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      disabled={disabled}
      className={cn(
        "relative inline-flex h-5 w-10 shrink-0 items-center rounded-full transition-colors",
        "focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_#ffd2b4]",
        // ON
        checked && !disabled && "cursor-pointer bg-accent",
        checked && disabled && "cursor-not-allowed bg-accent-disabled",
        // OFF
        !checked && !disabled && "cursor-pointer bg-accent-disabled",
        !checked && disabled && "cursor-not-allowed bg-[#ffd2b4]",
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-5" : "translate-x-0.5",
        )}
      />
    </button>
  );
}
