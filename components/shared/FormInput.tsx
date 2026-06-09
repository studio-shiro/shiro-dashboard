"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface FormInputProps {
  label: string;
  required?: boolean;
  type?: "text" | "number";
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  min?: number;
  step?: number | string;
  adornStart?: React.ReactNode;
  adornEnd?: React.ReactNode;
  disabled?: boolean;
  error?: boolean;
  className?: string;
}

export function FormInput({
  label,
  required,
  type = "text",
  value,
  onChange,
  placeholder,
  min,
  step,
  adornStart,
  adornEnd,
  disabled,
  error,
  className,
}: FormInputProps) {
  const [focused, setFocused] = useState(false);
  const filled = value !== "" && value !== null && value !== undefined;

  return (
    <fieldset
      className={cn(
        "w-full min-w-0 rounded-md border border-solid px-3 pb-2 transition-colors",
        disabled
          ? "cursor-not-allowed bg-[#f8f8f8]"
          : error
            ? "bg-[rgba(231,183,184,0.2)]"
            : "bg-[#f7f7f7]",
        error
          ? "border-danger-300"
          : focused
            ? "border-2 border-[rgba(255,156,122,0.5)]"
            : filled
              ? "border-text-400"
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
      <div className="flex items-center gap-2">
        {adornStart && (
          <span className="shrink-0 text-text-400">{adornStart}</span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          min={min}
          step={step}
          placeholder={placeholder}
          className={cn(
            "w-full bg-transparent text-base leading-5 text-text-500 placeholder:text-text-400 focus:outline-none",
            disabled &&
              "cursor-not-allowed text-border-300 placeholder:text-border-300",
          )}
        />
        {adornEnd && (
          <span className="ml-2 shrink-0 text-text-400">{adornEnd}</span>
        )}
      </div>
    </fieldset>
  );
}
