"use client";

import { cn } from "@/lib/utils";
import { DatePickerInput } from "@/components/products/wizard/DatePickerInput";

interface DateFormInputProps {
  label: string;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  value: string | null;
  onChange: (value: string | null) => void;
}

export function DateFormInput({
  label,
  required,
  disabled,
  error,
  value,
  onChange,
}: DateFormInputProps) {
  const filled = value !== null;

  return (
    <fieldset
      className={cn(
        "w-full min-w-0 rounded-[6px] border border-solid px-3 pb-2",
        "bg-[#f7f7f7]",
        error
          ? "border-danger-300"
          : filled
            ? "border-[#616161]"
            : "border-border-300",
        disabled && "pointer-events-none bg-[#f8f8f8] opacity-60",
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
      <DatePickerInput
        value={value}
        onChange={onChange}
        variant="form"
        className="h-auto border-0 bg-transparent px-0 shadow-none"
      />
    </fieldset>
  );
}
