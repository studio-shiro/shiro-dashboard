"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface FormInputProps {
  label?: string;
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
  variant?: "form" | "table";
  maxLength?: number;
  /** Formats the value with "es-AR" thousand separators (e.g. 100000 → "100.000")
   *  while still reporting the raw digit string through onChange. */
  currency?: boolean;
}

/** Formats a clean numeric value ("123123.45") as es-AR display
 *  ("123.123,45") — thousands grouped with ".", decimals with ",". */
function formatCurrencyDisplay(value: string | number): string {
  if (value === "" || value === null || value === undefined) return "";
  const [intPart, decPart] = String(value).split(".");
  const groupedInt = Number(intPart || "0").toLocaleString("es-AR");
  return decPart !== undefined ? `${groupedInt},${decPart}` : groupedInt;
}

/** Keeps digits and at most one "," (decimal separator, max 2 digits). */
function sanitizeCurrencyInput(typed: string): string {
  const commaIndex = typed.indexOf(",");
  if (commaIndex === -1) return typed.replace(/\D/g, "");
  const intPart = typed.slice(0, commaIndex).replace(/\D/g, "");
  const decPart = typed
    .slice(commaIndex + 1)
    .replace(/\D/g, "")
    .slice(0, 2);
  return `${intPart},${decPart}`;
}

function toNumberOrNull(value: string | number): number | null {
  if (value === "" || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

/** A char that counts toward cursor position bookkeeping — digits and the
 *  decimal comma, but never the "." thousands separator (that one is
 *  always machine-inserted, so it must never participate in the count). */
function isContentChar(ch: string): boolean {
  return /[\d,]/.test(ch);
}

// Hides the native up/down spinner on type="number" inputs — we only want
// free typing, not click-to-increment.
const NO_SPINNER =
  "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

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
  variant = "form",
  currency,
  maxLength,
}: FormInputProps) {
  const [focused, setFocused] = useState(false);

  const isCurrency = currency && type === "number";
  const inputType = isCurrency ? "text" : type;

  const inputRef = useRef<HTMLInputElement>(null);
  const [displayText, setDisplayText] = useState(() =>
    formatCurrencyDisplay(value),
  );
  // Tracks the last value *we* emitted so the resync effect below can tell
  // "the parent echoed our own change" apart from "the value changed from
  // outside" (e.g. switching edit target) — compared numerically since a
  // trailing "." (mid-decimal-entry) is silently dropped by Number().
  const lastEmittedRef = useRef(toNumberOrNull(value));
  // Cursor position (in displayText) to restore after the next render —
  // set synchronously in the change handler, applied in a layout effect
  // once React has actually written the reformatted value to the DOM.
  const pendingCursorRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (isCurrency && toNumberOrNull(value) !== lastEmittedRef.current) {
      setDisplayText(formatCurrencyDisplay(value));
      lastEmittedRef.current = toNumberOrNull(value);
    }
  }, [value, isCurrency]);

  useLayoutEffect(() => {
    if (pendingCursorRef.current !== null && inputRef.current) {
      const pos = Math.min(pendingCursorRef.current, displayText.length);
      inputRef.current.setSelectionRange(pos, pos);
      pendingCursorRef.current = null;
    }
  }, [displayText]);

  function handleChange(raw: string) {
    onChange(raw);
  }

  // Number inputs often default to "0" — without this, clicking in and
  // typing "5" appends instead of replacing, yielding "05".
  function handleNumericFocus(e: React.FocusEvent<HTMLInputElement>) {
    e.target.select();
  }

  function handleCurrencyChange(e: React.ChangeEvent<HTMLInputElement>) {
    const typed = e.target.value;
    const cursorPos = e.target.selectionStart ?? typed.length;

    let keptBeforeCursor = 0;
    for (let i = 0; i < cursorPos && i < typed.length; i++) {
      if (isContentChar(typed[i])) keptBeforeCursor++;
    }

    const sanitized = sanitizeCurrencyInput(typed);
    const hasComma = sanitized.includes(",");
    const [intRaw, decRaw = ""] = sanitized.split(",");
    const groupedInt = intRaw ? Number(intRaw).toLocaleString("es-AR") : "";
    const newDisplay = hasComma ? `${groupedInt},${decRaw}` : groupedInt;

    let newPos = 0;
    if (keptBeforeCursor > 0) {
      let count = 0;
      for (let i = 0; i < newDisplay.length; i++) {
        if (isContentChar(newDisplay[i])) {
          count++;
          newPos = i + 1;
          if (count === keptBeforeCursor) break;
        }
      }
    }
    pendingCursorRef.current = newPos;
    setDisplayText(newDisplay);

    const numeric = hasComma ? `${intRaw || "0"}.${decRaw}` : intRaw;
    lastEmittedRef.current = toNumberOrNull(numeric);
    onChange(numeric);
  }

  if (variant === "table") {
    return (
      <div
        className={cn(
          "flex h-[30px] w-full items-center gap-2 overflow-hidden rounded-[6px] border border-solid shadow-sm",
          adornStart ? "pl-1 pr-4" : "px-2",
          error ? "border-danger-300" : "border-border-400",
          disabled
            ? "cursor-not-allowed bg-[#f8f8f8] opacity-50"
            : "bg-white focus-within:border-accent",
          className,
        )}
      >
        {adornStart && (
          <span className="shrink-0 text-text-400">{adornStart}</span>
        )}
        <input
          ref={isCurrency ? inputRef : undefined}
          type={inputType}
          inputMode={isCurrency ? "decimal" : undefined}
          value={isCurrency ? displayText : value}
          onChange={(e) =>
            isCurrency ? handleCurrencyChange(e) : handleChange(e.target.value)
          }
          onFocus={type === "number" ? handleNumericFocus : undefined}
          disabled={disabled}
          min={min}
          step={step}
          placeholder={placeholder}
          maxLength={maxLength}
          className={cn(
            "w-full bg-transparent body-md-regular text-text-500 placeholder:text-text-500 focus:outline-none disabled:cursor-not-allowed",
            type === "number" && NO_SPINNER,
          )}
        />
        {adornEnd && (
          <span className="ml-2 shrink-0 text-text-400">{adornEnd}</span>
        )}
      </div>
    );
  }

  const filled = value !== "" && value !== null && value !== undefined;

  return (
    <fieldset
      className={cn(
        "relative h-[38px] w-full min-w-0 rounded-[6px] border border-solid transition-colors",
        disabled
          ? "cursor-not-allowed bg-[#f8f8f8]"
          : error
            ? "bg-[rgba(231,183,184,0.2)]"
            : "bg-[#f7f7f7]",
        error
          ? "border-danger-300"
          : focused
            ? "border-[rgba(255,156,122,0.5)]"
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
      {/* Absolutely positioned so items-center has the full 38px to center within */}
      <div className="absolute inset-0 flex items-center gap-2 px-3">
        {adornStart && (
          <span className="shrink-0 text-text-400">{adornStart}</span>
        )}
        <input
          ref={isCurrency ? inputRef : undefined}
          type={inputType}
          inputMode={isCurrency ? "decimal" : undefined}
          value={isCurrency ? displayText : value}
          onChange={(e) =>
            isCurrency ? handleCurrencyChange(e) : handleChange(e.target.value)
          }
          onFocus={(e) => {
            setFocused(true);
            if (type === "number") handleNumericFocus(e);
          }}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          min={min}
          step={step}
          placeholder={placeholder}
          maxLength={maxLength}
          className={cn(
            "min-w-0 flex-1 bg-transparent text-base leading-5 text-text-500 placeholder:text-text-400 focus:outline-none",
            type === "number" && NO_SPINNER,
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
