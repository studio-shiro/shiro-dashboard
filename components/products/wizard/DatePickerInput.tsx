"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { DayPicker } from "react-day-picker";
import { es } from "react-day-picker/locale";
import {
  ChevronDownIcon,
  CalendarDaysIcon as CalendarDaysOutlineIcon,
} from "@heroicons/react/24/outline";
import { CalendarDaysIcon } from "@heroicons/react/24/solid";
import "@daypicker/react/style.css";
import { cn } from "@/lib/utils";

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

interface CalendarCaptionProps {
  calendarMonth: { date: Date };
  onMonthChange: (date: Date) => void;
}

function CalendarCaption({
  calendarMonth,
  onMonthChange,
}: CalendarCaptionProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
  const { date } = calendarMonth;

  return (
    <div className="flex gap-1.5 pb-2">
      <div className="relative">
        <select
          value={date.getMonth()}
          onChange={(e) =>
            onMonthChange(new Date(date.getFullYear(), +e.target.value, 1))
          }
          className="appearance-none cursor-pointer rounded-md border border-border-200 bg-white py-0.5 pl-2 pr-6 text-[16px] text-text-500 outline-none hover:bg-background-300"
        >
          {MONTHS.map((m, i) => (
            <option key={i} value={i}>
              {m}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-1 top-1/2 size-3.5 -translate-y-1/2 text-text-400" />
      </div>
      <div className="relative">
        <select
          value={date.getFullYear()}
          onChange={(e) =>
            onMonthChange(new Date(+e.target.value, date.getMonth(), 1))
          }
          className="appearance-none cursor-pointer rounded-md border border-border-200 bg-white py-0.5 pl-2 pr-6 text-[16px] text-text-500 outline-none hover:bg-background-300"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-1 top-1/2 size-3.5 -translate-y-1/2 text-text-400" />
      </div>
    </div>
  );
}

interface DatePickerInputProps {
  value: string | null; // "YYYY-MM-DD"
  onChange: (value: string | null) => void;
  className?: string;
  // "form" matches wizard form: 16px text, gray placeholder,
  // 24px outline calendar icon. "table" keeps the compact table styling.
  variant?: "table" | "form";
}

function parseISO(iso: string): Date {
  return new Date(`${iso}T12:00:00.000Z`);
}

function toISO(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function formatDisplay(date: Date): string {
  return [
    String(date.getDate()).padStart(2, "0"),
    String(date.getMonth() + 1).padStart(2, "0"),
    date.getFullYear(),
  ].join("/");
}

export function DatePickerInput({
  value,
  onChange,
  className,
  variant = "table",
}: DatePickerInputProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{
    top?: number;
    bottom?: number;
    left: number;
  }>({ left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true, // Client
    () => false, // SSR
  );

  const selected = value ? parseISO(value) : undefined;
  const [displayMonth, setDisplayMonth] = useState<Date>(
    selected ?? new Date(),
  );

  const CALENDAR_HEIGHT = 380;

  function handleOpen() {
    setDisplayMonth(selected ?? new Date());
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      if (spaceBelow < CALENDAR_HEIGHT) {
        setPos({ bottom: window.innerHeight - rect.top + 4, left: rect.left });
      } else {
        setPos({ top: rect.bottom + 4, left: rect.left });
      }
    }
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        className={cn(
          "flex h-[30px] w-full items-center justify-between gap-2 overflow-hidden rounded-[6px] border border-solid border-border-400 bg-white px-2 shadow-sm",
          open && "border-accent",
          className,
        )}
      >
        <span
          className={cn(
            "truncate",
            variant === "form" ? "body-lg-regular" : "body-md-regular",
            selected
              ? "text-text-500"
              : variant === "form"
                ? "text-text-400"
                : "text-text-300",
          )}
        >
          {selected ? formatDisplay(selected) : "00/00/0000"}
        </span>
        {variant === "form" ? (
          <CalendarDaysOutlineIcon className="size-6 shrink-0 text-text-400" />
        ) : (
          <CalendarDaysIcon className="size-5 shrink-0 text-text-400" />
        )}
      </button>

      {mounted &&
        open &&
        createPortal(
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />

            {/* Calendar — same UI as the dashboard filters calendar
                (DateRangePicker), but single-date and any date selectable */}
            <div
              className="fixed z-50"
              style={{ top: pos.top, bottom: pos.bottom, left: pos.left }}
            >
              <DayPicker
                mode="single"
                locale={es}
                selected={selected}
                month={displayMonth}
                onMonthChange={setDisplayMonth}
                onSelect={(date) => {
                  onChange(date ? toISO(date) : null);
                  setOpen(false);
                }}
                weekStartsOn={0}
                formatters={{
                  formatWeekdayName: (date) => {
                    const days = [
                      "Dom",
                      "Lun",
                      "Mar",
                      "Mié",
                      "Jue",
                      "Vie",
                      "Sáb",
                    ];
                    return days[date.getDay()];
                  },
                }}
                showOutsideDays
                classNames={{
                  root: "bg-white font-body border border-[#c4cdd5] rounded-[12px] shadow-md gap-3 p-4 w-[320px]",
                  month: "flex-1 flex flex-col",
                  month_grid: "w-full",
                  weekdays: "flex",
                  weekday:
                    "flex-1 flex items-center justify-center px-[3px] py-[12px] text-[14px] text-text-400 text-center font-normal leading-[20px]",
                  weeks: "flex flex-col gap-[2px] pt-[4px]",
                  week: "flex",
                  day: "flex-1 relative",
                  day_button: [
                    "w-full relative px-3 py-3 flex items-center justify-center rounded-full",
                    "text-[16px] text-text-400 text-center font-normal leading-[20px]",
                    "hover:bg-background-300 transition-colors outline-none cursor-pointer",
                  ].join(" "),
                  selected:
                    "[&>button]:!bg-accent [&>button]:!text-white [&>button]:hover:!bg-accent-hover",
                  today: "font-semibold text-accent-selected",
                  outside: "opacity-40",
                  hidden: "invisible",
                  disabled: "opacity-30 cursor-not-allowed",
                }}
                components={{
                  Nav: () => <></>,
                  MonthCaption: (props) => (
                    <CalendarCaption
                      calendarMonth={props.calendarMonth}
                      onMonthChange={setDisplayMonth}
                    />
                  ),
                }}
              />
            </div>
          </>,
          document.body,
        )}
    </>
  );
}
