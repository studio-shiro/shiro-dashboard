"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { DayPicker } from "react-day-picker";
import { es } from "react-day-picker/locale";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { CalendarDaysIcon } from "@heroicons/react/24/solid";
import "@daypicker/react/style.css";
import { cn } from "@/lib/utils";

interface DatePickerInputProps {
  value: string | null; // "YYYY-MM-DD"
  onChange: (value: string | null) => void;
  className?: string;
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

  const CALENDAR_HEIGHT = 320;

  function handleOpen() {
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
          "flex h-[30px] w-full items-center justify-between gap-1 overflow-hidden rounded-md border border-border-400 bg-white px-2 shadow-sm",
          open && "border-accent",
          className,
        )}
      >
        <span
          className={cn(
            "body-md-regular truncate",
            selected ? "text-text-500" : "text-text-300",
          )}
        >
          {selected ? formatDisplay(selected) : "--/--/----"}
        </span>
        <CalendarDaysIcon className="size-5 shrink-0 text-text-400" />
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

            {/* Calendar */}
            <div
              className="fixed z-50"
              style={{ top: pos.top, bottom: pos.bottom, left: pos.left }}
            >
              <DayPicker
                mode="single"
                locale={es}
                selected={selected}
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
                  root: "bg-white font-body border border-border-300 rounded-xl shadow-lg p-4 w-[280px]",
                  months: "flex flex-col",
                  month: "flex flex-col gap-2",
                  month_caption: "flex items-center justify-between px-1 py-1",
                  caption_label:
                    "capitalize body-md-semibold text-text-500 mx-auto",
                  nav: "flex items-center gap-1",
                  button_previous:
                    "flex items-center justify-center text-text-400 hover:text-text-500 cursor-pointer transition-colors",
                  button_next:
                    "flex items-center justify-center text-text-400 hover:text-text-500 cursor-pointer transition-colors",
                  month_grid: "w-full",
                  weekdays: "flex",
                  weekday:
                    "flex-1 flex items-center justify-center py-2 body-sm-regular text-text-300 text-center",
                  weeks: "flex flex-col gap-[2px] pt-1",
                  week: "flex",
                  day: "flex-1 relative",
                  day_button: [
                    "w-full px-2 py-[7px] flex items-center justify-center rounded-full",
                    "body-md-regular text-text-400 text-center",
                    "hover:bg-background-300 transition-colors outline-none cursor-pointer",
                  ].join(" "),
                  selected:
                    "[&>button]:!bg-accent [&>button]:!text-white [&>button]:hover:!bg-accent-hover",
                  today: "[&>button]:font-semibold [&>button]:text-accent",
                  outside: "opacity-30",
                  hidden: "invisible",
                  disabled: "opacity-30 cursor-not-allowed",
                }}
                components={{
                  Chevron: ({ orientation }) =>
                    orientation === "left" ? (
                      <ChevronLeftIcon className="size-4" />
                    ) : (
                      <ChevronRightIcon className="size-4" />
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
