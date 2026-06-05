"use client";

import { useRef, useState, useCallback } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowUturnRightIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

const FORMATS = [
  { label: "EAN-8", length: 8 },
  { label: "EAN-13", length: 13 },
  { label: "CODE-128", length: 20 },
];

interface BarcodeInputProps {
  onSubmit: (barcode: string) => void;
  disabled?: boolean;
}

export function BarcodeInput({ onSubmit, disabled }: BarcodeInputProps) {
  const [formatIndex, setFormatIndex] = useState(1); // EAN-13 default
  const [digits, setDigits] = useState<string[]>([]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const format = FORMATS[formatIndex];
  const cells = Array.from({ length: format.length });

  const getDigit = (i: number) => digits[i] ?? "";

  const submit = useCallback(
    (currentDigits: string[]) => {
      const code = currentDigits.slice(0, format.length).join("");
      if (code.trim().length > 0) {
        onSubmit(code);
        setDigits([]);
        inputRefs.current[0]?.focus();
      }
    },
    [format.length, onSubmit],
  );

  function handleChange(index: number, value: string) {
    const char = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = char;
    setDigits(next);

    if (char && index < format.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    // if (char && index === format.length - 1) {
    //   submit(next);
    // }
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
    if (chars.length >= format.length) {
      submit(chars);
    } else {
      inputRefs.current[chars.length]?.focus();
    }
  }

  function cycleFormat(dir: 1 | -1) {
    setFormatIndex((i) => (i + dir + FORMATS.length) % FORMATS.length);
    setDigits([]);
    inputRefs.current[0]?.focus();
  }

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
      <div className="flex gap-1.5" onPaste={handlePaste}>
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
      </div>

      {/* Enter hint */}
      <div className="flex items-center justify-end gap-1 text-text-400">
        <ArrowUturnRightIcon className="size-3.5 -scale-y-100 rotate-180" />
        <span className="body-sm-regular">Enter</span>
      </div>
    </div>
  );
}
