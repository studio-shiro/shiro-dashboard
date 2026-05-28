"use client";
import { cn } from "@/lib/utils";

interface PeriodMenuOption {
  value: string;
  label: string;
}

interface PeriodMenuProps {
  options: PeriodMenuOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}

export function PeriodMenu({
  options,
  selectedValue,
  onSelect,
  onClose,
}: PeriodMenuProps) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-[calc(100%+6px)] z-50 max-h-56 overflow-y-auto rounded-lg border border-border-400 bg-background-400 shadow-sm">
        <ul className="py-2">
          {options.map((opt) => {
            const isSelected = opt.value === selectedValue;
            return (
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={() => onSelect(opt.value)}
                  className="flex w-full items-center gap-2 pl-3.5 pr-4 py-2 text-left transition-colors hover:bg-background-300"
                >
                  <span
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-sm border bg-background-500",
                      isSelected
                        ? "border-accent-selected"
                        : "border-border-300",
                    )}
                  >
                    {isSelected && (
                      <svg
                        width="12"
                        height="9"
                        viewBox="0 0 12 9"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M1 4L4.5 7.5L11 1"
                          stroke="#c23d0e"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>
                  <span className="body-lg-regular text-text-400 whitespace-nowrap">
                    {opt.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
