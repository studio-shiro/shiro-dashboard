"use client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ChevronDownIcon, FunnelIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { getPeriodOptions } from "@/lib/dashboard/periodComparison";
import { getDefaultPeriod, formatPeriodLabel } from "@/lib/dashboard/dateRange";
import { DateRangePicker } from "@/components/dashboard/DateRangePicker";
import { PeriodMenu } from "@/components/shared/PeriodMenu";
import type { PeriodType } from "@/types/dashboard";

type PickerState = "month" | "year" | "custom" | null;

const PERIOD_TYPES: { type: PeriodType; label: string }[] = [
  { type: "today", label: "Hoy" },
  { type: "month", label: "Mes" },
  { type: "year", label: "Año" },
  { type: "custom", label: "Personalizado" },
];

interface PeriodFilterProps {
  accountCreatedAt: string | null;
}

export function PeriodFilter({ accountCreatedAt }: PeriodFilterProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const defaultPeriod = getDefaultPeriod();

  const currentType = (searchParams.get("type") ??
    defaultPeriod.type) as PeriodType;
  const currentValue = searchParams.get("value") ?? defaultPeriod.value;

  const [openPicker, setOpenPicker] = useState<PickerState>(null);

  const minDate = accountCreatedAt ? new Date(accountCreatedAt) : undefined;

  function navigate(type: PeriodType, value: string) {
    const params = new URLSearchParams({ type, value });
    router.push(`?${params.toString()}`, { scroll: false });
  }

  function handleTypeClick(type: PeriodType) {
    if (type === "today") {
      const today = new Date().toISOString().slice(0, 10);
      navigate("today", today);
      setOpenPicker(null);
      return;
    }

    if (type === "custom") {
      setOpenPicker("custom");
      return;
    }

    setOpenPicker(type as PickerState);
  }

  function handleOptionSelect(value: string) {
    if (!openPicker || openPicker === "custom") return;
    navigate(openPicker, value);
    setOpenPicker(null);
  }

  function handleCustomRange(from: string, to: string) {
    navigate("custom", `${from}_${to}`);
    setOpenPicker(null);
  }

  const options =
    openPicker && openPicker !== "custom"
      ? getPeriodOptions(openPicker as PeriodType, minDate)
      : [];

  return (
    <div className="flex shrink-0 items-center gap-3">
      <div className="flex items-center gap-1.5">
        <FunnelIcon className="size-4 text-text-400" />
        <span className="body-md-regular text-text-400">
          Selector de período:
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        {PERIOD_TYPES.map(({ type, label }) => {
          const isHighlighted = openPicker === null && currentType === type;
          const buttonLabel =
            currentType === type && openPicker === null
              ? formatPeriodLabel(type, currentValue)
              : label;
          return (
            <div key={type} className="relative">
              <button
                type="button"
                onClick={() => handleTypeClick(type)}
                className={cn(
                  "flex h-9 items-center gap-1.5 rounded-[6px] px-4 py-2.5 text-xs font-semibold shadow-sm transition-colors",
                  isHighlighted
                    ? "bg-accent-selected text-text-100"
                    : "border border-border-400 bg-background-400 text-text-500 hover:border-border-500",
                )}
              >
                {buttonLabel}
                {type !== "today" && (
                  <ChevronDownIcon
                    className={cn(
                      "size-5 transition-transform",
                      openPicker === type && "rotate-180",
                    )}
                  />
                )}
              </button>

              {openPicker === type &&
                type !== "custom" &&
                options.length > 0 && (
                  <PeriodMenu
                    options={options}
                    selectedValue={currentValue}
                    onSelect={handleOptionSelect}
                    onClose={() => setOpenPicker(null)}
                  />
                )}

              {openPicker === "custom" && type === "custom" && (
                <DateRangePicker
                  value={currentType === "custom" ? currentValue : null}
                  onChange={handleCustomRange}
                  onClose={() => setOpenPicker(null)}
                  minDate={minDate}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
