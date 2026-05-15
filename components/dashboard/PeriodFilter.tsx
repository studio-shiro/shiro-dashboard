"use client";
import { FunnelIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

function getMonthOptions() {
  const options: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = date.toLocaleDateString("es-AR", {
      month: "long",
      year: "numeric",
    });
    const labelFormatted =
      label.charAt(0).toUpperCase() + label.slice(1).replace(" de ", " ");
    options.push({ value, label: labelFormatted });
  }
  return options;
}

export function PeriodFilter() {
  const options = getMonthOptions();

  return (
    <div className="flex shrink-0 items-center gap-3">
      <div className="flex items-center gap-1.5">
        <FunnelIcon className="size-4 text-text-400" />
        <span className="font-body text-sm leading-5 text-text-400">
          Filtrar por:
        </span>
      </div>
      <div className="relative">
        <select
          defaultValue={options[0]?.value}
          className="h-9 appearance-none rounded-md border border-border-300 bg-background-400 pl-4 pr-9 font-body text-sm text-text-500 outline-none transition-colors hover:border-border-400 focus:border-border-400"
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
