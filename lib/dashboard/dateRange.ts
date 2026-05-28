import type { PeriodType } from "@/types/dashboard";

export interface DateRange {
  startDate: string;
  endDate: string;
  prevStartDate: string;
  prevEndDate: string;
}

export function computeDateRange(type: PeriodType, value: string): DateRange {
  switch (type) {
    case "today": {
      const start = new Date(`${value}T00:00:00.000Z`);
      const end = new Date(start);
      end.setUTCDate(end.getUTCDate() + 1);
      const prevStart = new Date(start);
      prevStart.setUTCDate(prevStart.getUTCDate() - 1);
      return {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        prevStartDate: prevStart.toISOString(),
        prevEndDate: start.toISOString(),
      };
    }

    case "month": {
      const [year, month] = value.split("-").map(Number);
      const start = new Date(Date.UTC(year, month - 1, 1));
      const end = new Date(Date.UTC(year, month, 1));
      const prevStart = new Date(Date.UTC(year, month - 2, 1));
      return {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        prevStartDate: prevStart.toISOString(),
        prevEndDate: start.toISOString(),
      };
    }

    case "year": {
      const year = parseInt(value, 10);
      const start = new Date(Date.UTC(year, 0, 1));
      const end = new Date(Date.UTC(year + 1, 0, 1));
      const prevStart = new Date(Date.UTC(year - 1, 0, 1));
      return {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        prevStartDate: prevStart.toISOString(),
        prevEndDate: start.toISOString(),
      };
    }

    case "custom": {
      // value = "YYYY-MM-DD_YYYY-MM-DD"
      const [fromStr, toStr] = value.split("_");
      const start = new Date(`${fromStr}T00:00:00.000Z`);
      const end = new Date(`${toStr}T00:00:00.000Z`);
      end.setUTCDate(end.getUTCDate() + 1); // exclusive end
      const durationMs = end.getTime() - start.getTime();
      const prevStart = new Date(start.getTime() - durationMs);
      return {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        prevStartDate: prevStart.toISOString(),
        prevEndDate: start.toISOString(),
      };
    }
  }
}

export function getDefaultPeriod(): { type: PeriodType; value: string } {
  const now = new Date();
  return {
    type: "today",
    value: now.toISOString().slice(0, 10),
  };
}

export function navigatePeriod(
  type: PeriodType,
  value: string,
  dir: -1 | 1,
): string {
  switch (type) {
    case "today": {
      const d = new Date(`${value}T12:00:00.000Z`);
      d.setUTCDate(d.getUTCDate() + dir);
      return d.toISOString().slice(0, 10);
    }
    case "month": {
      const [y, m] = value.split("-").map(Number);
      const d = new Date(Date.UTC(y, m - 1 + dir, 1));
      return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    }
    case "year":
      return String(parseInt(value, 10) + dir);
    case "custom": {
      const [fromStr, toStr] = value.split("_");
      const from = new Date(`${fromStr}T00:00:00.000Z`);
      const to = new Date(`${toStr}T00:00:00.000Z`);
      const durationMs = to.getTime() - from.getTime() + 86_400_000;
      const newFrom = new Date(from.getTime() + dir * durationMs);
      const newTo = new Date(to.getTime() + dir * durationMs);
      return `${newFrom.toISOString().slice(0, 10)}_${newTo.toISOString().slice(0, 10)}`;
    }
  }
}

export function formatPeriodLabel(type: PeriodType, value: string): string {
  switch (type) {
    case "today": {
      const d = new Date(`${value}T12:00:00.000Z`);
      const today = new Date();
      const todayStr = today.toISOString().slice(0, 10);
      const yesterday = new Date(today);
      yesterday.setUTCDate(today.getUTCDate() - 1);
      const yesterdayStr = yesterday.toISOString().slice(0, 10);
      if (value === todayStr) return "Hoy";
      if (value === yesterdayStr) return "Ayer";
      return d.toLocaleDateString("es-AR", { day: "numeric", month: "long" });
    }
    case "month": {
      const [year, month] = value.split("-").map(Number);
      const d = new Date(year, month - 1, 1);
      const label = d.toLocaleDateString("es-AR", {
        month: "long",
        year: "numeric",
      });
      return label.charAt(0).toUpperCase() + label.slice(1);
    }
    case "year":
      return value;
    case "custom": {
      const [fromStr, toStr] = value.split("_");
      if (fromStr === toStr) {
        const d = new Date(`${fromStr}T12:00:00.000Z`);
        return d.toLocaleDateString("es-AR", { day: "numeric", month: "long" });
      }
      const from = new Date(`${fromStr}T12:00:00.000Z`);
      const to = new Date(`${toStr}T12:00:00.000Z`);
      const sameMonth = from.getUTCMonth() === to.getUTCMonth() && from.getUTCFullYear() === to.getUTCFullYear();
      if (sameMonth) {
        return `${from.getUTCDate()}–${to.getUTCDate()} ${from.toLocaleDateString("es-AR", { month: "long" })}`;
      }
      const fmt = (d: Date) =>
        `${d.getUTCDate()} ${d.toLocaleDateString("es-AR", { month: "short" })}`;
      return `${fmt(from)} – ${fmt(to)}`;
    }
  }
}
