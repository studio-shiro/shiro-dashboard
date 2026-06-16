"use client";

import {
  useRef,
  useState,
  useCallback,
  useEffect,
  useImperativeHandle,
  type Ref,
} from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowUturnRightIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import {
  ScanTooltip,
  type ScanTooltipVariant,
} from "@/components/products/wizard/ScanTooltip";

const FORMATS = [
  { label: "EAN-8", length: 8, exact: true },
  { label: "EAN-13", length: 13, exact: true },
  { label: "CODE-128", length: 20, exact: false },
];

const MIN_CODE_LENGTH = 4;

const TOOLTIP_TEXT: Record<ScanTooltipVariant, string> = {
  info: "Presioná Enter para ingresar el producto",
  danger:
    "Código inválido. Revisá los números ingresados e intentá nuevamente.",
  warning:
    "Para continuar, completá el código del producto y presioná “Enter” o eliminá este registro.",
  duplicate: "El producto ya fue ingresado.",
};

const ENTER_REMINDER_DELAY_MS = 3000;

export interface BarcodeInputHandle {
  clear: () => void;
}

interface BarcodeInputProps {
  onSubmit: (barcode: string) => void;
  disabled?: boolean;
  /** External tooltip override (lookup not found / continue warning). */
  tooltip?: ScanTooltipVariant | null;
  onDigitsChange?: (hasDigits: boolean) => void;
  ref?: Ref<BarcodeInputHandle>;
}

export function BarcodeInput({
  onSubmit,
  disabled,
  tooltip = null,
  onDigitsChange,
  ref,
}: BarcodeInputProps) {
  const [formatIndex, setFormatIndex] = useState(1); // EAN-13 default
  const [digits, setDigits] = useState<string[]>([]);
  const [internalTooltip, setInternalTooltip] = useState<
    "info" | "danger" | null
  >(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const reminderTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const format = FORMATS[formatIndex];
  const cells = Array.from({ length: format.length });

  const getDigit = (i: number) => digits[i] ?? "";

  const clearReminderTimer = useCallback(() => {
    if (reminderTimerRef.current) {
      clearTimeout(reminderTimerRef.current);
      reminderTimerRef.current = null;
    }
  }, []);

  useEffect(() => clearReminderTimer, [clearReminderTimer]);

  const resetDigits = useCallback(() => {
    setDigits([]);
    setInternalTooltip(null);
    clearReminderTimer();
    onDigitsChange?.(false);
    inputRefs.current[0]?.focus();
  }, [clearReminderTimer, onDigitsChange]);

  useImperativeHandle(ref, () => ({ clear: resetDigits }), [resetDigits]);

  function isComplete(currentDigits: string[]) {
    return Array.from(
      { length: format.length },
      (_, i) => currentDigits[i],
    ).every(Boolean);
  }

  /** Restart the "press Enter" reminder when the code is fully typed. */
  function scheduleReminder(currentDigits: string[]) {
    clearReminderTimer();
    if (isComplete(currentDigits)) {
      reminderTimerRef.current = setTimeout(() => {
        setInternalTooltip("info");
      }, ENTER_REMINDER_DELAY_MS);
    }
  }

  const submit = useCallback(
    (currentDigits: string[]) => {
      clearReminderTimer();
      setInternalTooltip(null);

      const code = currentDigits.slice(0, format.length).join("");
      if (code.length === 0) return;

      const validLength = format.exact
        ? code.length === format.length &&
          currentDigits.slice(0, format.length).every(Boolean)
        : code.length >= MIN_CODE_LENGTH;

      if (!validLength) {
        setInternalTooltip("danger");
        return;
      }

      // Digits stay visible until the lookup succeeds; the parent calls
      // clear() so a failed lookup leaves the code on screen for review.
      onSubmit(code);
    },
    [clearReminderTimer, format, onSubmit],
  );

  function handleChange(index: number, value: string) {
    const char = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = char;
    setDigits(next);
    setInternalTooltip(null);
    scheduleReminder(next);
    onDigitsChange?.(next.some(Boolean));

    if (char && index < format.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (e.key === "Backspace" && !getDigit(index) && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter") {
      submit(digits);
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
    const chars = pasted.slice(0, format.length).split("");
    setDigits(chars);
    setInternalTooltip(null);
    onDigitsChange?.(chars.length > 0);
    if (chars.length >= format.length) {
      submit(chars);
    } else {
      scheduleReminder(chars);
      inputRefs.current[chars.length]?.focus();
    }
  }

  function cycleFormat(dir: 1 | -1) {
    setFormatIndex((i) => (i + dir + FORMATS.length) % FORMATS.length);
    resetDigits();
  }

  const activeTooltip = tooltip ?? internalTooltip;

  return (
    <div className="flex w-full flex-col gap-3">
      {/* Format selector */}
      <div className="flex items-center justify-between">
        <span className="body-md-semibold text-text-500">Ingreso Manual</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => cycleFormat(-1)}
            className="rounded p-0.5 text-text-400 hover:text-text-500"
          >
            <ChevronLeftIcon className="size-5" />
          </button>
          <span className="body-sm-semibold text-accent">{format.label}</span>
          <button
            type="button"
            onClick={() => cycleFormat(1)}
            className="rounded p-0.5 text-text-400 hover:text-text-500"
          >
            <ChevronRightIcon className="size-5" />
          </button>
        </div>
      </div>

      {/* Digit cells — flex-1 so all cells share the fixed 390px container equally */}
      <div className="relative flex gap-1.5" onPaste={handlePaste}>
        {cells.map((_, i) => (
          <input
            key={`${format.label}-${i}`}
            ref={(el) => {
              inputRefs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={2}
            value={getDigit(i)}
            disabled={disabled}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className={cn(
              "h-11 min-w-0 flex-1 rounded-md border border-border-400 bg-white text-center body-md-semibold text-text-500",
              "focus:border-accent focus:outline-none",
              "disabled:opacity-50",
            )}
          />
        ))}

        {activeTooltip && (
          <div className="absolute left-full top-1/2 z-10 ml-2.5 -translate-y-1/2">
            <ScanTooltip variant={activeTooltip}>
              {TOOLTIP_TEXT[activeTooltip]}
            </ScanTooltip>
          </div>
        )}
      </div>

      {/* Enter hint */}
      <div className="flex items-center justify-end gap-1 text-text-400">
        <ArrowUturnRightIcon className="size-3.5 -scale-y-100 rotate-180" />
        <span className="body-sm-regular">Enter</span>
      </div>
    </div>
  );
}
