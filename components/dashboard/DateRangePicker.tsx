"use client";
import { useState } from "react";
import { DayPicker } from "react-day-picker";
import { es } from "react-day-picker/locale";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import type { DateRange } from "react-day-picker";
import "@daypicker/react/style.css";

interface DateRangePickerProps {
  value: string | null; // "YYYY-MM-DD_YYYY-MM-DD" or null
  onChange: (from: string, to: string) => void;
  onClose: () => void;
}

export function DateRangePicker({
  value,
  onChange,
  onClose,
}: DateRangePickerProps) {
  const parseInitial = (): DateRange | undefined => {
    if (!value) return undefined;
    const [fromStr, toStr] = value.split("_");
    return {
      from: new Date(`${fromStr}T12:00:00.000Z`),
      to: new Date(`${toStr}T12:00:00.000Z`),
    };
  };

  const [selected, setSelected] = useState<DateRange | undefined>(parseInitial);

  const canApply = !!(selected?.from && selected?.to);

  function handleApply() {
    if (!selected?.from || !selected?.to) return;
    const fmt = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    onChange(fmt(selected.from), fmt(selected.to));
  }

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />

      <div className="absolute right-0 top-[calc(100%+8px)] z-50">
        <div className="relative">
          <DayPicker
            mode="range"
            locale={es}
            selected={selected}
            onSelect={setSelected}
            weekStartsOn={0}
            formatters={{
              formatWeekdayName: (date) => {
                const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
                return days[date.getDay()];
              },
            }}
            showOutsideDays
            endMonth={new Date()}
            disabled={{ after: new Date() }}
            classNames={{
              root: "bg-white font-body border border-[#c4cdd5] rounded-[12px] shadow-md gap-3 pb-[60px] p-4",
              month: "flex-1 flex flex-col",
              month_grid: "w-full",
              // month_caption:
              //   "flex items-center justify-between pb-[10px] pt-[5px]",
              // nav: "flex items-center gap-2",
              caption_label: "capitalize",
              // caption_label:
              //   "capitalize font-bold text-[20px] text-[#212b36] leading-none",
              button_previous:
                "flex items-center justify-center text-text-400 hover:text-text-500 transition-colors",
              button_next:
                "flex items-center justify-center text-text-400 hover:text-text-500 transition-colors",
              weekdays: "flex",
              weekday:
                "flex-1 flex items-center justify-center px-[3px] py-[12px] text-[14px] text-text-400 text-center font-normal leading-[20px]",
              weeks: "flex flex-col gap-[2px] pt-[4px]",
              week: "flex",
              // day is the cell wrapper — range backgrounds live here to span full column width
              day: "flex-1 relative",
              day_button: [
                "w-full relative px-3 py-3 flex items-center justify-center rounded-full",
                "text-[16px] text-text-400 text-center font-normal leading-[20px]",
                "hover:bg-background-300 transition-colors outline-none",
              ].join(" "),
              // selected is applied to both the day cell div AND the day_button.
              // Only set text color here — cell background/rounding come from range_* classes.
              selected: "[&_button]:text-white",
              // range_start/end: solid orange on the cell div, pill cap on the open side
              range_start:
                "bg-[#e84911] rounded-tl-[24px] rounded-bl-[24px] [&_button]:text-white [&_button:hover]:bg-transparent",
              range_end:
                "bg-[#e84911] rounded-tr-[24px] rounded-br-[24px] [&_button]:text-white [&_button:hover]:bg-transparent",
              // range_middle: semi-transparent strip
              // first/last child of each week row get pill caps to close the strip at row edges
              range_middle: [
                "bg-[#FF5A1F9C]/60 [&_button]:text-white",
                "[&:first-child]:rounded-tl-[24px] [&:first-child]:rounded-bl-[24px]",
                "[&:last-child]:rounded-tr-[24px] [&:last-child]:rounded-br-[24px]",
                "[&_button:hover]:bg-transparent",
              ].join(" "),
              today: "font-semibold text-accent-selected",
              outside: "opacity-40",
              hidden: "invisible",
              disabled: "opacity-30 cursor-not-allowed",
            }}
            components={{
              Chevron: ({ orientation }) =>
                orientation === "left" ? (
                  <ChevronLeftIcon className="size-6 text-text-400" />
                ) : (
                  <ChevronRightIcon className="size-6 text-text-400" />
                ),
              DayButton: ({
                day: _day,
                modifiers,
                children,
                ...buttonProps
              }) => (
                <button {...buttonProps}>
                  {children}
                  {modifiers.range_start && modifiers.range_end && (
                    <span className="absolute top-[32px] left-1/2 size-[4px] -translate-x-1/2 rounded-full bg-white" />
                  )}
                </button>
              ),
            }}
          />

          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between border-t border-[#c4cdd5] pt-3">
            <span className="body-sm-regular text-text-300">
              {!selected?.from
                ? "Seleccioná una fecha de inicio"
                : !selected.to
                  ? "Seleccioná una fecha de fin"
                  : ""}
            </span>
            <button
              type="button"
              disabled={!canApply}
              onClick={handleApply}
              className="rounded-[6px] bg-accent-selected px-4 py-2 text-xs font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
            >
              Aplicar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
