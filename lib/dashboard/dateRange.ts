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

    case "week": {
      // value = ISO Monday date string, e.g. "2026-05-12"
      const start = new Date(`${value}T00:00:00.000Z`);
      const end = new Date(start);
      end.setUTCDate(end.getUTCDate() + 7);
      const prevStart = new Date(start);
      prevStart.setUTCDate(prevStart.getUTCDate() - 7);
      return {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        prevStartDate: prevStart.toISOString(),
        prevEndDate: start.toISOString(),
      };
    }

    case "month": {
      // value = "YYYY-MM"
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
      // value = "YYYY"
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
  }
}

export function getDefaultPeriod(): { type: PeriodType; value: string } {
  const now = new Date();
  return {
    type: "month",
    value: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
  };
}
