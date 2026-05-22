"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { ChevronDownIcon, FunnelIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { getPeriodOptions } from "@/lib/dashboard/periodComparison";
import { getDefaultPeriod } from "@/lib/dashboard/dateRange";
import type { PeriodType } from "@/types/dashboard";

const PERIOD_TYPES: { type: PeriodType; label: string }[] = [
  { type: "today", label: "Hoy" },
  { type: "week", label: "Semana" },
  { type: "month", label: "Mes" },
  { type: "year", label: "Año" },
];

export function PeriodFilter() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const defaultPeriod = getDefaultPeriod();

  const currentType = (searchParams.get("type") ??
    defaultPeriod.type) as PeriodType;
  const currentValue = searchParams.get("value") ?? defaultPeriod.value;
  const options = getPeriodOptions(currentType);

  function navigate(type: PeriodType, value: string) {
    const params = new URLSearchParams({ type, value });
    router.push(`?${params.toString()}`, { scroll: false });
  }

  function handleTypeChange(newType: PeriodType) {
    const firstOption = getPeriodOptions(newType)[0];
    navigate(newType, firstOption.value);
  }

  function handleValueChange(newValue: string) {
    navigate(currentType, newValue);
  }

  return (
    <div className="flex shrink-0 items-center gap-3">
      <div className="flex items-center gap-1.5">
        <FunnelIcon className="size-4 text-text-400" />
        <span className="body-md-regular text-text-400">Filtrar por:</span>
      </div>

      {/* Period type — segmented control */}
      <div className="flex items-center rounded-lg border border-border-300 bg-background-300 p-0.5">
        {PERIOD_TYPES.map(({ type, label }) => (
          <button
            key={type}
            onClick={() => handleTypeChange(type)}
            className={cn(
              "rounded-md px-3 py-1.5 body-md-regular transition-colors",
              currentType === type
                ? "bg-background-400 font-medium text-text-500 shadow-sm"
                : "text-text-400 hover:text-text-500",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Period value — dropdown */}
      <div className="relative">
        <select
          value={currentValue}
          onChange={(e) => handleValueChange(e.target.value)}
          className="h-9 appearance-none rounded-md border border-border-300 bg-background-400 pl-4 pr-9 body-md-regular text-text-500 outline-none transition-colors hover:border-border-400 focus:border-border-400"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-text-400" />
      </div>
    </div>
  );
}
