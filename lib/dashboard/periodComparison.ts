import type { PeriodType } from "@/types/dashboard";

export interface PeriodOption {
  value: string;
  label: string;
}

export function getPeriodOptions(periodType: PeriodType): PeriodOption[] {
  const now = new Date();

  switch (periodType) {
    case "month": {
      const options: PeriodOption[] = [];
      for (let i = 0; i < 12; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const label = d
          .toLocaleDateString("es-AR", { month: "long", year: "numeric" })
          .replace(/^\w/, (c) => c.toUpperCase());
        options.push({ value, label });
      }
      return options;
    }

    case "week": {
      const options: PeriodOption[] = [];
      const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1; // Monday = 0
      const currentMonday = new Date(now);
      currentMonday.setDate(now.getDate() - dayOfWeek);
      currentMonday.setHours(0, 0, 0, 0);
      for (let i = 0; i < 8; i++) {
        const weekStart = new Date(currentMonday);
        weekStart.setDate(currentMonday.getDate() - i * 7);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        const value = weekStart.toISOString().slice(0, 10);
        const startDay = weekStart.getDate();
        const startMonth = weekStart.getMonth() + 1;
        const endDay = weekEnd.getDate();
        const endMonth = weekEnd.getMonth() + 1;
        const label = `${startDay}/${startMonth} — ${endDay}/${endMonth}`;
        options.push({ value, label });
      }
      return options;
    }

    case "today": {
      const options: PeriodOption[] = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const value = d.toISOString().slice(0, 10);
        let label: string;
        if (i === 0) {
          label = "Hoy";
        } else if (i === 1) {
          label = "Ayer";
        } else {
          label = d
            .toLocaleDateString("es-AR", { day: "numeric", month: "long" })
            .replace(/^\w/, (c) => c.toUpperCase());
        }
        options.push({ value, label });
      }
      return options;
    }

    case "year": {
      const options: PeriodOption[] = [];
      for (let i = 0; i < 5; i++) {
        const year = now.getFullYear() - i;
        options.push({ value: String(year), label: String(year) });
      }
      return options;
    }
  }
}

export function getDefaultPeriodValues(
  periodType: PeriodType,
): [string, string] {
  const now = new Date();

  switch (periodType) {
    case "month": {
      const current = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const previous = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;
      return [current, previous];
    }

    case "week": {
      const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1;
      const currentMonday = new Date(now);
      currentMonday.setDate(now.getDate() - dayOfWeek);
      currentMonday.setHours(0, 0, 0, 0);
      const previousMonday = new Date(currentMonday);
      previousMonday.setDate(currentMonday.getDate() - 7);
      return [
        currentMonday.toISOString().slice(0, 10),
        previousMonday.toISOString().slice(0, 10),
      ];
    }

    case "today": {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      return [
        now.toISOString().slice(0, 10),
        yesterday.toISOString().slice(0, 10),
      ];
    }

    case "year": {
      return [String(now.getFullYear()), String(now.getFullYear() - 1)];
    }
  }
}
